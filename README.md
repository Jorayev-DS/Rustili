# Русский — shaxsiy rus tili yordamchisi

FastAPI + React (Vite) + Tailwind + SQLAlchemy. AI: Anthropic Claude yoki OpenAI.

## Lokal ishga tushirish

### 1. Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # ichiga API kalitingizni yozing
uvicorn main:app --reload --port 8000
```
API hujjatlari: http://localhost:8000/docs

### 2. Frontend (yangi terminalda)
```bash
cd frontend
npm install
npm run dev
```
Brauzerda: http://localhost:5173

## Production (Railway / Render)
- Backend: `DATABASE_URL` ga PostgreSQL manzilini, `APP_PASSWORD` ga parol, `CORS_ORIGINS` ga frontend manzilini qo'ying.
  Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Frontend: `VITE_API_URL=https://sizning-backend.onrender.com npm run build`, `dist/` papkasini hosting qiling.

## Xotira qanday ishlaydi
1. Har bir xabar vaqti bilan bazada saqlanadi.
2. Har so'rovga joriy suhbatning oxirgi `HISTORY_LIMIT` ta xabari qo'shiladi.
3. Eski suhbatlardan (haftalar/oylar oldin) kalit so'zlar mos kelgan `RECALL_LIMIT` ta xabar "eslatma" sifatida qo'shiladi.
4. "Doimiy qoidalar" har so'rovda system prompt'ga qo'shiladi.
