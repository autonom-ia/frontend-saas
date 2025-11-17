"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, Settings, Megaphone, KanbanSquare } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

type SidebarProps = {
  show?: boolean; // staged entrance animation; defaults to true
};

const navItems = [
  { href: "/monitoring", label: "Monitoramento", Icon: LayoutDashboard },
  { href: "/kanban", label: "Kanban", Icon: KanbanSquare },
  { href: "/settings", label: "Configurações", Icon: Settings },
  { href: "/campaigns", label: "Campanhas", Icon: Megaphone },
  { href: "/projects", label: "Projetos", Icon: ClipboardList },
];

export default function Sidebar({ show = true }: SidebarProps) {
  const pathname = usePathname();
  const { theme } = useTheme();
  
  return (
    <aside className={`fixed left-0 top-0 h-screen w-20 bg-transparent z-40`}>
      <div className={`h-full flex items-center justify-center transition-all duration-400 ease-out ${show ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5'}`}>
        <nav className={`flex flex-col items-center gap-3 rounded-full ${theme.colors.background.card} ${theme.colors.border.primary} p-2 shadow-lg`}>
          {navItems.map(({ href, label, Icon }) => {
            const active = pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={`h-10 w-10 p-0 rounded-full flex items-center justify-center transition-colors ${active ? 'bg-blue-600 text-white' : `${theme.colors.text.muted} ${theme.colors.background.hover}`}`}
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
