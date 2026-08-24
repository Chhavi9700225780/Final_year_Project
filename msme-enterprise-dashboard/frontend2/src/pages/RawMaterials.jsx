/*
import { useEffect, useMemo, useState } from "react";

import {
  Package,
  Boxes,
  IndianRupee,
  AlertTriangle,
  Search,
  RefreshCw,
  Truck,
} from "lucide-react";

import { getRawMaterials } from "../services/api";

const COMPANY_ID = "68a123456789abcdef123456";

const RawMaterials = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // ==========================================
  // Fetch Raw Materials
  // ==========================================

  const fetchRawMaterials = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getRawMaterials(COMPANY_ID);

      console.log(
        "Raw Materials API:",
        response.data
      );

      const responseData =
        response.data?.data;

      let materialData = [];

      if (Array.isArray(responseData)) {
        materialData = responseData;
      } else if (
        Array.isArray(responseData?.data)
      ) {
        materialData = responseData.data;
      }

      setRecords(materialData);

    } catch (err) {
      console.error(
        "Raw Materials fetch error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to load raw material data."
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRawMaterials();
  }, []);

  // ==========================================
  // Statistics
  // ==========================================

  const statistics = useMemo(() => {
    const totalStock = records.reduce(
      (sum, item) =>
        sum + Number(item.currentStock || 0),
      0
    );

    const inventoryValue = records.reduce(
      (sum, item) =>
        sum +
        Number(item.currentStock || 0) *
          Number(item.unitCost || 0),
      0
    );

    const lowStock = records.filter(
      (item) =>
        Number(item.currentStock || 0) <=
        Number(item.minimumStock || 0)
    ).length;

    const totalSuppliers = new Set(
      records
        .map((item) => item.supplier)
        .filter(Boolean)
    ).size;

    return {
      totalMaterials: records.length,
      totalStock,
      inventoryValue,
      lowStock,
      totalSuppliers,
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
        item.materialName
          ?.toLowerCase()
          .includes(query) ||
        item.materialId
          ?.toLowerCase()
          .includes(query) ||
        item.supplier
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [records, search]);

  // ==========================================
  // Stock Status
  // ==========================================

  const getStockStatus = (
    current,
    minimum
  ) => {
    if (current <= minimum) {
      return {
        label: "Low Stock",
        className: "stock-danger",
      };
    }

    if (current <= minimum * 1.5) {
      return {
        label: "Monitor",
        className: "stock-warning",
      };
    }

    return {
      label: "Healthy",
      className: "stock-good",
    };
  };

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

      {/* ======================================
          Header
      ======================================= 

      <div className="module-header">

        <div>

          <h2>
            Raw Materials
          </h2>

          <p>
            Monitor material availability,
            suppliers and procurement risks.
          </p>

        </div>

        <button
          className="refresh-button"
          onClick={fetchRawMaterials}
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


      {/* ======================================
          Error
      ======================================= 

      {error && (

        <div className="module-error">

          <AlertTriangle size={18} />

          {error}

        </div>

      )}


      {/* ======================================
          KPI Cards
      ======================================= 

      <div className="module-kpi-grid">

        {/* Total Materials 

        <div className="module-kpi-card">

          <div className="module-kpi-icon blue">

            <Boxes size={20} />

          </div>

          <div>

            <span>
              Total Materials
            </span>

            <strong>
              {statistics.totalMaterials}
            </strong>

            <small>
              Material records
            </small>

          </div>

        </div>


        {/* Current Stock 

        <div className="module-kpi-card">

          <div className="module-kpi-icon purple">

            <Package size={20} />

          </div>

          <div>

            <span>
              Current Stock
            </span>

            <strong>
              {statistics.totalStock.toLocaleString(
                "en-IN"
              )}
            </strong>

            <small>
              Total material units
            </small>

          </div>

        </div>


        {/* Inventory Value 

        <div className="module-kpi-card">

          <div className="module-kpi-icon green">

            <IndianRupee size={20} />

          </div>

          <div>

            <span>
              Inventory Value
            </span>

            <strong>
              {formatCurrency(
                statistics.inventoryValue
              )}
            </strong>

            <small>
              Current stock value
            </small>

          </div>

        </div>


        {/* Low Stock 

        <div className="module-kpi-card">

          <div className="module-kpi-icon red">

            <AlertTriangle size={20} />

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
          Supplier Summary
      ======================================= 

      <div className="module-card supplier-summary">

        <div className="supplier-summary-content">

          <div className="module-kpi-icon blue">

            <Truck size={20} />

          </div>

          <div>

            <strong>
              {statistics.totalSuppliers}
            </strong>

            <span>
              Active Suppliers
            </span>

          </div>

        </div>

      </div>


      {/* ======================================
          Materials Table
      ======================================= 

      <div className="module-card">

        <div className="module-card-header">

          <div>

            <h3>
              Raw Material Records
            </h3>

            <p>
              Current material stock and supplier
              information.
            </p>

          </div>

          <div className="record-count">

            {records.length} Records

          </div>

        </div>


        {/* Search 

        <div className="table-toolbar">

          <div className="search-box">

            <Search size={16} />

            <input
              type="text"
              placeholder="Search material or supplier..."
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
        ===================================== 

        {loading ? (

          <div className="table-state">

            <RefreshCw
              size={24}
              className="spin"
            />

            <p>
              Loading raw materials...
            </p>

          </div>

        ) : filteredRecords.length === 0 ? (

          <div className="table-state">

            <Package size={30} />

            <p>
              No raw material records found.
            </p>

          </div>

        ) : (

          <div className="table-wrapper">

            <table className="enterprise-table">

              <thead>

                <tr>

                  <th>
                    Material
                  </th>

                  <th>
                    Supplier
                  </th>

                  <th>
                    Current Stock
                  </th>

                  <th>
                    Minimum Stock
                  </th>

                  <th>
                    Unit Cost
                  </th>

                  <th>
                    Stock Value
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Last Updated
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredRecords.map(
                  (item) => {

                    const current =
                      Number(
                        item.currentStock ||
                        0
                      );

                    const minimum =
                      Number(
                        item.minimumStock ||
                        0
                      );

                    const stockValue =
                      current *
                      Number(
                        item.unitCost || 0
                      );

                    const status =
                      getStockStatus(
                        current,
                        minimum
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
                                  item.materialName ||
                                  "Unknown Material"
                                }
                              </strong>

                              <span>
                                {
                                  item.materialId ||
                                  "-"
                                }
                              </span>

                            </div>

                          </div>

                        </td>


                        

                        <td>

                          <div className="warehouse-cell">

                            <Truck
                              size={14}
                            />

                            {
                              item.supplier ||
                              "Unknown"
                            }

                          </div>

                        </td>


                        

                        <td>

                          <strong>
                            {current.toLocaleString(
                              "en-IN"
                            )}
                          </strong>

                        </td>


                       

                        <td>

                          {minimum.toLocaleString(
                            "en-IN"
                          )}

                        </td>


                        

                        <td>

                          {formatCurrency(
                            item.unitCost
                          )}

                        </td>


                       

                        <td>

                          <strong>
                            {formatCurrency(
                              stockValue
                            )}
                          </strong>

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
                            item.lastUpdated
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

export default RawMaterials;

*/


import { useEffect, useMemo, useState } from "react"
import { getRawMaterials } from "../services/api"
import "./styles/RawMaterials.css"

const COMPANY_ID = "68a123456789abcdef123456"

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0)

const formatDate = (date) => {
  if (!date) return "-"
  return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

// ─── Animated conveyor belt ───────────────────────────────────────────
const BELT_ITEMS = [
  { label: "ORE", color: "#22d3ee" },
  { label: "ALLOY", color: "#a78bfa" },
  { label: "CHEM", color: "#34d399" },
  { label: "POLY", color: "#fb923c" },
  { label: "FIBER", color: "#fbbf24" },
  { label: "RESIN", color: "#22d3ee" },
  { label: "METAL", color: "#a78bfa" },
]

function ConveyorBelt({ supplierCount }) {
  return (
    <div className="mat-conveyor-panel">
      <div className="mat-conveyor-header">
        <span className="mat-conveyor-label">SUPPLY CHAIN CONVEYOR — MATERIAL FLOW</span>
        <span className="mat-supplier-badge">
          <span className="mat-sup-dot" />
          {supplierCount} ACTIVE SUPPLIERS
        </span>
      </div>
      <div className="mat-belt-track">
        <div className="mat-belt-boxes">
          {[...BELT_ITEMS, ...BELT_ITEMS, ...BELT_ITEMS].map((item, i) => (
            <div
              key={i}
              className="mat-belt-box"
              style={{
                borderColor: `${item.color}44`,
                background: `${item.color}11`,
                color: item.color,
              }}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Stock status (original logic) ───────────────────────────────────
function getStockStatus(current, minimum) {
  if (current <= minimum) return { label: "Low Stock", className: "mat-badge-danger" }
  if (current <= minimum * 1.5) return { label: "Monitor", className: "mat-badge-warning" }
  return { label: "Healthy", className: "mat-badge-good" }
}

// ─── RawMaterials page ────────────────────────────────────────────────
export default function RawMaterials() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")

  // ── Fetch Raw Materials (original logic) ──
  const fetchRawMaterials = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await getRawMaterials(COMPANY_ID)
      console.log("Raw Materials API:", response.data)
      const responseData = response.data?.data
      let materialData = []
      if (Array.isArray(responseData)) materialData = responseData
      else if (Array.isArray((responseData )?.data)) materialData = (responseData ).data
      setRecords(materialData)
    } catch (err) {
      console.error("Raw Materials fetch error:", err)
      setError(err.response?.data?.message || "Unable to load raw material data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRawMaterials() }, [])

  // ── Statistics (original logic) ──
  const statistics = useMemo(() => {
    const totalStock = records.reduce((s, i) => s + Number(i.currentStock || 0), 0)
    const inventoryValue = records.reduce((s, i) => s + Number(i.currentStock || 0) * Number(i.unitCost || 0), 0)
    const lowStock = records.filter((i) => Number(i.currentStock || 0) <= Number(i.minimumStock || 0)).length
    const totalSuppliers = new Set(records.map((i) => i.supplier).filter(Boolean)).size
    return { totalMaterials: records.length, totalStock, inventoryValue, lowStock, totalSuppliers }
  }, [records])

  // ── Search (original logic) ──
  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return records
    return records.filter((item) =>
      item.materialName?.toLowerCase().includes(query) ||
      item.materialId?.toLowerCase().includes(query) ||
      item.supplier?.toLowerCase().includes(query)
    )
  }, [records, search])

  return (
    <div className="mat-root">

      {/* ── Header ── */}
      <div className="mat-header">
        <div className="mat-header-stripe" />
        <div className="mat-header-left">
          <div className="mat-header-accent" />
          <div className="mat-header-text">
            <span className="mat-module-id">MOD-06 // RAW SUPPLY</span>
            <h2 className="mat-title">RAW MATERIALS</h2>
            <span className="mat-subtitle">Monitor material availability, suppliers and procurement risks</span>
          </div>
        </div>
        <div className="mat-header-right">
          <div className="mat-status-chip">
            <span className="mat-status-dot" />
            SUPPLY ONLINE
          </div>
          <button className="mat-refresh-btn" onClick={fetchRawMaterials} disabled={loading}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={loading ? "mat-spin" : ""}>
              <path d="M11 2.5A5.5 5.5 0 1 1 6.5 1" />
              <polyline points="6.5,1 9,1 9,3.5" />
            </svg>
            REFRESH
          </button>
        </div>
      </div>

      {error && (
        <div className="mat-error">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 1L13 12H1L7 1Z" /><line x1="7" y1="6" x2="7" y2="9" /><circle cx="7" cy="11" r="0.6" fill="currentColor" /></svg>
          {error}
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="mat-kpi-row">
        {[
          { label: "TOTAL MATERIALS", value: String(statistics.totalMaterials), sub: "Material records", color: "#22d3ee", icon: "▦" },
          { label: "CURRENT STOCK", value: statistics.totalStock.toLocaleString("en-IN"), sub: "Total units", color: "#a78bfa", icon: "▤" },
          { label: "INVENTORY VALUE", value: formatCurrency(statistics.inventoryValue), sub: "Current stock value", color: "#34d399", icon: "₹" },
          { label: "LOW STOCK ALERTS", value: String(statistics.lowStock), sub: "Requires attention", color: statistics.lowStock > 0 ? "#f87171" : "#4ade80", icon: "!" },
        ].map((k) => (
          <div className="mat-kpi-card" key={k.label}>
            <div className="mat-kpi-top-bar" style={{ background: k.color }} />
            <div className="mat-kpi-body">
              <div className="mat-kpi-icon" style={{ color: k.color, borderColor: `${k.color}33`, background: `${k.color}11` }}>
                {k.icon}
              </div>
              <span className="mat-kpi-label">{k.label}</span>
              <div className="mat-kpi-value" style={{ color: k.color }}>{k.value}</div>
              <span className="mat-kpi-sub">{k.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Conveyor Belt Visualization ── */}
      <ConveyorBelt supplierCount={statistics.totalSuppliers} />

      {/* ── Materials Table ── */}
      <div className="mat-table-panel">
        <div className="mat-table-header">
          <div className="mat-table-tab" />
          <div className="mat-table-titles">
            <span className="mat-table-name">RAW MATERIAL RECORDS</span>
            <span className="mat-table-sub">Current material stock and supplier information</span>
          </div>
          <span className="mat-record-count">{records.length} RECORDS</span>
        </div>

        <div className="mat-toolbar">
          <div className="mat-search-box">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
              <circle cx="5.5" cy="5.5" r="4" />
              <line x1="9" y1="9" x2="12" y2="12" />
            </svg>
            <input
              type="text"
              placeholder="Search material or supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="mat-state">
            <div className="mat-loading-ring" />
            <span>LOADING RAW MATERIALS<span className="mat-dots"><span>.</span><span>.</span><span>.</span></span></span>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="mat-state">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="var(--text-faint)" strokeWidth="1.2" strokeLinecap="round">
              <path d="M18 4L32 12V24L18 32L4 24V12Z" />
              <line x1="18" y1="4" x2="18" y2="32" />
              <line x1="4" y1="12" x2="32" y2="12" />
              <line x1="4" y1="24" x2="32" y2="24" />
            </svg>
            <span>NO RAW MATERIAL RECORDS FOUND</span>
          </div>
        ) : (
          <div className="mat-table-wrap">
            <table className="mat-table">
              <thead>
                <tr>
                  <th>MATERIAL</th>
                  <th>SUPPLIER</th>
                  <th>CURRENT STOCK</th>
                  <th>MIN STOCK</th>
                  <th>UNIT COST</th>
                  <th>STOCK VALUE</th>
                  <th>STATUS</th>
                  <th>LAST UPDATED</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((item) => {
                  const current = Number(item.currentStock || 0)
                  const minimum = Number(item.minimumStock || 0)
                  const stockValue = current * Number(item.unitCost || 0)
                  const status = getStockStatus(current, minimum)
                  const stockPct = minimum > 0 ? Math.min((current / (minimum * 2)) * 100, 100) : 50
                  const barColor = status.className === "mat-badge-danger" ? "#f87171" : status.className === "mat-badge-warning" ? "#f59e0b" : "#22d3ee"

                  return (
                    <tr key={item._id} className={status.className === "mat-badge-danger" ? "mat-row-danger" : ""}>
                      <td>
                        <div className="mat-product-cell">
                          <div className="mat-product-icon">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M7 1L13 4V10L7 13L1 10V4Z" />
                            </svg>
                          </div>
                          <div>
                            <strong className="mat-product-name">{item.materialName || "Unknown Material"}</strong>
                            <span className="mat-product-id">{item.materialId || "-"}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="mat-supplier-cell">
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
                            <rect x="1" y="5" width="9" height="7" rx="1" />
                            <path d="M10 8h2l-1-5H7" />
                            <circle cx="4" cy="11" r="1.2" />
                            <circle cx="9" cy="11" r="1.2" />
                          </svg>
                          {item.supplier || "Unknown"}
                        </div>
                      </td>
                      <td>
                        <div className="mat-stock-cell">
                          <span className="mat-stock-val" style={{ color: barColor }}>{current.toLocaleString("en-IN")}</span>
                          <div className="mat-stock-bar-wrap">
                            <div className="mat-stock-bar" style={{ width: `${stockPct}%`, background: barColor }} />
                          </div>
                        </div>
                      </td>
                      <td>{minimum.toLocaleString("en-IN")}</td>
                      <td>{formatCurrency(item.unitCost)}</td>
                      <td><strong className="mat-val-currency">{formatCurrency(stockValue)}</strong></td>
                      <td>
                        <span className={`mat-badge ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td><span className="mat-date">{formatDate(item.lastUpdated)}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
