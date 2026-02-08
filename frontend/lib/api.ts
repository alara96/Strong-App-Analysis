const API_BASE = (process.env.NEXT_PUBLIC_LIFT_METRICS_BACKEND_API || "http://localhost:8000").replace(/\/$/, "");

export async function fetchDefaultData(): Promise<import("./types").UploadResponse> {
  const res = await fetch(`${API_BASE}/api/default-data`);
  if (!res.ok) throw new Error("Failed to load default data");
  return res.json();
}

export async function uploadCsv(file: File): Promise<import("./types").UploadResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/api/upload`, { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Upload failed");
  }
  return res.json();
}

export async function fetch1RM(
  data: import("./types").WorkoutRow[],
  exercise: string,
  startDate: string,
  endDate: string
): Promise<import("./types").OneRMResponse> {
  const res = await fetch(`${API_BASE}/api/analysis/1rm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data,
      exercise,
      start_date: startDate,
      end_date: endDate,
    }),
  });
  if (!res.ok) throw new Error("1RM analysis failed");
  return res.json();
}

export async function fetchVolume(
  data: import("./types").WorkoutRow[],
  startDate: string,
  endDate: string
): Promise<import("./types").VolumeResponse> {
  const res = await fetch(`${API_BASE}/api/analysis/volume`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data,
      start_date: startDate,
      end_date: endDate,
    }),
  });
  if (!res.ok) throw new Error("Volume analysis failed");
  return res.json();
}
