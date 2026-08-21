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

  // ==========================================
  // Fetch Alerts
  // ==========================================

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getAlerts(COMPANY_ID);

      console.log(
        "Alerts API:",
        response.data
      );

      const responseData =
        response.data?.data;

      let alertData = [];

      if (Array.isArray(responseData)) {
        alertData = responseData;
      } else if (
        Array.isArray(responseData?.data)
      ) {
        alertData = responseData.data;
      }

      setAlerts(alertData);

    } catch (err) {
      console.error(
        "Alerts fetch error:",
        err
      );

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

  // ==========================================
  // Statistics
  // ==========================================

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

  // ==========================================
  // Search + Filter
  // ==========================================

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

  // ==========================================
  // Date
  // ==========================================

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

  // ==========================================
  // Alert Severity
  // ==========================================

  const getSeverity = (alert) => {
    const severity =
      alert.severity?.toLowerCase();

    if (severity === "critical") {
      return {
        label: "Critical",
        className: "alert-critical",
      };
    }

    if (severity === "warning") {
      return {
        label: "Warning",
        className: "alert-warning",
      };
    }

    if (severity === "info") {
      return {
        label: "Information",
        className: "alert-info",
      };
    }

    return {
      label: "Alert",
      className: "alert-warning",
    };
  };

  // ==========================================
  // Alert Icon
  // ==========================================

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

  return (
    <div className="module-page">

      {/* ======================================
          Header
      ======================================= */}

      <div className="module-header">

        <div>

          <h2>
            Alerts
          </h2>

          <p>
            Monitor operational risks and
            actionable business alerts.
          </p>

        </div>

        <button
          className="refresh-button"
          onClick={fetchAlerts}
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
      ======================================= */}

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
      ======================================= */}

      <div className="module-kpi-grid">

        {/* Total */}

        <div className="module-kpi-card">

          <div className="module-kpi-icon blue">

            <Bell size={20} />

          </div>

          <div>

            <span>
              Total Alerts
            </span>

            <strong>
              {statistics.total}
            </strong>

            <small>
              All generated alerts
            </small>

          </div>

        </div>


        {/* Active */}

        <div className="module-kpi-card">

          <div className="module-kpi-icon red">

            <AlertTriangle
              size={20}
            />

          </div>

          <div>

            <span>
              Active Alerts
            </span>

            <strong>
              {statistics.unresolved}
            </strong>

            <small>
              Requires attention
            </small>

          </div>

        </div>


        {/* Critical */}

        <div className="module-kpi-card">

          <div className="module-kpi-icon red">

            <ShieldAlert
              size={20}
            />

          </div>

          <div>

            <span>
              Critical
            </span>

            <strong>
              {statistics.critical}
            </strong>

            <small>
              High priority alerts
            </small>

          </div>

        </div>


        {/* Resolved */}

        <div className="module-kpi-card">

          <div className="module-kpi-icon green">

            <CheckCircle
              size={20}
            />

          </div>

          <div>

            <span>
              Resolved
            </span>

            <strong>
              {statistics.resolved}
            </strong>

            <small>
              Completed alerts
            </small>

          </div>

        </div>

      </div>


      {/* ======================================
          Alert Status Banner
      ======================================= */}

      <div className="alert-status-banner">

        <div className="alert-status-icon">

          {statistics.unresolved > 0 ? (
            <AlertTriangle
              size={22}
            />
          ) : (
            <CheckCircle
              size={22}
            />
          )}

        </div>

        <div>

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


      {/* ======================================
          Alert List
      ======================================= */}

      <div className="module-card">

        <div className="module-card-header">

          <div>

            <h3>
              Alert Center
            </h3>

            <p>
              Operational alerts generated from
              integrated enterprise data.
            </p>

          </div>

          <div className="record-count">

            {filteredAlerts.length} Alerts

          </div>

        </div>


        {/* Toolbar */}

        <div className="finance-toolbar">

          <div className="search-box">

            <Search size={16} />

            <input
              type="text"
              placeholder="Search alerts..."
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
                filter === "active"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setFilter("active")
              }
            >
              Active
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
              Critical
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
              Warning
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
              Resolved
            </button>

          </div>

        </div>


        {/* ====================================
            Loading
        ===================================== */}

        {loading ? (

          <div className="table-state">

            <RefreshCw
              size={24}
              className="spin"
            />

            <p>
              Loading alerts...
            </p>

          </div>

        ) : filteredAlerts.length === 0 ? (

          <div className="alerts-empty-state">

            <div className="alerts-empty-icon">

              <CheckCircle
                size={32}
              />

            </div>

            <h3>
              No alerts found
            </h3>

            <p>
              There are no alerts matching
              your current filter.
            </p>

          </div>

        ) : (

          <div className="alerts-list">

            {filteredAlerts.map(
              (alert) => {

                const severity =
                  getSeverity(alert);

                return (

                  <div
                    key={
                      alert._id
                    }
                    className="alert-item"
                  >

                    {/* Icon */}

                    <div
                      className={`alert-item-icon ${severity.className}`}
                    >
                      {getAlertIcon(
                        alert
                      )}
                    </div>


                    {/* Main */}

                    <div className="alert-item-content">

                      <div className="alert-item-top">

                        <div>

                          <h4>
                            {
                              alert.title ||
                              alert.name ||
                              "System Alert"
                            }
                          </h4>

                          <span className="alert-type">
                            {
                              alert.type ||
                              "Operational"
                            }
                          </span>

                        </div>


                        <span
                          className={`alert-severity ${severity.className}`}
                        >
                          {
                            severity.label
                          }
                        </span>

                      </div>


                      <p>

                        {
                          alert.message ||
                          alert.description ||
                          "No additional information available."
                        }

                      </p>


                      <div className="alert-item-bottom">

                        <span>

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
                          className={
                            alert.isResolved
                              ? "resolved-status"
                              : "active-status"
                          }
                        >

                          {alert.isResolved ? (
                            <>
                              <CheckCircle
                                size={13}
                              />
                              Resolved
                            </>
                          ) : (
                            <>
                              <AlertTriangle
                                size={13}
                              />
                              Active
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

      </div>

    </div>
  );
};

export default Alerts;