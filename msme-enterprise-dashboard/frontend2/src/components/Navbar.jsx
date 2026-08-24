import "./Navbar.css"

// ─── Icons ────────────────────────────────────────────────────────────

function BellIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M8.5 2a5 5 0 0 1 5 5v3l1.5 2H2L3.5 10V7a5 5 0 0 1 5-5Z" />
      <path d="M7 14.5a1.5 1.5 0 0 0 3 0" />
    </svg>
  )
}

function WrenchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3a3.5 3.5 0 0 0-4.9 4.9L2 15l2 2 7.1-7.1A3.5 3.5 0 0 0 14 3Z" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M2 3.5l3 3 3-3" />
    </svg>
  )
}

// ─── Page labels ──────────────────────────────────────────────────────
const PAGE_LABELS = {
  Dashboard: "OVERVIEW",
  Production: "PRODUCTION",
  Inventory: "INVENTORY",
  Sales: "SALES",
  Finance: "FINANCE",
  "Raw Materials": "RAW MATERIALS",
  "Data Sources": "DATA SOURCES",
  Alerts: "ALERTS",
  Reports: "REPORTS",
};

// ─── Hanging bulb — lit (dark) vs unlit (light) ───────────────────────
function HangingBulb({ lit, onClick }) {
  return (
    <div className="bulb-anchor" onClick={onClick} title={lit ? "Switch to Day Mode" : "Switch to Night Mode"}>
      {/* Ceiling bracket */}
      <div className="bulb-mount" />

      {/* Cord */}
      <div className="bulb-wire" />

      {/* Bayonet socket */}
      <div className="bulb-socket" />

      {/* Glass + glow */}
      <div className="bulb-glass-wrap">
        {lit && <div className="bulb-halo" />}

        <svg
          viewBox="0 0 40 52"
          width="42"
          height="54"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer glass */}
          <path
            d="M20 2 C 9,2 3,12 3,22 C 3,33 10,42 14,47 L 26,47 C 30,42 37,33 37,22 C 37,12 31,2 20,2 Z"
            fill={lit ? "rgba(245,158,11,0.18)" : "rgba(160,140,110,0.15)"}
            stroke={lit ? "rgba(245,158,11,0.5)" : "rgba(160,140,110,0.4)"}
            strokeWidth="0.8"
          />

          {/* Mid glow layer — only when lit */}
          {lit && (
            <path
              d="M20 5 C 11,5 6,14 6,22 C 6,32 12,40 16,45 L 24,45 C 28,40 34,32 34,22 C 34,14 29,5 20,5 Z"
              fill="rgba(251,191,36,0.32)"
            />
          )}

          {/* Hot core — only when lit */}
          {lit && <ellipse cx="20" cy="22" rx="9" ry="10" fill="rgba(255,220,80,0.72)" />}

          {/* Bright filament center — only when lit */}
          {lit && <ellipse cx="20" cy="21" rx="5" ry="5.5" fill="rgba(255,248,180,0.95)" />}

          {/* Filament wire — always visible, color changes */}
          <path
            d="M15 24 L17 19 L19 23 L21 18 L23 23 L25 19"
            stroke={lit ? "rgba(255,160,10,0.9)" : "rgba(120,100,70,0.7)"}
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Inner shine highlight — only when lit */}
          {lit && <ellipse cx="15" cy="16" rx="3" ry="4" fill="rgba(255,255,220,0.22)" />}

          {/* Unlit glass interior sheen */}
          {!lit && (
            <ellipse cx="17" cy="18" rx="4" ry="5"
              fill="rgba(200,185,160,0.12)"
            />
          )}

          {/* Glass bottom neck */}
          <path
            d="M14,47 C14,47 13,51 20,52 C27,51 26,47 26,47"
            fill={lit ? "rgba(245,158,11,0.25)" : "rgba(160,140,110,0.2)"}
            stroke={lit ? "rgba(245,158,11,0.35)" : "rgba(160,140,110,0.3)"}
            strokeWidth="0.6"
          />
        </svg>
      </div>

      {/* Light cone — only when lit */}
      {lit && <div className="bulb-cone" />}

      {/* Mode label tooltip */}
      <div className="bulb-mode-tip">{lit ? "NIGHT" : "DAY"}</div>
    </div>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────


export default function Navbar({ activePage, theme, onToggleTheme, onAlertsClick }) {
  const pageLabel = PAGE_LABELS[activePage] ?? "OVERVIEW"
  const lit = theme === "dark"

  return (
    <nav className="forge-navbar">
      {/* Corner rivets */}
      <span className="navbar-rivet nr-tl" />
      <span className="navbar-rivet nr-tr" />
      <span className="navbar-rivet nr-bl" />
      <span className="navbar-rivet nr-br" />

      {/* ── Left: breadcrumb + page title ── */}
      <div className="navbar-left">
        <div className="navbar-stripe-v" />
        <div className="navbar-breadcrumb">
          <div className="navbar-crumb-path">
            <span className="navbar-crumb-root">MSME</span>
            <span className="navbar-crumb-sep">›</span>
            <span className="navbar-crumb-root">CMD CTR</span>
            <span className="navbar-crumb-sep">›</span>
            <span className="navbar-crumb-active">{pageLabel}</span>
          </div>
          <div className="navbar-page-title">{pageLabel}</div>
        </div>
      </div>

      {/* ── Center: hanging bulb toggle ── */}
      <div className="navbar-center">
        <HangingBulb lit={lit} onClick={onToggleTheme} />
      </div>

      {/* ── Right: controls ── */}
      <div className="navbar-right">

        {/* Mode indicator */}
        <div className="navbar-machine-id">
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: lit ? "var(--amber)" : "var(--green-op)",
              boxShadow: `0 0 5px ${lit ? "var(--amber)" : "var(--green-op)"}`,
              animation: "led-pulse 2s ease-in-out infinite",
              flexShrink: 0,
            }}
          />
          <span className="navbar-machine-label">MODE</span>
          <span className="navbar-machine-val">{lit ? "NIGHT" : "DAY"}</span>
        </div>

        <div className="navbar-vdiv" />

        {/* Wrench / maintenance */}
        <button className="navbar-icon-btn" title="Maintenance">
          <WrenchIcon />
        </button>

        {/* Notifications */}
        <button  onClick={onAlertsClick} className="navbar-icon-btn" title="Alerts" style={{ marginLeft: 4 }}>
          <BellIcon />
          <span className="notif-dot" />
        </button>

        <div className="navbar-vdiv" />

        {/* User */}
        <div className="navbar-user">
          <div className="user-avatar">OP</div>
          <div className="user-info">
            <span className="user-role">OPERATOR</span>
            <span className="user-id">USR-001</span>
          </div>
          <span style={{ color: "var(--text-faint)", marginLeft: 4 }}>
            <ChevronDownIcon />
          </span>
        </div>

      </div>

      {/* Bottom warning stripe */}
      <div className="navbar-warning-stripe" />
    </nav>
  )
}
