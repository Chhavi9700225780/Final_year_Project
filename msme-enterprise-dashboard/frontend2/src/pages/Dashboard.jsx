import { useEffect, useState } from "react";

import {
  Factory,
  Package,
  IndianRupee,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Activity,
  Boxes,
} from "lucide-react";

import {
  getDashboardSummary,
  getProductionTrend,
  getFinanceTrend,
  getInventoryOverview,
  getSalesRegions,
} from "../services/api";

import ProductionChart from "../components/dashboard/ProductionChart";
import FinanceChart from "../components/dashboard/FinanceChart";
import InventoryChart from "../components/dashboard/InventoryChart";
import SalesRegionChart from "../components/dashboard/SalesRegionChart";

const COMPANY_ID =
  "68a123456789abcdef123456";

const Dashboard = () => {

  const [summary, setSummary] =
    useState(null);

  const [productionTrend, setProductionTrend] =
    useState([]);

  const [financeTrend, setFinanceTrend] =
    useState([]);

  const [inventoryData, setInventoryData] =
    useState([]);

  const [salesRegions, setSalesRegions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchDashboard = async () => {

    try {

      setLoading(true);
      setError("");

      const [
        summaryResponse,
        productionResponse,
        financeResponse,
        inventoryResponse,
        salesResponse,
      ] = await Promise.all([

        getDashboardSummary(
          COMPANY_ID
        ),

        getProductionTrend(
          COMPANY_ID
        ),

        getFinanceTrend(
          COMPANY_ID
        ),

        getInventoryOverview(
          COMPANY_ID
        ),

        getSalesRegions(
          COMPANY_ID
        ),

      ]);

      setSummary(
        summaryResponse.data?.data
      );

      setProductionTrend(
        productionResponse.data?.data ||
          []
      );

      setFinanceTrend(
        financeResponse.data?.data ||
          []
      );

      setInventoryData(
        inventoryResponse.data?.data ||
          []
      );

      setSalesRegions(
        salesResponse.data?.data ||
          []
      );

      console.log(
        "Dashboard analytics loaded"
      );

    } catch (err) {

      console.error(
        "Dashboard error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load dashboard data."
      );

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const currency = (value) =>
    `₹${Number(
      value || 0
    ).toLocaleString("en-IN")}`;

  if (loading) {

    return (
      <div className="grid grid-cols-1 gap-5 2xl:grid-cols-2">

        <div className="flex flex-col items-center gap-3">

          <RefreshCw
            size={28}
            className="animate-spin text-blue-600"
          />

          <p className="text-sm text-slate-500">
            Loading enterprise analytics...
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* =====================================
          HEADER
      ====================================== */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div>

          <div className="flex items-center gap-3">

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Business Performance
            </h1>

            <span className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">

              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              System Operational

            </span>

          </div>

          <p className="mt-1 text-sm text-slate-500">
            Real-time overview of your enterprise
            operations and performance.
          </p>

        </div>

        <button
          onClick={fetchDashboard}
          className="flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
        >

          <RefreshCw size={15} />

          Refresh

        </button>

      </div>


      {/* =====================================
          ERROR
      ====================================== */}

      {error && (

        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">

          <AlertTriangle size={18} />

          {error}

        </div>

      )}


      {/* =====================================
          KPI CARDS
      ====================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

        {/* Production */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-start justify-between">

            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">

              <Factory size={20} />

            </div>

            <span className="text-xs text-slate-400">
              Production
            </span>

          </div>

          <p className="mt-4 text-2xl font-bold text-slate-900">
            {Number(
              summary?.totalActualProduction ||
                0
            ).toLocaleString("en-IN")}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Units produced
          </p>

        </div>


        {/* Efficiency */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-start justify-between">

            <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600">

              <TrendingUp size={20} />

            </div>

            <span className="text-xs text-slate-400">
              Efficiency
            </span>

          </div>

          <p className="mt-4 text-2xl font-bold text-slate-900">
            {summary?.productionEfficiency || 0}%
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Actual vs planned
          </p>

        </div>


        {/* Inventory */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-start justify-between">

            <div className="rounded-lg bg-violet-50 p-2.5 text-violet-600">

              <Package size={20} />

            </div>

            <span className="text-xs text-slate-400">
              Inventory
            </span>

          </div>

          <p className="mt-4 text-2xl font-bold text-slate-900">
            {Number(
              summary?.totalInventoryUnits ||
                0
            ).toLocaleString("en-IN")}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Current stock units
          </p>

        </div>


        {/* Revenue */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-start justify-between">

            <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600">

              <IndianRupee size={20} />

            </div>

            <span className="text-xs text-slate-400">
              Revenue
            </span>

          </div>

          <p className="mt-4 text-2xl font-bold text-slate-900">
            {currency(
              summary?.salesRevenue
            )}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Recorded sales revenue
          </p>

        </div>


        {/* Profit */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-start justify-between">

            <div className="rounded-lg bg-cyan-50 p-2.5 text-cyan-600">

              <Activity size={20} />

            </div>

            <span className="text-xs text-slate-400">
              Estimated Profit
            </span>

          </div>

          <p className="mt-4 text-2xl font-bold text-slate-900">
            {currency(
              summary?.estimatedProfit
            )}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Revenue minus expenses
          </p>

        </div>

      </div>


      {/* =====================================
          CHARTS ROW 1
      ====================================== */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

        {/* Production */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-4">

            <h2 className="font-semibold text-slate-900">
              Production Performance
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Planned versus actual production
            </p>

          </div>

          <ProductionChart
            data={productionTrend}
          />

        </div>


        {/* Finance */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-4">

            <h2 className="font-semibold text-slate-900">
              Financial Performance
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Revenue and expenses over time
            </p>

          </div>

          <FinanceChart
            data={financeTrend}
          />

        </div>

      </div>


      {/* =====================================
          CHARTS ROW 2
      ====================================== */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

        {/* Inventory */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-4 flex items-center justify-between">

            <div>

              <h2 className="font-semibold text-slate-900">
                Inventory Overview
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Current stock by product
              </p>

            </div>

            <Boxes
              size={20}
              className="text-slate-400"
            />

          </div>

          <InventoryChart
            data={inventoryData}
          />

        </div>


        {/* Sales Regions */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-4">

            <h2 className="font-semibold text-slate-900">
              Sales by Region
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Revenue distribution across regions
            </p>

          </div>

          <SalesRegionChart
            data={salesRegions}
          />

        </div>

      </div>


      {/* =====================================
          OPERATIONAL SUMMARY
      ====================================== */}

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="mb-5">

          <h2 className="font-semibold text-slate-900">
            Operational Summary
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Key indicators requiring management
            attention.
          </p>

        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          <div className="rounded-lg bg-slate-50 p-4">

            <p className="text-xs text-slate-500">
              Defect Rate
            </p>

            <p className="mt-2 text-xl font-bold text-slate-900">
              {summary?.defectRate || 0}%
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Production quality indicator
            </p>

          </div>


          <div className="rounded-lg bg-slate-50 p-4">

            <p className="text-xs text-slate-500">
              Raw Material Value
            </p>

            <p className="mt-2 text-xl font-bold text-slate-900">
              {currency(
                summary?.rawMaterialInventoryValue
              )}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Current raw material position
            </p>

          </div>


          <div className="rounded-lg bg-slate-50 p-4">

            <p className="text-xs text-slate-500">
              Active Alerts
            </p>

            <p className="mt-2 text-xl font-bold text-slate-900">
              {summary?.activeAlerts || 0}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Require management attention
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;