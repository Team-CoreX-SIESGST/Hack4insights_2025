# app.py  (FastAPI backend)
from fastapi import FastAPI, Query
from typing import Literal
import pandas as pd

api = FastAPI(title="Sessions API")

# ---------- unified CSV registry ----------
CSV = {
    # granular views
    "daily-detailed":   "daily_sessions_detailed.csv",
    "daily-source":     "daily_by_source.csv",
    "daily-device":     "daily_by_device.csv",
    "weekly-detailed":  "weekly_sessions_detailed.csv",
    "weekly-source":    "weekly_by_source.csv",
    "weekly-device":    "weekly_by_device.csv",
    "monthly-detailed": "monthly_sessions_detailed.csv",
    "monthly-source":   "monthly_by_source.csv",
    "monthly-device":   "monthly_by_device.csv",
    # totals-only views
    "daily-totals":     "daily_sessions.csv",
    "weekly-totals":    "sessions_weekly.csv",
    "monthly-totals":   "monthly_sessions.csv",
}

# ---------- universal loader ----------
def read_csv(name: str) -> pd.DataFrame:
    df = pd.read_csv(CSV[name], parse_dates=["date"], infer_datetime_format=True)
    # unify time column -> 'x'
    for col in ["date", "week_period", "month_period"]:
        if col in df.columns:
            df = df.rename(columns={col: "x"})
            break
    return df

# ---------- single endpoint (unchanged contract) ----------
@api.get("/data")
def get_data(
    view: Literal[tuple(CSV.keys())] = Query(...),
    metric: Literal["sessions", "unique_users", "first_time_sessions", "repeat_sessions"] = Query("sessions"),
    dimension: Literal["traffic_source", "device_type", "both", "total"] = Query("both"),
):
    df = read_csv(view)

    # totals files → force dimension = total
    if view.endswith("-totals"):
    dimension = "total"

    if dimension == "total":
        out = (df.groupby("x")["sessions"]
                .sum()
                .reset_index(name="y"))
        out["color"] = "total"
    else:
        grp = ["x"]
        if dimension == "both":
            grp += ["traffic_source", "device_type"]
        else:
            grp += [dimension]

        out = (df.groupby(grp)[metric]
             .sum()
             .reset_index(name="y"))

        if dimension == "both":
            out["color"] = out["traffic_source"].astype(str) + " | " + out["device_type"].astype(str)
        else:
            out["color"] = out[dimension].astype(str)

# ---------- return ----------
    return out.to_dict(orient="records")