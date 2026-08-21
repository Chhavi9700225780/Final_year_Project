import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const FinanceChart = ({ data = [] }) => {
  const chartData = data.map((item) => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    }),
  }));

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

  const formatAxisValue = (value) => {
    const numericValue = Number(value || 0);

    if (numericValue >= 100000) {
      return `₹${(numericValue / 100000).toFixed(1)}L`;
    }

    if (numericValue >= 1000) {
      return `₹${(numericValue / 1000).toFixed(0)}k`;
    }

    return `₹${numericValue}`;
  };

  return (
    <div className="h-[280px] w-full sm:h-[320px]">
      {chartData.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-50 text-slate-400">
            <span className="text-lg">—</span>
          </div>

          <p className="text-sm font-medium text-slate-600">
            No financial data
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Upload finance records to view trends
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: -8,
              bottom: 5,
            }}
            barGap={5}
          >
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
                fontSize: 10,
                fill: "#64748b",
              }}
              axisLine={false}
              tickLine={false}
              width={48}
              tickFormatter={formatAxisValue}
            />

            <Tooltip
              cursor={{
                fill: "#f8fafc",
              }}
              formatter={(value) => formatCurrency(value)}
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

            <Bar
              dataKey="revenue"
              name="Revenue"
              fill="#2563eb"
              radius={[5, 5, 0, 0]}
              barSize={18}
            />

            <Bar
              dataKey="expenses"
              name="Expenses"
              fill="#94a3b8"
              radius={[5, 5, 0, 0]}
              barSize={18}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default FinanceChart;