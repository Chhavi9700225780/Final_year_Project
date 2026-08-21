import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = [
  "#2563eb",
  "#7c3aed",
  "#059669",
  "#d97706",
  "#0891b2",
  "#dc2626",
];

const SalesRegionChart = ({ data = [] }) => {
  const chartData = data
    .filter(
      (item) =>
        Number(item.revenue) > 0
    )
    .map((item) => ({
      region:
        item.region ||
        item.customerRegion ||
        "Unknown",

      revenue:
        Number(item.revenue) || 0,
    }));

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

  return (
    <div className="h-[260px] w-full sm:h-[300px]">
      {chartData.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-50 text-slate-400">
            <span className="text-lg">—</span>
          </div>

          <p className="text-sm font-medium text-slate-600">
            No regional sales data
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Sales data will appear here after upload
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="revenue"
              nameKey="region"
              cx="50%"
              cy="43%"
              innerRadius={55}
              outerRadius={88}
              paddingAngle={3}
              stroke="#ffffff"
              strokeWidth={3}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`region-${index}`}
                  fill={
                    COLORS[
                      index % COLORS.length
                    ]
                  }
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value) =>
                formatCurrency(value)
              }
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
                boxShadow:
                  "0 10px 30px rgba(15, 23, 42, 0.10)",
                padding: "12px 14px",
              }}
            />

            <Legend
              verticalAlign="bottom"
              height={45}
              iconType="circle"
              wrapperStyle={{
                fontSize: "11px",
                paddingTop: "5px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default SalesRegionChart;