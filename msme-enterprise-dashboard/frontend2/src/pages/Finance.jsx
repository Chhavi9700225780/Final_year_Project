import { useEffect, useMemo, useState } from "react";

import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Wallet,
  Search,
  RefreshCw,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";

import { getFinanceTransactions } from "../services/api";

const COMPANY_ID = "68a123456789abcdef123456";

const Finance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // ==========================================
  // Fetch Finance Data
  // ==========================================

  const fetchFinance = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getFinanceTransactions(COMPANY_ID);

      console.log(
        "Finance API:",
        response.data
      );

      const responseData =
        response.data?.data;

      let financeData = [];

      if (Array.isArray(responseData)) {
        financeData = responseData;
      } else if (
        Array.isArray(responseData?.data)
      ) {
        financeData = responseData.data;
      }

      setRecords(financeData);

    } catch (err) {
      console.error(
        "Finance fetch error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to load finance data."
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  // ==========================================
  // Financial Statistics
  // ==========================================

  const statistics = useMemo(() => {
    const revenue = records
      .filter(
        (item) =>
          item.transactionType === "revenue"
      )
      .reduce(
        (sum, item) =>
          sum + Number(item.amount || 0),
        0
      );

    const expenses = records
      .filter(
        (item) =>
          item.transactionType === "expense"
      )
      .reduce(
        (sum, item) =>
          sum + Number(item.amount || 0),
        0
      );

    const profit = revenue - expenses;

    const revenueTransactions =
      records.filter(
        (item) =>
          item.transactionType ===
          "revenue"
      ).length;

    const expenseTransactions =
      records.filter(
        (item) =>
          item.transactionType ===
          "expense"
      ).length;

    return {
      revenue,
      expenses,
      profit,
      revenueTransactions,
      expenseTransactions,
    };
  }, [records]);

  // ==========================================
  // Search + Filter
  // ==========================================

  const filteredRecords = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return records.filter((item) => {
      const matchesSearch =
        !query ||
        item.department
          ?.toLowerCase()
          .includes(query) ||
        item.description
          ?.toLowerCase()
          .includes(query) ||
        item.transactionType
          ?.toLowerCase()
          .includes(query);

      const matchesFilter =
        filter === "all" ||
        item.transactionType === filter;

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [records, search, filter]);

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
      ======================================= */}

      <div className="module-header">

        <div>

          <h2>
            Finance
          </h2>

          <p>
            Monitor revenue, expenses and
            financial performance.
          </p>

        </div>

        <button
          className="refresh-button"
          onClick={fetchFinance}
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
      ======================================= */}

      {error && (

        <div className="module-error">

          <Wallet size={18} />

          {error}

        </div>

      )}


      {/* ======================================
          KPI Cards
      ======================================= */}

      <div className="module-kpi-grid">

        {/* Revenue */}

        <div className="module-kpi-card">

          <div className="module-kpi-icon green">

            <TrendingUp size={20} />

          </div>

          <div>

            <span>
              Total Revenue
            </span>

            <strong>
              {formatCurrency(
                statistics.revenue
              )}
            </strong>

            <small>
              Revenue transactions
            </small>

          </div>

        </div>


        {/* Expenses */}

        <div className="module-kpi-card">

          <div className="module-kpi-icon red">

            <TrendingDown size={20} />

          </div>

          <div>

            <span>
              Total Expenses
            </span>

            <strong>
              {formatCurrency(
                statistics.expenses
              )}
            </strong>

            <small>
              Expense transactions
            </small>

          </div>

        </div>


        {/* Profit */}

        <div className="module-kpi-card">

          <div className="module-kpi-icon blue">

            <Wallet size={20} />

          </div>

          <div>

            <span>
              Estimated Profit
            </span>

            <strong>
              {formatCurrency(
                statistics.profit
              )}
            </strong>

            <small>
              Revenue minus expenses
            </small>

          </div>

        </div>


        {/* Transactions */}

        <div className="module-kpi-card">

          <div className="module-kpi-icon purple">

            <IndianRupee size={20} />

          </div>

          <div>

            <span>
              Transactions
            </span>

            <strong>
              {records.length}
            </strong>

            <small>
              Total financial records
            </small>

          </div>

        </div>

      </div>


      {/* ======================================
          Financial Overview
      ======================================= */}

      <div className="finance-overview-grid">

        <div className="finance-summary-card">

          <div className="finance-summary-icon revenue">

            <ArrowUpCircle size={20} />

          </div>

          <div>

            <span>
              Revenue Transactions
            </span>

            <strong>
              {statistics.revenueTransactions}
            </strong>

          </div>

        </div>


        <div className="finance-summary-card">

          <div className="finance-summary-icon expense">

            <ArrowDownCircle size={20} />

          </div>

          <div>

            <span>
              Expense Transactions
            </span>

            <strong>
              {statistics.expenseTransactions}
            </strong>

          </div>

        </div>

      </div>


      {/* ======================================
          Finance Records
      ======================================= */}

      <div className="module-card">

        <div className="module-card-header">

          <div>

            <h3>
              Financial Transactions
            </h3>

            <p>
              Revenue and expense records
              across departments.
            </p>

          </div>

          <div className="record-count">

            {records.length} Records

          </div>

        </div>


        {/* Toolbar */}

        <div className="finance-toolbar">

          <div className="search-box">

            <Search size={16} />

            <input
              type="text"
              placeholder="Search department or description..."
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
                filter === "revenue"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setFilter("revenue")
              }
            >
              Revenue
            </button>

            <button
              className={
                filter === "expense"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setFilter("expense")
              }
            >
              Expenses
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
              Loading financial data...
            </p>

          </div>

        ) : filteredRecords.length === 0 ? (

          <div className="table-state">

            <Wallet size={30} />

            <p>
              No financial records found.
            </p>

          </div>

        ) : (

          <div className="table-wrapper">

            <table className="enterprise-table">

              <thead>

                <tr>

                  <th>
                    Department
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Amount
                  </th>

                  <th>
                    Description
                  </th>

                  <th>
                    Date
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredRecords.map(
                  (item) => {

                    const isRevenue =
                      item.transactionType ===
                      "revenue";

                    return (

                      <tr
                        key={
                          item._id
                        }
                      >

                        {/* Department */}

                        <td>

                          <strong>
                            {
                              item.department ||
                              "Unknown"
                            }
                          </strong>

                        </td>


                        {/* Type */}

                        <td>

                          <span
                            className={
                              isRevenue
                                ? "finance-type revenue"
                                : "finance-type expense"
                            }
                          >

                            {isRevenue ? (
                              <ArrowUpCircle
                                size={13}
                              />
                            ) : (
                              <ArrowDownCircle
                                size={13}
                              />
                            )}

                            {isRevenue
                              ? "Revenue"
                              : "Expense"}

                          </span>

                        </td>


                        {/* Amount */}

                        <td>

                          <strong
                            className={
                              isRevenue
                                ? "amount-revenue"
                                : "amount-expense"
                            }
                          >

                            {isRevenue
                              ? "+"
                              : "-"}

                            {formatCurrency(
                              item.amount
                            )}

                          </strong>

                        </td>


                        {/* Description */}

                        <td>

                          <span className="description-cell">

                            {item.description ||
                              "No description"}

                          </span>

                        </td>


                        {/* Date */}

                        <td>

                          {formatDate(
                            item.transactionDate
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

export default Finance;