
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../services/api";
import "./styles/AcceptInvitation.css";

export default function AcceptInvitation({ onGoToLogin }) {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid invitation link. No token was provided.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await API.post("/invitations/accept", {
        token,
        password,
        confirmPassword,
      });

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to accept invitation. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="accept-invitation-page">
      <div className="accept-invitation-card">
        <div className="invitation-eyebrow">
          MSME / WORKSPACE / INVITATION
        </div>

        {!success ? (
          <>
            <h1>JOIN WORKSPACE</h1>
            <p className="invitation-description">
              You've been invited to join a company workspace.
              Create your password to activate your account.
            </p>

            <form onSubmit={handleSubmit}>
              <label htmlFor="invite-password">CREATE PASSWORD</label>
              <input
                id="invite-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                minLength={8}
                autoComplete="new-password"
                required
              />

              <label htmlFor="invite-confirm-password">
                CONFIRM PASSWORD
              </label>
              <input
                id="invite-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                minLength={8}
                autoComplete="new-password"
                required
              />

              {error && (
                <div className="invitation-error">{error}</div>
              )}

              <button type="submit" disabled={loading || !token}>
                {loading ? "CREATING ACCOUNT..." : "ACCEPT INVITATION"}
              </button>
            </form>
          </>
        ) : (
          <div className="invitation-success">
            <h1>WELCOME ABOARD!</h1>
            <p>
              Your account has been created successfully.
              You can now sign in using your invited email and password.
            </p>

            <button onClick={onGoToLogin}>
              GO TO LOGIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
