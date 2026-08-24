/* import { useEffect, useMemo, useState } from "react";

import {
  Package,
  Boxes,
  ShoppingCart,
  AlertTriangle,
  Search,
  RefreshCw,
  Warehouse,
} from "lucide-react";

import { getInventory } from "../services/api";

const COMPANY_ID = "68a123456789abcdef123456";

const Inventory = () => {
  const [records, setRecords] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  // ==========================================
  // Fetch Inventory
  // ==========================================

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getInventory(COMPANY_ID);

console.log(
  "Inventory API:",
  response.data
);

console.log(
  "FIRST INVENTORY RECORD:",
  response.data?.data?.[0]
);

      const responseData =
        response.data?.data;

      let inventoryData = [];

      if (Array.isArray(responseData)) {
        inventoryData = responseData;
      } else if (
        Array.isArray(responseData?.data)
      ) {
        inventoryData =
          responseData.data;
      }

      setRecords(inventoryData);

    } catch (err) {
      console.error(
        "Inventory fetch error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to load inventory data."
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // ==========================================
  // Statistics
  // ==========================================

  const statistics = useMemo(() => {
    const totalStock = records.reduce(
      (sum, item) =>
        sum +
        Number(item.closingStock || 0),
      0
    );

    const openingStock = records.reduce(
      (sum, item) =>
        sum +
        Number(item.openingStock || 0),
      0
    );

    const produced = records.reduce(
      (sum, item) =>
        sum +
        Number(item.producedQuantity || 0),
      0
    );

    const sold = records.reduce(
      (sum, item) =>
        sum +
        Number(item.soldQuantity || 0),
      0
    );

    /*
     * We don't have a minimumStock field
     * in InventoryRecord.
     *
     * Therefore, low stock here is based
     * on closing stock <= 20% of opening stock.
     
    const lowStock = records.filter(
      (item) => {
        const opening =
          Number(
            item.openingStock || 0
          );

        const closing =
          Number(
            item.closingStock || 0
          );

        if (opening === 0) {
          return false;
        }

        return (
          closing <=
          opening * 0.2
        );
      }
    ).length;

    return {
      totalStock,
      openingStock,
      produced,
      sold,
      lowStock,
      totalProducts: records.length,
    };
  }, [records]);

  // ==========================================
  // Search
  // ==========================================

  const filteredRecords = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return records;
    }

    return records.filter((item) => {
      return (
        item.productName
          ?.toLowerCase()
          .includes(query) ||
        item.productId
          ?.toLowerCase()
          .includes(query) ||
        item.warehouse
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [records, search]);

  // ==========================================
  // Stock Status
  // ==========================================

  const getStockStatus = (
    opening,
    closing
  ) => {
    if (!opening) {
      return {
        label: "Unknown",
        className: "stock-neutral",
      };
    }

    const percentage =
      (closing / opening) * 100;

    if (percentage <= 20) {
      return {
        label: "Low Stock",
        className: "stock-danger",
      };
    }

    if (percentage <= 40) {
      return {
        label: "Moderate",
        className: "stock-warning",
      };
    }

    return {
      label: "Healthy",
      className: "stock-good",
    };
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

      {/* ======================================
          Header
      ======================================= 

      <div className="module-header">

        <div>

          <h2>
            Inventory
          </h2>

          <p>
            Monitor stock levels, warehouse
            activity and inventory movement.
          </p>

        </div>

        <button
          className="refresh-button"
          onClick={fetchInventory}
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

      </div>


      {/* ======================================
          Error
      ======================================= 

      {error && (

        <div className="module-error">

          <AlertTriangle
            size={18}
          />

          {error}

        </div>

      )}


      {/* ======================================
          KPI Cards
      ======================================= 

      <div className="module-kpi-grid">

        {/* Total Stock

        <div className="module-kpi-card">

          <div className="module-kpi-icon blue">

            <Package size={20} />

          </div>

          <div>

            <span>
              Total Inventory
            </span>

            <strong>
              {statistics.totalStock.toLocaleString(
                "en-IN"
              )}
            </strong>

            <small>
              Current closing stock
            </small>

          </div>

        </div>


        

        <div className="module-kpi-card">

          <div className="module-kpi-icon purple">

            <Boxes size={20} />

          </div>

          <div>

            <span>
              Products
            </span>

            <strong>
              {statistics.totalProducts}
            </strong>

            <small>
              Inventory records
            </small>

          </div>

        </div>


        

        <div className="module-kpi-card">

          <div className="module-kpi-icon green">

            <ShoppingCart size={20} />

          </div>

          <div>

            <span>
              Units Sold
            </span>

            <strong>
              {statistics.sold.toLocaleString(
                "en-IN"
              )}
            </strong>

            <small>
              Recorded sales movement
            </small>

          </div>

        </div>


        

        <div className="module-kpi-card">

          <div className="module-kpi-icon red">

            <AlertTriangle
              size={20}
            />

          </div>

          <div>

            <span>
              Low Stock
            </span>

            <strong>
              {statistics.lowStock}
            </strong>

            <small>
              Requires attention
            </small>

          </div>

        </div>

      </div>


      {/* ======================================
          Inventory Table
      ======================================= 

      <div className="module-card">

        <div className="module-card-header">

          <div>

            <h3>
              Inventory Records
            </h3>

            <p>
              Current inventory position across
              products and warehouses.
            </p>

          </div>

          <div className="record-count">

            {records.length} Records

          </div>

        </div>


        

        <div className="table-toolbar">

          <div className="search-box">

            <Search size={16} />

            <input
              type="text"
              placeholder="Search product or warehouse..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>

        </div>


        {/* ====================================
            Loading
        ====================================

        {loading ? (

          <div className="table-state">

            <RefreshCw
              size={24}
              className="spin"
            />

            <p>
              Loading inventory data...
            </p>

          </div>

        ) : filteredRecords.length === 0 ? (

          <div className="table-state">

            <Package size={30} />

            <p>
              No inventory records found.
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
                    Opening
                  </th>

                  <th>
                    Produced
                  </th>

                  <th>
                    Sold
                  </th>

                  <th>
                    Closing Stock
                  </th>

                  <th>
                    Warehouse
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Date
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredRecords.map(
                  (item) => {

                    const opening =
                      Number(
                        item.openingStock ||
                        0
                      );

                    const closing =
                      Number(
                        item.closingStock ||
                        0
                      );

                    const status =
                      getStockStatus(
                        opening,
                        closing
                      );

                    return (

                      <tr
                        key={
                          item._id
                        }
                      >

                        
                        <td>

                          <div className="product-cell">

                            <div className="product-avatar">

                              <Package
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

                          {opening.toLocaleString(
                            "en-IN"
                          )}

                        </td>


                        

                        <td>

                          {Number(
                            item.producedQuantity ||
                            0
                          ).toLocaleString(
                            "en-IN"
                          )}

                        </td>


                      

                        <td>

                          {Number(
                            item.soldQuantity ||
                            0
                          ).toLocaleString(
                            "en-IN"
                          )}

                        </td>


                        

                        <td>

                          <strong>

                            {closing.toLocaleString(
                              "en-IN"
                            )}

                          </strong>

                        </td>


                    

                        <td>

                          <div className="warehouse-cell">

                            <Warehouse
                              size={14}
                            />

                            {
                              item.warehouse ||
                              "Main Warehouse"
                            }

                          </div>

                        </td>


                        

                        <td>

                          <span
                            className={`stock-badge ${status.className}`}
                          >

                            {status.label}

                          </span>

                        </td>


                        

                        <td>

                          {formatDate(
                            item.recordDate
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

export default Inventory;  */


import { useEffect, useMemo, useState } from "react"
import { getInventory } from "../services/api";


import "./styles/Inventory.css"

const COMPANY_ID = "68a123456789abcdef123456"

// ─── Types ────────────────────────────────────────────────────────────


// ─── Inline SVGs ──────────────────────────────────────────────────────
function BoxIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 4.5l7-4 7 4v8l-7 4-7-4V4.5z" />
      <path d="M1 4.5l7 4 7-4" />
      <line x1="8" y1="8.5" x2="8" y2="16.5" />
    </svg>
  )
}

function WarehouseIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 7L8 2l7 5v8H1V7z" />
      <rect x="5" y="10" width="6" height="5" />
    </svg>
  )
}

function AlertIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M8 1L15 14H1L8 1z" />
      <line x1="8" y1="6" x2="8" y2="9" />
      <circle cx="8" cy="11.5" r="0.5" fill="currentColor" />
    </svg>
  )
}

function CartIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M1 2h2l2 8h7l2-5H5" />
      <circle cx="7" cy="13.5" r="1.2" />
      <circle cx="12" cy="13.5" r="1.2" />
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

// ─── Helpers ──────────────────────────────────────────────────────────
const formatDate = (date) => {
  if (!date) return "—"
  return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

const getStockStatus = (opening, closing) => {
  if (!opening) return { label: "Unknown", className: "stock-neutral" }
  const pct = (closing / opening) * 100
  if (pct <= 20) return { label: "Low Stock", className: "stock-danger" }
  if (pct <= 40) return { label: "Moderate", className: "stock-warning" }
  return { label: "Healthy", className: "stock-good" }
}

// ─── KPI Card ─────────────────────────────────────────────────────────
function KPICard({
  label, value, sub, accent, icon, alertDot,
}) {
  return (
    <div className="inv-kpi-card">
      <div className="inv-kpi-top" style={{ background: accent, boxShadow: `0 2px 8px ${accent}60` }} />
      <div className="inv-kpi-body">
        <div className="inv-kpi-row">
          <div className="inv-kpi-icon" style={{ background: `${accent}14`, borderColor: `${accent}30`, color: accent }}>
            {icon}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
            <span className="inv-kpi-cat">{label}</span>
            {alertDot && <span className="inv-kpi-alert-dot" />}
          </div>
        </div>
        <div className="inv-kpi-value" style={{ color: accent, textShadow: `0 0 12px ${accent}60` }}>{value}</div>
        <div className="inv-kpi-sub">{sub}</div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────
const Inventory = () => {
  const [records, setRecords] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState("")
  const [search, setSearch]     = useState("")

  // ── Fetch ──
  const fetchInventory = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await getInventory(COMPANY_ID)

      console.log("Inventory API:", response.data)
      console.log("FIRST INVENTORY RECORD:", response.data?.data?.[0])

      const responseData = (response.data )?.data
      let inventoryData= []

      if (Array.isArray(responseData)) {
        inventoryData = responseData
      } else if (Array.isArray(responseData?.data)) {
        inventoryData = responseData.data
      }

      setRecords(inventoryData)
    } catch (err) {
      console.error("Inventory fetch error:", err)
      setError(err.response?.data?.message || "Unable to load inventory data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchInventory() }, [])

  // ── Statistics ──
  const statistics = useMemo(() => {
    const totalStock   = records.reduce((s, r) => s + Number(r.closingStock  || 0), 0)
    const openingStock = records.reduce((s, r) => s + Number(r.openingStock  || 0), 0)
    const produced     = records.reduce((s, r) => s + Number(r.producedQuantity || 0), 0)
    const sold         = records.reduce((s, r) => s + Number(r.soldQuantity  || 0), 0)

    const lowStock = records.filter(r => {
      const o = Number(r.openingStock || 0)
      const c = Number(r.closingStock  || 0)
      return o > 0 && c <= o * 0.2
    }).length

    return { totalStock, openingStock, produced, sold, lowStock, totalProducts: records.length }
  }, [records])

  // ── Search ──
  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return records
    return records.filter(r =>
      r.productName?.toLowerCase().includes(q) ||
      r.productId?.toLowerCase().includes(q) ||
      r.warehouse?.toLowerCase().includes(q)
    )
  }, [records, search])

  // ── Max closing stock for bar scale ──
  const maxClosing = useMemo(() =>
    Math.max(...records.map(r => Number(r.closingStock || 0)), 1),
  [records])

  return (
    <div className="inv-root">

      {/* ── Header ── */}
      <div className="inv-header">
        <div className="inv-header-left">
          <div className="inv-header-accent" />
          <div className="inv-header-text">
            <div className="inv-header-label">MSME OPERATIONS · INVENTORY MODULE</div>
            <div className="inv-header-title">STOCK MANAGEMENT</div>
          </div>
        </div>
        <div className="inv-header-right">
          <div className="inv-live-badge">
            <span className="inv-led" />
            WAREHOUSE ACTIVE
          </div>
          <button
            className="inv-refresh-btn"
            onClick={fetchInventory}
            disabled={loading}
          >
            <RefreshIcon size={11} />
            REFRESH
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="inv-error">
          <AlertIcon size={15} />
          {error}
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="inv-kpi-grid">
        <KPICard
          label="TOTAL INVENTORY"
          value={statistics.totalStock.toLocaleString("en-IN")}
          sub="Current closing stock"
          accent="#a78bfa"
          icon={<BoxIcon size={16} />}
        />
        <KPICard
          label="PRODUCTS"
          value={String(statistics.totalProducts)}
          sub="Inventory records tracked"
          accent="#22d3ee"
          icon={
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="1" width="6" height="6" rx="0.5" /><rect x="9" y="1" width="6" height="6" rx="0.5" />
              <rect x="1" y="9" width="6" height="6" rx="0.5" /><rect x="9" y="9" width="6" height="6" rx="0.5" />
            </svg>
          }
        />
        <KPICard
          label="UNITS SOLD"
          value={statistics.sold.toLocaleString("en-IN")}
          sub="Recorded sales movement"
          accent="#4ade80"
          icon={<CartIcon size={16} />}
        />
        <KPICard
          label="LOW STOCK ALERTS"
          value={String(statistics.lowStock)}
          sub="Items requiring attention"
          accent="#f87171"
          icon={<AlertIcon size={16} />}
          alertDot={statistics.lowStock > 0}
        />
      </div>

      {/* ── Records Panel ── */}
      <div className="inv-panel">

        {/* Panel header */}
        <div className="inv-panel-header">
          <div className="inv-panel-tab" />
          <div className="inv-panel-titles">
            <div className="inv-panel-name">INVENTORY RECORDS</div>
            <div className="inv-panel-sub">CURRENT STOCK POSITION ACROSS PRODUCTS AND WAREHOUSES</div>
          </div>
          <div className="inv-count-badge">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa", boxShadow: "0 0 5px #a78bfa", flexShrink: 0 }} />
            {records.length} RECORDS
          </div>
        </div>

        {/* Toolbar */}
        <div className="inv-toolbar">
          <div className="inv-search">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="7" cy="7" r="5" /><line x1="11" y1="11" x2="15" y2="15" />
            </svg>
            <input
              type="text"
              placeholder="SEARCH PRODUCT OR WAREHOUSE..."
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
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.16em", color: "var(--text-faint)", marginLeft: "auto" }}>
            {filteredRecords.length} / {records.length} SHOWN
          </span>
        </div>

        {/* States */}
        {loading ? (
          <div className="inv-state">
            <div className="inv-loading-ring" />
            <div>
              <span className="inv-state-text">LOADING INVENTORY DATA</span>
              <span className="inv-state-dots"><span>.</span><span>.</span><span>.</span></span>
            </div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="inv-state">
            <BoxIcon size={32} />
            <span className="inv-state-text">
              {search ? "NO RECORDS MATCH YOUR SEARCH" : "NO INVENTORY RECORDS FOUND"}
            </span>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="inv-table-wrap">
              <table className="inv-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>PRODUCT</th>
                    <th>OPENING</th>
                    <th>PRODUCED</th>
                    <th>SOLD</th>
                    <th>CLOSING STOCK</th>
                    <th>WAREHOUSE</th>
                    <th>STATUS</th>
                    <th>DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((item, idx) => {
                    const opening  = Number(item.openingStock  || 0)
                    const closing  = Number(item.closingStock  || 0)
                    const produced = Number(item.producedQuantity || 0)
                    const sold     = Number(item.soldQuantity   || 0)
                    const status   = getStockStatus(opening, closing)
                    const isLow    = status.className === "stock-danger"
                    const stockPct = opening > 0 ? Math.min((closing / opening) * 100, 100) : 0
                    const barColor = status.className === "stock-good" ? "#4ade80"
                                   : status.className === "stock-warning" ? "#f59e0b"
                                   : status.className === "stock-danger" ? "#f87171"
                                   : "var(--text-faint)"

                    return (
                      <tr key={item._id} className={isLow ? "row-low" : ""}>

                        {/* # */}
                        <td style={{ color: "var(--text-faint)", fontSize: 9 }}>
                          {String(idx + 1).padStart(2, "0")}
                        </td>

                        {/* Product */}
                        <td>
                          <div className="inv-product-cell">
                            <div className="inv-product-icon">
                              <BoxIcon size={14} />
                            </div>
                            <div>
                              <div className="inv-product-name">{item.productName || "Unknown Product"}</div>
                              <div className="inv-product-id">{item.productId || "—"}</div>
                            </div>
                          </div>
                        </td>

                        {/* Opening */}
                        <td className="inv-val">{opening.toLocaleString("en-IN")}</td>

                        {/* Produced */}
                        <td style={{ color: produced > 0 ? "#4ade80" : "var(--text-faint)" }}>
                          {produced > 0 ? `+${produced.toLocaleString("en-IN")}` : "—"}
                        </td>

                        {/* Sold */}
                        <td style={{ color: sold > 0 ? "#fb923c" : "var(--text-faint)" }}>
                          {sold > 0 ? `-${sold.toLocaleString("en-IN")}` : "—"}
                        </td>

                        {/* Closing stock + mini bar */}
                        <td>
                          <div className="inv-stock-wrap">
                            <span className="inv-val-closing">{closing.toLocaleString("en-IN")}</span>
                            <div className="inv-stock-bar-track">
                              <div
                                className="inv-stock-bar-fill"
                                style={{
                                  width: `${stockPct}%`,
                                  background: `linear-gradient(90deg, ${barColor}70, ${barColor})`,
                                  boxShadow: `0 0 4px ${barColor}60`,
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Warehouse */}
                        <td>
                          <div className="inv-warehouse-cell">
                            <WarehouseIcon size={13} />
                            {item.warehouse || "Main Warehouse"}
                          </div>
                        </td>

                        {/* Status */}
                        <td>
                          <span className={`stock-badge ${status.className}`}>
                            <span className="stock-dot" />
                            {status.label}
                          </span>
                        </td>

                        {/* Date */}
                        <td style={{ color: "var(--text-faint)", fontSize: 9, letterSpacing: "0.06em" }}>
                          {formatDate(item.recordDate)}
                        </td>

                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer totals */}
            <div className="inv-footer">
              <span className="inv-footer-label">TOTALS</span>
              <div className="inv-footer-divider" />
              <div className="inv-footer-stat">
                <span className="inv-footer-label">OPENING STOCK</span>
                <span className="inv-footer-val" style={{ color: "var(--text-bright)" }}>
                  {statistics.openingStock.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="inv-footer-divider" />
              <div className="inv-footer-stat">
                <span className="inv-footer-label">TOTAL PRODUCED</span>
                <span className="inv-footer-val" style={{ color: "#4ade80" }}>
                  +{statistics.produced.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="inv-footer-divider" />
              <div className="inv-footer-stat">
                <span className="inv-footer-label">TOTAL SOLD</span>
                <span className="inv-footer-val" style={{ color: "#fb923c" }}>
                  -{statistics.sold.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="inv-footer-divider" />
              <div className="inv-footer-stat">
                <span className="inv-footer-label">CLOSING STOCK</span>
                <span className="inv-footer-val" style={{ color: "#a78bfa" }}>
                  {statistics.totalStock.toLocaleString("en-IN")}
                </span>
              </div>
              {statistics.lowStock > 0 && (
                <>
                  <div className="inv-footer-divider" />
                  <div className="inv-footer-stat" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f87171", boxShadow: "0 0 5px #f87171", animation: "led-pulse 1.4s ease-in-out infinite" }} />
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.14em", color: "#f87171" }}>
                      {statistics.lowStock} LOW STOCK ALERT{statistics.lowStock !== 1 ? "S" : ""}
                    </span>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Inventory
