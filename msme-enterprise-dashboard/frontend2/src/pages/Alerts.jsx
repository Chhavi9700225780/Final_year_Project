import { useEffect, useMemo, useState } from "react";

import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  RefreshCw,
  Search,
  ShieldAlert,
  Package,
  Factory,
} from "lucide-react";

import { getAlerts } from "../services/api";

const COMPANY_ID = "68a123456789abcdef123456";

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  /* =========================================================
     FETCH ALERTS
  ========================================================= */

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAlerts(COMPANY_ID);

      console.log("Alerts API:", response.data);

      const responseData = response.data?.data;

      let alertData = [];

      if (Array.isArray(responseData)) {
        alertData = responseData;
      } else if (Array.isArray(responseData?.data)) {
        alertData = responseData.data;
      }

      setAlerts(alertData);
    } catch (err) {
      console.error("Alerts fetch error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load alerts."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const statistics = useMemo(() => {
    const unresolved = alerts.filter(
      (alert) =>
        alert.isResolved === false
    ).length;

    const resolved = alerts.filter(
      (alert) =>
        alert.isResolved === true
    ).length;

    const critical = alerts.filter(
      (alert) =>
        alert.severity === "critical"
    ).length;

    const warnings = alerts.filter(
      (alert) =>
        alert.severity === "warning"
    ).length;

    return {
      total: alerts.length,
      unresolved,
      resolved,
      critical,
      warnings,
    };
  }, [alerts]);

  /* =========================================================
     SEARCH + FILTER
  ========================================================= */

  const filteredAlerts = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return alerts.filter((alert) => {
      const matchesSearch =
        !query ||
        alert.title
          ?.toLowerCase()
          .includes(query) ||
        alert.message
          ?.toLowerCase()
          .includes(query) ||
        alert.type
          ?.toLowerCase()
          .includes(query);

      let matchesFilter = true;

      if (filter === "active") {
        matchesFilter =
          alert.isResolved === false;
      }

      if (filter === "resolved") {
        matchesFilter =
          alert.isResolved === true;
      }

      if (filter === "critical") {
        matchesFilter =
          alert.severity === "critical";
      }

      if (filter === "warning") {
        matchesFilter =
          alert.severity === "warning";
      }

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [
    alerts,
    search,
    filter,
  ]);

  /* =========================================================
     DATE
  ========================================================= */

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  /* =========================================================
     SEVERITY
  ========================================================= */

  const getSeverity = (alert) => {
    const severity =
      alert.severity?.toLowerCase();

    if (severity === "critical") {
      return {
        label: "CRITICAL",
        className: "alerts-critical",
      };
    }

    if (severity === "warning") {
      return {
        label: "WARNING",
        className: "alerts-warning",
      };
    }

    if (severity === "info") {
      return {
        label: "INFORMATION",
        className: "alerts-info",
      };
    }

    return {
      label: "ALERT",
      className: "alerts-warning",
    };
  };

  /* =========================================================
     ALERT ICON
  ========================================================= */

  const getAlertIcon = (alert) => {
    const type =
      alert.type?.toLowerCase();

    if (
      type?.includes("inventory") ||
      type?.includes("stock") ||
      type?.includes("material")
    ) {
      return <Package size={18} />;
    }

    if (
      type?.includes("production")
    ) {
      return <Factory size={18} />;
    }

    if (
      alert.severity === "critical"
    ) {
      return (
        <ShieldAlert size={18} />
      );
    }

    return (
      <AlertTriangle size={18} />
    );
  };

  /* =========================================================
     JSX
  ========================================================= */

  return (
    <div className="alerts-page">

      <style>{`

        /* =====================================================
           ALERTS — FORGE / NEO RETRO INDUSTRIAL
        ===================================================== */

        .alerts-page {
          --alerts-panel: var(
            --forge-panel,
            #191713
          );

          --alerts-panel-dark: #14130f;

          --alerts-border: var(
            --forge-groove,
            #38342d
          );

          --alerts-text: var(
            --text-bright,
            #eee6d4
          );

          --alerts-muted: var(
            --text-faint,
            #8f897b
          );

          --alerts-amber: var(
            --amber,
            #f59e0b
          );

          --alerts-green: var(
            --green-op,
            #4ade80
          );

          --alerts-red: var(
            --red-alert,
            #f87171
          );

          --alerts-blue: #38bdf8;

          width: 100%;
          min-height: 100%;

          padding:
            22px 24px 34px;

          color:
            var(--alerts-text);

          font-family:
            var(
              --font-brand,
              "Arial Narrow",
              sans-serif
            );

          background:
            radial-gradient(
              circle at 90% 8%,
              rgba(
                245,
                158,
                11,
                0.045
              ),
              transparent 28%
            );
        }

        .alerts-page *,
        .alerts-page *::before,
        .alerts-page *::after {
          box-sizing: border-box;
        }

        .alerts-shell {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .alerts-header {
          position: relative;

          display: flex;
          align-items: center;
          justify-content: space-between;

          min-height: 82px;

          padding:
            16px 18px;

          border:
            1px solid
            var(--alerts-border);

          border-left:
            3px solid
            var(--alerts-amber);

          background:
            linear-gradient(
              90deg,
              rgba(
                245,
                158,
                11,
                0.055
              ),
              transparent 42%
            ),
            var(--alerts-panel);

          overflow: hidden;

          box-shadow:
            0 10px 30px
              rgba(
                0,
                0,
                0,
                0.15
              );
        }

        .alerts-header::after {
          content: "";

          position: absolute;

          left: 0;
          right: 0;
          bottom: 0;

          height: 2px;

          background:
            repeating-linear-gradient(
              90deg,
              var(--alerts-amber)
                0 28px,
              transparent
                28px 35px
            );

          opacity: 0.28;
        }

        .alerts-header-left {
          display: flex;
          align-items: center;

          min-width: 0;
        }

        .alerts-header-accent {
          width: 5px;
          height: 46px;

          margin-right: 14px;

          background:
            var(--alerts-amber);

          box-shadow:
            0 0 14px
              rgba(
                245,
                158,
                11,
                0.25
              );
        }

       .alerts-eyebrow {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.22em;
  color: var(--text-faint);
}

        .alerts-title {
  font-family: var(--font-brand);
  font-size: 24px;
  letter-spacing: 0.06em;
  color: var(--text-bright);
  margin: 0;
  line-height: 1;
}
        .alerts-subtitle {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.08em;
  color: var(--text-faint);
}
        .alerts-header-right {
          display: flex;
          align-items: center;

          gap: 12px;
        }

        .alerts-system-status {
          display: inline-flex;
          align-items: center;

          gap: 7px;

          padding:
            7px 10px;

          border:
            1px solid
            rgba(
              74,
              222,
              128,
              0.3
            );

          background:
            rgba(
              74,
              222,
              128,
              0.04
            );

          color:
            var(--alerts-green);

          font-family:
            var(
              --font-mono,
              monospace
            );

          font-size: 8px;

          font-weight: 700;

          letter-spacing:
            0.13em;
        }

        .alerts-system-dot {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background:
            var(--alerts-green);

          box-shadow:
            0 0 7px
              rgba(
                74,
                222,
                128,
                0.7
              );

          animation:
            alertsPulse
            1.8s
            ease-in-out
            infinite;
        }

        .alerts-refresh {
          display: inline-flex;
          align-items: center;

          gap: 7px;

          min-height: 32px;

          padding:
            0 11px;

          border:
            1px solid
            var(--alerts-border);

          background:
            #15130f;

          color:
            var(--alerts-text);

          font-family:
            var(
              --font-mono,
              monospace
            );

          font-size: 8px;

          font-weight: 700;

          letter-spacing:
            0.12em;

          cursor: pointer;

          transition:
            0.18s ease;
        }

        .alerts-refresh:hover:not(:disabled) {
          color:
            var(--alerts-amber);

          border-color:
            var(--alerts-amber);

          transform:
            translateY(-1px);
        }

        .alerts-refresh:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        /* =====================================================
           ERROR
        ===================================================== */

        .alerts-error {
          display: flex;
          align-items: center;

          gap: 9px;

          margin-top: 12px;

          padding:
            11px 13px;

          border:
            1px solid
            rgba(
              248,
              113,
              113,
              0.3
            );

          border-left:
            3px solid
            var(--alerts-red);

          background:
            rgba(
              248,
              113,
              113,
              0.055
            );

          color:
            #fca5a5;

          font-family:
            var(
              --font-mono,
              monospace
            );

          font-size: 9px;

          letter-spacing:
            0.07em;
        }

        /* =====================================================
           KPI GRID
        ===================================================== */

        .alerts-kpi-grid {
          display: grid;

          grid-template-columns:
            repeat(
              4,
              minmax(
                0,
                1fr
              )
            );

          gap: 12px;

          margin-top: 14px;
        }

        .alerts-kpi {
  position: relative;

  min-height: 150px;

  padding: 18px 20px;

  border:
    1px solid
    var(--alerts-border);

  background:
    var(--alerts-panel);

  overflow: hidden;

  transition:
    0.18s ease;
}

        .alerts-kpi:hover {
          transform:
            translateY(-2px);

          border-color:
            #514b40;
        }

        .alerts-kpi::before {
          content: "";

          position: absolute;

          left: 0;
          top: 0;
          bottom: 0;

          width: 3px;

          background:
            var(--kpi-accent);
        }

        .alerts-kpi::after {
          content: "";

          position: absolute;

          right: -38px;
          top: -38px;

          width: 82px;
          height: 82px;

          border:
            1px solid
            var(--kpi-accent);

          opacity: 0.07;

          transform:
            rotate(45deg);
        }

        .alerts-kpi-top {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 17px;
}

        .alerts-kpi-icon {
          display: flex;
          align-items: center;
          justify-content: center;

          width: 32px;
          height: 32px;

          border:
            1px solid
            color-mix(
              in srgb,
              var(--kpi-accent)
                30%,
              transparent
            );

          background:
            color-mix(
              in srgb,
              var(--kpi-accent)
                7%,
              transparent
            );

          color:
            var(--kpi-accent);
        }

        .alerts-kpi-code {
          color:
            var(--alerts-muted);

          font-family:
            var(
              --font-mono,
              monospace
            );

          font-size: 7px;

          letter-spacing:
            0.15em;
        }

       .alerts-kpi-label {
  display: block;

  margin-bottom: 8px;

  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.2em;
  line-height: 1.2;

  color: var(--text-faint);

  text-transform: uppercase;
}

.alerts-kpi-value {
  display: block;

  margin: 0;

  font-family: var(--font-brand);
  font-size: 22px;
  font-weight: 800;
  line-height: 1;

  letter-spacing: 0.02em;

  color: var(--text-bright);
}

.alerts-kpi-description {
  display: block;

  margin-top: 9px;

  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.1em;
  line-height: 1.3;

  color: var(--text-faint);

  text-transform: uppercase;
}

        /* =====================================================
           STATUS BANNER
        ===================================================== */

        .alerts-status-banner {
          display: flex;
          align-items: center;

          gap: 13px;

          margin-top: 14px;

          padding:
            13px 15px;

          border:
            1px solid
            var(--alerts-border);

          border-left:
            3px solid
            var(--status-color);

          background:
            linear-gradient(
              90deg,
              var(--status-bg),
              transparent 70%
            ),
            var(--alerts-panel);
        }

        .alerts-status-banner.alerts-attention {
          --status-color:
            var(--alerts-red);

          --status-bg:
            rgba(
              248,
              113,
              113,
              0.05
            );
        }

        .alerts-status-banner.alerts-normal {
          --status-color:
            var(--alerts-green);

          --status-bg:
            rgba(
              74,
              222,
              128,
              0.04
            );
        }

        .alerts-status-icon {
          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          width: 38px;
          height: 38px;

          border:
            1px solid
            color-mix(
              in srgb,
              var(--status-color)
                35%,
              transparent
            );

          color:
            var(--status-color);

          background:
            color-mix(
              in srgb,
              var(--status-color)
                6%,
              transparent
            );
        }

        .alerts-status-content strong {
          display: block;

          color:
            var(--alerts-text);

          font-family:
            var(
              --font-brand,
              sans-serif
            );

          font-size: 13px;

          font-weight: 800;

          letter-spacing:
            0.035em;

          text-transform:
            uppercase;
        }

        .alerts-status-content span {
          display: block;

          margin-top: 4px;

          color:
            var(--alerts-muted);

          font-family:
            var(
              --font-mono,
              monospace
            );

          font-size: 8px;

          letter-spacing:
            0.04em;
        }

        /* =====================================================
           MAIN ALERT PANEL
        ===================================================== */

        .alerts-panel {
          margin-top: 14px;

          border:
            1px solid
            var(--alerts-border);

          background:
            var(--alerts-panel);

          box-shadow:
            0 15px 35px
              rgba(
                0,
                0,
                0,
                0.12
              );
        }

        .alerts-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          min-height: 58px;

          padding:
            0 15px;

          border-bottom:
            1px solid
            var(--alerts-border);

          background:
            repeating-linear-gradient(
              135deg,
              rgba(
                255,
                255,
                255,
                0.014
              )
              0 2px,
              transparent
              2px 8px
            ),
            #171511;
        }

        .alerts-panel-heading {
          display: flex;
          align-items: center;

          gap: 10px;
        }

        .alerts-panel-tab {
          width: 4px;
          height: 24px;

          background:
            var(--alerts-amber);

          box-shadow:
            0 0 10px
              rgba(
                245,
                158,
                11,
                0.2
              );
        }

        .alerts-panel-title {
          color:
            var(--alerts-text);

          font-family:
            var(
              --font-mono,
              monospace
            );

          font-size: 10px;

          font-weight: 800;

          letter-spacing:
            0.16em;

          text-transform:
            uppercase;
        }

        .alerts-record-count {
          padding:
            5px 8px;

          border:
            1px solid
            var(--alerts-border);

          color:
            var(--alerts-muted);

          font-family:
            var(
              --font-mono,
              monospace
            );

          font-size: 7px;

          letter-spacing:
            0.08em;
        }

        /* =====================================================
           TOOLBAR
        ===================================================== */

        .alerts-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 14px;

          padding:
            12px 14px;

          border-bottom:
            1px solid
            var(--alerts-border);
        }

        .alerts-search {
          display: flex;
          align-items: center;

          gap: 9px;

          width:
            min(
              360px,
              100%
            );

          min-height: 35px;

          padding:
            0 10px;

          border:
            1px solid
            #38342d;

          background:
            #12110e;

          color:
            var(--alerts-muted);
        }

        .alerts-search:focus-within {
          border-color:
            rgba(
              245,
              158,
              11,
              0.55
            );

          box-shadow:
            0 0 0 2px
              rgba(
                245,
                158,
                11,
                0.05
              );
        }

        .alerts-search input {
          width: 100%;

          border: 0;
          outline: 0;

          background:
            transparent;

          color:
            var(--alerts-text);

          font-family:
            var(
              --font-mono,
              monospace
            );

          font-size: 8px;

          letter-spacing:
            0.08em;
        }

        .alerts-search input::placeholder {
          color:
            #666158;
        }

        .alerts-filter {
          display: flex;
          align-items: center;

          gap: 4px;

          padding: 3px;

          border:
            1px solid
            var(--alerts-border);

          background:
            #12110e;
        }

        .alerts-filter button {
          min-height: 27px;

          padding:
            0 9px;

          border: 0;

          background:
            transparent;

          color:
            #777166;

          font-family:
            var(
              --font-mono,
              monospace
            );

          font-size: 7px;

          font-weight: 800;

          letter-spacing:
            0.08em;

          text-transform:
            uppercase;

          cursor: pointer;

          transition:
            0.16s ease;
        }

        .alerts-filter button:hover {
          color:
            var(--alerts-text);
        }

        .alerts-filter button.active {
          background:
            var(--alerts-amber);

          color:
            #17130d;

          box-shadow:
            0 0 9px
              rgba(
                245,
                158,
                11,
                0.12
              );
        }

        /* =====================================================
           LOADING
        ===================================================== */

        .alerts-state {
          min-height: 230px;

          display: flex;
          flex-direction: column;

          align-items: center;
          justify-content: center;

          gap: 12px;

          color:
            var(--alerts-muted);

          font-family:
            var(
              --font-mono,
              monospace
            );

          font-size: 8px;

          letter-spacing:
            0.14em;

          text-transform:
            uppercase;
        }

        .alerts-loading-icon {
          color:
            var(--alerts-amber);

          animation:
            alertsSpin
            0.9s
            linear
            infinite;
        }

        /* =====================================================
           EMPTY
        ===================================================== */

        .alerts-empty {
          min-height: 240px;

          display: flex;
          flex-direction: column;

          align-items: center;
          justify-content: center;

          text-align: center;
        }

        .alerts-empty-icon {
          display: flex;
          align-items: center;
          justify-content: center;

          width: 54px;
          height: 54px;

          margin-bottom: 13px;

          border:
            1px solid
            rgba(
              74,
              222,
              128,
              0.3
            );

          background:
            rgba(
              74,
              222,
              128,
              0.045
            );

          color:
            var(--alerts-green);
        }

        .alerts-empty h3 {
          margin: 0;

          color:
            var(--alerts-text);

          font-family:
            var(
              --font-brand,
              sans-serif
            );

          font-size: 15px;

          font-weight: 800;

          letter-spacing:
            0.06em;

          text-transform:
            uppercase;
        }

        .alerts-empty p {
          margin:
            7px 0 0;

          color:
            var(--alerts-muted);

          font-family:
            var(
              --font-mono,
              monospace
            );

          font-size: 8px;

          letter-spacing:
            0.05em;
        }

        /* =====================================================
           ALERT LIST
        ===================================================== */

        .alerts-list {
          width: 100%;
        }

        .alerts-item {
          display: grid;

          grid-template-columns:
            44px minmax(
              0,
              1fr
            );

          gap: 13px;

          padding:
            15px;

          border-bottom:
            1px solid
            #29261f;

          transition:
            background
            0.16s ease;
        }

        .alerts-item:hover {
          background:
            rgba(
              245,
              158,
              11,
              0.025
            );
        }

        .alerts-item:last-child {
          border-bottom: 0;
        }

        .alerts-item-icon {
          display: flex;
          align-items: center;
          justify-content: center;

          width: 38px;
          height: 38px;

          border:
            1px solid
            currentColor;

          background:
            rgba(
              255,
              255,
              255,
              0.018
            );
        }

        .alerts-item-icon.alerts-critical {
          color:
            var(--alerts-red);

          background:
            rgba(
              248,
              113,
              113,
              0.05
            );

          box-shadow:
            0 0 12px
              rgba(
                248,
                113,
                113,
                0.07
              );
        }

        .alerts-item-icon.alerts-warning {
          color:
            var(--alerts-amber);

          background:
            rgba(
              245,
              158,
              11,
              0.05
            );
        }

        .alerts-item-icon.alerts-info {
          color:
            var(--alerts-blue);

          background:
            rgba(
              56,
              189,
              248,
              0.05
            );
        }

        .alerts-item-content {
          min-width: 0;
        }

        .alerts-item-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;

          gap: 15px;
        }

        .alerts-item-title {
          margin: 0;

          color:
            var(--alerts-text);

          font-family:
            var(
              --font-brand,
              sans-serif
            );

          font-size: 13px;

          font-weight: 800;

          letter-spacing:
            0.035em;

          text-transform:
            uppercase;
        }

        .alerts-item-type {
          display: inline-block;

          margin-top: 4px;

          color:
            #716b60;

          font-family:
            var(
              --font-mono,
              monospace
            );

          font-size: 7px;

          font-weight: 700;

          letter-spacing:
            0.1em;

          text-transform:
            uppercase;
        }

        .alerts-severity {
          display: inline-flex;
          align-items: center;

          flex-shrink: 0;

          padding:
            5px 8px;

          border:
            1px solid
            currentColor;

          font-family:
            var(
              --font-mono,
              monospace
            );

          font-size: 7px;

          font-weight: 800;

          letter-spacing:
            0.08em;
        }

        .alerts-severity::before {
          content: "";

          width: 4px;
          height: 4px;

          margin-right: 6px;

          border-radius: 50%;

          background:
            currentColor;

          box-shadow:
            0 0 5px
              currentColor;
        }

        .alerts-severity.alerts-critical {
          color:
            var(--alerts-red);

          background:
            rgba(
              248,
              113,
              113,
              0.045
            );
        }

        .alerts-severity.alerts-warning {
          color:
            var(--alerts-amber);

          background:
            rgba(
              245,
              158,
              11,
              0.045
            );
        }

        .alerts-severity.alerts-info {
          color:
            var(--alerts-blue);

          background:
            rgba(
              56,
              189,
              248,
              0.045
            );
        }

        .alerts-item-message {
          margin:
            9px 0 11px;

          color:
            #aaa398;

          font-family:
            var(
              --font-mono,
              monospace
            );

          font-size: 9px;

          line-height: 1.55;
        }

        .alerts-item-bottom {
          display: flex;
          align-items: center;

          justify-content:
            space-between;

          gap: 12px;
        }

        .alerts-meta {
          display: inline-flex;
          align-items: center;

          gap: 6px;

          color:
            #69645b;

          font-family:
            var(
              --font-mono,
              monospace
            );

          font-size: 7px;

          letter-spacing:
            0.06em;
        }

        .alerts-meta svg {
          color:
            #777166;
        }

        .alerts-status {
          display: inline-flex;
          align-items: center;

          gap: 6px;

          padding:
            4px 7px;

          font-family:
            var(
              --font-mono,
              monospace
            );

          font-size: 7px;

          font-weight: 800;

          letter-spacing:
            0.07em;

          text-transform:
            uppercase;
        }

        .alerts-status.active {
          border:
            1px solid
            rgba(
              248,
              113,
              113,
              0.28
            );

          background:
            rgba(
              248,
              113,
              113,
              0.045
            );

          color:
            var(--alerts-red);
        }

        .alerts-status.resolved {
          border:
            1px solid
            rgba(
              74,
              222,
              128,
              0.28
            );

          background:
            rgba(
              74,
              222,
              128,
              0.045
            );

          color:
            var(--alerts-green);
        }

        /* =====================================================
           FOOTER
        ===================================================== */

        .alerts-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 15px;

          padding:
            10px 14px;

          border-top:
            1px solid
            var(--alerts-border);

          background:
            #14120f;
        }

        .alerts-footer-label {
          color:
            #686258;

          font-family:
            var(
              --font-mono,
              monospace
            );

          font-size: 7px;

          font-weight: 800;

          letter-spacing:
            0.17em;
        }

        .alerts-footer-values {
          display: flex;
          align-items: center;

          gap: 7px;

          flex-wrap: wrap;
        }

        .alerts-footer-value {
          padding:
            5px 8px;

          border:
            1px solid
            #373229;

          color:
            #777166;

          font-family:
            var(
              --font-mono,
              monospace
            );

          font-size: 7px;

          letter-spacing:
            0.05em;
        }

        .alerts-footer-value strong {
          margin-left: 5px;

          color:
            var(--alerts-text);
        }

        .alerts-footer-value.critical strong {
          color:
            var(--alerts-red);
        }

        .alerts-footer-value.warning strong {
          color:
            var(--alerts-amber);
        }

        .alerts-footer-value.resolved strong {
          color:
            var(--alerts-green);
        }

        /* =====================================================
           ANIMATIONS
        ===================================================== */

        @keyframes alertsSpin {
          to {
            transform:
              rotate(360deg);
          }
        }

        @keyframes alertsPulse {
          0%,
          100% {
            opacity: 1;
          }

          50% {
            opacity: 0.4;
          }
        }

        /* =====================================================
           LIGHT / DAY MODE
           Dark mode remains untouched
        ===================================================== */

        html[data-theme="light"]
          .alerts-page {
          --alerts-panel:
            #f5f0e6;

          --alerts-panel-dark:
            #e7dfd0;

          --alerts-border:
            #b9ad99;

          --alerts-text:
            #292722;

          --alerts-muted:
            #70695d;

          --alerts-amber:
            #a66a08;

          --alerts-green:
            #277548;

          --alerts-red:
            #b5423d;

          --alerts-blue:
            #267394;

          background:
            linear-gradient(
              180deg,
              #f7f3ea,
              #eee7d9
            );
        }

        html[data-theme="light"]
          .alerts-header {
          background:
            linear-gradient(
              90deg,
              rgba(
                166,
                106,
                8,
                0.08
              ),
              transparent 45%
            ),
            #f5f0e6;

          border-color:
            #b9ad99;

          box-shadow:
            0 8px 22px
              rgba(
                75,
                65,
                50,
                0.08
              );
        }

        html[data-theme="light"]
          .alerts-system-status {
          background:
            rgba(
              39,
              117,
              72,
              0.07
            );

          border-color:
            rgba(
              39,
              117,
              72,
              0.3
            );
        }

        html[data-theme="light"]
          .alerts-refresh {
          background:
            #e9e1d2;

          border-color:
            #b9ad99;

          color:
            #403b32;
        }

        html[data-theme="light"]
          .alerts-refresh:hover:not(:disabled) {
          border-color:
            #9a6106;

          color:
            #8d5907;
        }

        html[data-theme="light"]
          .alerts-error {
          background:
            rgba(
              181,
              66,
              61,
              0.07
            );

          border-color:
            rgba(
              181,
              66,
              61,
              0.3
            );

          color:
            #963d39;
        }

        html[data-theme="light"]
          .alerts-kpi {
          background:
            #f5f0e6;

          border-color:
            #b9ad99;

          box-shadow:
            0 5px 14px
              rgba(
                75,
                65,
                50,
                0.055
              );
        }

        html[data-theme="light"]
          .alerts-kpi:hover {
          border-color:
            #9c907b;
        }

        html[data-theme="light"]
          .alerts-kpi-description {
          color:
            #817869;
        }

        html[data-theme="light"]
          .alerts-status-banner {
          background:
            linear-gradient(
              90deg,
              var(--status-bg),
              transparent 75%
            ),
            #f5f0e6;

          border-color:
            #b9ad99;
        }

        html[data-theme="light"]
          .alerts-panel {
          background:
            #f5f0e6;

          border-color:
            #b9ad99;

          box-shadow:
            0 8px 22px
              rgba(
                75,
                65,
                50,
                0.07
              );
        }

        html[data-theme="light"]
          .alerts-panel-header {
          background:
            repeating-linear-gradient(
              135deg,
              rgba(
                60,
                50,
                40,
                0.025
              )
              0 2px,
              transparent
              2px 8px
            ),
            #e7dfd0;

          border-color:
            #b9ad99;
        }

        html[data-theme="light"]
          .alerts-record-count {
          border-color:
            #b9ad99;

          color:
            #70695d;
        }

        html[data-theme="light"]
          .alerts-toolbar {
          border-color:
            #c7bcaa;
        }

        html[data-theme="light"]
          .alerts-search {
          background:
            #e9e1d2;

          border-color:
            #b9ad99;

          color:
            #70695d;
        }

        html[data-theme="light"]
          .alerts-search input {
          color:
            #292722;
        }

        html[data-theme="light"]
          .alerts-search input::placeholder {
          color:
            #817869;
        }

        html[data-theme="light"]
          .alerts-filter {
          background:
            #e1d8c8;

          border-color:
            #b9ad99;
        }

        html[data-theme="light"]
          .alerts-filter button {
          color:
            #696154;
        }

        html[data-theme="light"]
          .alerts-filter button:hover {
          color:
            #292722;
        }

        html[data-theme="light"]
          .alerts-filter button.active {
          background:
            #a66a08;

          color:
            #fff8e9;
        }

        html[data-theme="light"]
          .alerts-item {
          border-color:
            #d1c7b7;
        }

        html[data-theme="light"]
          .alerts-item:hover {
          background:
            rgba(
              166,
              106,
              8,
              0.035
            );
        }

        html[data-theme="light"]
          .alerts-item-title {
          color:
            #292722;
        }

        html[data-theme="light"]
          .alerts-item-type {
          color:
            #7b7265;
        }

        html[data-theme="light"]
          .alerts-item-message {
          color:
            #5f584d;
        }

        html[data-theme="light"]
          .alerts-meta {
          color:
            #7b7265;
        }

        html[data-theme="light"]
          .alerts-footer {
          background:
            #e7dfd0;

          border-color:
            #b9ad99;
        }

        html[data-theme="light"]
          .alerts-footer-label {
          color:
            #70695d;
        }

        html[data-theme="light"]
          .alerts-footer-value {
          border-color:
            #b9ad99;

          color:
            #70695d;
        }

        html[data-theme="light"]
          .alerts-footer-value strong {
          color:
            #292722;
        }

        html[data-theme="light"]
          .alerts-state {
          color:
            #70695d;
        }

        html[data-theme="light"]
          .alerts-empty h3 {
          color:
            #292722;
        }

        html[data-theme="light"]
          .alerts-empty p {
          color:
            #70695d;
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 1050px) {

          .alerts-kpi-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              );
          }

        }

        @media (max-width: 760px) {

          .alerts-page {
            padding:
              14px;
          }

          .alerts-header {
            align-items:
              flex-start;

            flex-direction:
              column;
          }

          .alerts-header-right {
            width: 100%;

            justify-content:
              flex-start;
          }

          .alerts-toolbar {
            align-items:
              stretch;

            flex-direction:
              column;
          }

          .alerts-search {
            width: 100%;
          }

          .alerts-filter {
            width: 100%;

            overflow-x: auto;
          }

          .alerts-filter button {
            flex: 1;

            white-space:
              nowrap;
          }

          .alerts-panel-header {
            gap: 10px;
          }

          .alerts-item-top {
            flex-direction:
              column;
          }

          .alerts-severity {
            align-self:
              flex-start;
          }

        }

        @media (max-width: 520px) {

          .alerts-kpi-grid {
            grid-template-columns:
              1fr;
          }

          .alerts-title {
            font-size:
              27px;
          }

          .alerts-system-status {
            display: none;
          }

          .alerts-footer {
            align-items:
              flex-start;

            flex-direction:
              column;
          }

        }

      `}</style>

      <div className="alerts-shell">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="alerts-header">

          <div className="alerts-header-left">

            <div className="alerts-header-accent" />

            <div>

              <div className="alerts-eyebrow">
                MSME OPERATIONS · SAFETY & MONITORING
              </div>

              <div className="alerts-title">
                ALERT COMMAND CENTER
              </div>

              <div className="alerts-subtitle">
                Monitor operational risks and actionable business alerts.
              </div>

            </div>

          </div>

          <div className="alerts-header-right">

            <div className="alerts-system-status">

              <span className="alerts-system-dot" />

              ALERT SYSTEM ACTIVE

            </div>

            <button
              className="alerts-refresh"
              onClick={fetchAlerts}
              disabled={loading}
            >

              <RefreshCw
                size={12}
                className={
                  loading
                    ? "alerts-loading-icon"
                    : ""
                }
              />

              REFRESH

            </button>

          </div>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div className="alerts-error">

            <AlertTriangle size={17} />

            {error}

          </div>

        )}

        {/* =================================================
            KPI CARDS
        ================================================= */}

        <div className="alerts-kpi-grid">

          {/* TOTAL */}

          <div
            className="alerts-kpi"
            style={{
              "--kpi-accent":
                "#38bdf8",
            }}
          >

            <div className="alerts-kpi-top">

              <div className="alerts-kpi-icon">

                <Bell size={17} />

              </div>

              <span className="alerts-kpi-code">
                ALT / 01
              </span>

            </div>

            <span className="alerts-kpi-label">
              Total Alerts
            </span>

            <strong className="alerts-kpi-value">
              {statistics.total}
            </strong>

            <small className="alerts-kpi-description">
              All generated alerts
            </small>

          </div>

          {/* ACTIVE */}

          <div
            className="alerts-kpi"
            style={{
              "--kpi-accent":
                "#f87171",
            }}
          >

            <div className="alerts-kpi-top">

              <div className="alerts-kpi-icon">

                <AlertTriangle
                  size={17}
                />

              </div>

              <span className="alerts-kpi-code">
                ALT / 02
              </span>

            </div>

            <span className="alerts-kpi-label">
              Active Alerts
            </span>

            <strong className="alerts-kpi-value">
              {statistics.unresolved}
            </strong>

            <small className="alerts-kpi-description">
              Requires attention
            </small>

          </div>

          {/* CRITICAL */}

          <div
            className="alerts-kpi"
            style={{
              "--kpi-accent":
                "#f87171",
            }}
          >

            <div className="alerts-kpi-top">

              <div className="alerts-kpi-icon">

                <ShieldAlert
                  size={17}
                />

              </div>

              <span className="alerts-kpi-code">
                ALT / 03
              </span>

            </div>

            <span className="alerts-kpi-label">
              Critical
            </span>

            <strong className="alerts-kpi-value">
              {statistics.critical}
            </strong>

            <small className="alerts-kpi-description">
              High priority alerts
            </small>

          </div>

          {/* RESOLVED */}

          <div
            className="alerts-kpi"
            style={{
              "--kpi-accent":
                "#4ade80",
            }}
          >

            <div className="alerts-kpi-top">

              <div className="alerts-kpi-icon">

                <CheckCircle
                  size={17}
                />

              </div>

              <span className="alerts-kpi-code">
                ALT / 04
              </span>

            </div>

            <span className="alerts-kpi-label">
              Resolved
            </span>

            <strong className="alerts-kpi-value">
              {statistics.resolved}
            </strong>

            <small className="alerts-kpi-description">
              Completed alerts
            </small>

          </div>

        </div>

        {/* =================================================
            STATUS BANNER
        ================================================= */}

        <div
          className={`alerts-status-banner ${
            statistics.unresolved > 0
              ? "alerts-attention"
              : "alerts-normal"
          }`}
        >

          <div className="alerts-status-icon">

            {statistics.unresolved > 0 ? (
              <AlertTriangle
                size={21}
              />
            ) : (
              <CheckCircle
                size={21}
              />
            )}

          </div>

          <div className="alerts-status-content">

            <strong>

              {statistics.unresolved > 0
                ? `${statistics.unresolved} active alert${
                    statistics.unresolved === 1
                      ? ""
                      : "s"
                  } require attention`
                : "All systems are operating normally"}

            </strong>

            <span>

              {statistics.unresolved > 0
                ? "Review the alerts below and take appropriate action."
                : "There are currently no unresolved operational alerts."}

            </span>

          </div>

        </div>

        {/* =================================================
            ALERT CENTER
        ================================================= */}

        <div className="alerts-panel">

          {/* PANEL HEADER */}

          <div className="alerts-panel-header">

            <div className="alerts-panel-heading">

              <div className="alerts-panel-tab" />

              <span className="alerts-panel-title">
                ALERT CENTER
              </span>

              <span className="alerts-record-count">
                {filteredAlerts.length} ALERTS
              </span>

            </div>

          </div>

          {/* =================================================
              TOOLBAR
          ================================================= */}

          <div className="alerts-toolbar">

            <div className="alerts-search">

              <Search size={13} />

              <input
                type="text"
                placeholder="SEARCH ALERTS..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />

            </div>

            <div className="alerts-filter">

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
                ALL
              </button>

              <button
                className={
                  filter === "active"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setFilter("active")
                }
              >
                ACTIVE
              </button>

              <button
                className={
                  filter === "critical"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setFilter("critical")
                }
              >
                CRITICAL
              </button>

              <button
                className={
                  filter === "warning"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setFilter("warning")
                }
              >
                WARNING
              </button>

              <button
                className={
                  filter === "resolved"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setFilter("resolved")
                }
              >
                RESOLVED
              </button>

            </div>

          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (

            <div className="alerts-state">

              <RefreshCw
                size={25}
                className="alerts-loading-icon"
              />

              LOADING ALERT RECORDS...

            </div>

          ) : filteredAlerts.length === 0 ? (

            /* =================================================
               EMPTY
            ================================================= */

            <div className="alerts-empty">

              <div className="alerts-empty-icon">

                <CheckCircle
                  size={30}
                />

              </div>

              <h3>
                NO ALERTS FOUND
              </h3>

              <p>
                There are no alerts matching your current filter.
              </p>

            </div>

          ) : (

            /* =================================================
               ALERT LIST
            ================================================= */

            <div className="alerts-list">

              {filteredAlerts.map(
                (alert) => {

                  const severity =
                    getSeverity(
                      alert
                    );

                  return (

                    <div
                      key={
                        alert._id
                      }
                      className="alerts-item"
                    >

                      {/* ICON */}

                      <div
                        className={`alerts-item-icon ${severity.className}`}
                      >

                        {getAlertIcon(
                          alert
                        )}

                      </div>

                      {/* CONTENT */}

                      <div className="alerts-item-content">

                        <div className="alerts-item-top">

                          <div>

                            <h4 className="alerts-item-title">

                              {
                                alert.title ||
                                alert.name ||
                                "System Alert"
                              }

                            </h4>

                            <span className="alerts-item-type">

                              {
                                alert.type ||
                                "Operational"
                              }

                            </span>

                          </div>

                          <span
                            className={`alerts-severity ${severity.className}`}
                          >

                            {
                              severity.label
                            }

                          </span>

                        </div>

                        <p className="alerts-item-message">

                          {
                            alert.message ||
                            alert.description ||
                            "No additional information available."
                          }

                        </p>

                        <div className="alerts-item-bottom">

                          <span className="alerts-meta">

                            <Clock
                              size={13}
                            />

                            {
                              formatDate(
                                alert.createdAt ||
                                alert.alertDate
                              )
                            }

                          </span>

                          <span
                            className={`alerts-status ${
                              alert.isResolved
                                ? "resolved"
                                : "active"
                            }`}
                          >

                            {alert.isResolved ? (
                              <>
                                <CheckCircle
                                  size={12}
                                />

                                RESOLVED
                              </>
                            ) : (
                              <>
                                <AlertTriangle
                                  size={12}
                                />

                                ACTIVE
                              </>
                            )}

                          </span>

                        </div>

                      </div>

                    </div>

                  );
                }
              )}

            </div>

          )}

          {/* =================================================
              FOOTER TOTALS
          ================================================= */}

          {!loading &&
            alerts.length > 0 && (

              <div className="alerts-footer">

                <div className="alerts-footer-label">
                  ALERT SYSTEM SUMMARY
                </div>

                <div className="alerts-footer-values">

                  <div className="alerts-footer-value">

                    TOTAL

                    <strong>
                      {statistics.total}
                    </strong>

                  </div>

                  <div className="alerts-footer-value critical">

                    CRITICAL

                    <strong>
                      {statistics.critical}
                    </strong>

                  </div>

                  <div className="alerts-footer-value warning">

                    WARNING

                    <strong>
                      {statistics.warnings}
                    </strong>

                  </div>

                  <div className="alerts-footer-value">

                    ACTIVE

                    <strong>
                      {statistics.unresolved}
                    </strong>

                  </div>

                  <div className="alerts-footer-value resolved">

                    RESOLVED

                    <strong>
                      {statistics.resolved}
                    </strong>

                  </div>

                </div>

              </div>

            )}

        </div>

      </div>

    </div>
  );
};

export default Alerts;