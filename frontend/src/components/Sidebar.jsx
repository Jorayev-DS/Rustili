export default function Sidebar({ conversations, activeId, onSelect, onNew, onDelete, onSettings, open, onClose }) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-ink/30 z-20 md:hidden" onClick={onClose} />}
      <aside
        className={`fixed md:static z-30 inset-y-0 left-0 w-72 bg-mist border-r border-line flex flex-col transition-transform ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-4 flex items-center justify-between">
          <span className="text-xl font-semibold tracking-tight">Русский</span>
        </div>
        <div className="px-3">
          <button onClick={onNew} className="w-full rounded-lg bg-gzhel text-white py-2.5 font-medium hover:bg-gzhel-dark transition-colors">
            Yangi suhbat
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1" aria-label="Suhbatlar">
          {conversations.length === 0 && (
            <p className="text-sm text-ink/60 px-2 py-3">Hozircha suhbat yo'q. Birinchi xabaringizni yozing.</p>
          )}
          {conversations.map((c) => (
            <div
              key={c.id}
              className={`group flex items-center rounded-lg ${c.id === activeId ? "bg-gzhel-soft" : "hover:bg-white"}`}
            >
              <button onClick={() => onSelect(c.id)} className="flex-1 text-left px-3 py-2 truncate text-sm">
                {c.title}
              </button>
              <button
                onClick={() => window.confirm("Bu suhbat o'chirilsinmi?") && onDelete(c.id)}
                className="px-2 text-ink/40 hover:text-red-600 md:opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label={`"${c.title}" suhbatini o'chirish`}
              >
                ✕
              </button>
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-line">
          <button onClick={onSettings} className="w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-white">
            Doimiy qoidalar
          </button>
        </div>
      </aside>
    </>
  );
}
