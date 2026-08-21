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
      ======================================= */}

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
      ======================================= */}

      {error && (

        <div className="module-error">

          <FileBarChart size={18} />

          {error}

        </div>

      )}


      {/* ======================================
          Loading
      ======================================= */}

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
          =================================== */}

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
          =================================== */}

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
          =================================== */}

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
          =================================== */}

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
          =================================== */}

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
              Sales
          =================================== */}

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


          {/* ==================================
              Decision Support
          =================================== */}

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
          =================================== */}

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