export type WorkoutRow = {
  Date: string;
  "Exercise Name": string;
  "Set Order": number;
  Weight: number;
  Reps: number;
};

export type DateRange = { min: string | null; max: string | null };

export type PRs = { bench: number; deadlift: number; squat: number };

export type UploadResponse = {
  exercises: string[];
  data: WorkoutRow[];
  date_range: DateRange;
  prs: PRs;
};

export type OneRMResponse = {
  daily_max: { date: string; one_rep_max: number }[];
  stats: { best_pr: number; average_volume: number; total_volume: number };
  table_data: { Date: string; "Set Order": number; Weight: number; Reps: number }[];
};

export type VolumeResponse = {
  daily_volume: {
    date: string;
    volume: number;
    average_volume: number;
    color: string;
  }[];
};
