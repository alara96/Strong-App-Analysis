type Row = { Date: string; "Set Order": number; Weight: number; Reps: number };

type DayRow = {
  dateKey: string;
  dateDisplay: string;
  sets: string[];
  totalVolume: number;
};

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function dateToKey(dateStr: string): string {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toISOString().slice(0, 10);
}

function groupByDate(rows: Row[]): DayRow[] {
  const byDate = new Map<string, Row[]>();
  for (const row of rows) {
    const key = dateToKey(row.Date);
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key)!.push(row);
  }
  const result: DayRow[] = [];
  for (const [dateKey, dayRows] of byDate) {
    const sorted = [...dayRows].sort((a, b) => a["Set Order"] - b["Set Order"]);
    const sets = sorted.map((r) => `${r.Weight}×${r.Reps}`);
    const totalVolume = sorted.reduce((sum, r) => sum + r.Weight * r.Reps, 0);
    result.push({
      dateKey,
      dateDisplay: formatDate(sorted[0].Date),
      sets,
      totalVolume,
    });
  }
  result.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  return result;
}

export function DataTable({
  data,
  title,
}: {
  data: Row[];
  title: string;
}) {
  if (!data.length) {
    return (
      <div className="rounded-xl border border-gray-200/80 bg-white p-8 shadow-sm">
        <h2 className="font-heading font-bold text-lg text-center text-gray-700 mb-2">
          {title}
        </h2>
        <p className="text-center text-gray-500 text-sm">No rows in this range.</p>
      </div>
    );
  }

  const dayRows = groupByDate(data);

  return (
    <div className="rounded-xl border border-gray-200/80 bg-white overflow-hidden shadow-sm ring-1 ring-black/5">
      <div className="border-b border-gray-200/80 bg-gradient-to-r from-gray-50 to-gray-50/70 px-5 py-4">
        <h2 className="font-heading font-bold text-base text-gray-800 tracking-tight">
          {title}
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100/80">
              <th className="text-left py-3.5 px-5 font-heading font-semibold text-gray-600 text-xs uppercase tracking-wider">
                Date
              </th>
              <th className="text-left py-3.5 px-5 font-heading font-semibold text-gray-600 text-xs uppercase tracking-wider">
                Sets (weight × reps)
              </th>
              <th className="text-right py-3.5 px-5 font-heading font-semibold text-gray-600 text-xs uppercase tracking-wider">
                Total volume
              </th>
            </tr>
          </thead>
          <tbody>
            {dayRows.map((day, i) => (
              <tr
                key={day.dateKey}
                className={`
                  border-b border-gray-100 last:border-0
                  transition-colors duration-150
                  hover:bg-accent/5
                  ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}
                `}
              >
                <td className="py-3 px-5 text-gray-700 tabular-nums font-medium">
                  {day.dateDisplay}
                </td>
                <td className="py-3 px-5 text-gray-700">
                  <span className="inline-flex flex-wrap gap-x-2 gap-y-1">
                    {day.sets.map((s, j) => (
                      <span
                        key={j}
                        className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-gray-800 tabular-nums font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </span>
                </td>
                <td className="text-right py-3 px-5 text-gray-800 tabular-nums font-semibold">
                  {day.totalVolume.toLocaleString()} lbs
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
