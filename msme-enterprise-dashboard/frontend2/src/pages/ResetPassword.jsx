
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../services/api";
import "./styles/Login.css";

const ResetPassword = ({
  theme,
  onToggleTheme,
  onGoToLogin,
}) => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid password reset link.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/auth/reset-password", {
        token,
        newPassword: password,
        confirmPassword,
      });

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <button
        type="button"
        className="login-theme-toggle"
        onClick={onToggleTheme}
      >
        {theme === "dark" ? "☀ LIGHT" : "◐ DARK"}
      </button>

      <div className="login-panel">
        <div className="login-brand">
          <div className="login-brand-icon">⚙</div>

          <div>
            <div className="login-brand-name">FORGE</div>
            <div className="login-brand-subtitle">
              MSME OPERATIONS COMMAND CENTER
            </div>
          </div>
        </div>

        <div className="login-divider" />

        <div className="login-heading">
          <div className="login-eyebrow">ACCOUNT SECURITY</div>
          <h1>{success ? "Password Updated" : "Reset Password"}</h1>
          <p>
            {success
              ? "Your password has been changed successfully. You can now sign in."
              : "Create a new password for your FORGE account."}
          </p>
        </div>

        {error && (
          <div className="login-error">
            <span>!</span>
            {error}
          </div>
        )}

        {!success && (
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="newPassword">NEW PASSWORD</label>
              <input
                id="newPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                disabled={loading}
                required
                minLength={8}
              />
            </div>

            <div className="login-field">
              <label htmlFor="confirmPassword">CONFIRM PASSWORD</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Enter password again"
                autoComplete="new-password"
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={loading || !token}
            >
              {loading ? (
                <>
                  <span className="login-spinner" />
                  UPDATING PASSWORD...
                </>
              ) : (
                <>
                  RESET PASSWORD <span>→</span>
                </>
              )}
            </button>
          </form>
        )}

        <div className="login-footer">
          <span>FORGE ENTERPRISE PLATFORM</span>
          <span>SECURE SESSION</span>
        </div>

        <button
          type="button"
          className="login-register-link"
          onClick={onGoToLogin}
        >
          ← BACK TO SIGN IN
        </button>
      </div>

      <div className="login-grid" />
      <div className="login-corner login-corner-tl" />
      <div className="login-corner login-corner-br" />
    </div>
  );
};

export default ResetPassword;
