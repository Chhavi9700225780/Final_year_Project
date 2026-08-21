import { useEffect, useMemo, useState } from "react";

import {
  ShoppingCart,
  IndianRupee,
  TrendingUp,
  MapPin,
  Search,
  RefreshCw,
  Package,
} from "lucide-react";

import { getSales } from "../services/api";

const COMPANY_ID = "68a123456789abcdef123456";

const Sales = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] =
    useState("all");

  // ==========================================
  // Fetch Sales
  // ==========================================

  const fetchSales = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getSales(COMPANY_ID);

      console.log(
        "Sales API:",
        response.data
      );

      const responseData =
        response.data?.data;

      let salesData = [];

      if (Array.isArray(responseData)) {
        salesData = responseData;
      } else if (
        Array.isArray(responseData?.data)
      ) {
        salesData = responseData.data;
      }

      setRecords(salesData);

    } catch (err) {
      console.error(
        "Sales fetch error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to load sales data."
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  // ==========================================
  // Statistics
  // ==========================================

  const statistics = useMemo(() => {
    const totalQuantity = records.reduce(
      (sum, item) =>
        sum + Number(item.quantity || 0),
      0
    );

    const totalRevenue = records.reduce(
      (sum, item) =>
        sum + Number(item.revenue || 0),
      0
    );

    const products = new Set(
      records
        .map((item) => item.productId)
        .filter(Boolean)
    ).size;

    const regions = new Set(
      records
        .map((item) => item.customerRegion)
        .filter(Boolean)
    ).size;

    // ----------------------------------------
    // Top Product
    // ----------------------------------------

    const productSales = {};

    records.forEach((item) => {
      const product =
        item.productName ||
        "Unknown Product";

      if (!productSales[product]) {
        productSales[product] = 0;
      }

      productSales[product] +=
        Number(item.revenue || 0);
    });

    let topProduct = "N/A";
    let topProductRevenue = 0;

    Object.entries(productSales).forEach(
      ([product, revenue]) => {
        if (
          revenue >
          topProductRevenue
        ) {
          topProduct = product;
          topProductRevenue = revenue;
        }
      }
    );

    return {
      totalQuantity,
      totalRevenue,
      products,
      regions,
      topProduct,
      topProductRevenue,
    };
  }, [records]);

  // ==========================================
  // Regions
  // ==========================================

  const regions = useMemo(() => {
    return [
      ...new Set(
        records
          .map(
            (item) =>
              item.customerRegion
          )
          .filter(Boolean)
      ),
    ];
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
        item.productName
          ?.toLowerCase()
          .includes(query) ||
        item.productId
          ?.toLowerCase()
          .includes(query) ||
        item.customerRegion
          ?.toLowerCase()
          .includes(query);

      const matchesRegion =
        regionFilter === "all" ||
        item.customerRegion ===
          regionFilter;

      return (
        matchesSearch &&
        matchesRegion
      );
    });
  }, [
    records,
    search,
    regionFilter,
  ]);

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
            Sales
          </h2>

          <p>
            Analyze sales performance,
            products and customer regions.
          </p>

        </div>

        <button
          className="refresh-button"
          onClick={fetchSales}
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

          <ShoppingCart size={18} />

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

            <IndianRupee size={20} />

          </div>

          <div>

            <span>
              Sales Revenue
            </span>

            <strong>
              {formatCurrency(
                statistics.totalRevenue
              )}
            </strong>

            <small>
              Total recorded revenue
            </small>

          </div>

        </div>


        {/* Quantity */}

        <div className="module-kpi-card">

          <div className="module-kpi-icon blue">

            <ShoppingCart size={20} />

          </div>

          <div>

            <span>
              Units Sold
            </span>

            <strong>
              {statistics.totalQuantity.toLocaleString(
                "en-IN"
              )}
            </strong>

            <small>
              Total quantity sold
            </small>

          </div>

        </div>


        {/* Products */}

        <div className="module-kpi-card">

          <div className="module-kpi-icon purple">

            <Package size={20} />

          </div>

          <div>

            <span>
              Products
            </span>

            <strong>
              {statistics.products}
            </strong>

            <small>
              Products with sales
            </small>

          </div>

        </div>


        {/* Regions */}

        <div className="module-kpi-card">

          <div className="module-kpi-icon red">

            <MapPin size={20} />

          </div>

          <div>

            <span>
              Regions
            </span>

            <strong>
              {statistics.regions}
            </strong>

            <small>
              Customer regions
            </small>

          </div>

        </div>

      </div>


      {/* ======================================
          Top Product
      ======================================= */}

      <div className="module-card sales-highlight">

        <div className="sales-highlight-content">

          <div className="sales-highlight-icon">

            <TrendingUp size={22} />

          </div>

          <div>

            <span>
              Top Performing Product
            </span>

            <strong>
              {statistics.topProduct}
            </strong>

            <small>
              {formatCurrency(
                statistics.topProductRevenue
              )}{" "}
              revenue generated
            </small>

          </div>

        </div>

      </div>


      {/* ======================================
          Sales Records
      ======================================= */}

      <div className="module-card">

        <div className="module-card-header">

          <div>

            <h3>
              Sales Records
            </h3>

            <p>
              Product sales and regional
              performance.
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
              placeholder="Search product or region..."
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
                regionFilter === "all"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setRegionFilter("all")
              }
            >
              All Regions
            </button>

            {regions.map(
              (region) => (

                <button
                  key={region}
                  className={
                    regionFilter ===
                    region
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setRegionFilter(
                      region
                    )
                  }
                >
                  {region}
                </button>

              )
            )}

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
              Loading sales data...
            </p>

          </div>

        ) : filteredRecords.length === 0 ? (

          <div className="table-state">

            <ShoppingCart size={30} />

            <p>
              No sales records found.
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
                    Quantity
                  </th>

                  <th>
                    Revenue
                  </th>

                  <th>
                    Region
                  </th>

                  <th>
                    Sale Date
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredRecords.map(
                  (item) => (

                    <tr
                      key={
                        item._id
                      }
                    >

                      {/* Product */}

                      <td>

                        <div className="product-cell">

                          <div className="product-avatar">

                            <ShoppingCart
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


                      {/* Quantity */}

                      <td>

                        <strong>
                          {Number(
                            item.quantity ||
                            0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                      </td>


                      {/* Revenue */}

                      <td>

                        <strong className="amount-revenue">

                          {formatCurrency(
                            item.revenue
                          )}

                        </strong>

                      </td>


                      {/* Region */}

                      <td>

                        <span className="region-badge">

                          <MapPin
                            size={12}
                          />

                          {
                            item.customerRegion ||
                            "Unknown"
                          }

                        </span>

                      </td>


                      {/* Date */}

                      <td>

                        {formatDate(
                          item.saleDate
                        )}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
};

export default Sales;