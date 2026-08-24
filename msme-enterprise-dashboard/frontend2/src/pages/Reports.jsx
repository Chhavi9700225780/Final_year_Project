/*
import { useEffect, useState } from "react";

import {
  FileBarChart,
  Factory,
  Package,
  Boxes,
  IndianRupee,
  ShoppingCart,
  Download,
  RefreshCw,
} from "lucide-react";

import {
  getDashboardSummary,
} from "../services/api";

const COMPANY_ID =
  "68a123456789abcdef123456";

const Reports = () => {
  const [summary, setSummary] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getDashboardSummary(
          COMPANY_ID
        );

      console.log(
        "Reports Summary:",
        response.data
      );

      setSummary(
        response.data?.data
      );

    } catch (err) {
      console.error(
        "Reports error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to generate report."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(value || 0);
  };

  const formatNumber = (value) => {
    return Number(
      value || 0
    ).toLocaleString("en-IN");
  };

  // ==========================================
  // Print Report
  // ==========================================

  const printReport = () => {
    window.print();
  };

  return (
    <div className="module-page">

      {/* ======================================
          Header
      ======================================= 

      <div className="module-header report-header">

        <div>

          <h2>
            Reports
          </h2>

          <p>
            Enterprise performance summary
            and operational insights.
          </p>

        </div>

        <div className="report-actions">

          <button
            className="refresh-button"
            onClick={fetchSummary}
            disabled={loading}
          >

            <RefreshCw
              size={16}
              className={
                loading
                  ? "spin"
                  : ""
              }
            />

            Refresh

          </button>

          <button
            className="report-download-button"
            onClick={printReport}
          >

            <Download size={16} />

            Export Report

          </button>

        </div>

      </div>


      {/* ======================================
          Error
      ======================================= 

      {error && (

        <div className="module-error">

          <FileBarChart size={18} />

          {error}

        </div>

      )}


      {/* ======================================
          Loading
      ======================================= 

      {loading ? (

        <div className="table-state">

          <RefreshCw
            size={25}
            className="spin"
          />

          <p>
            Generating enterprise report...
          </p>

        </div>

      ) : summary ? (

        <div className="report-document">

          {/* ==================================
              Report Title
          =================================== 

          <div className="report-title-section">

            <div className="report-title-icon">

              <FileBarChart
                size={25}
              />

            </div>

            <div>

              <h1>
                Enterprise Performance Report
              </h1>

              <p>
                MSME Enterprise Data
                Integration Dashboard
              </p>

              <span>
                Generated on{" "}
                {new Date().toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }
                )}
              </span>

            </div>

          </div>


          {/* ==================================
              Executive Summary
          =================================== 

          <div className="report-section">

            <div className="report-section-title">

              <h3>
                Executive Summary
              </h3>

            </div>

            <p className="report-summary-text">

              This report provides a consolidated
              overview of production, inventory,
              raw material, sales and financial
              performance based on the integrated
              enterprise datasets.

            </p>

          </div>


          {/* ==================================
              Production
          =================================== 

          <div className="report-section">

            <div className="report-section-title">

              <Factory size={18} />

              <h3>
                Production Performance
              </h3>

            </div>


            <div className="report-metric-grid">

              <div className="report-metric">

                <span>
                  Planned Production
                </span>

                <strong>
                  {formatNumber(
                    summary.totalPlannedProduction
                  )}
                </strong>

                <small>
                  Units
                </small>

              </div>


              <div className="report-metric">

                <span>
                  Actual Production
                </span>

                <strong>
                  {formatNumber(
                    summary.totalActualProduction
                  )}
                </strong>

                <small>
                  Units
                </small>

              </div>


              <div className="report-metric">

                <span>
                  Production Efficiency
                </span>

                <strong>
                  {summary.productionEfficiency}%
                </strong>

                <small>
                  Actual vs planned
                </small>

              </div>


              <div className="report-metric">

                <span>
                  Defect Rate
                </span>

                <strong>
                  {summary.defectRate}%
                </strong>

                <small>
                  Quality indicator
                </small>

              </div>

            </div>

          </div>


          {/* ==================================
              Inventory
          =================================== 

          <div className="report-section">

            <div className="report-section-title">

              <Package size={18} />

              <h3>
                Inventory Overview
              </h3>

            </div>


            <div className="report-highlight">

              <div>

                <span>
                  Total Inventory Units
                </span>

                <strong>
                  {formatNumber(
                    summary.totalInventoryUnits
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Raw Material Inventory Value
                </span>

                <strong>
                  {formatCurrency(
                    summary.rawMaterialInventoryValue
                  )}
                </strong>

              </div>

            </div>

          </div>


          {/* ==================================
              Finance
          =================================== 

          <div className="report-section">

            <div className="report-section-title">

              <IndianRupee size={18} />

              <h3>
                Financial Performance
              </h3>

            </div>


            <div className="report-metric-grid">

              <div className="report-metric">

                <span>
                  Finance Revenue
                </span>

                <strong>
                  {formatCurrency(
                    summary.financeRevenue
                  )}
                </strong>

              </div>


              <div className="report-metric">

                <span>
                  Sales Revenue
                </span>

                <strong>
                  {formatCurrency(
                    summary.salesRevenue
                  )}
                </strong>

              </div>


              <div className="report-metric">

                <span>
                  Total Expenses
                </span>

                <strong>
                  {formatCurrency(
                    summary.totalExpenses
                  )}
                </strong>

              </div>


              <div className="report-metric profit">

                <span>
                  Estimated Profit
                </span>

                <strong>
                  {formatCurrency(
                    summary.estimatedProfit
                  )}
                </strong>

              </div>

            </div>

          </div>


          {/* ==================================
              Sa
          =================================== 

          <div className="report-section">

            <div className="report-section-title">

              <ShoppingCart
                size={18}
              />

              <h3>
                Sales Performance
              </h3>

            </div>


            <div className="report-highlight">

              <div>

                <span>
                  Total Sales Revenue
                </span>

                <strong>
                  {formatCurrency(
                    summary.salesRevenue
                  )}
                </strong>

              </div>

              <div>

                <span>
                  Active Alerts
                </span>

                <strong>
                  {summary.activeAlerts}
                </strong>

              </div>

            </div>

          </div>


           ==================================
              Decision Support
          =================================== 

          <div className="report-section">

            <div className="report-section-title">

              <Boxes size={18} />

              <h3>
                Decision Support
              </h3>

            </div>


            <div className="decision-list">

              <div>

                <span className="decision-number">
                  01
                </span>

                <p>
                  Monitor production efficiency
                  and investigate deviations between
                  planned and actual output.
                </p>

              </div>


              <div>

                <span className="decision-number">
                  02
                </span>

                <p>
                  Track raw material inventory
                  levels to prevent production
                  interruptions.
                </p>

              </div>


              <div>

                <span className="decision-number">
                  03
                </span>

                <p>
                  Analyze financial performance
                  and control operational expenses.
                </p>

              </div>


              <div>

                <span className="decision-number">
                  04
                </span>

                <p>
                  Use sales trends and regional
                  performance to support business
                  planning.
                </p>

              </div>

            </div>

          </div>


          {/* ==================================
              Footer
          =================================== 

          <div className="report-footer">

            <span>
              Enterprise Data Integration
              Dashboard
            </span>

            <span>
              MSME Analytics
            </span>

          </div>

        </div>

      ) : null}

    </div>
  );
};

export default Reports;
*/


import { useEffect, useState } from "react"
import { getDashboardSummary } from "../services/api"
import "./styles/Reports.css"

const COMPANY_ID = "68a123456789abcdef123456"

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0)

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("en-IN")

// ─── Icon helpers ─────────────────────────────────────────────────────
function FactoryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <rect x="1" y="9" width="14" height="6" />
      <rect x="1" y="6" width="4" height="3" />
      <rect x="11" y="7" width="4" height="2" />
      <rect x="2" y="3" width="2" height="4" />
      <rect x="8" y="4" width="2" height="5" />
    </svg>
  )
}

function BoxIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 5l6-3 6 3v7l-6 3-6-3V5z" />
      <path d="M2 5l6 3 6-3" />
      <line x1="8" y1="8" x2="8" y2="15" />
    </svg>
  )
}

function RupeeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <path d="M4 4h8M4 7h8M4 7c0 3 2 5 6 6M4 4c0 0 6-1 6 3" />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <path d="M1 2h2l2 8h7l2-5H5" />
      <circle cx="7" cy="13.5" r="1.2" />
      <circle cx="12" cy="13.5" r="1.2" />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <rect x="2" y="2" width="5" height="5" />
      <rect x="9" y="2" width="5" height="5" />
      <rect x="2" y="9" width="5" height="5" />
      <rect x="9" y="9" width="5" height="5" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 11v2h10v-2" />
      <polyline points="7,2 7,9" />
      <polyline points="4,7 7,10 10,7" />
    </svg>
  )
}

// ─── Section component ────────────────────────────────────────────────
function Section({
  icon, title, num, color, children,
}) {
  return (
    <div className="rep-section">
      <div className="rep-section-header">
        <div className="rep-section-icon" style={{ color, borderColor: `${color}44`, background: `${color}11` }}>
          {icon}
        </div>
        <span className="rep-section-title">{title}</span>
        <span className="rep-section-num">{num}</span>
      </div>
      {children}
    </div>
  )
}

// ─── Reports page ─────────────────────────────────────────────────────
export default function Reports() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // ── Fetch summary (original logic) ──
  const fetchSummary = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await getDashboardSummary(COMPANY_ID)
      console.log("Reports Summary:", response.data)
      setSummary(response.data?.data)
    } catch (err) {
      console.error("Reports error:", err)
      setError(err.response?.data?.message || "Unable to generate report.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSummary() }, [])

  // ── Print (original logic) ──
  const printReport = () => {
  document.body.classList.add("rep-printing")

  window.setTimeout(() => {
    window.print()

    window.setTimeout(() => {
      document.body.classList.remove("rep-printing")
    }, 100)
  }, 50)
}

  return (
    <div className="rep-root">

      {/* ── Header ── */}
      <div className="rep-header">
        <div className="rep-header-stripe" />
        <div className="rep-header-left">
          <div className="rep-header-accent" />
          <div className="rep-header-text">
            <span className="rep-module-id">MOD-08 // ANALYTICS</span>
            <h2 className="rep-title">REPORTS</h2>
            <span className="rep-subtitle">Enterprise performance summary and operational insights</span>
          </div>
        </div>
        <div className="rep-header-right">
          <button className="rep-refresh-btn" onClick={fetchSummary} disabled={loading}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={loading ? "rep-spin" : ""}>
              <path d="M11 2.5A5.5 5.5 0 1 1 6.5 1" />
              <polyline points="6.5,1 9,1 9,3.5" />
            </svg>
            REFRESH
          </button>
          <button className="rep-export-btn" onClick={printReport}>
            <DownloadIcon />
            EXPORT REPORT
          </button>
        </div>
      </div>

      {error && (
        <div className="rep-error">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="6" /><line x1="7" y1="4" x2="7" y2="7" /><circle cx="7" cy="10" r="0.6" fill="currentColor" /></svg>
          {error}
        </div>
      )}

      {loading ? (
        <div className="rep-loading">
          <div className="rep-loading-ring" />
          <span className="rep-loading-text">
            GENERATING ENTERPRISE REPORT
            <span className="rep-loading-dots"><span>.</span><span>.</span><span>.</span></span>
          </span>
        </div>
      ) : summary ? (
        <div className="rep-document">

          {/* ── Report Title ── */}
          <div className="rep-title-section">
            <div className="rep-title-icon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                <rect x="4" y="3" width="20" height="22" rx="1" />
                <line x1="8" y1="9" x2="20" y2="9" />
                <line x1="8" y1="13" x2="20" y2="13" />
                <line x1="8" y1="17" x2="14" y2="17" />
                <rect x="14" y="15" width="7" height="7" rx="0.5" />
                <line x1="17" y1="17" x2="17" y2="19" />
                <line x1="16" y1="18" x2="18" y2="18" />
              </svg>
            </div>
            <div>
              <span className="rep-doc-title">Enterprise Performance Report</span>
              <span className="rep-doc-sub">MSME Enterprise Data Integration Dashboard</span>
              <span className="rep-doc-date">
                GENERATED ON {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }).toUpperCase()}
              </span>
            </div>
          </div>

          {/* ── Executive Summary ── */}
          <Section icon={<GridIcon />} title="EXECUTIVE SUMMARY" num="§ 01" color="#fbbf24">
            <p className="rep-exec-text">
              This report provides a consolidated overview of production, inventory, raw material, sales and
              financial performance based on the integrated enterprise datasets. All figures reflect the
              most recent sync from connected backend modules.
            </p>
          </Section>

          {/* ── Production ── */}
          <Section icon={<FactoryIcon />} title="PRODUCTION PERFORMANCE" num="§ 02" color="#22d3ee">
            <div className="rep-metric-grid">
              {[
                { label: "PLANNED PRODUCTION", value: formatNumber(summary.totalPlannedProduction), unit: "Units", highlight: false },
                { label: "ACTUAL PRODUCTION",  value: formatNumber(summary.totalActualProduction),  unit: "Units", highlight: false },
                { label: "PRODUCTION EFFICIENCY", value: `${summary.productionEfficiency ?? 0}%`, unit: "Actual vs planned", highlight: true },
                { label: "DEFECT RATE",         value: `${summary.defectRate ?? 0}%`,             unit: "Quality indicator", highlight: false },
              ].map((m) => (
                <div key={m.label} className={`rep-metric-tile${m.highlight ? " rep-highlight" : ""}`}>
                  <span className="rep-metric-label">{m.label}</span>
                  <span className={`rep-metric-value${m.highlight ? " rep-profit" : ""}`}>{m.value}</span>
                  <span className="rep-metric-unit">{m.unit}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Inventory ── */}
          <Section icon={<BoxIcon />} title="INVENTORY OVERVIEW" num="§ 03" color="#a78bfa">
            <div className="rep-highlight-row">
              <div className="rep-highlight-cell">
                <span className="rep-highlight-label">TOTAL INVENTORY UNITS</span>
                <span className="rep-highlight-value">{formatNumber(summary.totalInventoryUnits)}</span>
              </div>
              <div className="rep-highlight-cell">
                <span className="rep-highlight-label">RAW MATERIAL INVENTORY VALUE</span>
                <span className="rep-highlight-value">{formatCurrency(summary.rawMaterialInventoryValue)}</span>
              </div>
            </div>
          </Section>

          {/* ── Finance ── */}
          <Section icon={<RupeeIcon />} title="FINANCIAL PERFORMANCE" num="§ 04" color="#34d399">
            <div className="rep-metric-grid">
              {[
                { label: "FINANCE REVENUE",  value: formatCurrency(summary.financeRevenue),  unit: "", highlight: false },
                { label: "SALES REVENUE",    value: formatCurrency(summary.salesRevenue),    unit: "", highlight: false },
                { label: "TOTAL EXPENSES",   value: formatCurrency(summary.totalExpenses),   unit: "", highlight: false },
                { label: "ESTIMATED PROFIT", value: formatCurrency(summary.estimatedProfit), unit: "Net balance", highlight: true },
              ].map((m) => (
                <div key={m.label} className={`rep-metric-tile${m.highlight ? " rep-highlight" : ""}`}>
                  <span className="rep-metric-label">{m.label}</span>
                  <span className={`rep-metric-value${m.highlight ? " rep-profit" : ""}`}>{m.value}</span>
                  {m.unit && <span className="rep-metric-unit">{m.unit}</span>}
                </div>
              ))}
            </div>
          </Section>

          {/* ── Sales ── */}
          <Section icon={<CartIcon />} title="SALES PERFORMANCE" num="§ 05" color="#fb923c">
            <div className="rep-highlight-row">
              <div className="rep-highlight-cell">
                <span className="rep-highlight-label">TOTAL SALES REVENUE</span>
                <span className="rep-highlight-value" style={{ color: "#fb923c", textShadow: "0 0 14px rgba(251,146,60,0.25)" }}>
                  {formatCurrency(summary.salesRevenue)}
                </span>
              </div>
              <div className="rep-highlight-cell">
                <span className="rep-highlight-label">ACTIVE ALERTS</span>
                <span className="rep-highlight-value" style={{ color: summary.activeAlerts > 0 ? "#f87171" : "#4ade80", textShadow: "none" }}>
                  {summary.activeAlerts ?? 0}
                </span>
              </div>
            </div>
          </Section>

          {/* ── Decision Support ── */}
          <Section icon={<GridIcon />} title="DECISION SUPPORT" num="§ 06" color="#fbbf24">
            <div className="rep-decision-list">
              {[
                "Monitor production efficiency and investigate deviations between planned and actual output.",
                "Track raw material inventory levels to prevent production interruptions.",
                "Analyze financial performance and control operational expenses.",
                "Use sales trends and regional performance to support business planning.",
              ].map((text, i) => (
                <div className="rep-decision-item" key={i}>
                  <span className="rep-decision-num">{String(i + 1).padStart(2, "0")}</span>
                  <p className="rep-decision-text">{text}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Footer ── */}
          <div className="rep-footer">
            <span className="rep-footer-left">Enterprise Data Integration Dashboard &nbsp;// MSME Analytics</span>
            <div className="rep-footer-right">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--rep)", boxShadow: "0 0 6px var(--rep)", display: "inline-block", animation: "rep-pulse 2s ease-in-out infinite" }} />
              REPORT COMPLETE
            </div>
          </div>

        </div>
      ) : null}

    </div>
  )
}
