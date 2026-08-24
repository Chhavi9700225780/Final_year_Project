
/*
import { useEffect, useMemo, useState } from "react";

import {
  ShoppingCart,
  IndianRupee,
  TrendingUp,
  MapPin,
  Search,
  RefreshCw,
  Package,
} from "lucide-react";

import { getSales } from "../services/api";

const COMPANY_ID = "68a123456789abcdef123456";

const Sales = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] =
    useState("all");

  // ==========================================
  // Fetch Sales
  // ==========================================

  const fetchSales = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getSales(COMPANY_ID);

      console.log(
        "Sales API:",
        response.data
      );

      const responseData =
        response.data?.data;

      let salesData = [];

      if (Array.isArray(responseData)) {
        salesData = responseData;
      } else if (
        Array.isArray(responseData?.data)
      ) {
        salesData = responseData.data;
      }

      setRecords(salesData);

    } catch (err) {
      console.error(
        "Sales fetch error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to load sales data."
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  // ==========================================
  // Statistics
  // ==========================================

  const statistics = useMemo(() => {
    const totalQuantity = records.reduce(
      (sum, item) =>
        sum + Number(item.quantity || 0),
      0
    );

    const totalRevenue = records.reduce(
      (sum, item) =>
        sum + Number(item.revenue || 0),
      0
    );

    const products = new Set(
      records
        .map((item) => item.productId)
        .filter(Boolean)
    ).size;

    const regions = new Set(
      records
        .map((item) => item.customerRegion)
        .filter(Boolean)
    ).size;

    // ----------------------------------------
    // Top Product
    // ----------------------------------------

    const productSales = {};

    records.forEach((item) => {
      const product =
        item.productName ||
        "Unknown Product";

      if (!productSales[product]) {
        productSales[product] = 0;
      }

      productSales[product] +=
        Number(item.revenue || 0);
    });

    let topProduct = "N/A";
    let topProductRevenue = 0;

    Object.entries(productSales).forEach(
      ([product, revenue]) => {
        if (
          revenue >
          topProductRevenue
        ) {
          topProduct = product;
          topProductRevenue = revenue;
        }
      }
    );

    return {
      totalQuantity,
      totalRevenue,
      products,
      regions,
      topProduct,
      topProductRevenue,
    };
  }, [records]);

  // ==========================================
  // Regions
  // ==========================================

  const regions = useMemo(() => {
    return [
      ...new Set(
        records
          .map(
            (item) =>
              item.customerRegion
          )
          .filter(Boolean)
      ),
    ];
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
        item.productName
          ?.toLowerCase()
          .includes(query) ||
        item.productId
          ?.toLowerCase()
          .includes(query) ||
        item.customerRegion
          ?.toLowerCase()
          .includes(query);

      const matchesRegion =
        regionFilter === "all" ||
        item.customerRegion ===
          regionFilter;

      return (
        matchesSearch &&
        matchesRegion
      );
    });
  }, [
    records,
    search,
    regionFilter,
  ]);

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
            Sales
          </h2>

          <p>
            Analyze sales performance,
            products and customer regions.
          </p>

        </div>

        <button
          className="refresh-button"
          onClick={fetchSales}
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

          <ShoppingCart size={18} />

          {error}

        </div>

      )}



      <div className="module-kpi-grid">

       

        <div className="module-kpi-card">

          <div className="module-kpi-icon green">

            <IndianRupee size={20} />

          </div>

          <div>

            <span>
              Sales Revenue
            </span>

            <strong>
              {formatCurrency(
                statistics.totalRevenue
              )}
            </strong>

            <small>
              Total recorded revenue
            </small>

          </div>

        </div>


        

        <div className="module-kpi-card">

          <div className="module-kpi-icon blue">

            <ShoppingCart size={20} />

          </div>

          <div>

            <span>
              Units Sold
            </span>

            <strong>
              {statistics.totalQuantity.toLocaleString(
                "en-IN"
              )}
            </strong>

            <small>
              Total quantity sold
            </small>

          </div>

        </div>


       

        <div className="module-kpi-card">

          <div className="module-kpi-icon purple">

            <Package size={20} />

          </div>

          <div>

            <span>
              Products
            </span>

            <strong>
              {statistics.products}
            </strong>

            <small>
              Products with sales
            </small>

          </div>

        </div>


      

        <div className="module-kpi-card">

          <div className="module-kpi-icon red">

            <MapPin size={20} />

          </div>

          <div>

            <span>
              Regions
            </span>

            <strong>
              {statistics.regions}
            </strong>

            <small>
              Customer regions
            </small>

          </div>

        </div>

      </div>



      <div className="module-card sales-highlight">

        <div className="sales-highlight-content">

          <div className="sales-highlight-icon">

            <TrendingUp size={22} />

          </div>

          <div>

            <span>
              Top Performing Product
            </span>

            <strong>
              {statistics.topProduct}
            </strong>

            <small>
              {formatCurrency(
                statistics.topProductRevenue
              )}{" "}
              revenue generated
            </small>

          </div>

        </div>

      </div>




      <div className="module-card">

        <div className="module-card-header">

          <div>

            <h3>
              Sales Records
            </h3>

            <p>
              Product sales and regional
              performance.
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
              placeholder="Search product or region..."
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
                regionFilter === "all"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setRegionFilter("all")
              }
            >
              All Regions
            </button>

            {regions.map(
              (region) => (

                <button
                  key={region}
                  className={
                    regionFilter ===
                    region
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setRegionFilter(
                      region
                    )
                  }
                >
                  {region}
                </button>

              )
            )}

          </div>

        </div>



        {loading ? (

          <div className="table-state">

            <RefreshCw
              size={24}
              className="spin"
            />

            <p>
              Loading sales data...
            </p>

          </div>

        ) : filteredRecords.length === 0 ? (

          <div className="table-state">

            <ShoppingCart size={30} />

            <p>
              No sales records found.
            </p>

          </div>

        ) : (

          <div className="table-wrapper">

            <table className="enterprise-table">

              <thead>

                <tr>

                  <th>
                    Product
                  </th>

                  <th>
                    Quantity
                  </th>

                  <th>
                    Revenue
                  </th>

                  <th>
                    Region
                  </th>

                  <th>
                    Sale Date
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredRecords.map(
                  (item) => (

                    <tr
                      key={
                        item._id
                      }
                    >

                      

                      <td>

                        <div className="product-cell">

                          <div className="product-avatar">

                            <ShoppingCart
                              size={15}
                            />

                          </div>

                          <div>

                            <strong>
                              {
                                item.productName ||
                                "Unknown Product"
                              }
                            </strong>

                            <span>
                              {
                                item.productId ||
                                "-"
                              }
                            </span>

                          </div>

                        </div>

                      </td>



                      <td>

                        <strong>
                          {Number(
                            item.quantity ||
                            0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                      </td>


                      

                      <td>

                        <strong className="amount-revenue">

                          {formatCurrency(
                            item.revenue
                          )}

                        </strong>

                      </td>



                      <td>

                        <span className="region-badge">

                          <MapPin
                            size={12}
                          />

                          {
                            item.customerRegion ||
                            "Unknown"
                          }

                        </span>

                      </td>


                      

                      <td>

                        {formatDate(
                          item.saleDate
                        )}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
};

export default Sales;

*/


import { useEffect, useMemo, useState } from "react"
import { getSales } from "../services/api"
import "./styles/Sales.css"

const COMPANY_ID = "68a123456789abcdef123456"



// ─── Region colors ────────────────────────────────────────────────────
const REGION_PALETTE = {}
const PALETTE = ["#f59e0b", "#4ade80", "#fb923c", "#a78bfa", "#f87171", "#22d3ee", "#e879f9"]
const getRegionColor = (region) => {
  if (!REGION_PALETTE[region]) {
    const idx = Object.keys(REGION_PALETTE).length % PALETTE.length
    REGION_PALETTE[region] = PALETTE[idx]
  }
  return REGION_PALETTE[region]
}

// ─── Helpers ──────────────────────────────────────────────────────────
const formatCurrency = (v) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v || 0)

const formatCurrencyShort = (v) =>
  v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${(v / 1000).toFixed(0)}K`

const formatDate = (date) => {
  if (!date) return "—"
  return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

// ─── Inline SVGs ──────────────────────────────────────────────────────
function CartIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M1 2h2l2 8h7l2-5H5" /><circle cx="7" cy="13.5" r="1.2" /><circle cx="12" cy="13.5" r="1.2" />
    </svg>
  )
}

function RupeeIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <line x1="4" y1="4" x2="12" y2="4" /><line x1="4" y1="7" x2="12" y2="7" />
      <path d="M4 7l5 7" /><path d="M8 4v0a3 3 0 0 1 0 3" />
    </svg>
  )
}

function TrendingIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1,15 7,9 12,12 20,4" /><polyline points="14,4 20,4 20,10" />
    </svg>
  )
}

function PackageIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 4.5l7-4 7 4v8l-7 4-7-4V4.5z" />
      <path d="M1 4.5l7 4 7-4" /><line x1="8" y1="8.5" x2="8" y2="16.5" />
    </svg>
  )
}

function MapPinIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="6" cy="4.5" r="2" /><path d="M6 11s-4-3.8-4-6.5a4 4 0 0 1 8 0C10 7.2 6 11 6 11z" />
    </svg>
  )
}

function RefreshIcon({ size = 11 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────────
function KPICard({ label, value, sub, accent, icon }) {
  return (
    <div className="sales-kpi-card">
      <div className="sales-kpi-top" style={{ background: accent, boxShadow: `0 2px 8px ${accent}60` }} />
      <div className="sales-kpi-body">
        <div className="sales-kpi-row">
          <div className="sales-kpi-icon" style={{ background: `${accent}14`, borderColor: `${accent}30`, color: accent }}>
            {icon}
          </div>
          <span className="sales-kpi-cat">{label}</span>
        </div>
        <div className="sales-kpi-value" style={{ color: accent, textShadow: `0 0 12px ${accent}55` }}>{value}</div>
        <div className="sales-kpi-sub">{sub}</div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────
const Sales = () => {
  const [records, setRecords]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState("")
  const [search, setSearch]             = useState("")
  const [regionFilter, setRegionFilter] = useState("all")

  // ── Fetch ──
  const fetchSales = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await getSales(COMPANY_ID)
      console.log("Sales API:", response.data)

      const responseData = (response.data )?.data
      let salesData = []

      if (Array.isArray(responseData)) {
        salesData = responseData
      } else if (Array.isArray(responseData?.data)) {
        salesData = responseData.data
      }

      setRecords(salesData)
    } catch (err) {
      console.error("Sales fetch error:", err)
      setError(err.response?.data?.message || "Unable to load sales data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSales() }, [])

  // ── Statistics ──
  const statistics = useMemo(() => {
    const totalQuantity = records.reduce((s, r) => s + Number(r.quantity || 0), 0)
    const totalRevenue  = records.reduce((s, r) => s + Number(r.revenue  || 0), 0)
    const products      = new Set(records.map(r => r.productId).filter(Boolean)).size
    const regions       = new Set(records.map(r => r.customerRegion).filter(Boolean)).size

    const productSales = {}
    records.forEach(r => {
      const p = r.productName || "Unknown"
      productSales[p] = (productSales[p] || 0) + Number(r.revenue || 0)
    })

    let topProduct = "N/A", topProductRevenue = 0
    Object.entries(productSales).forEach(([p, rev]) => {
      if (rev > topProductRevenue) { topProduct = p; topProductRevenue = rev }
    })

    return { totalQuantity, totalRevenue, products, regions, topProduct, topProductRevenue }
  }, [records])

  // ── Unique regions ──
  const regions = useMemo(() =>
    [...new Set(records.map(r => r.customerRegion).filter(Boolean) )],
  [records])

  // ── Max revenue for bar scale ──
  const maxRevenue = useMemo(() =>
    Math.max(...records.map(r => Number(r.revenue || 0)), 1),
  [records])

  // ── Search + filter ──
  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase()
    return records.filter(r => {
      const matchesSearch =
        !q ||
        r.productName?.toLowerCase().includes(q) ||
        r.productId?.toLowerCase().includes(q) ||
        r.customerRegion?.toLowerCase().includes(q)
      const matchesRegion =
        regionFilter === "all" || r.customerRegion === regionFilter
      return matchesSearch && matchesRegion
    })
  }, [records, search, regionFilter])

  return (
    <div className="sales-root">

      {/* ── Header ── */}
      <div className="sales-header">
        <div className="sales-header-left">
          <div className="sales-header-accent" />
          <div className="sales-header-text">
            <div className="sales-header-label">MSME OPERATIONS · SALES MODULE</div>
            <div className="sales-header-title">REVENUE COMMAND</div>
          </div>
        </div>
        <div className="sales-header-right">
          <div className="sales-live-badge">
            <span className="sales-led" />
            MARKET ACTIVE
          </div>
          <button className="sales-refresh-btn" onClick={fetchSales} disabled={loading}>
            <RefreshIcon size={11} />
            REFRESH
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="sales-error">
          <CartIcon size={14} />
          {error}
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="sales-kpi-grid">
        <KPICard
          label="SALES REVENUE"
          value={formatCurrencyShort(statistics.totalRevenue)}
          sub="Total recorded revenue"
          accent="#fb923c"
          icon={<RupeeIcon size={16} />}
        />
        <KPICard
          label="UNITS SOLD"
          value={statistics.totalQuantity.toLocaleString("en-IN")}
          sub="Total quantity sold"
          accent="#4ade80"
          icon={<CartIcon size={16} />}
        />
        <KPICard
          label="PRODUCTS"
          value={String(statistics.products)}
          sub="Products with active sales"
          accent="#a78bfa"
          icon={<PackageIcon size={16} />}
        />
        <KPICard
          label="REGIONS"
          value={String(statistics.regions)}
          sub="Active customer regions"
          accent="#22d3ee"
          icon={<MapPinIcon size={14} />}
        />
      </div>

      {/* ── Top Product (Peak Performer) ── */}
      {statistics.topProduct !== "N/A" && (
        <div className="sales-peak-panel">
          <div className="sales-peak-inner">
            <div className="sales-peak-icon-wrap">
              <TrendingIcon size={24} />
            </div>
            <div className="sales-peak-text">
              <div className="sales-peak-eyebrow">PEAK PERFORMER · TOP REVENUE PRODUCT</div>
              <div className="sales-peak-name">{statistics.topProduct}</div>
              <div className="sales-peak-rev">
                <strong>{formatCurrency(statistics.topProductRevenue)}</strong>
                {" "}revenue generated this period
              </div>
            </div>
            <div className="sales-peak-badge">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fb923c", boxShadow: "0 0 5px #fb923c", animation: "led-pulse 2s ease-in-out infinite" }} />
              LEADING
            </div>
          </div>
        </div>
      )}

      {/* ── Records Panel ── */}
      <div className="sales-panel">

        {/* Panel header */}
        <div className="sales-panel-header">
          <div className="sales-panel-tab" />
          <div className="sales-panel-titles">
            <div className="sales-panel-name">SALES RECORDS</div>
            <div className="sales-panel-sub">PRODUCT SALES AND REGIONAL PERFORMANCE</div>
          </div>
          <div className="sales-count-badge">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fb923c", boxShadow: "0 0 5px #fb923c", flexShrink: 0 }} />
            {records.length} RECORDS
          </div>
        </div>

        {/* Toolbar */}
        <div className="sales-toolbar">
          {/* Search */}
          <div className="sales-search">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="7" cy="7" r="5" /><line x1="11" y1="11" x2="15" y2="15" />
            </svg>
            <input
              type="text"
              placeholder="SEARCH PRODUCT OR REGION..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{ background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", padding: 0, lineHeight: 1, fontSize: 14 }}
              >×</button>
            )}
          </div>

          {/* Region filter */}
          <div className="sales-region-filters">
            <span className="sales-filter-label">REGION:</span>
            <button
              className={`sales-filter-btn${regionFilter === "all" ? " active" : ""}`}
              onClick={() => setRegionFilter("all")}
            >
              ALL
            </button>
            {regions.map(region => (
              <button
                key={region}
                className={`sales-filter-btn${regionFilter === region ? " active" : ""}`}
                onClick={() => setRegionFilter(region)}
              >
                {region}
              </button>
            ))}
          </div>

          <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.16em", color: "var(--text-faint)", marginLeft: "auto" }}>
            {filteredRecords.length} / {records.length} SHOWN
          </span>
        </div>

        {/* States */}
        {loading ? (
          <div className="sales-state">
            <div className="sales-loading-ring" />
            <div>
              <span className="sales-state-text">LOADING SALES DATA</span>
              <span className="sales-state-dots"><span>.</span><span>.</span><span>.</span></span>
            </div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="sales-state">
            <CartIcon size={32} />
            <span className="sales-state-text">
              {search || regionFilter !== "all" ? "NO RECORDS MATCH YOUR FILTERS" : "NO SALES RECORDS FOUND"}
            </span>
          </div>
        ) : (
          <>
            <div className="sales-table-wrap">
              <table className="sales-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>PRODUCT</th>
                    <th>QUANTITY</th>
                    <th>REVENUE</th>
                    <th>REGION</th>
                    <th>SALE DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((item, idx) => {
                    const rev    = Number(item.revenue  || 0)
                    const qty    = Number(item.quantity || 0)
                    const revPct = (rev / maxRevenue) * 100
                    const rColor = getRegionColor(item.customerRegion || "")

                    return (
                      <tr key={item._id}>

                        {/* # */}
                        <td style={{ color: "var(--text-faint)", fontSize: 9 }}>
                          {String(idx + 1).padStart(2, "0")}
                        </td>

                        {/* Product */}
                        <td>
                          <div className="sales-product-cell">
                            <div className="sales-product-icon">
                              <CartIcon size={14} />
                            </div>
                            <div>
                              <div className="sales-product-name">{item.productName || "Unknown Product"}</div>
                              <div className="sales-product-id">{item.productId || "—"}</div>
                            </div>
                          </div>
                        </td>

                        {/* Quantity */}
                        <td>
                          <span className="sales-qty">{qty.toLocaleString("en-IN")}</span>
                        </td>

                        {/* Revenue + bar */}
                        <td>
                          <div className="sales-rev-wrap">
                            <strong className="amount-revenue">{formatCurrency(rev)}</strong>
                            <div className="sales-rev-bar-track">
                              <div className="sales-rev-bar-fill" style={{ width: `${revPct}%` }} />
                            </div>
                          </div>
                        </td>

                        {/* Region */}
                        <td>
                          <span className="region-badge">
                            <span className="region-badge-dot" style={{ background: rColor, boxShadow: `0 0 4px ${rColor}` }} />
                            {item.customerRegion || "Unknown"}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="sales-date">{formatDate(item.saleDate)}</td>

                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer totals */}
            <div className="sales-footer">
              <span className="sales-footer-label">TOTALS</span>
              <div className="sales-footer-divider" />
              <div className="sales-footer-stat">
                <span className="sales-footer-label">TOTAL REVENUE</span>
                <span className="sales-footer-val" style={{ color: "#fb923c", textShadow: "0 0 10px rgba(251,146,60,0.4)" }}>
                  {formatCurrency(statistics.totalRevenue)}
                </span>
              </div>
              <div className="sales-footer-divider" />
              <div className="sales-footer-stat">
                <span className="sales-footer-label">UNITS SOLD</span>
                <span className="sales-footer-val" style={{ color: "#4ade80" }}>
                  {statistics.totalQuantity.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="sales-footer-divider" />
              <div className="sales-footer-stat">
                <span className="sales-footer-label">ACTIVE REGIONS</span>
                <span className="sales-footer-val" style={{ color: "#22d3ee" }}>
                  {statistics.regions}
                </span>
              </div>
              <div className="sales-footer-divider" />
              <div className="sales-footer-stat">
                <span className="sales-footer-label">PRODUCTS</span>
                <span className="sales-footer-val" style={{ color: "#a78bfa" }}>
                  {statistics.products}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Sales
