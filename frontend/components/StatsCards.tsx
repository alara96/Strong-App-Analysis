type Stats = { best_pr: number; average_volume: number; total_volume: number };

const cards: { key: keyof Stats; label: string; gradient: string }[] = [
  { key: "best_pr", label: "Exercise Best", gradient: "from-amber-500 to-amber-700" },
  { key: "average_volume", label: "Average Volume", gradient: "from-orange-500 to-orange-700" },
  { key: "total_volume", label: "Total Volume", gradient: "from-violet-600 to-violet-800" },
];

export function StatsCards({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map(({ key, label, gradient }) => (
        <div
          key={key}
          className={`rounded-xl bg-gradient-to-br ${gradient} text-white p-5 shadow-lg`}
        >
          <p className="font-heading font-semibold text-white/90 text-sm">{label}</p>
          <p className="text-xl font-bold mt-1">
            {key === "best_pr"
              ? `${stats[key].toFixed(2)} lbs`
              : `${stats[key].toFixed(2)} lbs`}
          </p>
        </div>
      ))}
    </div>
  );
}
