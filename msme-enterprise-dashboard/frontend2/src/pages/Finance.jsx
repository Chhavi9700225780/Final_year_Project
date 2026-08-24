/*
import { useEffect, useMemo, useState } from "react";

import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Wallet,
  Search,
  RefreshCw,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";

import { getFinanceTransactions } from "../services/api";

const COMPANY_ID = "68a123456789abcdef123456";

const Finance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // ==========================================
  // Fetch Finance Data
  // ==========================================

  const fetchFinance = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getFinanceTransactions(COMPANY_ID);

      console.log(
        "Finance API:",
        response.data
      );

      const responseData =
        response.data?.data;

      let financeData = [];

      if (Array.isArray(responseData)) {
        financeData = responseData;
      } else if (
        Array.isArray(responseData?.data)
      ) {
        financeData = responseData.data;
      }

      setRecords(financeData);

    } catch (err) {
      console.error(
        "Finance fetch error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to load finance data."
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  // ==========================================
  // Financial Statistics
  // ==========================================

  const statistics = useMemo(() => {
    const revenue = records
      .filter(
        (item) =>
          item.transactionType === "revenue"
      )
      .reduce(
        (sum, item) =>
          sum + Number(item.amount || 0),
        0
      );

    const expenses = records
      .filter(
        (item) =>
          item.transactionType === "expense"
      )
      .reduce(
        (sum, item) =>
          sum + Number(item.amount || 0),
        0
      );

    const profit = revenue - expenses;

    const revenueTransactions =
      records.filter(
        (item) =>
          item.transactionType ===
          "revenue"
      ).length;

    const expenseTransactions =
      records.filter(
        (item) =>
          item.transactionType ===
          "expense"
      ).length;

    return {
      revenue,
      expenses,
      profit,
      revenueTransactions,
      expenseTransactions,
    };
  }, [records]);

  // ==========================================
  // Search + Filter
  // ==========================================

  const filteredRecords = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return records.filter((item) => {
      const matchesSearch =
        !query ||
        item.department
          ?.toLowerCase()
          .includes(query) ||
        item.description
          ?.toLowerCase()
          .includes(query) ||
        item.transactionType
          ?.toLowerCase()
          .includes(query);

      const matchesFilter =
        filter === "all" ||
        item.transactionType === filter;

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [records, search, filter]);

  // ==========================================
  // Currency
  // ==========================================

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

  // ==========================================
  // Date
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <div className="module-page">

     

      <div className="module-header">

        <div>

          <h2>
            Finance
          </h2>

          <p>
            Monitor revenue, expenses and
            financial performance.
          </p>

        </div>

        <button
          className="refresh-button"
          onClick={fetchFinance}
          disabled={loading}
        >

          <RefreshCw
            size={16}
            className={
              loading ? "spin" : ""
            }
          />

          Refresh

        </button>

      </div>


      

      {error && (

        <div className="module-error">

          <Wallet size={18} />

          {error}

        </div>

      )}



      <div className="module-kpi-grid">

        

        <div className="module-kpi-card">

          <div className="module-kpi-icon green">

            <TrendingUp size={20} />

          </div>

          <div>

            <span>
              Total Revenue
            </span>

            <strong>
              {formatCurrency(
                statistics.revenue
              )}
            </strong>

            <small>
              Revenue transactions
            </small>

          </div>

        </div>


        

        <div className="module-kpi-card">

          <div className="module-kpi-icon red">

            <TrendingDown size={20} />

          </div>

          <div>

            <span>
              Total Expenses
            </span>

            <strong>
              {formatCurrency(
                statistics.expenses
              )}
            </strong>

            <small>
              Expense transactions
            </small>

          </div>

        </div>


        

        <div className="module-kpi-card">

          <div className="module-kpi-icon blue">

            <Wallet size={20} />

          </div>

          <div>

            <span>
              Estimated Profit
            </span>

            <strong>
              {formatCurrency(
                statistics.profit
              )}
            </strong>

            <small>
              Revenue minus expenses
            </small>

          </div>

        </div>


        

        <div className="module-kpi-card">

          <div className="module-kpi-icon purple">

            <IndianRupee size={20} />

          </div>

          <div>

            <span>
              Transactions
            </span>

            <strong>
              {records.length}
            </strong>

            <small>
              Total financial records
            </small>

          </div>

        </div>

      </div>


     

      <div className="finance-overview-grid">

        <div className="finance-summary-card">

          <div className="finance-summary-icon revenue">

            <ArrowUpCircle size={20} />

          </div>

          <div>

            <span>
              Revenue Transactions
            </span>

            <strong>
              {statistics.revenueTransactions}
            </strong>

          </div>

        </div>


        <div className="finance-summary-card">

          <div className="finance-summary-icon expense">

            <ArrowDownCircle size={20} />

          </div>

          <div>

            <span>
              Expense Transactions
            </span>

            <strong>
              {statistics.expenseTransactions}
            </strong>

          </div>

        </div>

      </div>


      

      <div className="module-card">

        <div className="module-card-header">

          <div>

            <h3>
              Financial Transactions
            </h3>

            <p>
              Revenue and expense records
              across departments.
            </p>

          </div>

          <div className="record-count">

            {records.length} Records

          </div>

        </div>


        

        <div className="finance-toolbar">

          <div className="search-box">

            <Search size={16} />

            <input
              type="text"
              placeholder="Search department or description..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>


          <div className="finance-filter">

            <button
              className={
                filter === "all"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setFilter("all")
              }
            >
              All
            </button>

            <button
              className={
                filter === "revenue"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setFilter("revenue")
              }
            >
              Revenue
            </button>

            <button
              className={
                filter === "expense"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setFilter("expense")
              }
            >
              Expenses
            </button>

          </div>

        </div>


        

        {loading ? (

          <div className="table-state">

            <RefreshCw
              size={24}
              className="spin"
            />

            <p>
              Loading financial data...
            </p>

          </div>

        ) : filteredRecords.length === 0 ? (

          <div className="table-state">

            <Wallet size={30} />

            <p>
              No financial records found.
            </p>

          </div>

        ) : (

          <div className="table-wrapper">

            <table className="enterprise-table">

              <thead>

                <tr>

                  <th>
                    Department
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Amount
                  </th>

                  <th>
                    Description
                  </th>

                  <th>
                    Date
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredRecords.map(
                  (item) => {

                    const isRevenue =
                      item.transactionType ===
                      "revenue";

                    return (

                      <tr
                        key={
                          item._id
                        }
                      >

                        

                        <td>

                          <strong>
                            {
                              item.department ||
                              "Unknown"
                            }
                          </strong>

                        </td>


                        

                        <td>

                          <span
                            className={
                              isRevenue
                                ? "finance-type revenue"
                                : "finance-type expense"
                            }
                          >

                            {isRevenue ? (
                              <ArrowUpCircle
                                size={13}
                              />
                            ) : (
                              <ArrowDownCircle
                                size={13}
                              />
                            )}

                            {isRevenue
                              ? "Revenue"
                              : "Expense"}

                          </span>

                        </td>


                       

                        <td>

                          <strong
                            className={
                              isRevenue
                                ? "amount-revenue"
                                : "amount-expense"
                            }
                          >

                            {isRevenue
                              ? "+"
                              : "-"}

                            {formatCurrency(
                              item.amount
                            )}

                          </strong>

                        </td>


                        

                        <td>

                          <span className="description-cell">

                            {item.description ||
                              "No description"}

                          </span>

                        </td>


                        

                        <td>

                          {formatDate(
                            item.transactionDate
                          )}

                        </td>

                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
};

export default Finance; */

import { useEffect, useMemo, useState } from "react"
import { getFinanceTransactions } from "../services/api"
import "./styles/Finance.css"

const COMPANY_ID = "68a123456789abcdef123456"

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0)

const formatDate = (date) => {
  if (!date) return "-"
  return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

// ─── Floating coin rain ───────────────────────────────────────────────
function FloatingCoins() {
  return (
    <div className="fin-coins-wrap" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} className={`fin-coin fin-coin-${i}`} viewBox="0 0 20 20" width="15" height="15">
          <circle cx="10" cy="10" r="9" fill="rgba(52,211,153,0.14)" stroke="rgba(52,211,153,0.5)" strokeWidth="1.2" />
          <text x="10" y="14.5" textAnchor="middle" fontSize="9" fill="rgba(52,211,153,0.9)" fontFamily="sans-serif">₹</text>
        </svg>
      ))}
    </div>
  )
}

// ─── Revenue vs Expense balance bar ──────────────────────────────────
function ProfitMeter({ revenue, expenses }) {
  const total = revenue + expenses || 1
  const revPct = Math.round((revenue / total) * 100)
  const expPct = 100 - revPct
  const isProfit = revenue >= expenses

  return (
    <div className="fin-meter-panel">
      <div className="fin-meter-header">
        <span className="fin-meter-label">FINANCIAL BALANCE METER — REV vs EXP</span>
        <span className={`fin-meter-verdict ${isProfit ? "verdict-profit" : "verdict-loss"}`}>
          {isProfit ? "▲ PROFIT MODE" : "▼ DEFICIT MODE"}
        </span>
      </div>
      <div className="fin-balance-bar">
        <div className="fin-balance-rev" style={{ width: `${revPct}%` }}>
          {revPct > 10 && <span className="fin-balance-pct">{revPct}% REV</span>}
        </div>
        <div className="fin-balance-exp" style={{ flex: 1 }}>
          {expPct > 10 && <span className="fin-balance-pct">{expPct}% EXP</span>}
        </div>
      </div>
      <div className="fin-balance-legend">
        <span className="fin-leg-rev">▮ REVENUE</span>
        <span className="fin-leg-exp">▮ EXPENSES</span>
      </div>
    </div>
  )
}

// ─── Finance page ─────────────────────────────────────────────────────
export default function Finance() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")

  // ── Fetch Finance Data (original logic) ──
  const fetchFinance = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await getFinanceTransactions(COMPANY_ID)
      console.log("Finance API:", response.data)
      const responseData = response.data?.data
      let financeData = []
      if (Array.isArray(responseData)) financeData = responseData
      else if (Array.isArray((responseData )?.data)) financeData = (responseData ).data
      setRecords(financeData)
    } catch (err) {
      console.error("Finance fetch error:", err)
      setError(err.response?.data?.message || "Unable to load finance data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchFinance() }, [])

  // ── Financial Statistics (original logic) ──
  const statistics = useMemo(() => {
    const revenue = records.filter((i) => i.transactionType === "revenue").reduce((s, i) => s + Number(i.amount || 0), 0)
    const expenses = records.filter((i) => i.transactionType === "expense").reduce((s, i) => s + Number(i.amount || 0), 0)
    const profit = revenue - expenses
    const revenueTransactions = records.filter((i) => i.transactionType === "revenue").length
    const expenseTransactions = records.filter((i) => i.transactionType === "expense").length
    return { revenue, expenses, profit, revenueTransactions, expenseTransactions }
  }, [records])

  // ── Search + Filter (original logic) ──
  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase()
    return records.filter((item) => {
      const matchesSearch =
        !query ||
        item.department?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.transactionType?.toLowerCase().includes(query)
      const matchesFilter = filter === "all" || item.transactionType === filter
      return matchesSearch && matchesFilter
    })
  }, [records, search, filter])

  return (
    <div className="fin-root">

      {/* ── Header ── */}
      <div className="fin-header">
        <div className="fin-header-stripe" />
        <div className="fin-header-left">
          <div className="fin-header-accent" />
          <div className="fin-header-text">
            <span className="fin-module-id">MOD-05 // P&L LEDGER</span>
            <h2 className="fin-title">FINANCE</h2>
            <span className="fin-subtitle">Monitor revenue, expenses and financial performance</span>
          </div>
        </div>
        <div className="fin-header-right">
          <FloatingCoins />
          <div className="fin-status-chip">
            <span className="fin-status-dot" />
            LEDGER ACTIVE
          </div>
          <button className="fin-refresh-btn" onClick={fetchFinance} disabled={loading}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={loading ? "fin-spin" : ""}>
              <path d="M11 2.5A5.5 5.5 0 1 1 6.5 1" />
              <polyline points="6.5,1 9,1 9,3.5" />
            </svg>
            REFRESH
          </button>
        </div>
      </div>

      {error && (
        <div className="fin-error">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="6" /><line x1="7" y1="4" x2="7" y2="7.5" /><circle cx="7" cy="10" r="0.7" fill="currentColor" /></svg>
          {error}
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="fin-kpi-row">
        {[
          { label: "TOTAL REVENUE", value: formatCurrency(statistics.revenue), sub: `${statistics.revenueTransactions} revenue transactions`, color: "#34d399", icon: "↑" },
          { label: "TOTAL EXPENSES", value: formatCurrency(statistics.expenses), sub: `${statistics.expenseTransactions} expense transactions`, color: "#f87171", icon: "↓" },
          { label: "ESTIMATED PROFIT", value: formatCurrency(statistics.profit), sub: statistics.profit >= 0 ? "Positive balance" : "Deficit detected", color: statistics.profit >= 0 ? "#34d399" : "#f87171", icon: "≡" },
          { label: "TOTAL RECORDS", value: String(records.length), sub: "All financial entries", color: "#a78bfa", icon: "#" },
        ].map((k) => (
          <div className="fin-kpi-card" key={k.label}>
            <div className="fin-kpi-top-bar" style={{ background: k.color }} />
            <div className="fin-kpi-body">
              <div className="fin-kpi-icon" style={{ color: k.color, borderColor: `${k.color}33`, background: `${k.color}11` }}>
                {k.icon}
              </div>
              <span className="fin-kpi-label">{k.label}</span>
              <div className="fin-kpi-value" style={{ color: k.color }}>{k.value}</div>
              <span className="fin-kpi-sub">{k.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Profit Balance Meter ── */}
      <ProfitMeter revenue={statistics.revenue} expenses={statistics.expenses} />

      {/* ── Transactions Table ── */}
      <div className="fin-table-panel">
        <div className="fin-table-header">
          <div className="fin-table-tab" />
          <div className="fin-table-titles">
            <span className="fin-table-name">FINANCIAL TRANSACTIONS</span>
            <span className="fin-table-sub">Revenue and expense records across departments</span>
          </div>
          <span className="fin-record-count">{records.length} RECORDS</span>
        </div>

        <div className="fin-toolbar">
          <div className="fin-search-box">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
              <circle cx="5.5" cy="5.5" r="4" />
              <line x1="9" y1="9" x2="12" y2="12" />
            </svg>
            <input
              type="text"
              placeholder="Search department or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="fin-filter-btns">
            {(["all", "revenue", "expense"] ).map((f) => (
              <button key={f} className={`fin-filter-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                {f === "all" ? "ALL" : f === "revenue" ? "▲ REVENUE" : "▼ EXPENSES"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="fin-state">
            <div className="fin-loading-ring" />
            <span>LOADING FINANCIAL DATA<span className="fin-dots"><span>.</span><span>.</span><span>.</span></span></span>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="fin-state">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="var(--text-faint)" strokeWidth="1.2" strokeLinecap="round">
              <circle cx="18" cy="18" r="15" />
              <path d="M18 9v2M18 25v2" />
              <path d="M12 13.5c0-2 1.8-3.5 6-3.5s6 1.5 6 3.5c0 2.5-3 3.5-6 3.5s-6 1.5-6 4c0 2 1.8 3.5 6 3.5s6-1.5 6-3.5" />
            </svg>
            <span>NO FINANCIAL RECORDS FOUND</span>
          </div>
        ) : (
          <div className="fin-table-wrap">
            <table className="fin-table">
              <thead>
                <tr>
                  <th>DEPARTMENT</th>
                  <th>TYPE</th>
                  <th>AMOUNT</th>
                  <th>DESCRIPTION</th>
                  <th>DATE</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((item) => {
                  const isRevenue = item.transactionType === "revenue"
                  return (
                    <tr key={item._id} className={isRevenue ? "fin-row-rev" : "fin-row-exp"}>
                      <td><strong className="fin-dept">{item.department || "Unknown"}</strong></td>
                      <td>
                        <span className={`fin-type-badge ${isRevenue ? "type-rev" : "type-exp"}`}>
                          {isRevenue ? "▲" : "▼"} {isRevenue ? "Revenue" : "Expense"}
                        </span>
                      </td>
                      <td>
                        <strong className={`fin-amount ${isRevenue ? "amount-pos" : "amount-neg"}`}>
                          {isRevenue ? "+" : "-"}{formatCurrency(item.amount)}
                        </strong>
                      </td>
                      <td><span className="fin-desc">{item.description || "No description"}</span></td>
                      <td><span className="fin-date">{formatDate(item.transactionDate)}</span></td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="fin-footer-row">
                  <td colSpan={2}>TOTALS</td>
                  <td>
                    <span className="fin-amount amount-pos">+{formatCurrency(statistics.revenue)}</span>
                    <span style={{ margin: "0 8px", color: "var(--text-faint)" }}>/</span>
                    <span className="fin-amount amount-neg">-{formatCurrency(statistics.expenses)}</span>
                  </td>
                  <td colSpan={2}>
                    <span className={`fin-amount ${statistics.profit >= 0 ? "amount-pos" : "amount-neg"}`}>
                      NET: {formatCurrency(statistics.profit)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
