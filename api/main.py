"""
Lift Metrics - FastAPI backend.
Same logic as the original Shiny app; returns JSON for a React/Next.js frontend.
"""
import os
from pathlib import Path

import numpy as np
import pandas as pd
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Lift Metrics API")

_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if os.environ.get("LIFT_METRICS_FRONTEND_URL"):
    _origins.append(os.environ.get("LIFT_METRICS_FRONTEND_URL").rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Default dataset (same as Shiny app)
DEFAULT_CSV = Path(__file__).parent.parent / "data" / "strong.csv"


def parse_workout_df(df: pd.DataFrame) -> pd.DataFrame:
    """Normalize columns and ensure correct dtypes."""
    cols = ["Date", "Exercise Name", "Set Order", "Weight", "Reps"]
    out = df[[c for c in cols if c in df.columns]].copy()
    out["Date"] = pd.to_datetime(out["Date"])
    return out


def get_prs(df: pd.DataFrame) -> dict[str, float]:
    """All-time PRs for Bench, Deadlift, Squat (max weight)."""
    bench = df[df["Exercise Name"].str.contains("Bench Press", na=False)]["Weight"].max()
    deadlift = df[df["Exercise Name"].str.contains("Deadlift", na=False)]["Weight"].max()
    squat = df[df["Exercise Name"].str.contains("Squat", na=False)]["Weight"].max()
    return {
        "bench": float(bench) if pd.notna(bench) else 0.0,
        "deadlift": float(deadlift) if pd.notna(deadlift) else 0.0,
        "squat": float(squat) if pd.notna(squat) else 0.0,
    }


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/default-data")
def get_default_data():
    """Return parsed default CSV so the app works without an upload."""
    if not DEFAULT_CSV.exists():
        raise HTTPException(status_code=404, detail="Default data file not found")
    df = parse_workout_df(pd.read_csv(DEFAULT_CSV))
    exercises = sorted(df["Exercise Name"].dropna().unique().tolist())
    date_min = df["Date"].min().isoformat() if len(df) else None
    date_max = df["Date"].max().isoformat() if len(df) else None
    rows = df.astype({"Date": str}).to_dict(orient="records")
    return {
        "exercises": exercises,
        "data": rows,
        "date_range": {"min": date_min, "max": date_max},
        "prs": get_prs(df),
    }


@app.post("/api/upload")
async def upload(file: UploadFile = File(...)):
    """Parse uploaded workout CSV (e.g. from Strong app export) and return exercises, data, date range, and PRs."""
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="CSV file required")
    contents = await file.read()
    try:
        df = pd.read_csv(pd.io.common.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid CSV: {e}")
    df = parse_workout_df(df)
    exercises = sorted(df["Exercise Name"].dropna().unique().tolist())
    date_min = df["Date"].min().isoformat() if len(df) else None
    date_max = df["Date"].max().isoformat() if len(df) else None
    rows = df.astype({"Date": str}).to_dict(orient="records")
    return {
        "exercises": exercises,
        "data": rows,
        "date_range": {"min": date_min, "max": date_max},
        "prs": get_prs(df),
    }


class OneRMRequest(BaseModel):
    data: list[dict]
    exercise: str
    start_date: str
    end_date: str


@app.post("/api/analysis/1rm")
def analysis_1rm(req: OneRMRequest):
    """1 Rep Max (Epley) over time + stats + table for selected exercise and date range."""
    df = pd.DataFrame(req.data)
    if df.empty:
        return {"daily_max": [], "stats": {"best_pr": 0, "average_volume": 0, "total_volume": 0}, "table_data": []}
    df["Date"] = pd.to_datetime(df["Date"])
    df = df[df["Exercise Name"] == req.exercise].copy()
    if df.empty:
        return {"daily_max": [], "stats": {"best_pr": 0, "average_volume": 0, "total_volume": 0}, "table_data": []}
    df["Date_dt"] = df["Date"].dt.date
    start = pd.to_datetime(req.start_date).date()
    end = pd.to_datetime(req.end_date).date()
    mask = (df["Date_dt"] >= start) & (df["Date_dt"] <= end)
    df = df.loc[mask]
    if df.empty:
        return {"daily_max": [], "stats": {"best_pr": 0, "average_volume": 0, "total_volume": 0}, "table_data": []}

    # Epley 1RM
    df["1_Rep_Max"] = (df["Weight"] * df["Reps"] / 30) + df["Weight"]
    daily_max = df.groupby("Date")["1_Rep_Max"].max().reset_index()
    daily_max["date"] = daily_max["Date"].dt.strftime("%Y-%m-%d")
    daily_max = daily_max.rename(columns={"1_Rep_Max": "one_rep_max"})

    stats = {
        "best_pr": float(df["Weight"].max()),
        "average_volume": float((df["Weight"] * df["Reps"]).mean()),
        "total_volume": float((df["Weight"] * df["Reps"]).sum()),
    }

    table = df[["Date", "Set Order", "Weight", "Reps"]].copy()
    table["Date"] = table["Date"].astype(str)
    table_data = table.to_dict(orient="records")

    return {
        "daily_max": daily_max[["date", "one_rep_max"]].to_dict(orient="records"),
        "stats": stats,
        "table_data": table_data,
    }


class VolumeRequest(BaseModel):
    data: list[dict]
    start_date: str
    end_date: str


@app.post("/api/analysis/volume")
def analysis_volume(req: VolumeRequest):
    """Daily volume vs average over date range."""
    df = pd.DataFrame(req.data)
    if df.empty:
        return {"daily_volume": []}
    df["Date"] = pd.to_datetime(df["Date"])
    df["Date_dt"] = df["Date"].dt.date
    start = pd.to_datetime(req.start_date).date()
    end = pd.to_datetime(req.end_date).date()
    mask = (df["Date_dt"] >= start) & (df["Date_dt"] <= end)
    df = df.loc[mask]
    if df.empty:
        return {"daily_volume": []}
    df["Volume"] = df["Weight"] * df["Reps"]
    daily_volume = df.groupby("Date")["Volume"].sum().reset_index()
    daily_volume["Average_Volume"] = daily_volume["Volume"].mean()
    daily_volume["Color"] = np.where(
        daily_volume["Volume"] < daily_volume["Average_Volume"],
        "Below Average",
        "Above Average",
    )
    daily_volume["date"] = daily_volume["Date"].dt.strftime("%Y-%m-%d")
    out = daily_volume[["date", "Volume", "Average_Volume", "Color"]].copy()
    out = out.rename(columns={"Volume": "volume", "Average_Volume": "average_volume", "Color": "color"})
    return {"daily_volume": out.to_dict(orient="records")}


if __name__ == "__main__":
    import os
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
