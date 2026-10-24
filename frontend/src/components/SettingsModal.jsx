import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function SettingsModal({ onClose }) {
  const [value, setValue] = useState("");
  const [state, setState] = useState("loading"); // loading | idle | saving | saved | error

  useEffect(() => {
    api.getSettings().then((s) => { setValue(s.global_instruction); setState("idle"); }).catch(() => setState("error"));
  }, []);

  const save = async () => {
    setState("saving");
    try { await api.saveSettings(value); setState("saved"); } catch { setState("error"); }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Doimiy qoidalar" onClick={(e) => e.stopPropagation()} className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold">Doimiy qoidalar</h2>
        <p className="mt-1 text-sm text-ink/60">Bu matn har bir so'rovda AI ga avtomatik yuboriladi.</p>
        <textarea
          value={value}
          onChange={(e) => { setValue(e.target.value); setState("idle"); }}
          rows={9}
          disabled={state === "loading"}
          className="mt-4 w-full resize-y rounded-xl border border-line p-3 focus:border-gzhel focus:outline-none"
        />
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm" role="status">
            {state === "saved" && <span className="text-green-700">Saqlandi</span>}
            {state === "error" && <span className="text-red-700">Saqlab bo'lmadi. Qayta urinib ko'ring.</span>}
          </span>
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-lg px-4 py-2 hover:bg-mist">Yopish</button>
            <button onClick={save} disabled={state === "saving" || state === "loading"} className="rounded-lg bg-gzhel px-4 py-2 font-medium text-white hover:bg-gzhel-dark disabled:opacity-40">
              Saqlash
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
