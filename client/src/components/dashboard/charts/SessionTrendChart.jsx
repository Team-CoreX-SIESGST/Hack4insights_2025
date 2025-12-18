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
  BarChart,
  Bar,
} from "recharts";

const SessionTrendChart = ({ data }) => {
  // Calculate week-over-week growth
  const calculateWoWGrowth = (currentWeekData, previousWeekData) => {
    if (!previousWeekData || previousWeekData.length === 0) return 0;

    const currentTotal = currentWeekData.reduce(
      (sum, day) => sum + day.sessions,
      0
    );
    const previousTotal = previousWeekData.reduce(
      (sum, day) => sum + day.sessions,
      0
    );

    return previousTotal > 0
      ? ((currentTotal - previousTotal) / previousTotal) * 100
      : 0;
  };

  // Group data by week
  const groupByWeek = () => {
    const weeks = {};
    data.forEach((item) => {
      const date = new Date(item.date);
      const weekNumber = getWeekNumber(date);
      const weekKey = `Week ${weekNumber}`;

      if (!weeks[weekKey]) {
        weeks[weekKey] = { sessions: 0, orders: 0, days: 0 };
      }
      weeks[weekKey].sessions += item.sessions;
      weeks[weekKey].orders += item.orders;
      weeks[weekKey].days++;
    });

    return Object.entries(weeks).map(([week, data]) => ({
      week,
      avgSessions: data.sessions / data.days,
      avgOrders: data.orders / data.days,
      totalSessions: data.sessions,
      totalOrders: data.orders,
      conversionRate:
        data.sessions > 0 ? (data.orders / data.sessions) * 100 : 0,
    }));
  };

  const weeklyData = groupByWeek();

  // Helper function to get week number
  const getWeekNumber = (date) => {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={weeklyData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />

          <XAxis
            dataKey="week"
            stroke="var(--muted-foreground)"
            tick={{ fontSize: 12 }}
          />

          <YAxis
            yAxisId="left"
            stroke="var(--muted-foreground)"
            tick={{ fontSize: 12 }}
          />

          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="var(--muted-foreground)"
            tickFormatter={(value) => `${value}%`}
            tick={{ fontSize: 12 }}
          />

          <Tooltip
            formatter={(value, name) => {
              if (name === "conversionRate")
                return [`${value.toFixed(2)}%`, "Conversion Rate"];
              if (name === "avgSessions")
                return [value.toFixed(0), "Avg Daily Sessions"];
              if (name === "totalSessions")
                return [value.toFixed(0), "Total Sessions"];
              return [value, name];
            }}
            labelFormatter={(label) => label}
          />

          <Legend
            verticalAlign="top"
            height={36}
            iconSize={12}
            iconType="circle"
          />

          <Bar
            yAxisId="left"
            dataKey="avgSessions"
            name="Avg Daily Sessions"
            fill="#8884d8"
            radius={[4, 4, 0, 0]}
            opacity={0.8}
          />

          <Line
            yAxisId="right"
            type="monotone"
            dataKey="conversionRate"
            name="Conversion Rate"
            stroke="#82ca9d"
            strokeWidth={2}
            dot={{ stroke: "#82ca9d", strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5 }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SessionTrendChart;
