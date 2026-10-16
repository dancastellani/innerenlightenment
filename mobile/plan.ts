// Which message is shown on which day: { '2026-10-16': 861, ... }.
// Extra messages asked for with "Another message" are kept as '2026-10-16 +1', '2026-10-16 +2', ...
// Kept on the phone so notifications, the home screen and "no repeats" all agree.
export type Plan = Record<string, number>;

// Local date as 'YYYY-MM-DD'.
export function dayKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Gives today and the next `days` days a message, never reusing one already in the plan,
// and forgets days older than `keepDays` so their messages can come back.
export function fillPlan(plan: Plan, ids: number[], today: Date, days = 14, keepDays = 90, random = Math.random): Plan {
  // new Date(y, m, d + i) handles month ends and daylight-saving changes.
  const addDays = (i: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
  const oldest = dayKey(addDays(-keepDays));
  const result: Plan = {};
  for (const [day, id] of Object.entries(plan)) {
    if (day >= oldest) result[day] = id;
  }

  for (let i = 0; i <= days; i++) {
    const day = dayKey(addDays(i));
    if (result[day] !== undefined) continue;
    result[day] = pickUnused(result, ids, random);
  }
  return result;
}

// UC-04: a message not shown in the last 90 days (the plan only keeps those days), recorded for today.
export function addAnother(plan: Plan, ids: number[], today: Date, random = Math.random): [Plan, number] {
  const day = dayKey(today);
  const count = Object.keys(plan).filter((key) => key.startsWith(`${day} +`)).length;
  const id = pickUnused(plan, ids, random);
  return [{ ...plan, [`${day} +${count + 1}`]: id }, id];
}

function pickUnused(plan: Plan, ids: number[], random: () => number): number {
  const used = new Set(Object.values(plan));
  const unused = ids.filter((id) => !used.has(id));
  // Every message was shown in the last 90 days: allow repeats rather than show nothing.
  const pool = unused.length > 0 ? unused : ids;
  return pool[Math.floor(random() * pool.length)];
}
