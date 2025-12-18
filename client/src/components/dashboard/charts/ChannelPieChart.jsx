import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Sector,
} from "recharts";
import { useState } from "react";

const ChannelPieChart = ({ data, title = "Traffic Sources" }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Prepare data for pie chart
  const pieData = data.map((item) => ({
    name: item.source,
    value: item.sessions,
    orders: item.orders,
    conversionRate: item.conversionRate,
    revenue: item.revenue,
  }));

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
    "#FF6B6B",
    "#4ECDC4",
  ];

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  // Custom active shape
  const renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value,
    } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? "start" : "end";

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 5}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
          opacity={0.3}
        />
        <path
          d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
          stroke={fill}
          fill="none"
        />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          textAnchor={textAnchor}
          fill="var(--foreground)"
          fontSize={12}
        >
          {payload.name}
        </text>
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey + 15}
          textAnchor={textAnchor}
          fill="var(--muted-foreground)"
          fontSize={11}
        >
          {`${value} sessions (${(percent * 100).toFixed(1)}%)`}
        </text>
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey + 30}
          textAnchor={textAnchor}
          fill="#82ca9d"
          fontSize={11}
        >
          {`${payload.conversionRate.toFixed(1)}% conversion`}
        </text>
      </g>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-card p-4 border border-border shadow-lg min-w-[200px]">
          <div className="font-medium text-foreground mb-2">{data.name}</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Sessions</span>
              <span className="text-sm font-semibold text-foreground">
                {data.value.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Orders</span>
              <span className="text-sm font-semibold text-foreground">
                {data.orders?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Conversion Rate
              </span>
              <span className="text-sm font-semibold text-success">
                {data.conversionRate?.toFixed(1) || 0}%
              </span>
            </div>
            {data.revenue && (
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">Revenue</span>
                <span className="text-sm font-semibold text-success">
                  ${data.revenue?.toFixed(0) || 0}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold font-display text-foreground mb-6">
        {title}
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              onMouseEnter={onPieEnter}
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconSize={10}
              iconType="circle"
              formatter={(value) => (
                <span className="text-xs text-muted-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Summary statistics */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
        <div className="text-center">
          <div className="text-2xl font-bold font-display text-foreground">
            {pieData.length}
          </div>
          <div className="text-xs text-muted-foreground">Channels</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold font-display text-success">
            {pieData.length > 0
              ? Math.max(...pieData.map((d) => d.conversionRate)).toFixed(1)
              : "0"}
            %
          </div>
          <div className="text-xs text-muted-foreground">Best Conversion</div>
        </div>
      </div>
    </div>
  );
};

export default ChannelPieChart;
