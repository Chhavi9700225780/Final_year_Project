import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const InventoryChart = ({ data = [] }) => {
  const chartData = data.slice(0, 8).map((item) => ({
    productName: item.productName || "Unknown Product",
    shortName:
      item.productName?.length > 18
        ? `${item.productName.substring(0, 18)}...`
        : item.productName || "Unknown",

    stock: Number(item.closingStock) || 0,
  }));

  return (
    <div className="h-[260px] w-full sm:h-[300px]">
      {chartData.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-50 text-slate-400">
            <span className="text-lg">—</span>
          </div>

          <p className="text-sm font-medium text-slate-600">
            No inventory data
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Upload inventory records to view stock
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{
              top: 5,
              right: 15,
              left: 5,
              bottom: 5,
            }}
          >
            <CartesianGrid
              stroke="#e2e8f0"
              strokeDasharray="4 4"
              horizontal={false}
            />

            <XAxis
              type="number"
              tick={{
                fontSize: 10,
                fill: "#64748b",
              }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              type="category"
              dataKey="shortName"
              width={105}
              tick={{
                fontSize: 10,
                fill: "#475569",
              }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              cursor={{
                fill: "#f8fafc",
              }}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
                boxShadow:
                  "0 10px 30px rgba(15, 23, 42, 0.10)",
                padding: "12px 14px",
              }}
              formatter={(value) => [
                Number(value).toLocaleString("en-IN"),
                "Closing Stock",
              ]}
              labelFormatter={(_, payload) =>
                payload?.[0]?.payload?.productName ||
                "Product"
              }
            />

            <Bar
              dataKey="stock"
              name="Closing Stock"
              fill="#7c3aed"
              radius={[0, 6, 6, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default InventoryChart;