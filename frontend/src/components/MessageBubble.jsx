import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function Pre({ children }) {
  const ref = useRef(null);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(ref.current?.innerText || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="relative my-3">
      <button
        onClick={copy}
        className="absolute right-2 top-2 rounded-md bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/20"
      >
        {copied ? "Nusxalandi" : "Nusxalash"}
      </button>
      <pre ref={ref} className="bg-ink text-mist rounded-lg p-4 pt-9 overflow-x-auto text-sm font-mono">
        {children}
      </pre>
    </div>
  );
}

const fmt = (iso) =>
  new Date(iso).toLocaleString("uz-UZ", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[88%] md:max-w-[75%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div className={`rounded-2xl px-4 py-3 ${isUser ? "bg-gzhel-soft whitespace-pre-wrap" : "bg-white"}`}>
          {isUser ? (
            message.content
          ) : (
            <div className="md">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ pre: Pre }}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        <time className="mt-1 px-2 text-xs text-ink/50" dateTime={message.timestamp}>
          {fmt(message.timestamp)}
        </time>
      </div>
    </div>
  );
}
