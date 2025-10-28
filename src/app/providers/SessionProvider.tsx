"use client";

import React, { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getStoredUser, setStoredUser, shouldRefresh, refreshTokens } from "@/lib/auth";

const REFRESH_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const nav = (performance?.getEntriesByType?.('navigation') || [])[0] as PerformanceNavigationTiming | undefined;
      const navType = nav?.type || 'unknown';
      console.log('[Session] navigation detected', { navType, pathname });
      
      // Não fazer nada em reloads - deixar as páginas gerenciarem via seus próprios guards
    } catch {}
  }, [router, pathname]);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
    if (!apiBase) return;
    // Do not run refresh logic on login page
    if ((pathname || "").startsWith('/login')) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const scheduleNext = (ms: number) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      const when = Math.max(1_000, ms);
      const runAt = Date.now() + when;
      console.log(`[Session] scheduling refresh in ${when}ms (at ${new Date(runAt).toLocaleTimeString()})`);
      timerRef.current = setTimeout(async () => {
        const current = getStoredUser();
        if (!current?.RefreshToken) return;
        try {
          console.log('[Session] attempting token refresh at', new Date().toLocaleTimeString());
          const updated = await refreshTokens(apiBase, current.RefreshToken);
          const now = Date.now();
          const merged = {
            ...current,
            ...updated,
            refreshedAt: now,
            isAuthenticated: true,
          };
          setStoredUser(merged);
          console.log('[Session] token refreshed; scheduling next in', REFRESH_INTERVAL_MS, 'ms');
          scheduleNext(REFRESH_INTERVAL_MS);
        } catch (e) {
          console.error('[Session] token refresh failed', e);
          setStoredUser({ ...current, isAuthenticated: false });
          router.push("/login");
        }
      }, when);
    };

    const initiate = () => {
      const data = getStoredUser();
      if (!data?.isAuthenticated || !data?.RefreshToken) return;
      const last = data.refreshedAt || data.loginAt || 0;
      const now = Date.now();
      const dueIn = last ? (last + REFRESH_INTERVAL_MS - now) : 0;
      if (shouldRefresh(data, now, REFRESH_INTERVAL_MS)) {
        console.log('[Session] refresh due now; scheduling immediate short delay');
        scheduleNext(2_000);
      } else {
        console.log('[Session] refresh not due; scheduling in', dueIn, 'ms');
        scheduleNext(dueIn);
      }
    };

    initiate();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [router, pathname]);

  return <>{children}</>;
}
