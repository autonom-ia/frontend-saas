"use client";

import React, { useEffect, useMemo, useState } from "react";
import { computeMetrics, computeWeekdayAverages } from "@/services/conversations";

type Conversation = {
  created_at?: string;
  createdAt?: string;
  first_reply_created_at?: string;
  last_activity_at?: string;
  status?: string | number;
};

export default function Indicators({ data }: { data: Conversation[] }) {
  const metricsSummary = useMemo(() => computeMetrics(data || []), [data]);
  const weekdayAvgs = useMemo(() => computeWeekdayAverages(data || []), [data]);
  const weekdayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const toHours = (m?: number | null) => {
    if (m == null) return null;
    const h = m / 60;
    return Math.round(h * 10) / 10; // 1 casa decimal
  };

  // Simple mount/update animation for bar charts
  const [progress, setProgress] = useState(1);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const duration = 800; // ms
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    setProgress(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [JSON.stringify(weekdayAvgs)]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-lg border border-blue-700/60 bg-blue-900/20 p-4">
          <div className="text-sm text-blue-300">Tempo médio de primeiro atendimento</div>
          <div className="mt-2 text-3xl font-semibold text-blue-400">
            {toHours(metricsSummary.avgFirstResponseMinutes) ?? "—"} <span className="text-base font-normal text-blue-300">h</span>
          </div>
        </div>
        <div className="rounded-lg border border-blue-700/60 bg-blue-900/20 p-4">
          <div className="text-sm text-blue-300">Tempo médio em atendimento (resolvidas)</div>
          <div className="mt-2 text-3xl font-semibold text-blue-400">
            {toHours(metricsSummary.avgResolutionMinutes) ?? "—"} <span className="text-base font-normal text-blue-300">h</span>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <div className="mb-2 text-sm text-gray-300">Média de primeiro atendimento por dia da semana (horas)</div>
          <div className="rounded-md border border-gray-700 bg-gray-900/60 p-6">
            <div className="h-56 w-full overflow-x-auto">
              <div className="h-56 flex items-end gap-3 pr-2" style={{ minWidth: 7 * 56 }}>
                {weekdayLabels.map((label, i) => {
                  const vMin = weekdayAvgs.firstResponseByWeekday[i] || 0;
                  const maxMin = Math.max(...Object.values(weekdayAvgs.firstResponseByWeekday));
                  const v = vMin;
                  const max = maxMin;
                  const vHours = Math.round((vMin / 60) * 10) / 10;
                  const hBase = max > 0 ? Math.max(Math.round((v / max) * 100), v > 0 ? 3 : 0) : 0;
                  const h = Math.round(hBase * progress);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center" style={{ minWidth: 56 }}>
                      <div className="w-full h-44 relative">
                        <div className="absolute left-1/2 -translate-x-1/2 text-[10px] text-gray-200" style={{ bottom: `calc(${h}% + 4px)` }}>
                          {vHours}
                        </div>
                        <div className="absolute bottom-0 w-full bg-blue-500 rounded-sm" style={{ height: `${h}%` }} />
                      </div>
                      <div className="mt-1 text-[10px] text-gray-300 truncate w-full text-center" title={label}>{label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-2 text-sm text-gray-300">Média de atendimento por dia da semana (resolvidas, horas)</div>
          <div className="rounded-md border border-gray-700 bg-gray-900/60 p-6">
            <div className="h-56 w-full overflow-x-auto">
              <div className="h-56 flex items-end gap-3 pr-2" style={{ minWidth: 7 * 56 }}>
                {weekdayLabels.map((label, i) => {
                  const vMin = weekdayAvgs.resolutionByWeekday[i] || 0;
                  const maxMin = Math.max(...Object.values(weekdayAvgs.resolutionByWeekday));
                  const v = vMin;
                  const max = maxMin;
                  const vHours = Math.round((vMin / 60) * 10) / 10;
                  const hBase = max > 0 ? Math.max(Math.round((v / max) * 100), v > 0 ? 3 : 0) : 0;
                  const h = Math.round(hBase * progress);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center" style={{ minWidth: 56 }}>
                      <div className="w-full h-44 relative">
                        <div className="absolute left-1/2 -translate-x-1/2 text-[10px] text-gray-200" style={{ bottom: `calc(${h}% + 4px)` }}>
                          {vHours}
                        </div>
                        <div className="absolute bottom-0 w-full bg-blue-500 rounded-sm" style={{ height: `${h}%` }} />
                      </div>
                      <div className="mt-1 text-[10px] text-gray-300 truncate w-full text-center" title={label}>{label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
