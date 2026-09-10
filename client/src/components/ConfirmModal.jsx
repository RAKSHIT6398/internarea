import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Trash2, UserX, X, Loader2 } from "lucide-react";

const ICONS = {
  danger: <AlertTriangle size={22} />,
  delete: <Trash2 size={22} />,
  block: <UserX size={22} />,
};

const TONE = {
  danger: { ring: "ring-rose-500/25", bg: "bg-rose-500/15", text: "text-rose-400", btn: "bg-rose-500 hover:bg-rose-600 shadow-rose-500/25" },
  warn:   { ring: "ring-amber-500/25", bg: "bg-amber-500/15", text: "text-amber-400", btn: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/25" },
};

export default function ConfirmModal({
  open, title, message, note, confirmText = "Confirm", cancelText = "Cancel",
  tone = "danger", icon = "danger", loading = false, onConfirm, onCancel,
}) {
  useEffect(() => {
    if (!open) return;
    const k = (e) => { if (e.key === "Escape" && !loading) onCancel?.(); if (e.key === "Enter") onConfirm?.(); };
    document.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [open, loading, onCancel, onConfirm]);

  if (!open) return null;
  const t = TONE[tone] || TONE.danger;

  return createPortal(
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-[cmFade_.15s_ease-out]">
      <div className="w-full max-w-[380px] overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl animate-[cmPop_.18s_cubic-bezier(.2,.9,.3,1.2)]">
        <button onClick={onCancel} disabled={loading}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-600 transition hover:bg-zinc-900 hover:text-white disabled:opacity-30">
          <X size={15} />
        </button>

        <div className="px-6 pb-6 pt-8 text-center">
          <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ring-4 ${t.ring} ${t.bg} ${t.text}`}>
            {ICONS[icon] || ICONS.danger}
          </div>

          <h3 className="text-[17px] font-black text-white">{title}</h3>
          {message && <p className="mt-2 text-[12.5px] leading-relaxed text-zinc-400">{message}</p>}
          {note && (
            <p className="mt-3 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-[11px] leading-relaxed text-zinc-500">
              {note}
            </p>
          )}

          <div className="mt-6 flex gap-2.5">
            <button onClick={onCancel} disabled={loading}
              className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 text-[12.5px] font-bold text-zinc-300 transition hover:border-zinc-700 hover:text-white active:scale-95 disabled:opacity-40">
              {cancelText}
            </button>
            <button onClick={onConfirm} disabled={loading}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12.5px] font-black text-white shadow-lg transition active:scale-95 disabled:opacity-60 ${t.btn}`}>
              {loading && <Loader2 size={13} className="animate-spin" />}
              {confirmText}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cmFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes cmPop { from { opacity: 0; transform: scale(.94) translateY(8px) } to { opacity: 1; transform: none } }
      `}</style>
    </div>,
    document.body
  );
}