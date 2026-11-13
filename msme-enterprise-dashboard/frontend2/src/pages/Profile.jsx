
import { useState } from "react";
import API from "../services/api";
import "./styles/Profile.css";

export default function Profile({ user, onProfileUpdate }) {
  const [name, setName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const saveProfile = async (event) => {
    event.preventDefault();

    try {
      setSavingProfile(true);
      setProfileMessage("");
      setProfileError("");

      const response = await API.put("/auth/profile", {
        name: name.trim(),
      });

      onProfileUpdate?.(response.data.user);
      setProfileMessage("PROFILE UPDATED SUCCESSFULLY.");
    } catch (error) {
      setProfileError(
        error.response?.data?.message || "Unable to update profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();

    try {
      setSavingPassword(true);
      setPasswordMessage("");
      setPasswordError("");

      const response = await API.put("/auth/change-password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setPasswordMessage(
        response.data.message || "PASSWORD CHANGED SUCCESSFULLY."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordError(
        error.response?.data?.message || "Unable to change password."
      );
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="forge-profile">
      <div className="profile-heading">
        <div>
          <div className="profile-eyebrow">
            MSME / ACCOUNT / PERSONNEL
          </div>
          <h1>MY ACCOUNT</h1>
          <p>Manage your personal information and security credentials.</p>
        </div>

        <span className="profile-account-status">
          <i /> ACCOUNT ACTIVE
        </span>
      </div>

      <section className="profile-identity">
        <div className="profile-large-avatar">
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>

        <div className="profile-identity-info">
          <h2>{user?.name || "User"}</h2>
          <span>{user?.email}</span>
          <span className="profile-role">
            {user?.role?.toUpperCase() || "USER"}
          </span>
        </div>
      </section>

      <div className="profile-grid">
        <section className="profile-panel">
          <div className="profile-panel-heading">
            <h2>PERSONAL INFORMATION</h2>
            <span>ACCOUNT DETAILS</span>
          </div>

          <form onSubmit={saveProfile}>
            <label>
              FULL NAME
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={100}
                required
              />
            </label>

            <label>
              EMAIL ADDRESS
              <input
                type="email"
                value={user?.email || ""}
                disabled
              />
              <small>Email address cannot be changed here.</small>
            </label>

            <label>
              ACCOUNT ROLE
              <input
                value={user?.role?.toUpperCase() || "USER"}
                disabled
              />
            </label>

            {profileMessage && (
              <div className="profile-feedback success">
                {profileMessage}
              </div>
            )}

            {profileError && (
              <div className="profile-feedback error">
                {profileError}
              </div>
            )}

            <button
              type="submit"
              className="profile-submit"
              disabled={savingProfile || !name.trim()}
            >
              {savingProfile ? "SAVING..." : "SAVE PROFILE"}
            </button>
          </form>
        </section>

        <section className="profile-panel">
          <div className="profile-panel-heading">
            <h2>SECURITY & PASSWORD</h2>
            <span>UPDATE LOGIN CREDENTIALS</span>
          </div>

          <form onSubmit={changePassword}>
            <label>
              CURRENT PASSWORD
              <input
                type="password"
                value={currentPassword}
                onChange={(event) =>
                  setCurrentPassword(event.target.value)
                }
                autoComplete="current-password"
                required
              />
            </label>

            <label>
              NEW PASSWORD
              <input
                type="password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(event.target.value)
                }
                minLength={8}
                autoComplete="new-password"
                required
              />
              <small>Use at least 8 characters.</small>
            </label>

            <label>
              CONFIRM NEW PASSWORD
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                minLength={8}
                autoComplete="new-password"
                required
              />
            </label>

            {passwordMessage && (
              <div className="profile-feedback success">
                {passwordMessage}
              </div>
            )}

            {passwordError && (
              <div className="profile-feedback error">
                {passwordError}
              </div>
            )}

            <button
              type="submit"
              className="profile-submit"
              disabled={
                savingPassword ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword
              }
            >
              {savingPassword ? "UPDATING..." : "CHANGE PASSWORD"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
