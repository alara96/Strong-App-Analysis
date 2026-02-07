import Link from "next/link";

export default function PurposePage() {
  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <h1 className="font-heading font-bold text-2xl text-gray-800 mb-2">
        Lift Metrics
      </h1>

      <h2 className="font-heading font-semibold text-lg text-gray-800 mt-8 mb-2">
        Overview
      </h2>
      <p className="text-gray-600 leading-relaxed mb-4">
        This app helps you analyze workout data exported from the Strong app. You can:
      </p>
      <ul className="list-disc list-inside text-gray-600 space-y-1 mb-6">
        <li>
          <strong>1 Rep Max prediction</strong> — See predicted 1RM for any exercise over a chosen time period (Epley formula).
        </li>
        <li>
          <strong>Volume vs average</strong> — Compare daily workout volume to your average volume over a time period.
        </li>
        <li>
          View <strong>all-time personal bests</strong> for Bench Press, Deadlift, and Squat.
        </li>
      </ul>

      <h2 className="font-heading font-semibold text-lg text-gray-800 mt-8 mb-2">
        Instructions
      </h2>
      <p className="text-gray-600 leading-relaxed mb-6">
        Upload your workout CSV exported from Strong (or use the default sample), pick an exercise and date range, and choose either 1 Rep Max or Volume analysis. The charts and table update automatically.
      </p>

      <h2 className="font-heading font-semibold text-lg text-gray-800 mt-8 mb-2">
        Citations
      </h2>
      <p className="text-gray-600 leading-relaxed mb-2">
        <strong>Workout data</strong> — Exported from the{" "}
        <a
          href="https://www.strong.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent font-medium hover:underline"
        >
          Strong App
        </a>
        .
      </p>
      <p className="text-gray-600 leading-relaxed">
        <strong>1 Rep Max (Epley)</strong> — Epley, B. Poundage chart. In: Boyd Epley Workout. Lincoln, NE: Body Enterprises, 1985. p. 86.
      </p>

      <p className="mt-10">
        <Link
          href="/"
          className="text-accent font-medium hover:underline"
        >
          ← Back to Analyze
        </Link>
      </p>
    </div>
  );
}
