"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, Settings, Megaphone, KanbanSquare } from "lucide-react";

type SidebarProps = {
  show?: boolean; // staged entrance animation; defaults to true
};

const navItems = [
  { href: "/monitoring", label: "Monitoramento", Icon: LayoutDashboard },
  { href: "/settings", label: "Configurações", Icon: Settings },
  { href: "/projects", label: "Projetos", Icon: ClipboardList },
  { href: "/kanban", label: "Kanban", Icon: KanbanSquare },
  { href: "/campaigns", label: "Campanhas", Icon: Megaphone },
];

export default function Sidebar({ show = true }: SidebarProps) {
  const pathname = usePathname();
  return (
    <aside className="fixed left-0 top-0 h-screen w-20 bg-transparent dark:bg-gray-900 z-40">
      <div className={`h-full flex items-center justify-center transition-all duration-400 ease-out ${show ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5'}`}>
        <nav className="flex flex-col items-center gap-3 rounded-full bg-gray-800/60 dark:bg-gray-700/60 p-2">
          {navItems.map(({ href, label, Icon }) => {
            const active = pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={`h-10 w-10 p-0 rounded-full flex items-center justify-center transition-colors ${active ? 'bg-zinc-800 text-white' : 'text-zinc-300 hover:bg-gray-700/60 hover:text-white'}`}
              >
                <Icon className="h-5 w-5" />
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
