import { useEffect, useState } from "react";

import {
  Factory,
  IndianRupee,
  Package,
  TriangleAlert,
} from "lucide-react";

import KPICard from "../components/KPICard";

import { getDashboardSummary } from "../services/api";

const Dashboard = () => {

  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);

  const companyId =
    localStorage.getItem("companyId");

  useEffect(() => {

    const fetchDashboard = async () => {

      try {

        if (!companyId) {
          console.log("No company ID found");
          return;
        }

        const response =
          await getDashboardSummary(companyId);

        setDashboard(response.data.data);

      } catch (error) {

        console.error(
          "Dashboard error:",
          error
        );

      } finally {

        setLoading(false);

      }
    };

    fetchDashboard();

  }, [companyId]);

  if (loading) {
    return (
      <div className="loading">
        Loading dashboard...
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="empty-state">

        <h2>
          No dashboard data available
        </h2>

        <p>
          Upload departmental datasets to
          generate enterprise insights.
        </p>

      </div>
    );
  }

  return (

    <div className="dashboard">

      <div className="dashboard-header">

        <div>
          <h2>Business Performance</h2>

          <p>
            Real-time overview of your
            enterprise operations
          </p>
        </div>

        <div className="status">
          <span className="status-dot"></span>

          System Operational
        </div>

      </div>


      <div className="kpi-grid">

        <KPICard
          title="Revenue"
          value={`₹${(
            dashboard.salesRevenue || 0
          ).toLocaleString("en-IN")}`}
          subtitle="Total recorded revenue"
          icon={IndianRupee}
        />

        <KPICard
          title="Production"
          value={(
            dashboard.totalActualProduction || 0
          ).toLocaleString("en-IN")}
          subtitle="Units produced"
          icon={Factory}
        />

        <KPICard
          title="Production Efficiency"
          value={`${dashboard.productionEfficiency || 0}%`}
          subtitle="Actual vs planned"
          icon={Factory}
        />

        <KPICard
          title="Active Alerts"
          value={dashboard.activeAlerts || 0}
          subtitle="Require attention"
          icon={TriangleAlert}
        />

      </div>


      <div className="analytics-grid">

        <div className="analytics-card">

          <div className="card-heading">

            <div>
              <h3>Production Overview</h3>

              <p>
                Planned vs actual production
              </p>
            </div>

          </div>

          <div className="production-summary">

            <div>
              <span>Planned</span>

              <strong>
                {dashboard.totalPlannedProduction?.toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>

            <div>
              <span>Actual</span>

              <strong>
                {dashboard.totalActualProduction?.toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>

            <div>
              <span>Defect Rate</span>

              <strong>
                {dashboard.defectRate}%
              </strong>
            </div>

          </div>

        </div>


        <div className="analytics-card">

          <div className="card-heading">

            <div>
              <h3>Inventory Health</h3>

              <p>
                Current inventory position
              </p>
            </div>

            <Package size={20} />

          </div>

          <div className="inventory-value">

            {dashboard.totalInventoryUnits?.toLocaleString(
              "en-IN"
            )}

          </div>

          <span>
            Total inventory units
          </span>

        </div>

      </div>


      <div className="analytics-card financial-card">

        <div className="card-heading">

          <div>

            <h3>Financial Summary</h3>

            <p>
              Revenue, expenses and estimated profit
            </p>

          </div>

        </div>

        <div className="financial-grid">

          <div>
            <span>Revenue</span>

            <strong>
              ₹{dashboard.financeRevenue?.toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

          <div>
            <span>Expenses</span>

            <strong>
              ₹{dashboard.totalExpenses?.toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

          <div>
            <span>Estimated Profit</span>

            <strong>
              ₹{dashboard.estimatedProfit?.toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

        </div>

      </div>

    </div>

  );
};

export default Dashboard;