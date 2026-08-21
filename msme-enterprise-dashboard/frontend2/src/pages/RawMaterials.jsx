import { useEffect, useMemo, useState } from "react";

import {
  Package,
  Boxes,
  IndianRupee,
  AlertTriangle,
  Search,
  RefreshCw,
  Truck,
} from "lucide-react";

import { getRawMaterials } from "../services/api";

const COMPANY_ID = "68a123456789abcdef123456";

const RawMaterials = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // ==========================================
  // Fetch Raw Materials
  // ==========================================

  const fetchRawMaterials = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getRawMaterials(COMPANY_ID);

      console.log(
        "Raw Materials API:",
        response.data
      );

      const responseData =
        response.data?.data;

      let materialData = [];

      if (Array.isArray(responseData)) {
        materialData = responseData;
      } else if (
        Array.isArray(responseData?.data)
      ) {
        materialData = responseData.data;
      }

      setRecords(materialData);

    } catch (err) {
      console.error(
        "Raw Materials fetch error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to load raw material data."
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRawMaterials();
  }, []);

  // ==========================================
  // Statistics
  // ==========================================

  const statistics = useMemo(() => {
    const totalStock = records.reduce(
      (sum, item) =>
        sum + Number(item.currentStock || 0),
      0
    );

    const inventoryValue = records.reduce(
      (sum, item) =>
        sum +
        Number(item.currentStock || 0) *
          Number(item.unitCost || 0),
      0
    );

    const lowStock = records.filter(
      (item) =>
        Number(item.currentStock || 0) <=
        Number(item.minimumStock || 0)
    ).length;

    const totalSuppliers = new Set(
      records
        .map((item) => item.supplier)
        .filter(Boolean)
    ).size;

    return {
      totalMaterials: records.length,
      totalStock,
      inventoryValue,
      lowStock,
      totalSuppliers,
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
        item.materialName
          ?.toLowerCase()
          .includes(query) ||
        item.materialId
          ?.toLowerCase()
          .includes(query) ||
        item.supplier
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [records, search]);

  // ==========================================
  // Stock Status
  // ==========================================

  const getStockStatus = (
    current,
    minimum
  ) => {
    if (current <= minimum) {
      return {
        label: "Low Stock",
        className: "stock-danger",
      };
    }

    if (current <= minimum * 1.5) {
      return {
        label: "Monitor",
        className: "stock-warning",
      };
    }

    return {
      label: "Healthy",
      className: "stock-good",
    };
  };

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
            Raw Materials
          </h2>

          <p>
            Monitor material availability,
            suppliers and procurement risks.
          </p>

        </div>

        <button
          className="refresh-button"
          onClick={fetchRawMaterials}
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

          <AlertTriangle size={18} />

          {error}

        </div>

      )}


      {/* ======================================
          KPI Cards
      ======================================= */}

      <div className="module-kpi-grid">

        {/* Total Materials */}

        <div className="module-kpi-card">

          <div className="module-kpi-icon blue">

            <Boxes size={20} />

          </div>

          <div>

            <span>
              Total Materials
            </span>

            <strong>
              {statistics.totalMaterials}
            </strong>

            <small>
              Material records
            </small>

          </div>

        </div>


        {/* Current Stock */}

        <div className="module-kpi-card">

          <div className="module-kpi-icon purple">

            <Package size={20} />

          </div>

          <div>

            <span>
              Current Stock
            </span>

            <strong>
              {statistics.totalStock.toLocaleString(
                "en-IN"
              )}
            </strong>

            <small>
              Total material units
            </small>

          </div>

        </div>


        {/* Inventory Value */}

        <div className="module-kpi-card">

          <div className="module-kpi-icon green">

            <IndianRupee size={20} />

          </div>

          <div>

            <span>
              Inventory Value
            </span>

            <strong>
              {formatCurrency(
                statistics.inventoryValue
              )}
            </strong>

            <small>
              Current stock value
            </small>

          </div>

        </div>


        {/* Low Stock */}

        <div className="module-kpi-card">

          <div className="module-kpi-icon red">

            <AlertTriangle size={20} />

          </div>

          <div>

            <span>
              Low Stock
            </span>

            <strong>
              {statistics.lowStock}
            </strong>

            <small>
              Requires attention
            </small>

          </div>

        </div>

      </div>


      {/* ======================================
          Supplier Summary
      ======================================= */}

      <div className="module-card supplier-summary">

        <div className="supplier-summary-content">

          <div className="module-kpi-icon blue">

            <Truck size={20} />

          </div>

          <div>

            <strong>
              {statistics.totalSuppliers}
            </strong>

            <span>
              Active Suppliers
            </span>

          </div>

        </div>

      </div>


      {/* ======================================
          Materials Table
      ======================================= */}

      <div className="module-card">

        <div className="module-card-header">

          <div>

            <h3>
              Raw Material Records
            </h3>

            <p>
              Current material stock and supplier
              information.
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
              placeholder="Search material or supplier..."
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
              Loading raw materials...
            </p>

          </div>

        ) : filteredRecords.length === 0 ? (

          <div className="table-state">

            <Package size={30} />

            <p>
              No raw material records found.
            </p>

          </div>

        ) : (

          <div className="table-wrapper">

            <table className="enterprise-table">

              <thead>

                <tr>

                  <th>
                    Material
                  </th>

                  <th>
                    Supplier
                  </th>

                  <th>
                    Current Stock
                  </th>

                  <th>
                    Minimum Stock
                  </th>

                  <th>
                    Unit Cost
                  </th>

                  <th>
                    Stock Value
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Last Updated
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredRecords.map(
                  (item) => {

                    const current =
                      Number(
                        item.currentStock ||
                        0
                      );

                    const minimum =
                      Number(
                        item.minimumStock ||
                        0
                      );

                    const stockValue =
                      current *
                      Number(
                        item.unitCost || 0
                      );

                    const status =
                      getStockStatus(
                        current,
                        minimum
                      );

                    return (

                      <tr
                        key={
                          item._id
                        }
                      >

                        {/* Material */}

                        <td>

                          <div className="product-cell">

                            <div className="product-avatar">

                              <Package
                                size={15}
                              />

                            </div>

                            <div>

                              <strong>
                                {
                                  item.materialName ||
                                  "Unknown Material"
                                }
                              </strong>

                              <span>
                                {
                                  item.materialId ||
                                  "-"
                                }
                              </span>

                            </div>

                          </div>

                        </td>


                        {/* Supplier */}

                        <td>

                          <div className="warehouse-cell">

                            <Truck
                              size={14}
                            />

                            {
                              item.supplier ||
                              "Unknown"
                            }

                          </div>

                        </td>


                        {/* Current */}

                        <td>

                          <strong>
                            {current.toLocaleString(
                              "en-IN"
                            )}
                          </strong>

                        </td>


                        {/* Minimum */}

                        <td>

                          {minimum.toLocaleString(
                            "en-IN"
                          )}

                        </td>


                        {/* Unit Cost */}

                        <td>

                          {formatCurrency(
                            item.unitCost
                          )}

                        </td>


                        {/* Stock Value */}

                        <td>

                          <strong>
                            {formatCurrency(
                              stockValue
                            )}
                          </strong>

                        </td>


                        {/* Status */}

                        <td>

                          <span
                            className={`stock-badge ${status.className}`}
                          >

                            {status.label}

                          </span>

                        </td>


                        {/* Date */}

                        <td>

                          {formatDate(
                            item.lastUpdated
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

export default RawMaterials;