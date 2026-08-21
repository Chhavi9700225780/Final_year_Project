import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const ProductionChart = ({ data = [] }) => {
  const chartData = data.map((item) => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    }),
  }));

  return (
    <div className="h-[280px] w-full sm:h-[320px]">
      {chartData.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-50 text-slate-400">
            <span className="text-lg">—</span>
          </div>

          <p className="text-sm font-medium text-slate-600">
            No production data
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Upload production records to view trends
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 12,
              left: -18,
              bottom: 5,
            }}
          >
            <defs>
              <linearGradient
                id="productionActualGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#2563eb"
                  stopOpacity={0.22}
                />

                <stop
                  offset="100%"
                  stopColor="#2563eb"
                  stopOpacity={0.01}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="#e2e8f0"
              strokeDasharray="4 4"
              vertical={false}
            />

            <XAxis
              dataKey="displayDate"
              tick={{
                fontSize: 11,
                fill: "#64748b",
              }}
              axisLine={false}
              tickLine={false}
              dy={8}
            />

            <YAxis
              tick={{
                fontSize: 11,
                fill: "#64748b",
              }}
              axisLine={false}
              tickLine={false}
              width={45}
            />

            <Tooltip
              cursor={{
                stroke: "#cbd5e1",
                strokeWidth: 1,
              }}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
                boxShadow:
                  "0 10px 30px rgba(15, 23, 42, 0.10)",
                padding: "12px 14px",
              }}
              labelStyle={{
                color: "#0f172a",
                fontWeight: 600,
                marginBottom: 6,
              }}
              itemStyle={{
                fontSize: 13,
              }}
            />

            <Legend
              verticalAlign="bottom"
              height={30}
              iconType="circle"
              wrapperStyle={{
                fontSize: "12px",
                paddingTop: "8px",
              }}
            />

            <Area
              type="monotone"
              dataKey="actual"
              name="Actual"
              stroke="#2563eb"
              strokeWidth={2.5}
              fill="url(#productionActualGradient)"
              dot={false}
              activeDot={{
                r: 5,
                strokeWidth: 3,
                fill: "#ffffff",
              }}
            />

            <Area
              type="monotone"
              dataKey="planned"
              name="Planned"
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="transparent"
              dot={false}
              activeDot={{
                r: 4,
                strokeWidth: 2,
                fill: "#ffffff",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ProductionChart;