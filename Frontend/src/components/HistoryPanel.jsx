// components/HistoryPanel.jsx
// ---------------------------------------------------------------------------
// Slide-over drawer listing saved projects from localStorage. Purely
// presentational — App.jsx owns the actual history array and passes down
// callbacks for loading/deleting entries.
// ---------------------------------------------------------------------------
import { History, X, Trash2, FolderOpen } from "lucide-react";

function truncate(text, max = 90) {
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
      {/* Backdrop — click to close. */}
      <div
        className="fixed inset-0 z-40 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className="fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-900">
          <div className="flex items-center gap-2">
            <History size={18} className="text-indigo-400" />
            <h2 className="font-semibold text-slate-100">Saved Projects</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors"
            aria-label="Close saved projects"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {history.length === 0 && (
            <p className="text-sm text-slate-500 text-center mt-10 px-4">
              No saved projects yet. Every blueprint you generate is saved
              here automatically.
            </p>
          )}

          {history.map((entry) => (
            <div
              key={entry.id}
              className="group rounded-lg border border-slate-800 bg-slate-900/60 hover:border-indigo-700 transition-colors p-3"
            >
              <button onClick={() => onLoad(entry)} className="w-full text-left">
                <p className="text-sm text-slate-100 leading-snug">
                  {truncate(entry.idea)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {formatDate(entry.createdAt)}
                </p>
              </button>

              <div className="flex items-center gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onLoad(entry)}
                  className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                >
                  <FolderOpen size={13} /> Open
                </button>
                <button
                  onClick={() => onDelete(entry.id)}
                  className="text-xs flex items-center gap-1 text-red-400 hover:text-red-300"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}