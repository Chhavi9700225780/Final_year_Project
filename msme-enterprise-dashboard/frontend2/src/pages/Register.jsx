import { useState } from "react";
import API from "../services/api";
import "./styles/Register.css";
const Register = ({ onRegister, theme, onToggleTheme, onBackToLogin }) => {
  // Company
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [annualRevenue, setAnnualRevenue] = useState("");

  // Admin
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // -----------------------------
    // Frontend validation
    // -----------------------------

    if (
      !companyName.trim() ||
      !industry.trim() ||
      !location.trim() ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (
      employeeCount &&
      Number(employeeCount) < 1
    ) {
      setError("Employee count must be at least 1.");
      return;
    }

    if (
      annualRevenue &&
      Number(annualRevenue) < 0
    ) {
      setError("Annual revenue cannot be negative.");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post(
        "/auth/register",
        {
          company: {
            name: companyName.trim(),
            industry: industry.trim(),
            location: location.trim(),

            employeeCount: employeeCount
              ? Number(employeeCount)
              : undefined,

            annualRevenue: annualRevenue
              ? Number(annualRevenue)
              : undefined,
          },

          user: {
            name: name.trim(),
            email: email.trim(),
            password,
          },
        }
      );

      // Backend has already created the HttpOnly cookie.
      // We only pass the returned user to App.
      onRegister(response.data.user);

    } catch (err) {
      console.error(
        "Registration error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* ==================================================
          THEME TOGGLE
          ================================================== */}

      <button
        type="button"
        className="login-theme-toggle"
        onClick={onToggleTheme}
      >
        {theme === "dark"
          ? "☀ LIGHT"
          : "◐ DARK"}
      </button>


      {/* ==================================================
          REGISTER PANEL
          ================================================== */}

      <div className="register-panel">

        {/* BRAND */}

        <div className="login-brand">

          <div className="login-brand-icon">
            ⚙
          </div>

          <div>
            <div className="login-brand-name">
              FORGE
            </div>

            <div className="login-brand-subtitle">
              MSME OPERATIONS COMMAND CENTER
            </div>
          </div>

        </div>


        <div className="login-divider" />


        {/* HEADING */}

        <div className="login-heading">

          <div className="login-eyebrow">
            NEW ENTERPRISE
          </div>

          <h1>
            Create Workspace
          </h1>

          <p>
            Set up your company and administrator
            account to get started.
          </p>

        </div>


        {/* ERROR */}

        {error && (
          <div className="login-error">
            <span>!</span>
            {error}
          </div>
        )}


        {/* ==================================================
            FORM
            ================================================== */}

        <form
          className="register-form"
          onSubmit={handleSubmit}
        >

          {/* ================================================
              COMPANY
              ================================================ */}

          <div className="register-section">

            <div className="register-section-title">
              01 / COMPANY PROFILE
            </div>


            <div className="register-grid">

              <div className="login-field register-full">

                <label htmlFor="companyName">
                  COMPANY NAME *
                </label>

                <input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) =>
                    setCompanyName(e.target.value)
                  }
                  placeholder="ABC Manufacturing"
                  disabled={loading}
                />

              </div>


              <div className="login-field">

                <label htmlFor="industry">
                  INDUSTRY *
                </label>

                <input
                  id="industry"
                  type="text"
                  value={industry}
                  onChange={(e) =>
                    setIndustry(e.target.value)
                  }
                  placeholder="Manufacturing"
                  disabled={loading}
                />

              </div>


              <div className="login-field">

                <label htmlFor="location">
                  LOCATION *
                </label>

                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) =>
                    setLocation(e.target.value)
                  }
                  placeholder="Delhi"
                  disabled={loading}
                />

              </div>


              <div className="login-field">

                <label htmlFor="employeeCount">
                  EMPLOYEES
                </label>

                <input
                  id="employeeCount"
                  type="number"
                  min="1"
                  value={employeeCount}
                  onChange={(e) =>
                    setEmployeeCount(e.target.value)
                  }
                  placeholder="50"
                  disabled={loading}
                />

              </div>


              <div className="login-field">

                <label htmlFor="annualRevenue">
                  ANNUAL REVENUE
                </label>

                <input
                  id="annualRevenue"
                  type="number"
                  min="0"
                  value={annualRevenue}
                  onChange={(e) =>
                    setAnnualRevenue(e.target.value)
                  }
                  placeholder="5000000"
                  disabled={loading}
                />

              </div>

            </div>

          </div>


          {/* ================================================
              ADMIN ACCOUNT
              ================================================ */}

          <div className="register-section">

            <div className="register-section-title">
              02 / ADMINISTRATOR ACCOUNT
            </div>


            <div className="register-grid">

              <div className="login-field">

                <label htmlFor="name">
                  FULL NAME *
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Your Name"
                  autoComplete="name"
                  disabled={loading}
                />

              </div>


              <div className="login-field">

                <label htmlFor="email">
                  EMAIL ADDRESS *
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="admin@company.com"
                  autoComplete="email"
                  disabled={loading}
                />

              </div>


              <div className="login-field">

                <label htmlFor="password">
                  PASSWORD *
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                  disabled={loading}
                />

              </div>


              <div className="login-field">

                <label htmlFor="confirmPassword">
                  CONFIRM PASSWORD *
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  disabled={loading}
                />

              </div>

            </div>

          </div>


          {/* ================================================
              SUBMIT
              ================================================ */}

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >

            {loading ? (
              <>
                <span className="login-spinner" />
                CREATING WORKSPACE...
              </>
            ) : (
              <>
                CREATE WORKSPACE
                <span>→</span>
              </>
            )}

          </button>

        </form>


        {/* FOOTER */}

        <div className="login-footer">

          <span>
            FORGE ENTERPRISE PLATFORM
          </span>

          <span>
            FIRST USER = ADMIN
          </span>

        </div>
        <button
  type="button"
  className="login-register-link"
  onClick={onBackToLogin}
>
  ← BACK TO SIGN IN
</button>

      </div>


      {/* BACKGROUND */}

      <div className="login-grid" />

      <div className="login-corner login-corner-tl" />

      <div className="login-corner login-corner-br" />

    </div>
  );
};

export default Register;