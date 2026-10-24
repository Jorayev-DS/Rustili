const BASE = import.meta.env.VITE_API_URL || "";

async function request(path, options = {}, retry = true) {
  const key = localStorage.getItem("app_key") || "";
  const res = await fetch(BASE + path, {
    ...options,
    headers: { "Content-Type": "application/json", "X-App-Key": key, ...(options.headers || {}) },
  });
  if (res.status === 401 && retry) {
    const entered = window.prompt("Parolni kiriting:");
    if (entered === null) throw new Error("Parol kerak");
    localStorage.setItem("app_key", entered);
    return request(path, options, false);
  }
  if (!res.ok) {
    let detail = res.statusText;
    try { detail = (await res.json()).detail || detail; } catch { /* ignore */ }
    throw new Error(detail);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  conversations: () => request("/api/conversations"),
  deleteConversation: (id) => request(`/api/conversations/${id}`, { method: "DELETE" }),
  messages: (id) => request(`/api/messages?conversation_id=${id}`),
  chat: (message, conversation_id) =>
    request("/api/chat", { method: "POST", body: JSON.stringify({ message, conversation_id }) }),
  getSettings: () => request("/api/settings"),
  saveSettings: (global_instruction) =>
    request("/api/settings", { method: "PUT", body: JSON.stringify({ global_instruction }) }),
};
