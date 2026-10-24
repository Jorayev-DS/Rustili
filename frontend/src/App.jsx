import { useCallback, useEffect, useState } from "react";
import { api } from "./api.js";
import Sidebar from "./components/Sidebar.jsx";
import ChatWindow from "./components/ChatWindow.jsx";
import SettingsModal from "./components/SettingsModal.jsx";

export default function App() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const refresh = useCallback(() => api.conversations().then(setConversations).catch((e) => setError(e.message)), []);
  useEffect(() => { refresh(); }, [refresh]);

  const select = async (id) => {
    setActiveId(id); setError(""); setMenuOpen(false);
    try { setMessages(await api.messages(id)); } catch (e) { setError(e.message); }
  };
  const newChat = () => { setActiveId(null); setMessages([]); setError(""); setMenuOpen(false); };
  const remove = async (id) => {
    await api.deleteConversation(id);
    if (id === activeId) newChat();
    refresh();
  };

  const send = async (text) => {
    setError(""); setLoading(true);
    const temp = { id: `tmp-${Date.now()}`, role: "user", content: text, timestamp: new Date().toISOString() };
    setMessages((m) => [...m, temp]);
    try {
      const res = await api.chat(text, activeId);
      setActiveId(res.conversation.id);
      setMessages((m) => [...m.filter((x) => x.id !== temp.id), res.user_message, res.assistant_message]);
      refresh();
    } catch (e) {
      setMessages((m) => m.filter((x) => x.id !== temp.id));
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full">
      <Sidebar
        conversations={conversations} activeId={activeId} open={menuOpen}
        onClose={() => setMenuOpen(false)} onSelect={select} onNew={newChat}
        onDelete={remove} onSettings={() => { setSettingsOpen(true); setMenuOpen(false); }}
      />
      <ChatWindow messages={messages} loading={loading} error={error} onSend={send} onMenu={() => setMenuOpen(true)} />
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
