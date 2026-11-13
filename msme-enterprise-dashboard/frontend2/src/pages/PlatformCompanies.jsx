
import { useCallback, useEffect, useState } from "react";
import API from "../services/api";
import "./styles/PlatformCompanies.css";

const PAGE_SIZE = 10;

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const PlatformCompanies = () => {
  // =========================================
  // STATE
  // =========================================

  const [companies, setCompanies] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updatingCompanyId, setUpdatingCompanyId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  // =========================================
  // FETCH COMPANIES
  // =========================================

  const fetchCompanies = useCallback(async (signal) => {
    setLoading(true);
    setError("");

    try {
      const response = await API.get("/platform/companies", {
        params: {
          page,
          limit: PAGE_SIZE,
          ...(search ? { search } : {}),
        },
        signal,
      });

      const result = response.data?.data;

      if (
        !response.data?.success ||
        !Array.isArray(result?.companies) ||
        !result?.pagination
      ) {
        throw new Error("Invalid company directory response.");
      }

      setCompanies(result.companies);
      setPagination(result.pagination);
    } catch (err) {
      if (
        err.code === "ERR_CANCELED" ||
        err.name === "CanceledError"
      ) {
        return;
      }

      console.error("Company directory error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load companies."
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [page, search]);

  useEffect(() => {
    const controller = new AbortController();

    fetchCompanies(controller.signal);

    return () => controller.abort();
  }, [fetchCompanies]);

  // =========================================
  // SEARCH
  // =========================================

  const handleSearch = (event) => {
    event.preventDefault();

    const normalizedSearch = searchInput.trim();

    if (normalizedSearch.length > 100) {
      setError("Search cannot exceed 100 characters.");
      return;
    }

    setActionError("");
    setActionMessage("");
    setPage(1);
    setSearch(normalizedSearch);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
    setError("");
  };

  // =========================================
  // ACTIVATE / DEACTIVATE COMPANY
  // =========================================

  const handleCompanyStatusChange = async (company) => {
    if (updatingCompanyId !== null) return;

    const nextStatus = !company.isActive;

    const action = nextStatus ? "activate" : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${company.name}"?\n\n${
        nextStatus
          ? "Company users will regain platform access."
          : "All users belonging to this company will lose platform access."
      }`
    );

    if (!confirmed) return;

    setUpdatingCompanyId(company._id);
    setActionError("");
    setActionMessage("");

    try {
      const response = await API.patch(
        `/platform/companies/${company._id}/status`,
        { isActive: nextStatus }
      );

      if (
        !response.data?.success ||
        response.data?.data?.company?.isActive !== nextStatus
      ) {
        throw new Error(
          response.data?.message ||
            "The server did not confirm the company status change."
        );
      }

      // Update local state only after server confirmation.
      setCompanies((currentCompanies) =>
        currentCompanies.map((item) =>
          item._id === company._id
            ? {
                ...item,
                isActive: nextStatus,
              }
            : item
        )
      );

      setActionMessage(
        `${company.name} has been ${
          nextStatus ? "activated" : "deactivated"
        } successfully.`
      );
    } catch (err) {
      console.error("Company status update error:", err);

      setActionError(
        err.response?.data?.message ||
          err.message ||
          "Unable to update company status. Please try again."
      );
    } finally {
      setUpdatingCompanyId(null);
    }
  };

  // =========================================
  // RENDER
  // =========================================

  return (
    <section className="platform-companies">

      {/* HEADER */}
      <div className="platform-companies-header">
        <div>
          <span className="platform-eyebrow">
            PLATFORM / ORGANIZATIONS
          </span>

          <h3>Company Directory</h3>

          <p>
            View and monitor all companies registered on the platform.
          </p>
        </div>

        <span className="platform-company-count">
          {pagination
            ? `${pagination.totalCompanies} ORGANIZATIONS`
            : "LOADING..."}
        </span>
      </div>

      {/* SEARCH */}
      <form
        className="platform-company-search"
        onSubmit={handleSearch}
      >
        <input
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search company, industry or location..."
          maxLength={100}
          aria-label="Search companies"
        />

        <button
          type="submit"
          disabled={loading || updatingCompanyId !== null}
        >
          SEARCH
        </button>

        {search && (
          <button
            type="button"
            className="platform-clear-search"
            onClick={clearSearch}
            disabled={loading || updatingCompanyId !== null}
          >
            CLEAR
          </button>
        )}
      </form>

      {/* ACTION SUCCESS */}
      {actionMessage && (
        <div
          className="platform-company-success"
          role="status"
        >
          {actionMessage}
        </div>
      )}

      {/* ACTION ERROR */}
      {actionError && (
        <div
          className="platform-company-error"
          role="alert"
        >
          {actionError}
        </div>
      )}

      {/* FETCH ERROR */}
      {error && (
        <div
          className="platform-company-error"
          role="alert"
        >
          <span>{error}</span>

          <button
            type="button"
            disabled={loading}
            onClick={() => fetchCompanies()}
          >
            RETRY
          </button>
        </div>
      )}

      {/* COMPANY TABLE */}
      <div className="platform-company-table-wrapper">
        <table className="platform-company-table">

          <thead>
            <tr>
              <th>COMPANY</th>
              <th>INDUSTRY</th>
              <th>LOCATION</th>
              <th>EMPLOYEES</th>
              <th>USERS</th>
              <th>REGISTERED</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={8}
                  className="platform-company-message"
                >
                  LOADING COMPANY DIRECTORY...
                </td>
              </tr>
            ) : companies.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="platform-company-message"
                >
                  {search
                    ? "NO MATCHING COMPANIES FOUND."
                    : "NO COMPANIES REGISTERED YET."}
                </td>
              </tr>
            ) : (
              companies.map((company) => (
                <tr key={company._id}>

                  <td className="platform-company-name">
                    {company.name || "Unnamed Company"}
                  </td>

                  <td>{company.industry || "—"}</td>

                  <td>{company.location || "—"}</td>

                  <td>{company.employeeCount ?? "—"}</td>

                  <td>{company.totalUsers ?? 0}</td>

                  <td>{formatDate(company.createdAt)}</td>

                  {/* STATUS */}
                  <td>
                    <span
                      className={`platform-company-status ${
                        company.isActive ? "active" : "inactive"
                      }`}
                    >
                      {company.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td>
                    <button
                      type="button"
                      className={`platform-company-action ${
                        company.isActive
                          ? "deactivate"
                          : "activate"
                      }`}
                      disabled={updatingCompanyId !== null}
                      aria-label={`${
                        company.isActive ? "Deactivate" : "Activate"
                      } ${company.name}`}
                      onClick={() =>
                        handleCompanyStatusChange(company)
                      }
                    >
                      {updatingCompanyId === company._id
                        ? "UPDATING..."
                        : company.isActive
                          ? "DEACTIVATE"
                          : "ACTIVATE"}
                    </button>
                  </td>

                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>

      {/* PAGINATION */}
      <div className="platform-company-pagination">

        <span>
          {pagination
            ? `PAGE ${pagination.currentPage} OF ${pagination.totalPages}`
            : "—"}
        </span>

        <div>
          <button
            type="button"
            disabled={
              loading ||
              updatingCompanyId !== null ||
              !pagination?.hasPreviousPage
            }
            onClick={() =>
              setPage((current) => Math.max(1, current - 1))
            }
          >
            PREVIOUS
          </button>

          <button
            type="button"
            disabled={
              loading ||
              updatingCompanyId !== null ||
              !pagination?.hasNextPage
            }
            onClick={() =>
              setPage((current) => current + 1)
            }
          >
            NEXT
          </button>
        </div>

      </div>

    </section>
  );
};

export default PlatformCompanies;
