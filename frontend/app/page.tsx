"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchDefaultData, fetch1RM, fetchVolume, uploadCsv } from "@/lib/api";
import type { OneRMResponse, UploadResponse, VolumeResponse } from "@/lib/types";
import { ValueCards } from "@/components/ValueCard";
import { StatsCards } from "@/components/StatsCards";
import { Chart1RM } from "@/components/Chart1RM";
import { ChartVolume } from "@/components/ChartVolume";
import { DataTable } from "@/components/DataTable";

type AnalysisType = "1" | "2";

export default function AnalyzePage() {
  const [upload, setUpload] = useState<UploadResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [analysisType, setAnalysisType] = useState<AnalysisType>("1");
  const [exercise, setExercise] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [oneRM, setOneRM] = useState<OneRMResponse | null>(null);
  const [volume, setVolume] = useState<VolumeResponse | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const loadDefault = useCallback(async () => {
    setLoading(true);
    setUploadError(null);
    try {
      const res = await fetchDefaultData();
      setUpload(res);
      if (res.exercises.length) setExercise(res.exercises[0]);
      if (res.date_range.min) setStartDate(res.date_range.min.slice(0, 10));
      if (res.date_range.max) setEndDate(res.date_range.max.slice(0, 10));
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDefault();
  }, [loadDefault]);

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    try {
      const res = await uploadCsv(file);
      setUpload(res);
      if (res.exercises.length) setExercise(res.exercises[0]);
      if (res.date_range.min) setStartDate(res.date_range.min.slice(0, 10));
      if (res.date_range.max) setEndDate(res.date_range.max.slice(0, 10));
      setOneRM(null);
      setVolume(null);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    }
  }, []);

  useEffect(() => {
    if (!upload?.data.length || !startDate || !endDate) return;
    if (analysisType === "1") {
      if (!exercise) return;
      setAnalysisLoading(true);
      fetch1RM(upload.data, exercise, startDate, endDate)
        .then(setOneRM)
        .catch(() => setOneRM(null))
        .finally(() => setAnalysisLoading(false));
    } else {
      setAnalysisLoading(true);
      fetchVolume(upload.data, startDate, endDate)
        .then(setVolume)
        .catch(() => setVolume(null))
        .finally(() => setAnalysisLoading(false));
    }
  }, [upload, analysisType, exercise, startDate, endDate]);

  const selectedExerciseSetsReps = upload?.data
    ? upload.data
        .filter((r) => r["Exercise Name"] === exercise)
        .reduce(
          (acc, r) => ({ sets: acc.sets + 1, reps: acc.reps + (r.Reps || 0) }),
          { sets: 0, reps: 0 }
        )
    : { sets: 0, reps: 0 };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500">Loading default data…</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <label className="block font-heading font-semibold text-gray-700 mb-2">
          Upload Workout CSV
        </label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFile}
          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-accent file:text-white file:font-medium file:cursor-pointer hover:file:bg-accent/90"
        />
        {uploadError && (
          <p className="mt-2 text-sm text-red-600">{uploadError}</p>
        )}
      </div>

      {!upload && (
        <p className="text-gray-500">Upload a workout CSV or ensure the API is running with default data.</p>
      )}

      {upload && (
        <>
          <div className="mb-6 flex flex-wrap gap-4 items-end">
            <div>
              <label className="block font-heading font-semibold text-gray-700 mb-1">
                Exercise (1 Rep Analysis)
              </label>
              <select
                value={exercise}
                onChange={(e) => setExercise(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-800 shadow-sm focus:border-accent focus:ring-2 focus:ring-accent/20 min-w-[200px]"
              >
                {upload.exercises.map((ex) => (
                  <option key={ex} value={ex}>
                    {ex}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-heading font-semibold text-gray-700 mb-1">
                Analysis Type
              </label>
              <select
                value={analysisType}
                onChange={(e) => setAnalysisType(e.target.value as AnalysisType)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-800 shadow-sm focus:border-accent focus:ring-2 focus:ring-accent/20"
              >
                <option value="1">1 Rep Max Prediction</option>
                <option value="2">Volume vs Average</option>
              </select>
            </div>
            <div>
              <label className="block font-heading font-semibold text-gray-700 mb-1">
                Time period
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800 shadow-sm focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
                <span className="text-gray-500">–</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800 shadow-sm focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>
          </div>

          <p className="text-center text-gray-600 mb-8">
            Total sets: {selectedExerciseSetsReps.sets}, Total reps: {selectedExerciseSetsReps.reps}
          </p>

          <h2 className="font-heading font-bold text-xl text-center text-gray-800 mb-6">
            All-Time Personal Bests
          </h2>
          <ValueCards prs={upload.prs} />
          <hr className="my-8 border-gray-200" />

          {analysisType === "1" && (
            <>
              <h2 className="font-heading font-bold text-xl text-center text-gray-800 mb-4">
                {exercise} — Predicted 1 Rep Max
              </h2>
              {analysisLoading ? (
                <p className="text-gray-500 text-center py-8">Loading…</p>
              ) : (
                <Chart1RM data={oneRM?.daily_max ?? []} />
              )}
              {oneRM && (
                <>
                  <div className="mt-6">
                    <StatsCards stats={oneRM.stats} />
                  </div>
                  <hr className="my-8 border-gray-200" />
                  <DataTable data={oneRM.table_data} title={`${exercise} Data`} />
                </>
              )}
            </>
          )}

          {analysisType === "2" && (
            <>
              <h2 className="font-heading font-bold text-xl text-center text-gray-800 mb-4">
                Workout Volume vs Average
              </h2>
              {analysisLoading ? (
                <p className="text-gray-500 text-center py-8">Loading…</p>
              ) : (
                <ChartVolume data={volume?.daily_volume ?? []} />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
