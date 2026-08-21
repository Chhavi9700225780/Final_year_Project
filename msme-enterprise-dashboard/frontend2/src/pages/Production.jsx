import { useEffect, useMemo, useState } from "react";

import {
  Factory,
  PackageCheck,
  AlertTriangle,
  TrendingUp,
  Search,
  RefreshCw,
} from "lucide-react";

import { getProductions } from "../services/api";

const COMPANY_ID = "68a123456789abcdef123456";

const Production = () => {
  const [records, setRecords] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  // ==========================================
  // Fetch Production Data
  // ==========================================

  const fetchProduction = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getProductions(COMPANY_ID);

      console.log(
        "Production API:",
        response.data
      );

      const responseData =
        response.data?.data;

      /*
       * Handles both:
       *
       * { data: [...] }
       *
       * and
       *
       * { data: { data: [...] } }
       */

      let productionData = [];

      if (Array.isArray(responseData)) {
        productionData = responseData;
      } else if (
        Array.isArray(responseData?.data)
      ) {
        productionData =
          responseData.data;
      }

      setRecords(productionData);

    } catch (err) {
      console.error(
        "Production fetch error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to load production data."
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduction();
  }, []);

  // ==========================================
  // Calculations
  // ==========================================

  const statistics = useMemo(() => {
    const planned = records.reduce(
      (sum, item) =>
        sum + Number(item.plannedQuantity || 0),
      0
    );

    const actual = records.reduce(
      (sum, item) =>
        sum + Number(item.actualQuantity || 0),
      0
    );

    const defective = records.reduce(
      (sum, item) =>
        sum + Number(item.defectiveQuantity || 0),
      0
    );

    const cost = records.reduce(
      (sum, item) =>
        sum + Number(item.productionCost || 0),
      0
    );

    const efficiency =
      planned > 0
        ? (actual / planned) * 100
        : 0;

    const defectRate =
      actual > 0
        ? (defective / actual) * 100
        : 0;

    return {
      planned,
      actual,
      defective,
      cost,
      efficiency,
      defectRate,
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
        item.productName
          ?.toLowerCase()
          .includes(query) ||
        item.productId
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [records, search]);

  // ==========================================
  // Format Currency
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
  // Format Date
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

  // ==========================================
  // Efficiency Status
  // ==========================================

  const getEfficiencyClass = (
    planned,
    actual
  ) => {
    if (!planned) {
      return "neutral";
    }

    const efficiency =
      (actual / planned) * 100;

    if (efficiency >= 95) {
      return "good";
    }

    if (efficiency >= 85) {
      return "warning";
    }

    return "danger";
  };

  return (
    <div className="module-page">

      {/* ======================================
          Header
      ======================================= */}

      <div className="module-header">

        <div>
          <h2>Production</h2>

          <p>
            Monitor production performance,
            efficiency and quality.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchProduction}
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
          <AlertTriangle size={18} />

          {error}
        </div>
      )}


      {/* ======================================
          KPI Cards
      ======================================= */}

      <div className="module-kpi-grid">

        <div className="module-kpi-card">

          <div className="module-kpi-icon blue">
            <Factory size={20} />
          </div>

          <div>
            <span>
              Total Production
            </span>

            <strong>
              {statistics.actual.toLocaleString(
                "en-IN"
              )}
            </strong>

            <small>
              Units produced
            </small>
          </div>

        </div>


        <div className="module-kpi-card">

          <div className="module-kpi-icon purple">
            <TrendingUp size={20} />
          </div>

          <div>
            <span>
              Planned Production
            </span>

            <strong>
              {statistics.planned.toLocaleString(
                "en-IN"
              )}
            </strong>

            <small>
              Planned units
            </small>
          </div>

        </div>


        <div className="module-kpi-card">

          <div className="module-kpi-icon green">
            <PackageCheck size={20} />
          </div>

          <div>
            <span>
              Production Efficiency
            </span>

            <strong>
              {statistics.efficiency.toFixed(2)}%
            </strong>

            <small>
              Actual vs planned
            </small>
          </div>

        </div>


        <div className="module-kpi-card">

          <div className="module-kpi-icon red">
            <AlertTriangle size={20} />
          </div>

          <div>
            <span>
              Defect Rate
            </span>

            <strong>
              {statistics.defectRate.toFixed(2)}%
            </strong>

            <small>
              Quality indicator
            </small>
          </div>

        </div>

      </div>


      {/* ======================================
          Production Overview
      ======================================= */}

      <div className="module-card">

        <div className="module-card-header">

          <div>
            <h3>
              Production Records
            </h3>

            <p>
              Detailed production information
              from your enterprise datasets.
            </p>
          </div>

          <div className="record-count">
            {records.length} Records
          </div>

        </div>


        {/* Search */}

        <div className="table-toolbar">

          <div className="search-box">

            <Search size={16} />

            <input
              type="text"
              placeholder="Search product..."
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
        ===================================== */}

        {loading ? (

          <div className="table-state">

            <RefreshCw
              size={24}
              className="spin"
            />

            <p>
              Loading production data...
            </p>

          </div>

        ) : filteredRecords.length === 0 ? (

          <div className="table-state">

            <Factory size={30} />

            <p>
              No production records found.
            </p>

          </div>

        ) : (

          <div className="table-wrapper">

            <table className="enterprise-table">

              <thead>

                <tr>

                  <th>
                    Product
                  </th>

                  <th>
                    Planned
                  </th>

                  <th>
                    Actual
                  </th>

                  <th>
                    Defective
                  </th>

                  <th>
                    Efficiency
                  </th>

                  <th>
                    Production Cost
                  </th>

                  <th>
                    Date
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredRecords.map(
                  (item) => {

                    const planned =
                      Number(
                        item.plannedQuantity ||
                        0
                      );

                    const actual =
                      Number(
                        item.actualQuantity ||
                        0
                      );

                    const efficiency =
                      planned > 0
                        ? (
                            actual /
                            planned
                          ) * 100
                        : 0;

                    const status =
                      getEfficiencyClass(
                        planned,
                        actual
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
                              <Factory
                                size={15}
                              />
                            </div>

                            <div>

                              <strong>
                                {
                                  item.productName ||
                                  "Unknown Product"
                                }
                              </strong>

                              <span>
                                {
                                  item.productId ||
                                  "-"
                                }
                              </span>

                            </div>

                          </div>

                        </td>


                        <td>
                          {planned.toLocaleString(
                            "en-IN"
                          )}
                        </td>


                        <td>
                          {actual.toLocaleString(
                            "en-IN"
                          )}
                        </td>


                        <td>

                          <span
                            className={
                              Number(
                                item.defectiveQuantity ||
                                0
                              ) > 0
                                ? "defect-badge"
                                : "normal-badge"
                            }
                          >
                            {
                              item.defectiveQuantity ||
                              0
                            }
                          </span>

                        </td>


                        <td>

                          <span
                            className={`efficiency-badge ${status}`}
                          >
                            {efficiency.toFixed(
                              1
                            )}
                            %
                          </span>

                        </td>


                        <td>
                          {formatCurrency(
                            item.productionCost
                          )}
                        </td>


                        <td>
                          {formatDate(
                            item.productionDate
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

export default Production;