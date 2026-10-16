// Which message is shown on which day: { '2026-10-16': 861, ... }.
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
    const used = new Set(Object.values(result));
    const unused = ids.filter((id) => !used.has(id));
    result[day] = unused[Math.floor(random() * unused.length)];
  }
  return result;
}
