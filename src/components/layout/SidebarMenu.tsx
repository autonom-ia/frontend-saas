"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";

export type SidebarItem = {
  key: string;
  title: string;
  path: string;
  icon: React.ReactNode;
};

export type SidebarMenuProps = {
  items: SidebarItem[];
  show?: boolean; // controls initial show animation
  className?: string;
  onNavigate?: (path: string) => void;
};

export default function SidebarMenu({ items, show = true, className, onNavigate }: SidebarMenuProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navigate = (path: string) => {
    if (onNavigate) return onNavigate(path);
    router.push(path);
  };

  const isActive = (path: string) => {
    try {
      if (!pathname) return false;
      // consider exact match at first segment level
      const a = pathname.split("/").filter(Boolean)[0] || "";
      const b = path.split("/").filter(Boolean)[0] || "";
      return a === b;
    } catch {
      return false;
    }
  };

  return (
    <div className={`w-20 h-full bg-transparent dark:bg-gray-900 ${className || ""}`}>
      <div className={`h-full flex items-center justify-center transition-all duration-400 ease-out ${show ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5'}`}>
        <div className="flex flex-col items-center gap-3 rounded-full bg-gray-800/60 dark:bg-gray-700/60 p-2">
          {items.map((it) => (
            <Button
              key={it.key}
              className={`h-10 w-10 p-0 rounded-full bg-transparent hover:bg-gray-700/60 ${isActive(it.path) ? 'ring-2 ring-blue-500' : ''} text-white`}
              title={it.title}
              onClick={() => navigate(it.path)}
            >
              {it.icon}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
