"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, Settings, Megaphone } from "lucide-react";

const navItems = [
  { href: "/monitoring", label: "Monitoring", Icon: LayoutDashboard },
  { href: "/projects", label: "Projects", Icon: ClipboardList },
  { href: "/settings", label: "Settings", Icon: Settings },
  { href: "/campaigns", label: "Campanhas", Icon: Megaphone },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed left-0 top-0 h-screen w-16 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-4 gap-4 z-40">
      <div className="text-xs text-zinc-400 font-semibold">AI</div>
      <nav className="flex flex-col gap-3 mt-2">
        {navItems.map(({ href, label, Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={`p-2 rounded-md transition-colors ${active ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}
            >
              <Icon size={22} />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
