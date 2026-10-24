import os
import re
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

load_dotenv()

from backend import llm # noqa: E402
from database import Base, SessionLocal, engine, get_db  # noqa: E402
from models import Conversation, Message, Setting, utcnow  # noqa: E402
from schemas import (  # noqa: E402
    ChatIn, ChatOut, ConversationOut, MessageOut, SettingsIO,
)

GLOBAL_KEY = "global_instruction"
DEFAULT_INSTRUCTION = (
    "Men o'zbek tilida so'zlashaman va rus tilini o'rganyapman. "
    "Agar xabarimda rus tilida xato bo'lsa, avval to'g'rilangan variantni yoz, "
    "xatolarni o'zbekcha qisqa izohla, keyin savolimga javob ber. "
    "Yangi so'zlarni ударение (urg'u) bilan va o'zbekcha tarjimasi bilan ber."
)
BASE_SYSTEM = (
    "Sen foydalanuvchining shaxsiy rus tili o'qituvchisi va yordamchisisan. "
    "Javoblarni Markdown formatida yoz."
)
HISTORY_LIMIT = int(os.getenv("HISTORY_LIMIT", "30"))
RECALL_LIMIT = int(os.getenv("RECALL_LIMIT", "5"))


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        if not db.scalar(select(Setting).where(Setting.key == GLOBAL_KEY)):
            db.add(Setting(key=GLOBAL_KEY, value=DEFAULT_INSTRUCTION))
            db.commit()
    yield


app = FastAPI(title="Rus tili — shaxsiy yordamchi", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")],
    allow_methods=["*"],
    allow_headers=["*"],
)


def require_key(x_app_key: str | None = Header(default=None)):
    pw = os.getenv("APP_PASSWORD", "")
    if pw and x_app_key != pw:
        raise HTTPException(401, "Parol noto'g'ri")


api = [Depends(require_key)]


@app.get("/api/health")
def health():
    return {"ok": True}


# ---------- Settings ----------
def get_instruction(db: Session) -> str:
    row = db.scalar(select(Setting).where(Setting.key == GLOBAL_KEY))
    return row.value if row else ""


@app.get("/api/settings", response_model=SettingsIO, dependencies=api)
def read_settings(db: Session = Depends(get_db)):
    return SettingsIO(global_instruction=get_instruction(db))


@app.put("/api/settings", response_model=SettingsIO, dependencies=api)
def update_settings(body: SettingsIO, db: Session = Depends(get_db)):
    row = db.scalar(select(Setting).where(Setting.key == GLOBAL_KEY))
    if row:
        row.value = body.global_instruction
    else:
        db.add(Setting(key=GLOBAL_KEY, value=body.global_instruction))
    db.commit()
    return body


# ---------- Conversations ----------
@app.get("/api/conversations", response_model=list[ConversationOut], dependencies=api)
def list_conversations(db: Session = Depends(get_db)):
    return db.scalars(select(Conversation).order_by(Conversation.updated_at.desc())).all()


@app.delete("/api/conversations/{cid}", status_code=204, dependencies=api)
def delete_conversation(cid: int, db: Session = Depends(get_db)):
    conv = db.get(Conversation, cid)
    if not conv:
        raise HTTPException(404, "Suhbat topilmadi")
    db.delete(conv)
    db.commit()


# ---------- Messages ----------
@app.get("/api/messages", response_model=list[MessageOut], dependencies=api)
def list_messages(
    conversation_id: int,
    limit: int = Query(200, ge=1, le=1000),
    before_id: int | None = None,
    db: Session = Depends(get_db),
):
    q = select(Message).where(Message.conversation_id == conversation_id)
    if before_id:
        q = q.where(Message.id < before_id)
    rows = db.scalars(q.order_by(Message.id.desc()).limit(limit)).all()
    return list(reversed(rows))


# ---------- Chat ----------
def recall(db: Session, text: str, exclude_ids: set[int]) -> str:
    """Eski suhbatlardan (hafta/oylar oldin) mos xabarlarni kalit so'zlar bo'yicha topadi."""
    words = list({w.lower() for w in re.findall(r"\w{4,}", text)})[:6]
    if not words or RECALL_LIMIT <= 0:
        return ""
    q = (
        select(Message)
        .where(or_(*[Message.content.ilike(f"%{w}%") for w in words]))
        .where(Message.id.notin_(exclude_ids or {0}))
        .order_by(Message.timestamp.desc())
        .limit(RECALL_LIMIT)
    )
    rows = db.scalars(q).all()
    if not rows:
        return ""
    lines = [f"[{m.timestamp:%Y-%m-%d}] {m.role}: {m.content[:400]}" for m in reversed(rows)]
    return "\n\nEski suhbatlardan eslatmalar (kerak bo'lsa foydalan):\n" + "\n".join(lines)


@app.post("/api/chat", response_model=ChatOut, dependencies=api)
def chat(body: ChatIn, db: Session = Depends(get_db)):
    text = body.message.strip()
    if not text:
        raise HTTPException(400, "Xabar bo'sh")

    if body.conversation_id:
        conv = db.get(Conversation, body.conversation_id)
        if not conv:
            raise HTTPException(404, "Suhbat topilmadi")
    else:
        conv = Conversation(title=text[:40])
        db.add(conv)
        db.flush()

    recent = list(reversed(db.scalars(
        select(Message).where(Message.conversation_id == conv.id)
        .order_by(Message.id.desc()).limit(HISTORY_LIMIT)
    ).all()))

    system = BASE_SYSTEM
    instruction = get_instruction(db).strip()
    if instruction:
        system += "\n\nDOIMIY QOIDALAR (har doim bajar):\n" + instruction
    system += recall(db, text, {m.id for m in recent})

    history = [{"role": m.role, "content": m.content} for m in recent]
    history.append({"role": "user", "content": text})

    try:
        answer = llm.complete(system, history)
    except Exception as e:  # noqa: BLE001
        db.rollback()
        raise HTTPException(502, f"AI xizmati xatosi: {e}") from e

    user_msg = Message(conversation_id=conv.id, role="user", content=text)
    db.add(user_msg)
    db.flush()  # user xabari assistant xabaridan oldin id oladi
    ai_msg = Message(conversation_id=conv.id, role="assistant", content=answer or "…")
    db.add(ai_msg)
    conv.updated_at = utcnow()
    db.commit()
    db.refresh(conv)
    return ChatOut(conversation=conv, user_message=user_msg, assistant_message=ai_msg)
