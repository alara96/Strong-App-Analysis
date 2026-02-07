import type { PRs } from "@/lib/types";

const AWARD_SVG = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    fill="currentColor"
    viewBox="0 0 16 16"
    className="opacity-90"
  >
    <path d="M9.669.864 8 0 6.331.864l-1.858.282-.842 1.68-1.337 1.32L2.6 6l-.306 1.854 1.337 1.32.842 1.68 1.858.282L8 12l1.669-.864 1.858-.282.842-1.68 1.337-1.32L13.4 6l.306-1.854-1.337-1.32-.842-1.68zm1.196 1.193.684 1.365 1.086 1.072L12.387 6l.248 1.506-1.086 1.072-.684 1.365-1.51.229L8 10.874l-1.355-.702-1.51-.229-.684-1.365-1.086-1.072L3.614 6l-.25-1.506 1.087-1.072.684-1.365 1.51-.229L8 1.126l1.356.702z" />
    <path d="M4 11.794V16l4-1 4 1v-4.206l-2.018.306L8 13.126 6.018 12.1z" />
  </svg>
);

const cards: { key: keyof PRs; label: string; gradient: string }[] = [
  { key: "bench", label: "Bench", gradient: "from-emerald-600 to-emerald-700" },
  { key: "deadlift", label: "Deadlift", gradient: "from-blue-600 to-blue-800" },
  { key: "squat", label: "Squat", gradient: "from-red-600 to-red-800" },
];

export function ValueCards({ prs }: { prs: PRs }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map(({ key, label, gradient }) => (
        <div
          key={key}
          className={`rounded-xl bg-gradient-to-br ${gradient} text-white p-5 shadow-lg flex items-center gap-4 min-h-[100px]`}
        >
          <div className="shrink-0">{AWARD_SVG}</div>
          <div>
            <p className="font-heading font-semibold text-white/90">{label}</p>
            <p className="text-2xl font-bold">
              {prs[key] > 0 ? `${prs[key].toFixed(2)} lbs` : "—"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
