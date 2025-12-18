import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

const FunnelChart = ({ data }) => {
  // Calculate drop-off rates
  const enhancedData = data
    .map((item, index, array) => {
      const dropOff =
        index < array.length - 1
          ? ((item.count - array[index + 1].count) / item.count) * 100
          : 0;
      return {
        ...item,
        dropOff: dropOff.toFixed(1),
        stageOrder: index, // For sorting
      };
    })
    .sort((a, b) => b.stageOrder - a.stageOrder); // Reverse order for funnel

  const COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#0088fe",
    "#00c49f",
  ];

  // Custom funnel label
  const renderCustomLabel = (props) => {
    const { x, y, width, value, index } = props;
    const item = enhancedData[index];

    return (
      <g>
        <text
          x={x + width / 2}
          y={y - 10}
          fill="var(--foreground)"
          textAnchor="middle"
          fontSize={12}
          fontWeight="500"
        >
          {value.toLocaleString()}
        </text>
        <text
          x={x + width / 2}
          y={y + 20}
          fill="var(--muted-foreground)"
          textAnchor="middle"
          fontSize={11}
        >
          {item.percentage.toFixed(1)}%
        </text>
        {item.dropOff > 0 && (
          <text
            x={x + width / 2}
            y={y + 35}
            fill="var(--destructive)"
            textAnchor="middle"
            fontSize={10}
          >
            {item.dropOff}% drop-off
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={enhancedData}
          layout="vertical"
          margin={{ top: 40, right: 30, left: 100, bottom: 20 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            horizontal={false}
          />

          <XAxis
            type="number"
            stroke="var(--muted-foreground)"
            tickFormatter={(value) => `${value / 1000}k`}
          />

          <YAxis
            type="category"
            dataKey="stage"
            stroke="var(--muted-foreground)"
            width={90}
            tick={{ fontSize: 12 }}
          />

          <Tooltip
            formatter={(value, name, props) => {
              const item = props.payload;
              if (name === "count") {
                return [
                  <div key="tooltip">
                    <div className="font-medium">{value.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {item.percentage.toFixed(1)}% of total
                    </div>
                    {item.dropOff > 0 && (
                      <div className="text-xs text-destructive mt-1">
                        {item.dropOff}% drop-off to next stage
                      </div>
                    )}
                  </div>,
                  "Users",
                ];
              }
              return value;
            }}
            labelFormatter={(label) => (
              <div className="font-medium text-foreground">{label}</div>
            )}
          />

          <Bar
            dataKey="count"
            radius={[0, 4, 4, 0]}
            fill="#8884d8"
            background={{ fill: "var(--secondary)", radius: [0, 4, 4, 0] }}
          >
            {enhancedData.map((entry, index) => (
              <rect
                key={`bar-${index}`}
                fill={COLORS[index % COLORS.length]}
                opacity={0.8}
              />
            ))}
            <LabelList dataKey="count" content={renderCustomLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Funnel summary */}
      <div className="flex items-center justify-between mt-4 text-sm">
        <div className="text-muted-foreground">
          Overall conversion:{" "}
          {enhancedData[enhancedData.length - 1]?.percentage.toFixed(2)}%
        </div>
        <div className="flex items-center gap-4">
          {enhancedData.slice(0, -1).map((item, index) => (
            <div key={index} className="text-center">
              <div className="font-medium text-foreground">{item.dropOff}%</div>
              <div className="text-xs text-muted-foreground">drop-off</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FunnelChart;
