// components/HistoryPanel.jsx
// ---------------------------------------------------------------------------
// Slide-over drawer listing saved projects from localStorage in White + Orange.
// ---------------------------------------------------------------------------
import { History, X, Trash2, FolderOpen } from "lucide-react";

function truncate(text, max = 80) {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function HistoryPanel({ isOpen, onClose, history, onLoad, onDelete }) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className="fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-toast-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center h-7 w-7 rounded-lg bg-orange-50 border border-orange-200 text-orange-600">
              <History size={15} />
            </span>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Project Vault</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
            aria-label="Close saved projects"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
          {history.length === 0 && (
            <div className="text-center py-16 px-4">
              <p className="text-xs font-mono text-slate-400">
                No blueprints in vault yet. Every generated startup plan is saved here automatically.
              </p>
            </div>
          )}

          {history.map((entry) => (
            <div
              key={entry.id}
              className="group rounded-xl border border-slate-200 bg-slate-50/70 hover:border-orange-300 hover:bg-orange-50/20 transition-all p-3.5 shadow-2xs"
            >
              <button onClick={() => onLoad(entry)} className="w-full text-left">
                <p className="text-xs sm:text-sm text-slate-800 font-semibold leading-snug line-clamp-2 group-hover:text-orange-950 transition-colors">
                  {truncate(entry.idea)}
                </p>
                <p className="text-[11px] font-mono text-slate-400 mt-1.5">
                  {formatDate(entry.createdAt)}
                </p>
              </button>

              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-200/60">
                <button
                  onClick={() => onLoad(entry)}
                  className="text-xs flex items-center gap-1 text-orange-600 hover:text-orange-700 font-semibold font-mono"
                >
                  <FolderOpen size={12} /> Load Blueprint
                </button>
                <button
                  onClick={() => onDelete(entry.id)}
                  className="text-xs flex items-center gap-1 text-slate-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"
                  title="Delete blueprint"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}