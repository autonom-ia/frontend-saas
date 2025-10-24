export type Conversation = {
  created_at?: string;
  createdAt?: string;
  first_reply_created_at?: string;
  last_activity_at?: string;
  status?: string | number;
};

export type MetricsSummary = {
  avgFirstResponseMinutes: number | null;
  avgResolutionMinutes: number | null;
};

export type WeekdayAverages = {
  firstResponseByWeekday: Record<number, number>; // 0-6 -> minutes
  resolutionByWeekday: Record<number, number>; // 0-6 -> minutes
};

function toDate(s?: string): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function minutesBetween(a: Date, b: Date): number {
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 60000));
}

function getCreatedDate(c: Conversation): Date | null {
  return toDate(c.created_at || c.createdAt);
}

export function computeMetrics(conversations: Conversation[]): MetricsSummary {
  let sumFirst = 0;
  let countFirst = 0;
  let sumResolution = 0;
  let countResolution = 0;

  for (const c of conversations) {
    const created = getCreatedDate(c);
    if (!created) continue;

    const firstReply = toDate(c.first_reply_created_at);
    if (firstReply) {
      sumFirst += minutesBetween(created, firstReply);
      countFirst += 1;
    }

    const isResolved = c.status === 'resolved' || c.status === 'closed' || c.status === 1;
    const last = toDate(c.last_activity_at);
    if (isResolved && last) {
      sumResolution += minutesBetween(created, last);
      countResolution += 1;
    }
  }

  return {
    avgFirstResponseMinutes: countFirst ? Math.round(sumFirst / countFirst) : null,
    avgResolutionMinutes: countResolution ? Math.round(sumResolution / countResolution) : null,
  };
}

export function computeWeekdayAverages(conversations: Conversation[]): WeekdayAverages {
  const firstSum: Record<number, number> = {0:0,1:0,2:0,3:0,4:0,5:0,6:0};
  const firstCount: Record<number, number> = {0:0,1:0,2:0,3:0,4:0,5:0,6:0};
  const resSum: Record<number, number> = {0:0,1:0,2:0,3:0,4:0,5:0,6:0};
  const resCount: Record<number, number> = {0:0,1:0,2:0,3:0,4:0,5:0,6:0};

  for (const c of conversations) {
    const created = getCreatedDate(c);
    if (!created) continue;
    const weekday = created.getDay(); // 0-6

    const firstReply = toDate(c.first_reply_created_at);
    if (firstReply) {
      firstSum[weekday] += minutesBetween(created, firstReply);
      firstCount[weekday] += 1;
    }

    const isResolved = c.status === 'resolved' || c.status === 'closed' || c.status === 1;
    const last = toDate(c.last_activity_at);
    if (isResolved && last) {
      resSum[weekday] += minutesBetween(created, last);
      resCount[weekday] += 1;
    }
  }

  const firstResponseByWeekday: Record<number, number> = {0:0,1:0,2:0,3:0,4:0,5:0,6:0};
  const resolutionByWeekday: Record<number, number> = {0:0,1:0,2:0,3:0,4:0,5:0,6:0};

  for (let d = 0; d <= 6; d++) {
    firstResponseByWeekday[d] = firstCount[d] ? Math.round(firstSum[d] / firstCount[d]) : 0;
    resolutionByWeekday[d] = resCount[d] ? Math.round(resSum[d] / resCount[d]) : 0;
  }

  return { firstResponseByWeekday, resolutionByWeekday };
}
