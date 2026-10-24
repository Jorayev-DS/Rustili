from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_serializer


class _UTC(BaseModel):
    @field_serializer("timestamp", "created_at", "updated_at", check_fields=False)
    def _ser(self, v: datetime | None):
        return v.isoformat() + "Z" if v else None


class MessageOut(_UTC):
    model_config = ConfigDict(from_attributes=True)
    id: int
    conversation_id: int
    role: str
    content: str
    timestamp: datetime


class ConversationOut(_UTC):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    created_at: datetime
    updated_at: datetime


class ChatIn(BaseModel):
    message: str = Field(min_length=1, max_length=8000)
    conversation_id: int | None = None


class ChatOut(BaseModel):
    conversation: ConversationOut
    user_message: MessageOut
    assistant_message: MessageOut


class SettingsIO(BaseModel):
    global_instruction: str = Field(max_length=10000)
