import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble.jsx";

const STARTERS = [
  "Привет! Давай поговорим о моём дне.",
  "Menga rus tilida o'zimni tanishtirishni o'rgat.",
  "Bugun 10 ta yangi so'z o'rgat va meni sinab ko'r.",
];

export default function ChatWindow({ messages, loading, error, onSend, onMenu }) {
  const [text, setText] = useState("");
  const bottom = useRef(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const submit = () => {
    const t = text.trim();
    if (!t || loading) return;
    setText("");
    onSend(t);
  };

  return (
    <main className="flex-1 flex flex-col min-w-0 h-full">
      <header className="md:hidden flex items-center gap-3 border-b border-line px-4 py-3">
        <button onClick={onMenu} className="text-xl" aria-label="Menyuni ochish">☰</button>
        <span className="font-semibold">Русский</span>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6 space-y-5">
          {messages.length === 0 && !loading && (
            <div className="pt-16">
              <h1 className="text-3xl font-semibold tracking-tight">Что сегодня учим?</h1>
              <p className="mt-2 text-ink/60">Bugun nimani o'rganamiz? Boshlash uchun birini tanlang yoki o'zingiz yozing.</p>
              <div className="mt-6 flex flex-col gap-2 items-start">
                {STARTERS.map((s) => (
                  <button key={s} onClick={() => onSend(s)} className="rounded-xl border border-line px-4 py-2 text-left hover:border-gzhel hover:bg-gzhel-soft">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
          {loading && <p className="text-sm text-ink/60 px-2">Javob yozilmoqda…</p>}
          {error && (
            <p role="alert" className="rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">
              {error}
            </p>
          )}
          <div ref={bottom} />
        </div>
      </div>

      <div className="border-t border-line bg-white">
        <div className="mx-auto max-w-3xl p-4 flex gap-2 items-end">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                submit();
              }
            }}
            rows={2}
            placeholder="Xabar yozing… (Enter — yuborish, Shift+Enter — yangi qator)"
            className="flex-1 resize-none rounded-xl border border-line px-4 py-3 focus:border-gzhel focus:outline-none"
          />
          <button
            onClick={submit}
            disabled={loading || !text.trim()}
            className="rounded-xl bg-gzhel px-5 py-3 font-medium text-white hover:bg-gzhel-dark disabled:opacity-40"
          >
            Yuborish
          </button>
        </div>
      </div>
    </main>
  );
}
