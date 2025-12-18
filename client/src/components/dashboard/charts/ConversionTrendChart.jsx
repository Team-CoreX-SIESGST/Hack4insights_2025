import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  ComposedChart,
} from "recharts";
import { formatPercentage, formatNumber } from "@/utils/dataCleaners";

const ConversionTrendChart = ({ sessions, orders }) => {
  // Calculate daily conversion rates
  const calculateDailyConversionRates = () => {
    const sessionsByDate = sessions.reduce((acc, session) => {
      const date = session.created_at_date;
      if (!acc[date]) {
        acc[date] = { sessions: 0, orders: 0 };
      }
      acc[date].sessions++;
      return acc;
    }, {});

    // Count orders per date
    orders.forEach((order) => {
      const session = sessions.find(
        (s) => s.website_session_id === order.website_session_id
      );
      if (session) {
        const date = session.created_at_date;
        if (sessionsByDate[date]) {
          sessionsByDate[date].orders++;
        }
      }
    });

    // Convert to array and calculate conversion rate
    return Object.entries(sessionsByDate)
      .map(([date, data]) => ({
        date,
        sessions: data.sessions,
        orders: data.orders,
        conversionRate:
          data.sessions > 0 ? (data.orders / data.sessions) * 100 : 0,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-30); // Last 30 days
  };

  const data = calculateDailyConversionRates();

  // Calculate moving average for smoother line
  const calculateMovingAverage = (data, window = 7) => {
    return data.map((point, index) => {
      const start = Math.max(0, index - window + 1);
      const windowData = data.slice(start, index + 1);
      const avg =
        windowData.reduce((sum, d) => sum + d.conversionRate, 0) /
        windowData.length;
      return { ...point, movingAvg: avg };
    });
  };

  const dataWithMovingAvg = calculateMovingAverage(data);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-4 border border-border shadow-lg">
          <p className="text-sm font-medium text-foreground mb-2">
            {new Date(label).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">
                Conversion Rate
              </span>
              <span className="text-sm font-semibold text-success">
                {payload[0].value.toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">Sessions</span>
              <span className="text-sm font-semibold text-foreground">
                {formatNumber(payload[0].payload.sessions)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">Orders</span>
              <span className="text-sm font-semibold text-foreground">
                {formatNumber(payload[0].payload.orders)}
              </span>
            </div>
            {payload[0].payload.movingAvg && (
              <div className="flex items-center justify-between gap-4 pt-1 border-t border-border">
                <span className="text-xs text-muted-foreground">7-Day Avg</span>
                <span className="text-sm font-semibold text-primary">
                  {payload[0].payload.movingAvg.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate overall trend
  const calculateTrend = () => {
    if (data.length < 2) return 0;
    const first = data[0].conversionRate;
    const last = data[data.length - 1].conversionRate;
    return ((last - first) / first) * 100;
  };

  const trend = calculateTrend();

  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={dataWithMovingAvg}>
          <defs>
            <linearGradient id="conversionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="avgGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />

          <XAxis
            dataKey="date"
            stroke="var(--muted-foreground)"
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
            }}
            tick={{ fontSize: 12 }}
            tickMargin={10}
          />

          <YAxis
            stroke="var(--muted-foreground)"
            tickFormatter={(value) => `${value}%`}
            domain={["auto", "auto"]}
            tick={{ fontSize: 12 }}
            tickMargin={10}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            verticalAlign="top"
            height={36}
            iconSize={12}
            iconType="circle"
            formatter={(value) => (
              <span className="text-sm font-medium text-muted-foreground">
                {value}
              </span>
            )}
          />

          {/* Daily conversion rate area */}
          <Area
            type="monotone"
            dataKey="conversionRate"
            name="Daily Conversion"
            stroke="#82ca9d"
            fill="url(#conversionGradient)"
            strokeWidth={1.5}
            dot={{ stroke: "#82ca9d", strokeWidth: 1, r: 2 }}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />

          {/* 7-day moving average line */}
          <Line
            type="monotone"
            dataKey="movingAvg"
            name="7-Day Average"
            stroke="#8884d8"
            strokeWidth={2}
            dot={false}
            strokeDasharray="5 5"
          />

          {/* Target line (optional) */}
          <Line
            type="monotone"
            dataKey={() => 5} // 5% target line
            stroke="#ff6b6b"
            strokeWidth={1}
            strokeDasharray="3 3"
            dot={false}
            name="5% Target"
            opacity={0.5}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Trend indicator */}
      <div className="flex items-center justify-end mt-2">
        <div
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
            trend > 0
              ? "bg-success/10 text-success"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          <span>{trend > 0 ? "↗" : "↘"}</span>
          <span>
            {trend > 0 ? "+" : ""}
            {trend.toFixed(1)}%
          </span>
          <span className="text-xs opacity-75">over period</span>
        </div>
      </div>
    </div>
  );
};

export default ConversionTrendChart;
