import { useEffect, useMemo, useState } from "react";

import {
  Package,
  Boxes,
  ShoppingCart,
  AlertTriangle,
  Search,
  RefreshCw,
  Warehouse,
} from "lucide-react";

import { getInventory } from "../services/api";

const COMPANY_ID = "68a123456789abcdef123456";

const Inventory = () => {
  const [records, setRecords] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  // ==========================================
  // Fetch Inventory
  // ==========================================

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getInventory(COMPANY_ID);

console.log(
  "Inventory API:",
  response.data
);

console.log(
  "FIRST INVENTORY RECORD:",
  response.data?.data?.[0]
);

      const responseData =
        response.data?.data;

      let inventoryData = [];

      if (Array.isArray(responseData)) {
        inventoryData = responseData;
      } else if (
        Array.isArray(responseData?.data)
      ) {
        inventoryData =
          responseData.data;
      }

      setRecords(inventoryData);

    } catch (err) {
      console.error(
        "Inventory fetch error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to load inventory data."
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // ==========================================
  // Statistics
  // ==========================================

  const statistics = useMemo(() => {
    const totalStock = records.reduce(
      (sum, item) =>
        sum +
        Number(item.closingStock || 0),
      0
    );

    const openingStock = records.reduce(
      (sum, item) =>
        sum +
        Number(item.openingStock || 0),
      0
    );

    const produced = records.reduce(
      (sum, item) =>
        sum +
        Number(item.producedQuantity || 0),
      0
    );

    const sold = records.reduce(
      (sum, item) =>
        sum +
        Number(item.soldQuantity || 0),
      0
    );

    /*
     * We don't have a minimumStock field
     * in InventoryRecord.
     *
     * Therefore, low stock here is based
     * on closing stock <= 20% of opening stock.
     */

    const lowStock = records.filter(
      (item) => {
        const opening =
          Number(
            item.openingStock || 0
          );

        const closing =
          Number(
            item.closingStock || 0
          );

        if (opening === 0) {
          return false;
        }

        return (
          closing <=
          opening * 0.2
        );
      }
    ).length;

    return {
      totalStock,
      openingStock,
      produced,
      sold,
      lowStock,
      totalProducts: records.length,
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
          .includes(query) ||
        item.warehouse
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [records, search]);

  // ==========================================
  // Stock Status
  // ==========================================

  const getStockStatus = (
    opening,
    closing
  ) => {
    if (!opening) {
      return {
        label: "Unknown",
        className: "stock-neutral",
      };
    }

    const percentage =
      (closing / opening) * 100;

    if (percentage <= 20) {
      return {
        label: "Low Stock",
        className: "stock-danger",
      };
    }

    if (percentage <= 40) {
      return {
        label: "Moderate",
        className: "stock-warning",
      };
    }

    return {
      label: "Healthy",
      className: "stock-good",
    };
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
            Inventory
          </h2>

          <p>
            Monitor stock levels, warehouse
            activity and inventory movement.
          </p>

        </div>

        <button
          className="refresh-button"
          onClick={fetchInventory}
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

        {/* Total Stock */}

        <div className="module-kpi-card">

          <div className="module-kpi-icon blue">

            <Package size={20} />

          </div>

          <div>

            <span>
              Total Inventory
            </span>

            <strong>
              {statistics.totalStock.toLocaleString(
                "en-IN"
              )}
            </strong>

            <small>
              Current closing stock
            </small>

          </div>

        </div>


        {/* Products */}

        <div className="module-kpi-card">

          <div className="module-kpi-icon purple">

            <Boxes size={20} />

          </div>

          <div>

            <span>
              Products
            </span>

            <strong>
              {statistics.totalProducts}
            </strong>

            <small>
              Inventory records
            </small>

          </div>

        </div>


        {/* Sold */}

        <div className="module-kpi-card">

          <div className="module-kpi-icon green">

            <ShoppingCart size={20} />

          </div>

          <div>

            <span>
              Units Sold
            </span>

            <strong>
              {statistics.sold.toLocaleString(
                "en-IN"
              )}
            </strong>

            <small>
              Recorded sales movement
            </small>

          </div>

        </div>


        {/* Low Stock */}

        <div className="module-kpi-card">

          <div className="module-kpi-icon red">

            <AlertTriangle
              size={20}
            />

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
          Inventory Table
      ======================================= */}

      <div className="module-card">

        <div className="module-card-header">

          <div>

            <h3>
              Inventory Records
            </h3>

            <p>
              Current inventory position across
              products and warehouses.
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
              placeholder="Search product or warehouse..."
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
              Loading inventory data...
            </p>

          </div>

        ) : filteredRecords.length === 0 ? (

          <div className="table-state">

            <Package size={30} />

            <p>
              No inventory records found.
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
                    Opening
                  </th>

                  <th>
                    Produced
                  </th>

                  <th>
                    Sold
                  </th>

                  <th>
                    Closing Stock
                  </th>

                  <th>
                    Warehouse
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Date
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredRecords.map(
                  (item) => {

                    const opening =
                      Number(
                        item.openingStock ||
                        0
                      );

                    const closing =
                      Number(
                        item.closingStock ||
                        0
                      );

                    const status =
                      getStockStatus(
                        opening,
                        closing
                      );

                    return (

                      <tr
                        key={
                          item._id
                        }
                      >

                        {/* Product */}

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


                        {/* Opening */}

                        <td>

                          {opening.toLocaleString(
                            "en-IN"
                          )}

                        </td>


                        {/* Produced */}

                        <td>

                          {Number(
                            item.producedQuantity ||
                            0
                          ).toLocaleString(
                            "en-IN"
                          )}

                        </td>


                        {/* Sold */}

                        <td>

                          {Number(
                            item.soldQuantity ||
                            0
                          ).toLocaleString(
                            "en-IN"
                          )}

                        </td>


                        {/* Closing */}

                        <td>

                          <strong>

                            {closing.toLocaleString(
                              "en-IN"
                            )}

                          </strong>

                        </td>


                        {/* Warehouse */}

                        <td>

                          <div className="warehouse-cell">

                            <Warehouse
                              size={14}
                            />

                            {
                              item.warehouse ||
                              "Main Warehouse"
                            }

                          </div>

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
                            item.recordDate
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

export default Inventory;