// Which message is shown on which day: { '2026-10-16': 861, ... }.
// Kept on the phone so the notification and the home screen show the same message.
export type Plan = Record<string, number>;

// Local date as 'YYYY-MM-DD'.
export function dayKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Gives today and the next `days` days a random message, keeping days already planned
// and forgetting days before today.
export function fillPlan(plan: Plan, ids: number[], today: Date, days = 14, random = Math.random): Plan {
  // new Date(y, m, d + i) handles month ends and daylight-saving changes.
  const addDays = (i: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
  const result: Plan = {};
  for (const [day, id] of Object.entries(plan)) {
    if (day >= dayKey(today)) result[day] = id;
  }

  for (let i = 0; i <= days; i++) {
    const day = dayKey(addDays(i));
    if (result[day] === undefined) result[day] = ids[Math.floor(random() * ids.length)];
  }
  return result;
}
