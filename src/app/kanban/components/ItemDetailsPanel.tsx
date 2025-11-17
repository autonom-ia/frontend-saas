"use client";

import { useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";

type TagType = string | { name?: string; key?: string };
type KanbanItemLite = {
  id?: string | number;
  title?: string;
  name?: string;
  contact_name?: string;
  summary?: string;
  description?: string;
  status?: string;
  priority?: string;
  unread_count?: number;
  created_at?: string;
  updated_at?: string;
  tags?: Array<TagType>;
  [key: string]: unknown;
};

type Props = {
  item: KanbanItemLite;
  onClose: () => void;
};

export default function ItemDetailsPanel({ item, onClose }: Props) {
  const { theme } = useTheme();
  const kanban = theme.colors.kanban;
  
  // Close with ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Format summary with markdown-like bold sections
  const formatSummary = (text: string) => {
    if (!text) return null;
    
    // Split by ** markers, capturing the content between them
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    
    return parts.map((part, idx) => {
      // Odd indices are the content that was between **
      if (idx % 2 === 1) {
        return (
          <span key={idx}>
            <br />
            <strong className="font-semibold text-gray-50">{part}</strong>
          </span>
        );
      }
      // Even indices are regular text (without **)
      return <span key={idx}>{part}</span>;
    });
  };

  // Normalize fields
  const title = item?.title || item?.name || item?.contact_name || "Detalhes";
  const summary = item?.summary || item?.description || "";
  const status = item?.status || "-";
  const priority = item?.priority || "-";
  const updatedAt = item?.updated_at || item?.created_at;
  const person = item?.contact_name || item?.name || "";
  const initials = (person || title)
    .toString()
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="fixed inset-x-0 top-16 bottom-0 z-[59] flex">
      {/* Backdrop */}
      <div
        className="flex-1 bg-black/40"
        onClick={onClose}
        role="button"
        aria-label="Fechar detalhes"
      />

      {/* Panel */}
      <aside className={`w-[520px] max-w-[95vw] h-full border-l shadow-2xl overflow-y-auto backdrop-blur ${kanban.panel} ${theme.colors.text.primary}`} aria-label="Detalhes do item">
        {/* Header */}
        <header className={`sticky top-0 z-10 px-6 py-4 border-b backdrop-blur ${kanban.panel}`}>
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              {person ? (
                <div className={`text-sm ${theme.colors.text.secondary}`}>{person}</div>
              ) : null}
              <h3 className={`mt-0.5 text-lg font-semibold truncate ${theme.colors.text.primary}`} title={title}>{title}</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm ${kanban.avatar}`}>
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* Body as definition list with dividers */}
        <div className="px-6 py-5">
          <div className={`divide-y text-sm ${theme.colors.border.primary}`}>
            <div className="py-3 grid grid-cols-3 gap-4">
              <div className={`col-span-1 ${theme.colors.text.muted}`}>Resumo</div>
              <div className={`col-span-2 whitespace-pre-wrap break-words ${theme.colors.text.primary}`}>
                {summary ? formatSummary(summary) : "—"}
              </div>
            </div>
            <div className="py-3 grid grid-cols-3 gap-4">
              <div className={`col-span-1 ${theme.colors.text.muted}`}>Status</div>
              <div className={`col-span-2 ${theme.colors.text.primary}`}>{status}</div>
            </div>
            <div className="py-3 grid grid-cols-3 gap-4">
              <div className={`col-span-1 ${theme.colors.text.muted}`}>Prioridade</div>
              <div className={`col-span-2 ${theme.colors.text.primary}`}>{priority}</div>
            </div>
            <div className="py-3 grid grid-cols-3 gap-4">
              <div className={`col-span-1 ${theme.colors.text.muted}`}>Atualizado em</div>
              <div className={`col-span-2 ${theme.colors.text.primary}`}>{updatedAt || "—"}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`sticky bottom-0 z-10 px-6 py-4 border-t backdrop-blur flex justify-end ${kanban.panel}`}>
          <button
            type="button"
            title="Fechar"
            onClick={onClose}
            className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 shadow-xs h-9 px-4 py-2 ${theme.colors.button.secondary}`}
          >
            Fechar
          </button>
        </div>
      </aside>
    </div>
  );
}
