"use client";

import { useEffect } from "react";

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
  // Close with ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

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
      <aside className="w-[520px] max-w-[95vw] h-full bg-[#111827]/95 dark:bg-[#111827]/95 text-gray-100 border-l border-gray-700 shadow-2xl overflow-y-auto backdrop-blur" aria-label="Detalhes do item">
        {/* Header */}
        <header className="sticky top-0 z-10 px-6 py-4 border-b border-gray-700 bg-[#111827]/95 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              {person ? (
                <div className="text-sm text-gray-300">{person}</div>
              ) : null}
              <h3 className="mt-0.5 text-lg font-semibold truncate" title={title}>{title}</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-700 text-white flex items-center justify-center text-sm">
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* Body as definition list with dividers */}
        <div className="px-6 py-5">
          <div className="divide-y divide-gray-700 text-sm">
            <div className="py-3 grid grid-cols-3 gap-4">
              <div className="col-span-1 text-gray-400">Resumo</div>
              <div className="col-span-2 text-gray-100 whitespace-pre-wrap break-words">{summary || "—"}</div>
            </div>
            <div className="py-3 grid grid-cols-3 gap-4">
              <div className="col-span-1 text-gray-400">Status</div>
              <div className="col-span-2 text-gray-100">{status}</div>
            </div>
            <div className="py-3 grid grid-cols-3 gap-4">
              <div className="col-span-1 text-gray-400">Prioridade</div>
              <div className="col-span-2 text-gray-100">{priority}</div>
            </div>
            <div className="py-3 grid grid-cols-3 gap-4">
              <div className="col-span-1 text-gray-400">Atualizado em</div>
              <div className="col-span-2 text-gray-100">{updatedAt || "—"}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 px-6 py-4 border-t border-gray-700 bg-[#111827]/95 backdrop-blur flex justify-end">
          <button
            type="button"
            title="Fechar"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-xs h-9 px-4 py-2 has-[>svg]:px-3 bg-gray-700 hover:bg-gray-600 text-white"
          >
            Fechar
          </button>
        </div>
      </aside>
    </div>
  );
}
