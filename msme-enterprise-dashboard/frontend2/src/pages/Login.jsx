import { useState } from "react";
import API from "../services/api";
import "./styles/Login.css";
const Login = ({
  onLogin,
  theme,
  onToggleTheme,
  onRegisterClick,
  onForgotPasswordClick,
})  => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/auth/login", {
        email: email.trim(),
        password,
      });

      // JWT is stored by the browser as an HttpOnly cookie.
      // React never receives or stores the token.
      onLogin(response.data.user);

    } catch (err) {
      console.error("Login error:", err);

      const message =
        err.response?.data?.message ||
        "Unable to login. Please check your credentials.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* THEME TOGGLE */}

      <button
        type="button"
        className="login-theme-toggle"
        onClick={onToggleTheme}
      >
        {theme === "dark" ? "☀ LIGHT" : "◐ DARK"}
      </button>


      {/* LOGIN PANEL */}

      <div className="login-panel">

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
            SECURE ACCESS
          </div>

          <h1>
            Welcome Back
          </h1>

          <p>
            Sign in to access your enterprise
            operations dashboard.
          </p>

        </div>


        {/* ERROR */}

        {error && (
          <div className="login-error">
            <span>!</span>
            {error}
          </div>
        )}


        {/* FORM */}

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >

          {/* EMAIL */}

          <div className="login-field">

            <label htmlFor="email">
              EMAIL ADDRESS
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


          {/* PASSWORD */}

          <div className="login-field">

            <label htmlFor="password">
              PASSWORD
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={loading}
            />

          </div>
          <div className="login-forgot-password">
  <button
    type="button"
    onClick={onForgotPasswordClick}
  >
    FORGOT PASSWORD?
  </button>
</div>

          {/* SUBMIT */}

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >

            {loading ? (
              <>
                <span className="login-spinner" />
                AUTHENTICATING...
              </>
            ) : (
              <>
                SIGN IN
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
            SECURE SESSION
          </span>

        </div>
          <button
  type="button"
  className="login-register-link"
  onClick={onRegisterClick}
>
  DON'T HAVE AN ACCOUNT? CREATE WORKSPACE →
</button>
      </div>


      {/* BACKGROUND */}

      <div className="login-grid" />

      <div className="login-corner login-corner-tl" />

      <div className="login-corner login-corner-br" />
      
    </div>
  );
};

export default Login;