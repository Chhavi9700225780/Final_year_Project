/*import {

  LayoutDashboard,
  Factory,
  Package,
  Boxes,
  Wallet,
  ShoppingCart,
  Upload,
  Bell,
  FileText,
} from "lucide-react";
import "./Sidebar.css";
const Sidebar = ({ activePage, setActivePage }) => {
  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Production",
      icon: Factory,
    },
    {
      name: "Inventory",
      icon: Package,
    },
    {
      name: "Raw Materials",
      icon: Boxes,
    },
    {
      name: "Finance",
      icon: Wallet,
    },
    {
      name: "Sales",
      icon: ShoppingCart,
    },
    {
      name: "Data Sources",
      icon: Upload,
    },
    {
      name: "Alerts",
      icon: Bell,
    },
    {
      name: "Reports",
      icon: FileText,
    },
  ];

  return (
    <aside className="sidebar">

      <div className="logo">
        <div className="logo-icon">
          M
        </div>

        <div>
          <h2>MSME</h2>
          <span>Enterprise Analytics</span>
        </div>
      </div>

      <nav>
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.name}
              className={
                activePage === item.name
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() => setActivePage(item.name)}
            >
              <Icon size={19} />

              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <span>Enterprise Data Platform</span>
        <small>v1.0.0</small>
      </div>

    </aside>
  );
};

export default Sidebar;






*/




import { useState, useEffect } from "react"
import "./Sidebar.css"

// ─── Icons ────────────────────────────────────────────────────────────
function IconOverview() {
  return (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <rect x="1.5" y="1.5" width="6" height="6" rx="0.5" />
      <rect x="10.5" y="1.5" width="6" height="6" rx="0.5" />
      <rect x="1.5" y="10.5" width="6" height="6" rx="0.5" />
      <rect x="10.5" y="10.5" width="6" height="6" rx="0.5" />
    </svg>
  )
}

function IconProduction() {
  return (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <rect x="1" y="10" width="5" height="7" />
      <rect x="7" y="7" width="4" height="10" />
      <rect x="12" y="4" width="5" height="13" />
      <line x1="1" y1="17" x2="17" y2="17" />
    </svg>
  )
}

function IconInventory() {
  return (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6l7-4 7 4v9l-7 4-7-4V6z" />
      <path d="M2 6l7 4 7-4" />
      <line x1="9" y1="10" x2="9" y2="19" />
    </svg>
  )
}

function IconSales() {
  return (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M1 2h2l2 9h8l2-6H5" />
      <circle cx="8" cy="15.5" r="1.5" />
      <circle cx="13" cy="15.5" r="1.5" />
    </svg>
  )
}

function IconFinance() {
  return (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="9" cy="9" r="7.5" />
      <path d="M9 4.5V6M9 12v1.5" />
      <path d="M6.5 7.5c0-1.2.9-1.8 2.5-1.8s2.5.7 2.5 1.8c0 1.2-1.5 1.8-2.5 1.8S6.5 10 6.5 11.2c0 1.2 1 1.8 2.5 1.8s2.5-.6 2.5-1.8" />
    </svg>
  )
}

function IconMaterials() {
  return (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 5.5l8-4 8 4-8 4-8-4z" />
      <path d="M1 9.5l8 4 8-4" />
      <path d="M1 13.5l8 4 8-4" />
    </svg>
  )
}

function IconWorkforce() {
  return (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="6.5" cy="5.5" r="2.5" />
      <path d="M1 16c0-3 2.5-5 5.5-5" />
      <circle cx="13" cy="5.5" r="2.5" />
      <path d="M10.5 16c0-3 2.5-5 5.5-5" />
    </svg>
  )
}

function IconReports() {
  return (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <rect x="3" y="2" width="12" height="14" rx="1" />
      <line x1="6" y1="6" x2="12" y2="6" />
      <line x1="6" y1="9" x2="12" y2="9" />
      <line x1="6" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function IconSettings() {
  return (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="9" cy="9" r="2.5" />
      <path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.7 3.7l1.4 1.4M12.9 12.9l1.4 1.4M3.7 14.3l1.4-1.4M12.9 5.1l1.4-1.4" />
    </svg>
  )
}

// ─── Nav items ────────────────────────────────────────────────────────
const NAV = [
  { id: "overview",   code: "01", label: "OVERVIEW",   sub: "Command Center", Icon: IconOverview },
  { id: "production", code: "02", label: "PRODUCTION", sub: "Floor Ops",      Icon: IconProduction },
  { id: "inventory",  code: "03", label: "INVENTORY",  sub: "Stock Levels",   Icon: IconInventory },
  { id: "sales",      code: "04", label: "SALES",      sub: "Order Pipeline", Icon: IconSales },
  { id: "finance",    code: "05", label: "FINANCE",    sub: "P&L Ledger",     Icon: IconFinance },
  { id: "materials",  code: "06", label: "MATERIALS",  sub: "Raw Supply",     Icon: IconMaterials },
  { id: "workforce",  code: "07", label: "WORKFORCE",  sub: "Personnel",      Icon: IconWorkforce },
  { id: "reports",    code: "08", label: "REPORTS",    sub: "Analytics",      Icon: IconReports },
  { id: "settings",   code: "09", label: "SETTINGS",   sub: "Config Panel",   Icon: IconSettings },
]

// ─── Rivet bolts ──────────────────────────────────────────────────────
function Rivets() {
  return (
    <>
      <span className="rivet r-tl" />
      <span className="rivet r-tr" />
      <span className="rivet r-bl" />
      <span className="rivet r-br" />
    </>
  )
}

// ─── Factory icon ─────────────────────────────────────────────────────
function FactoryIcon() {
  return (
    <svg
      className="forge-factory-icon"
      viewBox="0 0 44 44"
      width="42"
      height="42"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Main building */}
      <rect x="3" y="24" width="38" height="16" rx="0.5" />
      {/* Left tower */}
      <rect x="3" y="17" width="11" height="7" />
      {/* Right annex */}
      <rect x="30" y="19" width="11" height="5" />
      {/* Smokestack left */}
      <rect x="6" y="7" width="5" height="12" />
      <rect x="5" y="5.5" width="7" height="2.5" rx="0.5" />
      {/* Smokestack center */}
      <rect x="20" y="10" width="5" height="14" />
      <rect x="19" y="8.5" width="7" height="2.5" rx="0.5" />
      {/* Windows row */}
      <rect x="6" y="27" width="4" height="4" rx="0.5" />
      <rect x="14" y="27" width="4" height="4" rx="0.5" />
      <rect x="26" y="27" width="4" height="4" rx="0.5" />
      <rect x="34" y="27" width="4" height="4" rx="0.5" />
      {/* Door */}
      <rect x="19" y="33" width="6" height="7" rx="0.5" />
      {/* Roof edge detail */}
      <line x1="3" y1="24" x2="41" y2="24" />
      {/* Smoke wisps */}
      <path d="M8.5 5 C8 3.5 10 2.5 9.5 4" strokeDasharray="1.5 1.5" opacity="0.5" />
      <path d="M22.5 8 C22 6.5 24 5.5 23.5 7" strokeDasharray="1.5 1.5" opacity="0.5" />
      {/* Gear on right side */}
      <circle cx="37" cy="21" r="3" />
      <circle cx="37" cy="21" r="1.2" />
      <line x1="37" y1="17.5" x2="37" y2="18.5" />
      <line x1="37" y1="23.5" x2="37" y2="24.5" />
      <line x1="33.5" y1="21" x2="34.5" y2="21" />
      <line x1="39.5" y1="21" x2="40.5" y2="21" />
    </svg>
  )
}

// ─── VU Meter gauge ───────────────────────────────────────────────────
const SEGMENTS = 12

function VUMeter({
  label,
  value,
  color,
}) {
  const filled = Math.round((value / 100) * SEGMENTS)
  return (
    <div className="vu-meter">
      <span className="vu-label">{label}</span>
      <div className="vu-segments">
        {Array.from({ length: SEGMENTS }, (_, i) => {
          const isOn = i < filled
          const dimColor =
            color === "#f59e0b"
              ? `rgba(245,158,11,${0.12 + i * 0.02})`
              : color === "#4ade80"
                ? `rgba(74,222,128,${0.12 + i * 0.02})`
                : `rgba(248,113,113,${0.12 + i * 0.02})`
          return (
            <div
              key={i}
              className={`vu-seg${isOn ? " on" : ""}`}
              style={
                isOn
                  ? {
                      background: color,
                      boxShadow: `0 0 4px ${color}99`,
                    }
                  : { background: dimColor, border: "1px solid transparent" }
              }
            />
          )
        })}
      </div>
      <span className="vu-value">{value}%</span>
    </div>
  )
}

// ─── Clock helpers ────────────────────────────────────────────────────
function pad(n) {
  return String(n).padStart(2, "0")
}

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

// ─── Main sidebar ─────────────────────────────────────────────────────
export default function Sidebar({ activePage, setActivePage }) {
  const activePageMap = {
  Dashboard: "overview",
  Production: "production",
  Inventory: "inventory",
  Sales: "sales",
  Finance: "finance",
  "Raw Materials": "materials",
  "Data Sources": "workforce",
  Alerts: "alerts",
  Reports: "reports",
  Settings: "settings",
};

const active =
  activePageMap[activePage] || "overview";
  
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const h = now.getHours()
  const m = now.getMinutes()
  const s = now.getSeconds()
  const ampm = h >= 12 ? "PM" : "AM"
  const h12 = h % 12 || 12
  const timeStr = `${pad(h12)}:${pad(m)}:${pad(s)}`
  const dayStr = DAYS[now.getDay()]
  const dateStr = `${pad(now.getDate())} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`

  return (
    <aside className="forge-sidebar">

      {/* ── Header with warning stripes + rivets ── */}
      <div className="forge-header">
        <Rivets />
        <div className="warning-stripe" />
        <div className="forge-brand">
          <FactoryIcon />
          <div className="forge-brand-text">
            <div className="forge-brand-name">MSME</div>
            <div className="forge-brand-sub">OPERATIONS CMD CTR</div>
          </div>
        </div>
        <div className="warning-stripe" />
      </div>

      {/* ── System online strip ── */}
      <div className="forge-status">
        <span className="led" />
        <span className="forge-status-text">SYSTEM ONLINE</span>
        <div className="led-row">
          <span className="led-sm" style={{ animationDelay: "0s" }} />
          <span className="led-sm" style={{ animationDelay: "0.35s" }} />
          <span className="led-sm" style={{ animationDelay: "0.7s" }} />
        </div>
      </div>

      {/* ── Nav section label ── */}
      <div className="forge-divider">
        <span>NAVIGATION</span>
      </div>

      {/* ── Nav items ── */}
      <nav className="forge-nav">
        {NAV.map(({ id, code, label, sub, Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              className={`forge-nav-item${isActive ? " active" : ""}`}
              onClick={() => {
  const pageMap = {
    overview: "Dashboard",
    production: "Production",
    inventory: "Inventory",
    sales: "Sales",
    finance: "Finance",
    materials: "Raw Materials",
    workforce: "Data Sources",
    reports: "Reports",
    settings: "Settings",
  };

  setActivePage(pageMap[id]);
}}
            >
              <span className="forge-nav-icon">
                <Icon />
              </span>
              <span className="forge-nav-content">
                <span className="forge-nav-label">{label}</span>
                <span className="forge-nav-sub">{sub}</span>
              </span>
              {isActive ? (
                <span className="forge-nav-arrow">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M3 1.5l3.5 3.5L3 8.5" />
                  </svg>
                </span>
              ) : (
                <span className="forge-nav-code">{code}</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* ── System gauges ── */}
      <div className="forge-gauge-panel">
        <div className="forge-divider">
          <span>SYSTEM STATUS</span>
        </div>
        <div className="forge-gauges">
          <VUMeter label="PWR" value={84} color="#f59e0b" />
          <VUMeter label="EFF" value={67} color="#4ade80" />
          <VUMeter label="TMP" value={43} color="#f87171" />
        </div>
      </div>

      {/* ── Shift / clock ── */}
      <div className="forge-clock-panel" style={{ position: "relative" }}>
        <Rivets />
        <div className="forge-clock-header">
          <span className="forge-shift-id">SHIFT-A</span>
          <span className="led led-amber" style={{ width: 6, height: 6 }} />
          <span className="forge-shift-status">ACTIVE</span>
          <span style={{ flex: 1 }} />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 8,
              color: "var(--text-faint)",
              letterSpacing: "0.1em",
            }}
          >
            08:00 – 16:00
          </span>
        </div>
        <div className="forge-clock-display">
          <span className="forge-clock-time">{timeStr}</span>
          <span className="forge-clock-ampm">{ampm}</span>
        </div>
        <div className="forge-clock-date">
          {dayStr} · {dateStr}
        </div>
      </div>

    </aside>
  )
}
