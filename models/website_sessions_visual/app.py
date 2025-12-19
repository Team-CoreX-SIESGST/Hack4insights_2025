# main.py
import streamlit as st
import pandas as pd
import plotly.express as px
from pathlib import Path

st.set_page_config(page_title="Sessions Analytics", layout="wide")
st.markdown("## 📊 Sessions Analytics – Granular & Totals")

# ---------- theme ----------
st.markdown("""
<style>
#MainMenu {visibility: hidden;} footer {visibility: hidden;}
.block-container {padding-top: 1.5rem;}
.metric-card {background-color: #0e1117; padding: 15px; border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,.25);}
.metric-number {font-size: 2.2rem; color:#03c4a1;}
.metric-label  {font-size: .9rem; color:#f5f5f5;}
</style>""", unsafe_allow_html=True)

# ---------- sidebar ----------
with st.sidebar:
    st.image("https://cdn-icons-png.flaticon.com/512/2965/2965879.png", width=60)
    st.title("Control Panel")

    granularity = st.selectbox("Granularity", ["Daily", "Weekly", "Monthly"])
    data_source = st.radio("Data source",
                           ["Granular (traffic + device)", "Totals only (date → sessions)"])

    if data_source == "Granular (traffic + device)":
        metric = st.selectbox("Metric",
                              ["sessions","unique_users","first_time_sessions","repeat_sessions"])
        dimension = st.radio("Split by", ["traffic_source","device_type","both"])
    else:
        metric, dimension = "sessions", "total"

# ---------- file mapping ----------
CSV_MAP = {
    "Daily": {
        "granular": "daily_sessions_detailed.csv",
        "totals":   "daily_sessions.csv",
    },
    "Weekly": {
        "granular": "weekly_sessions_detailed.csv",
        "totals":   "sessions_weekly.csv",
    },
    "Monthly": {
        "granular": "monthly_sessions_detailed.csv",
        "totals":   "monthly_sessions.csv",
    },
}

# ---------- safe loader ----------
@st.cache_data(show_spinner=False)
def _load(which: str) -> pd.DataFrame:
    file = CSV_MAP[granularity][which]
    df = pd.read_csv(Path(__file__).with_name(file))
    # harmonise time column -> 'x'
    for col in ["date","week_period","month_period"]:
        if col in df.columns:
            if col == "date":
                df[col] = pd.to_datetime(df[col])
            df = df.rename(columns={col: "x"})
            break
    else:
        st.error(f"No time column in {file}"); st.stop()
    return df

raw = _load("totals" if data_source.startswith("Totals") else "granular")

# ---------- build dataset ----------
if data_source.startswith("Totals"):
    df = raw.rename(columns={"sessions": "y"})[["x","y"]]
    df["color"] = "total"
else:
    cols, grp = ["x"], []
    if dimension == "both":
        cols += ["traffic_source","device_type"]
        raw["color"] = raw["traffic_source"].astype(str) + " | " + raw["device_type"].astype(str)
    else:
        cols += [dimension]
        raw["color"] = raw[dimension].astype(str)

    df = (raw.groupby(cols)[metric].sum()
            .reset_index()
            .rename(columns={metric: "y"}))

# *******  FIX: ensure datetime *******
df["x"] = pd.to_datetime(df["x"], errors="coerce")
# *************************************

# ---------- KPI ----------
latest = df["y"].sum()
prev   = df[df["x"] != df["x"].max()]["y"].sum()
delta  = (latest - prev) / (prev or 1)

c1, c2, c3, c4 = st.columns(4)
c1.markdown(f'<div class="metric-card"><div class="metric-number">{latest:,}</div>'
            f'<div class="metric-label">Total {metric.replace("_"," ")}</div></div>',
            unsafe_allow_html=True)
c2.metric("Change vs previous", f"{delta:+.1%}")
c3.metric("Peak", f"{df['y'].max():,}")
c4.metric("Average", f"{df['y'].mean():.0f}")

# ---------- charts ----------
col1, col2 = st.columns([3, 1])

with col1:
    fig_line = px.line(df, x="x", y="y", color="color", markers=True,
                       title=f"{metric.replace('_',' ').title()} over time")
    fig_line.update_layout(template="plotly_dark", height=400, xaxis_title=None, yaxis_title=None)
    st.plotly_chart(fig_line, width="stretch")

with col2:
    pie_df = df.groupby("color")["y"].sum().reset_index()
    fig_pie = px.pie(pie_df, names="color", values="y", hole=0.6, title="Share")
    fig_pie.update_layout(template="plotly_dark", height=400, showlegend=False)
    st.plotly_chart(fig_pie, width="stretch")

bar_df = df.groupby(["color", pd.Grouper(key="x", freq="M")])["y"].sum().reset_index()
fig_bar = px.bar(bar_df, x="x", y="y", color="color", title="Period comparison")
fig_bar.update_layout(template="plotly_dark", height=350, xaxis_title=None, yaxis_title=None)
st.plotly_chart(fig_bar, width="stretch")

# ---------- download ----------
csv = df.to_csv(index=False).encode("utf-8")
st.download_button(label=f"⬇ Download {granularity.lower()} data as CSV",
                   data=csv, file_name=f"{granularity.lower()}_{metric}.csv",
                   mime="text/csv")

with st.expander("View raw data"):
    st.dataframe(df, width="stretch")