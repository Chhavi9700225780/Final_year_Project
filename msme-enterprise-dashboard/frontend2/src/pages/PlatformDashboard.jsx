
import { useCallback, useEffect, useState } from "react";
import API from "../services/api";
import "./styles/PlatformDashboard.css";
import PlatformCompanies from "./PlatformCompanies";
const initialStatistics = {
  totalCompanies: 0,
  activeCompanies: 0,
  inactiveCompanies: 0,
  totalUsers: 0,
};

const formatNumber = (value) =>
  new Intl.NumberFormat("en-IN").format(value);

const PlatformDashboard = ({
  user,
  onLogout,
  theme,
  onToggleTheme,
}) => {
  const [statistics, setStatistics] = useState(initialStatistics);
  const [platformStatus, setPlatformStatus] = useState("checking");
  const [databaseStatus, setDatabaseStatus] = useState("checking");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchOverview = useCallback(async (signal) => {
    setLoading(true);
    setError("");

    try {
      const response = await API.get("/platform/overview", {
        signal,
      });

      const result = response.data?.data;

      if (!response.data?.success || !result?.statistics) {
        throw new Error("Invalid platform overview response.");
      }

      const stats = result.statistics;

      const validCounts = [
        stats.totalCompanies,
        stats.activeCompanies,
        stats.inactiveCompanies,
        stats.totalUsers,
      ].every(
        (value) =>
          Number.isSafeInteger(value) && value >= 0
      );

      if (!validCounts) {
        throw new Error("Invalid statistics received from server.");
      }

      setStatistics({
        totalCompanies: stats.totalCompanies,
        activeCompanies: stats.activeCompanies,
        inactiveCompanies: stats.inactiveCompanies,
        totalUsers: stats.totalUsers,
      });

      setPlatformStatus(result.platformStatus);
      setDatabaseStatus(result.databaseStatus);
      setLastUpdated(result.generatedAt);
    } catch (err) {
      if (
        err.code === "ERR_CANCELED" ||
        err.name === "CanceledError"
      ) {
        return;
      }

      console.error("Platform overview error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load platform statistics."
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetchOverview(controller.signal);

    return () => controller.abort();
  }, [fetchOverview]);

  const handleRefresh = () => {
    fetchOverview();
  };

  const statusLabel =
    platformStatus === "operational"
      ? "ONLINE"
      : platformStatus === "checking"
        ? "CHECKING"
        : "UNAVAILABLE";

  return (
    <div className="platform-dashboard">

      {/* HEADER */}
      <header className="platform-header">
        <div className="platform-brand">
          <span className="platform-eyebrow">
            FORGE / PLATFORM ADMINISTRATION
          </span>

          <h1 className="platform-title">
            PLATFORM CONTROL CENTER
          </h1>

          <p className="platform-subtitle">
            CENTRALIZED ENTERPRISE MANAGEMENT SYSTEM
          </p>
        </div>

        <div className="platform-header-actions">
          <button
            className="platform-action-btn"
            onClick={onToggleTheme}
            type="button"
          >
            {theme === "dark" ? "LIGHT MODE" : "DARK MODE"}
          </button>

          <button
            className="platform-action-btn"
            onClick={handleRefresh}
            disabled={loading}
            type="button"
          >
            {loading ? "REFRESHING..." : "REFRESH"}
          </button>

          <button
            className="platform-action-btn logout"
            onClick={onLogout}
            type="button"
          >
            LOGOUT
          </button>
        </div>
      </header>

      {/* WELCOME */}
      <section className="platform-welcome">
        <h2>Welcome, {user?.name || "Platform Admin"}</h2>

        <p>
          Monitor registered companies, manage platform operations,
          and oversee the entire MSME ecosystem.
        </p>
      </section>

      {/* ERROR */}
      {error && (
        <div className="platform-error" role="alert">
          <span>{error}</span>

          <button
            className="platform-action-btn"
            onClick={handleRefresh}
            type="button"
          >
            RETRY
          </button>
        </div>
      )}

      {/* STATISTICS */}
      <section>
        <div className="platform-section-heading">
          <h3>Platform Overview</h3>
          <span>
            {loading ? "FETCHING METRICS..." : "DATABASE METRICS"}
          </span>
        </div>

        <div className="platform-stats-grid">

          <div className="platform-stat-card">
            <span className="platform-stat-label">
              Total Companies
            </span>

            <strong className="platform-stat-value">
              {loading && !lastUpdated
                ? "—"
                : formatNumber(statistics.totalCompanies)}
            </strong>
          </div>

          <div className="platform-stat-card">
            <span className="platform-stat-label">
              Active Companies
            </span>

            <strong className="platform-stat-value">
              {loading && !lastUpdated
                ? "—"
                : formatNumber(statistics.activeCompanies)}
            </strong>
          </div>

          <div className="platform-stat-card">
            <span className="platform-stat-label">
              Total Users
            </span>

            <strong className="platform-stat-value">
              {loading && !lastUpdated
                ? "—"
                : formatNumber(statistics.totalUsers)}
            </strong>
          </div>

          <div className="platform-stat-card">
            <span className="platform-stat-label">
              Platform Status
            </span>

            <strong className="platform-stat-value">
              <span
                className={`platform-status ${
                  platformStatus !== "operational" ? "offline" : ""
                }`}
              >
                {statusLabel}
              </span>
            </strong>
          </div>

        </div>
      </section>

      {/* MAIN CONTENT */}
      <PlatformCompanies />

      {/* FOOTER */}
      <footer className="platform-footer">
        FORGE PLATFORM CONTROL CENTER
        {" "}·{" "}
        SUPER ADMIN CONSOLE
      </footer>

    </div>
  );
};

export default PlatformDashboard;
