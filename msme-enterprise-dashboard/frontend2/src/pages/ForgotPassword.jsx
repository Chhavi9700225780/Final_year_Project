
import { useState } from "react";
import API from "../services/api";
import "./styles/Login.css";

const ForgotPassword = ({
  theme,
  onToggleTheme,
  onBackToLogin,
}) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await API.post("/auth/forgot-password", { email });
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to process your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <button
        className="login-theme-toggle"
        onClick={onToggleTheme}
        type="button"
      >
        {theme === "dark" ? "LIGHT MODE" : "DARK MODE"}
      </button>

      <div className="login-panel">
        <div className="login-brand">FORGE</div>
        <div className="login-divider" />

        <div className="login-heading">
          <span className="login-eyebrow">ACCOUNT RECOVERY</span>
          <h1>Forgot Password?</h1>
          <p>
            Enter your registered email address to receive a
            password reset link.
          </p>
        </div>

        {error && (
          <div className="login-error">{error}</div>
        )}

        {success ? (
          <div className="login-success">
            If an active account exists for that email, a
            password reset link has been sent. Please check
            your inbox and spam folder.
          </div>
        ) : (
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label>EMAIL ADDRESS</label>
              <input
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? "SENDING..." : "SEND RESET LINK"}
            </button>
          </form>
        )}

        <div className="login-register">
          <button type="button" onClick={onBackToLogin}>
            BACK TO LOGIN
          </button>
        </div>
      </div>

      <div className="login-grid" />
    </div>
  );
};

export default ForgotPassword;
