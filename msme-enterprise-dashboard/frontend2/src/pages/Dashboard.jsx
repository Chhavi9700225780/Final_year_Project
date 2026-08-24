import { useState, useEffect, useCallback } from "react"
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

import {
  getDashboardSummary,
  getProductionTrend,
  getFinanceTrend,
  getInventoryOverview,
  getSalesRegions,
} from "../services/api"

import "./styles/Dashboard.css"

// ─── Company ──────────────────────────────────────────────────────────

const COMPANY_ID = "68a123456789abcdef123456"

// ─── Region colors ────────────────────────────────────────────────────

const REGION_COLORS = [
  "var(--accent-amber)",
  "var(--accent-green)",
  "var(--accent-orange)",
  "var(--accent-purple)",
  "var(--accent-red)",
]

// ─── Helpers ──────────────────────────────────────────────────────────

const currency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`

const currencyL = (value) => {
  const v = Number(value || 0)

  if (v >= 1000000) {
    return `₹${(v / 100000).toFixed(1)}L`
  }

  return `₹${(v / 1000).toFixed(0)}K`
}

// ─── API response normalizers ────────────────────────────────────────
// The old dashboard components expected: month/planned/actual,
// month/revenue/expenses, product/units/max and region/revenue/pct.
// Backend responses can use slightly different names, so we normalize
// them here before Recharts receives the data.

const firstValue = (obj, keys, fallback = undefined) => {
  for (const key of keys) {
    const value = obj?.[key]
    if (value !== undefined && value !== null && value !== "") {
      return value
    }
  }
  return fallback
}

const toArray = (payload, preferredKeys = []) => {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== "object") return []

  for (const key of preferredKeys) {
    if (Array.isArray(payload[key])) return payload[key]
  }

  for (const key of ["data", "results", "items", "records", "trend", "rows", "analytics"]) {
    if (Array.isArray(payload[key])) return payload[key]
    if (payload[key] && typeof payload[key] === "object") {
      const nested = toArray(payload[key], [])
      if (nested.length) return nested
    }
  }

  return []
}

const normalizeMonth = (row, index) => {
  const raw = firstValue(row, [
    "month", "period", "label", "date", "_id", "createdAt",
  ], `P${index + 1}`)

  if (raw instanceof Date) return raw.toLocaleDateString("en-IN", { month: "short" }).toUpperCase()

  const text = String(raw)
  const parsed = new Date(raw)
  if (!Number.isNaN(parsed.getTime()) && /[-/T:]/.test(text)) {
    return parsed.toLocaleDateString("en-IN", { month: "short" }).toUpperCase()
  }

  return text.length > 10 ? text.slice(0, 10) : text.toUpperCase()
}

const normalizeProduction = (payload) =>
  toArray(payload, ["productionTrend", "production", "productionData"]).map((row, index) => ({
    month: normalizeMonth(row, index),
    planned: Number(firstValue(row, [
      "planned", "plannedProduction", "plannedUnits", "target", "targetProduction", "plan",
    ], 0)),
    actual: Number(firstValue(row, [
      "actual", "actualProduction", "actualUnits", "produced", "unitsProduced", "totalActualProduction",
    ], 0)),
  })).filter(row => row.planned !== 0 || row.actual !== 0 || row.month)

const normalizeFinance = (payload) =>
  toArray(payload, ["financeTrend", "financialTrend", "finance", "financial", "financeData"]).map((row, index) => ({
    month: normalizeMonth(row, index),
    revenue: Number(firstValue(row, [
      "revenue", "salesRevenue", "totalRevenue", "sales", "income",
    ], 0)),
    expenses: Number(firstValue(row, [
      "expenses", "expense", "totalExpenses", "cost", "costs", "totalCost",
    ], 0)),
  })).filter(row => row.revenue !== 0 || row.expenses !== 0 || row.month)

const normalizeInventory = (payload) =>
  toArray(payload, ["inventoryOverview", "inventory", "inventoryData", "stock"]).map((row, index) => ({
    product: String(firstValue(row, [
      "product", "productName", "name", "item", "itemName", "category", "material",
    ], `ITEM ${index + 1}`)),
    units: Number(firstValue(row, [
      "units", "quantity", "stock", "currentStock", "stockUnits", "totalUnits", "availableUnits",
    ], 0)),
    max: Number(firstValue(row, [
      "max", "capacity", "maxUnits", "maximumStock", "maxStock", "limit",
    ], 0)),
  }))

const normalizeSalesRegions = (payload) => {
  const rows = toArray(payload, ["salesRegions", "regions", "salesByRegion", "sales", "regionData"])

  const normalized = rows.map((row, index) => ({
    region: String(firstValue(row, [
      "region", "regionName", "name", "location",
    ], `REGION ${index + 1}`)),
    revenue: Number(firstValue(row, [
      "revenue", "salesRevenue", "totalRevenue", "amount", "sales",
    ], 0)),
    pct: Number(firstValue(row, [
      "pct", "percentage", "percent", "share", "revenuePercentage",
    ], 0)),
  }))

  const total = normalized.reduce((sum, row) => sum + row.revenue, 0)

  return normalized.map(row => ({
    ...row,
    pct: row.pct > 0 ? row.pct : total > 0 ? (row.revenue / total) * 100 : 0,
  }))
}

const CHART_MONO = {
  fontFamily: "var(--font-mono)",
  fontSize: 9,
  letterSpacing: "0.1em",
  fill: "var(--text-faint)",
}

const TOOLTIP_STYLE = {
  background: "var(--tooltip-bg)",
  border: "1px solid var(--border-steel)",
  borderRadius: 2,
  fontFamily: "var(--font-mono)",
  fontSize: 10,
  letterSpacing: "0.08em",
  color: "var(--text-bright)",
  boxShadow: "var(--tooltip-shadow)",
}

const GRID_COLOR = "var(--chart-grid)"

// ─── Segmented meter ──────────────────────────────────────────────────

function SegBar({ pct, color }) {
  const SEGS = 10

  const safePct = Math.max(
    0,
    Math.min(100, Number(pct || 0))
  )

  const filled = Math.round((safePct / 100) * SEGS)

  return (
    <div className="kpi-meter">
      {Array.from({ length: SEGS }, (_, i) => (
        <div
          key={i}
          className="kpi-meter-seg"
          style={
            i < filled
              ? {
                  background: color,
                  "--meter-color": color,
                  boxShadow: "var(--meter-glow)",
                }
              : {
                  background: "var(--forge-groove)",
                  border: "1px solid var(--border-steel)",
                }
          }
        />
      ))}
    </div>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────────

function KPICard({
  label,
  sub,
  value,
  fillPct,
  trend,
  trendUp,
  accent,
  icon,
}) {
  return (
    <div className="kpi-card">

      <div
        className="kpi-top-bar"
        style={{
          background: accent,
          "--kpi-color": accent,
          boxShadow: "var(--kpi-bar-glow)",
        }}
      />

      <div className="kpi-body">

        <div className="kpi-header-row">

          <div
            className="kpi-icon-wrap"
            style={{
              background: `color-mix(in srgb, ${accent} 8%, transparent)`,
              borderColor: `color-mix(in srgb, ${accent} 22%, transparent)`,
              color: accent,
            }}
          >
            {icon}
          </div>

          <span className="kpi-cat-label">
            {label}
          </span>

        </div>

        <div
          className="kpi-value"
          style={{
            color: accent,
            "--kpi-color": accent,
          }}
        >
          {value}
        </div>

        <div className="kpi-sub">
          {sub}
        </div>

        <SegBar
          pct={fillPct}
          color={accent}
        />

        <div
          className={`kpi-trend ${
            trendUp ? "trend-up" : "trend-down"
          }`}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          >
            {trendUp ? (
              <path d="M2 7 L5 3 L8 7" />
            ) : (
              <path d="M2 3 L5 7 L8 3" />
            )}
          </svg>

          <span>
            {trend} vs last period
          </span>
        </div>

      </div>
    </div>
  )
}

// ─── Chart Panel ──────────────────────────────────────────────────────

function ChartPanel({
  name,
  sub,
  id,
  tabColor,
  children,
}) {
  return (
    <div className="forge-chart-panel">

      <div className="chart-panel-header">

        <div
          className="chart-panel-tab"
          style={{ background: tabColor }}
        />

        <div className="chart-panel-titles">
          <div className="chart-panel-name">
            {name}
          </div>

          <div className="chart-panel-sub">
            {sub}
          </div>
        </div>

        <div className="chart-panel-id">
          {id}
        </div>

      </div>

      {children}

    </div>
  )
}

// ─── Loading ──────────────────────────────────────────────────────────

function Loading() {
  return (
    <div className="dash-loading">

      <div className="loading-ring" />

      <div>
        <span className="loading-text">
          LOADING ENTERPRISE ANALYTICS
        </span>

        <span className="loading-dots">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </div>

    </div>
  )
}

// ─── Tooltip ──────────────────────────────────────────────────────────

function ForgeTooltip({
  active,
  payload,
  label,
  formatter,
}) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div style={TOOLTIP_STYLE}>

      <div
        style={{
          padding: "8px 12px 4px",
          borderBottom: "1px solid var(--border-steel)",
          fontSize: 9,
          letterSpacing: "0.16em",
          color: "var(--text-faint)",
        }}
      >
        {label}
      </div>

      <div
        style={{
          padding: "6px 12px 8px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >

        {payload.map((p) => (
          <div
            key={p.dataKey}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >

            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 1,
                background: p.color,
                flexShrink: 0,
              }}
            />

            <span
              style={{
                color: "var(--text-mid)",
                fontSize: 9,
                letterSpacing: "0.1em",
              }}
            >
              {p.name}
            </span>

            <span
              style={{
                marginLeft: "auto",
                color: p.color,
                paddingLeft: 12,
              }}
            >
              {formatter
                ? formatter(p.value)
                : Number(p.value || 0).toLocaleString("en-IN")}
            </span>

          </div>
        ))}

      </div>
    </div>
  )
}

// ─── Main Dashboard ──────────────────────────────────────────────────

export default function Dashboard({ activePage }) {

  // ── Real backend state ─────────────────────────────────────────────

  const [summary, setSummary] = useState(null)

  const [productionTrend, setProductionTrend] =
    useState([])

  const [financeTrend, setFinanceTrend] =
    useState([])

  const [inventoryData, setInventoryData] =
    useState([])

  const [salesRegions, setSalesRegions] =
    useState([])

  // ── UI state ───────────────────────────────────────────────────────

  const [loading, setLoading] = useState(true)

  const [spinning, setSpinning] =
    useState(false)

  const [error, setError] =
    useState("")

  const [lastUpdated, setLastUpdated] =
    useState("")

  // ── Fetch REAL dashboard data ─────────────────────────────────────

  const fetchData = useCallback(async () => {

    try {

      setSpinning(true)
      setError("")

      const [
        summaryResponse,
        productionResponse,
        financeResponse,
        inventoryResponse,
        salesResponse,
      ] = await Promise.all([

        getDashboardSummary(
          COMPANY_ID
        ),

        getProductionTrend(
          COMPANY_ID
        ),

        getFinanceTrend(
          COMPANY_ID
        ),

        getInventoryOverview(
          COMPANY_ID
        ),

        getSalesRegions(
          COMPANY_ID
        ),

      ])

      // ── Summary ───────────────────────────────────────────────────

      setSummary(
        summaryResponse.data?.data || null
      )

      // ── Normalize chart responses ─────────────────────────────────
      // This is the important fix: Recharts must receive an ARRAY whose
      // property names match the dataKey used by each chart.

      const production = normalizeProduction(productionResponse.data?.data)
      const finance = normalizeFinance(financeResponse.data?.data)
      const inventory = normalizeInventory(inventoryResponse.data?.data)
      const regions = normalizeSalesRegions(salesResponse.data?.data)

      setProductionTrend(production)
      setFinanceTrend(finance)
      setInventoryData(inventory)
      setSalesRegions(regions)

      console.log("Dashboard chart data:", {
        production,
        finance,
        inventory,
        regions,
      })

      // ── Last updated ─────────────────────────────────────────────

      const now = new Date()

      setLastUpdated(
        now
          .toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
          .toUpperCase()
      )

      console.log(
        "Dashboard analytics loaded"
      )

    } catch (err) {

      console.error(
        "Dashboard error:",
        err
      )

      setError(
        err.response?.data?.message ||
        "Unable to load dashboard data."
      )

    } finally {

      setLoading(false)
      setSpinning(false)

    }

  }, [])

  // ── Initial API request ───────────────────────────────────────────

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ── Loading ────────────────────────────────────────────────────────

  if (loading) {
    return <Loading />
  }

  // ── Real backend summary ──────────────────────────────────────────

  const s = summary || {}

  // ── Inventory maximum ─────────────────────────────────────────────

  const maxInv =
    inventoryData.length > 0
      ? Math.max(
          ...inventoryData.map((item) =>
            Number(item.max || item.units || 0)
          )
        )
      : 0

  // ── Sales total ───────────────────────────────────────────────────

  const totalSalesRevenue =
    salesRegions.reduce(
      (total, region) =>
        total + Number(region.revenue || 0),
      0
    )

  const defectRate = Number(s.defectRate || 0)
  const defectColor =
    defectRate < 1
      ? "var(--accent-green)"
      : defectRate < 5
        ? "var(--accent-amber)"
        : "var(--accent-red)"

  const defectStatus =
    defectRate < 5
      ? "WITHIN ACCEPTABLE THRESHOLD"
      : "ABOVE ACCEPTABLE THRESHOLD"

  return (
    <div className="dash-root">

      {/* ═════════════════════════════════════════════════════════════
          HEADER
      ═════════════════════════════════════════════════════════════ */}

      <div className="dash-header">

        <div className="dash-header-left">

          <div className="dash-header-accent" />

          <div className="dash-header-text">

            <div className="dash-header-label">
              MSME OPERATIONS COMMAND CENTER
            </div>

            <div className="dash-header-title">
              BUSINESS PERFORMANCE
            </div>

          </div>

        </div>

        <div className="dash-header-right">

          <div className="dash-system-status">

            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--green-op)",
                boxShadow:
                  "var(--glow-green)",
                animation:
                  "led-pulse 2.4s ease-in-out infinite",
                flexShrink: 0,
              }}
            />

            <span className="dash-status-label">
              ALL SYSTEMS OPERATIONAL
            </span>

          </div>

          {lastUpdated && (
            <span className="dash-last-updated">
              SYNC · {lastUpdated}
            </span>
          )}

          <button
            className={`dash-refresh-btn${
              spinning ? " spinning" : ""
            }`}
            onClick={fetchData}
            disabled={spinning}
          >

            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M11.5 6.5a5 5 0 1 1-1.4-3.5" />
              <path d="M10 1l0.1 3-3 0.1" />
            </svg>

            REFRESH

          </button>

        </div>

      </div>

      {/* ═════════════════════════════════════════════════════════════
          ERROR
      ═════════════════════════════════════════════════════════════ */}

      {error && (
        <div className="dash-error">

          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M8 1L15 14H1L8 1z" />
            <line
              x1="8"
              y1="6"
              x2="8"
              y2="9"
            />
            <circle
              cx="8"
              cy="11.5"
              r="0.5"
              fill="currentColor"
            />
          </svg>

          {error}

        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════
          KPI CARDS
      ═════════════════════════════════════════════════════════════ */}

      <div className="kpi-grid">

        {/* PRODUCTION */}

        <KPICard
          label="PRODUCTION"
          sub="Units produced · current period"
          value={
            (
              Number(
                s.totalActualProduction || 0
              ) / 1000
            ).toFixed(1) + "K"
          }
          fillPct={
            Number(
              s.productionEfficiency || 0
            )
          }
          trend="LIVE"
          trendUp
          accent="var(--accent-amber)"
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            >
              <rect
                x="1"
                y="9"
                width="4"
                height="6"
              />
              <rect
                x="6"
                y="6"
                width="4"
                height="9"
              />
              <rect
                x="11"
                y="3"
                width="4"
                height="12"
              />
            </svg>
          }
        />

        {/* EFFICIENCY */}

        <KPICard
          label="EFFICIENCY"
          sub="Actual vs planned output"
          value={
            Number(
              s.productionEfficiency || 0
            ) + "%"
          }
          fillPct={
            Number(
              s.productionEfficiency || 0
            )
          }
          trend="LIVE"
          trendUp
          accent="var(--accent-green)"
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            >
              <polyline points="1,11 5,7 9,9 15,3" />
              <polyline points="11,3 15,3 15,7" />
            </svg>
          }
        />

        {/* INVENTORY */}

        <KPICard
          label="INVENTORY"
          sub="Current stock units"
          value={
            (
              Number(
                s.totalInventoryUnits || 0
              ) / 1000
            ).toFixed(1) + "K"
          }
          fillPct={
            maxInv > 0
              ? Math.min(
                  100,
                  (Number(
                    s.totalInventoryUnits || 0
                  ) /
                    maxInv) *
                    100
                )
              : 0
          }
          trend="LIVE"
          trendUp
          accent="var(--accent-purple)"
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 5l7-4 7 4v8l-7 4-7-4V5z" />
              <path d="M1 5l7 4 7-4" />
              <line
                x1="8"
                y1="9"
                x2="8"
                y2="17"
              />
            </svg>
          }
        />

        {/* REVENUE */}

        <KPICard
          label="REVENUE"
          sub="Recorded sales revenue"
          value={currencyL(s.salesRevenue)}
          fillPct={83}
          trend="LIVE"
          trendUp
          accent="var(--accent-orange)"
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            >
              <circle
                cx="8"
                cy="8"
                r="7"
              />

              <path d="M8 3.5V5M8 11v1.5" />

              <path d="M5.5 6.5c0-1.1.8-1.8 2.5-1.8s2.5.8 2.5 1.8c0 1-1.5 1.7-2.5 1.7S5.5 9 5.5 10c0 1.1.9 1.8 2.5 1.8s2.5-.6 2.5-1.8" />
            </svg>
          }
        />

        {/* PROFIT */}

        <KPICard
          label="PROFIT"
          sub="Revenue minus expenses"
          value={currencyL(s.estimatedProfit)}
          fillPct={77}
          trend="LIVE"
          trendUp
          accent="var(--accent-cyan)"
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            >
              <path d="M8 1v14M1 8h14" />
              <rect
                x="3"
                y="5"
                width="4"
                height="8"
              />
              <rect
                x="9"
                y="2"
                width="4"
                height="11"
              />
            </svg>
          }
        />

      </div>

      {/* ═════════════════════════════════════════════════════════════
          PRODUCTION + FINANCE
      ═════════════════════════════════════════════════════════════ */}

      <div className="chart-grid-2">

        {/* PRODUCTION */}

        <ChartPanel
          name="PRODUCTION PERFORMANCE"
          sub="PLANNED VS ACTUAL · LIVE DATA"
          id="CH-01"
          tabColor="var(--accent-amber)"
        >

          <div className="chart-area">

            <ResponsiveContainer
              width="100%"
              height={220}
            >

              <BarChart
                data={productionTrend}
                barGap={3}
                barCategoryGap="28%"
              >

                <defs>

                  <linearGradient
                    id="plannedGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="var(--accent-amber)"
                      stopOpacity={0.35}
                    />

                    <stop
                      offset="100%"
                      stopColor="var(--accent-amber)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>

                  <linearGradient
                    id="actualGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="var(--accent-amber)"
                      stopOpacity={1}
                    />

                    <stop
                      offset="100%"
                      stopColor="var(--accent-amber)"
                      stopOpacity={0.7}
                    />
                  </linearGradient>

                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={GRID_COLOR}
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  tick={CHART_MONO}
                  axisLine={{
                    stroke: GRID_COLOR,
                  }}
                  tickLine={false}
                />

                <YAxis
                  tick={CHART_MONO}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    `${(v / 1000).toFixed(0)}K`
                  }
                  width={36}
                />

                <Tooltip
                  cursor={false}
                  content={
                    <ForgeTooltip />
                  }
                />

                <Bar
                  dataKey="planned"
                  name="PLANNED"
                  fill="url(#plannedGrad)"
                  stroke="var(--accent-amber)"
                  strokeWidth={1}
                  radius={[
                    2,
                    2,
                    0,
                    0,
                  ]}
                />

                <Bar
                  dataKey="actual"
                  name="ACTUAL"
                  fill="url(#actualGrad)"
                  stroke="var(--accent-amber)"
                  strokeWidth={0}
                  radius={[
                    2,
                    2,
                    0,
                    0,
                  ]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </ChartPanel>

        {/* FINANCE */}

        <ChartPanel
          name="FINANCIAL PERFORMANCE"
          sub="REVENUE VS EXPENSES · LIVE DATA"
          id="CH-02"
          tabColor="var(--accent-green)"
        >

          <div className="chart-area">

            <ResponsiveContainer
              width="100%"
              height={220}
            >

              <AreaChart
                data={financeTrend}
              >

                <defs>

                  <linearGradient
                    id="revGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--accent-green)"
                      stopOpacity={0.25}
                    />

                    <stop
                      offset="95%"
                      stopColor="var(--accent-green)"
                      stopOpacity={0.01}
                    />
                  </linearGradient>

                  <linearGradient
                    id="expGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--accent-red)"
                      stopOpacity={0.2}
                    />

                    <stop
                      offset="95%"
                      stopColor="var(--accent-red)"
                      stopOpacity={0.01}
                    />
                  </linearGradient>

                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={GRID_COLOR}
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  tick={CHART_MONO}
                  axisLine={{
                    stroke: GRID_COLOR,
                  }}
                  tickLine={false}
                />

                <YAxis
                  tick={CHART_MONO}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    `${(v / 100000).toFixed(0)}L`
                  }
                  width={36}
                />

                <Tooltip
                  cursor={false}
                  content={
                    <ForgeTooltip
                      formatter={currency}
                    />
                  }
                />

                <Area
                  dataKey="revenue"
                  name="REVENUE"
                  type="monotone"
                  stroke="var(--accent-green)"
                  strokeWidth={1.5}
                  fill="url(#revGrad)"
                  dot={false}
                />

                <Area
                  dataKey="expenses"
                  name="EXPENSES"
                  type="monotone"
                  stroke="var(--accent-red)"
                  strokeWidth={1.5}
                  fill="url(#expGrad)"
                  dot={false}
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>

        </ChartPanel>

      </div>

      {/* ═════════════════════════════════════════════════════════════
          INVENTORY + SALES
      ═════════════════════════════════════════════════════════════ */}

      <div className="chart-grid-2">

        {/* INVENTORY */}

        <ChartPanel
          name="INVENTORY OVERVIEW"
          sub="CURRENT STOCK BY PRODUCT · UNITS"
          id="CH-03"
          tabColor="var(--accent-purple)"
        >

         <div className="inv-bar-list">
  {inventoryData.map((item, index) => {
    const units = Number(
  item.closingStock ??
  item.currentStock ??
  item.stock ??
  item.quantity ??
  item.units ??
  0
);

    const max =
      Number(
        item.max ||
        item.capacity ||
        item.maxUnits ||
        maxInv ||
        0
      );

    const pct =
      max > 0
        ? Math.min(100, Math.round((units / max) * 100))
        : 0;
     // Inventory values are already normalized above.

      const color =
        pct > 75
          ? "var(--accent-green)"
          : pct > 60
            ? "var(--accent-amber)"
            : "var(--accent-red)"

    return (
      <div
        key={item.product || item.name || index}
        className="inv-bar-row"
      >
        <div className="inv-bar-meta">
          <span className="inv-bar-name">
            {item.product || item.name || "UNKNOWN"}
          </span>

          <span className="inv-bar-val">
            {units.toLocaleString("en-IN")}
            {max > 0 && (
              <span style={{ color: "var(--text-faint)" }}>
                {" / "}
                {max.toLocaleString("en-IN")}
              </span>
            )}
          </span>
        </div>

        <div className="inv-bar-track">
          <div
            className="inv-bar-fill"
            style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, color-mix(in srgb, ${color} 56%, transparent), ${color})`,
                        "--inventory-color": color,
                      }}
          />
        </div>
      </div>
    );
  })}
</div>

          {inventoryData.length === 0 && (
            <div className="chart-empty-state">
              NO INVENTORY DATA AVAILABLE
            </div>
          )}

        </ChartPanel>

        {/* SALES REGIONS */}

        <ChartPanel
  name="SALES BY REGION"
  sub="REVENUE DISTRIBUTION · CURRENT PERIOD"
  id="CH-04"
  tabColor="var(--accent-orange)"
>
  <div
    style={{
      width: "100%",
      height: "100%",
      minHeight: 300,
      display: "flex",
      flexDirection: "column",
      boxSizing: "border-box",
    }}
  >

    {/* =====================================================
        DONUT + REGION DATA
    ===================================================== */}

    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        padding: "4px 12px 0",
      }}
    >

      {/* ─────────────────────────────────────────────
          DONUT
      ───────────────────────────────────────────── */}

      <div
        style={{
          width: "48%",
          height: 230,
          minWidth: 190,
          position: "relative",
          flexShrink: 0,
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>

            <Pie
              data={salesRegions}
              dataKey="revenue"
              nameKey="region"
              cx="50%"
              cy="48%"
              innerRadius={55}
              outerRadius={88}
              paddingAngle={4}
              stroke="var(--donut-stroke)"
              strokeWidth={3}
            >
              {salesRegions.map((_, index) => (
                <Cell
                  key={`sales-donut-${index}`}
                  fill={
                    REGION_COLORS[
                      index % REGION_COLORS.length
                    ]
                  }
                />
              ))}
            </Pie>

            <Tooltip
              cursor={false}
              content={
                <ForgeTooltip formatter={currencyL} />
              }
            />

          </PieChart>
        </ResponsiveContainer>

        {/* ─────────────────────────────────────────
            DONUT CENTER
        ───────────────────────────────────────── */}

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "48%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 7,
              letterSpacing: "0.16em",
              color: "var(--text-faint)",
            }}
          >
            TOTAL REVENUE
          </div>

          <div
            style={{
              marginTop: 5,
              fontFamily: "var(--font-brand)",
              fontSize: 18,
              color: "var(--amber)",
              textShadow: "var(--glow-amber-text)",
            }}
          >
            {currencyL(
              salesRegions.reduce(
                (sum, r) => sum + r.revenue,
                0
              )
            )}
          </div>
        </div>
      </div>


      {/* ─────────────────────────────────────────────
          REGION READOUT
      ───────────────────────────────────────────── */}

      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 13,
          paddingRight: 8,
        }}
      >

        {salesRegions.map((r, i) => {

          const color =
            REGION_COLORS[
              i % REGION_COLORS.length
            ];

          return (
            <div
              key={`sales-region-${r.region}`}
              style={{
                display: "grid",
                gridTemplateColumns:
                  "10px minmax(65px, 1fr) auto",
                columnGap: 8,
                rowGap: 5,
                alignItems: "center",
              }}
            >

              {/* Status light */}
              <span
                className="sales-region-dot"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: color,
                  "--region-color": color,
                }}
              />

              {/* Region name */}
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  letterSpacing: "0.08em",
                  color: "var(--text-mid)",
                  whiteSpace: "nowrap",
                }}
              >
                {r.region}
              </span>

              {/* Percentage */}
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  color: color,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                {Number(r.pct || 0).toFixed(1)}%
              </span>

              {/* Mini horizontal meter */}
              <div
                style={{
                  gridColumn: "2 / 4",
                  width: "100%",
                  height: 5,
                  background: "var(--forge-groove)",
                  backgroundImage: "repeating-linear-gradient(90deg, transparent 0, transparent 10px, var(--chart-separator) 10px, var(--chart-separator) 11px)",
                  overflow: "hidden",
                  borderRadius: 1,
                }}
              >
                <div
                  style={{
                    width: `${r.pct}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, color-mix(in srgb, ${color} 50%, transparent), ${color})`,
                    "--region-color": color,
                  }}
                />
              </div>

              {/* Revenue */}
              <span
                style={{
                  gridColumn: "2 / 4",
                  fontFamily: "var(--font-brand)",
                  fontSize: 11,
                  color: "var(--amber)",
                  letterSpacing: "0.04em",
                  textAlign: "right",
                }}
              >
                {currencyL(r.revenue)}
              </span>

            </div>
          );
        })}

         

      </div>
       
    </div>
       
       

    {/* =====================================================
        TOTAL REVENUE FOOTER
    ===================================================== */}

    <div
      style={{
        margin: "0 14px 8px",
        paddingTop: 120,
        borderTop:
          "1px solid var(--border-steel)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >

      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 8,
          letterSpacing: "0.16em",
          color: "var(--text-faint)",
        }}
      >
        TOTAL REVENUE
      </span>

      <span
        style={{
          fontFamily: "var(--font-brand)",
          fontSize: 18,
          color: "var(--amber)",
          textShadow: "var(--glow-amber-text-strong)",
          letterSpacing: "0.04em",
        }}
      >
        {currencyL(
          salesRegions.reduce(
            (sum, r) => sum + r.revenue,
            0
          )
        )}
      </span>

     

    </div>


    
      
  </div>


   
</ChartPanel>






      </div>

      {/* ═════════════════════════════════════════════════════════════
          OPERATIONAL SUMMARY
      ═════════════════════════════════════════════════════════════ */}

      <div className="ops-panel">

        <div className="ops-header">

          <div>

            <div className="ops-title">
              OPERATIONAL SUMMARY
            </div>

            <div
              className="ops-sub"
              style={{ marginTop: 3 }}
            >
              KEY INDICATORS REQUIRING MANAGEMENT ATTENTION
            </div>

          </div>

          <div className="ops-tag">

            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background:
                  "var(--red-alert)",
                boxShadow:
                  "var(--glow-red)",
                animation:
                  "led-pulse 1.5s ease-in-out infinite",
              }}
            />

            {s.activeAlerts || 0} ACTIVE ALERT
            {Number(s.activeAlerts || 0) !== 1
              ? "S"
              : ""}

          </div>

        </div>

        <div className="ops-grid">

          {/* DEFECT RATE */}
          <div
            className="ops-metric"
            style={{ "--metric-color": defectColor }}
          >
            <div
              className="ops-metric-edge"
              style={{ background: defectColor }}
            />

            <div className="ops-metric-label">
              DEFECT RATE
            </div>

            <div
              className="ops-metric-value metric-glow"
              style={{ color: defectColor }}
            >
              {defectRate}%
            </div>

            <div className="ops-metric-desc">
              Production quality indicator
            </div>

            <div className="ops-status-line">
              <span
                className="ops-status-dot metric-glow"
                style={{ background: defectColor }}
              />
              {defectStatus}
            </div>
          </div>

          {/* RAW MATERIAL VALUE */}
          <div
            className="ops-metric"
            style={{ "--metric-color": "var(--accent-purple)" }}
          >
            <div
              className="ops-metric-edge"
              style={{ background: "var(--accent-purple)" }}
            />

            <div className="ops-metric-label">
              RAW MATERIAL VALUE
            </div>

            <div
              className="ops-metric-value metric-glow"
              style={{
                color: "var(--accent-purple)",
                fontSize: 20,
              }}
            >
              {currencyL(s.rawMaterialInventoryValue)}
            </div>

            <div className="ops-metric-desc">
              Current raw material stock position
            </div>

            <div className="ops-segment-meter">
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  className={
                    i < 7
                      ? "ops-segment filled"
                      : "ops-segment"
                  }
                />
              ))}
            </div>
          </div>

          {/* ACTIVE ALERTS */}
          <div
            className="ops-metric"
            style={{ "--metric-color": "var(--accent-red)" }}
          >
            <div
              className="ops-metric-edge metric-glow"
              style={{ background: "var(--accent-red)" }}
            />

            <div className="ops-metric-label">
              ACTIVE ALERTS
            </div>

            <div
              className="ops-metric-value metric-glow"
              style={{
                color: "var(--accent-red)",
                display: "flex",
                alignItems: "baseline",
                gap: 8,
              }}
            >
              {Number(s.activeAlerts || 0)}

              <span className="ops-open-label">
                OPEN
              </span>
            </div>

            <div className="ops-metric-desc">
              Require management attention
            </div>

            <div className="ops-alert-lights">
              {Array.from(
                {
                  length: Number(s.activeAlerts || 0),
                },
                (_, i) => (
                  <span
                    key={i}
                    className="ops-alert-light"
                    style={{
                      animationDuration: `${
                        1.2 + i * 0.3
                      }s`,
                    }}
                  />
                )
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}