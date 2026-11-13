
import { useEffect, useState } from "react";
import API from "../services/api";
import "./styles/Settings.css";

const DEFAULT_SETTINGS = {
  modules: {
    dashboard: true,
    production: true,
    inventory: true,
    rawMaterials: true,
    finance: true,
    sales: true,
    reports: true,
    alerts: true,
  },
  notifications: {
    lowInventory: true,
    productionDefects: true,
    salesDrop: true,
    failedUploads: true,
  },
  companyProfile: {
    industry: "",
    currency: "INR",
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
  },
};

const MODULE_LABELS = {
  dashboard: "Dashboard",
  production: "Production",
  inventory: "Inventory",
  rawMaterials: "Raw Materials",
  finance: "Finance",
  sales: "Sales",
  reports: "Reports",
  alerts: "Alerts",
};

const NOTIFICATION_LABELS = {
  lowInventory: "Low inventory warnings",
  productionDefects: "Production defect alerts",
  salesDrop: "Sales drop notifications",
  failedUploads: "Failed data upload notifications",
};

export default function Settings({ user }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("company");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get("/settings");
        const data = response.data.data || {};

        setSettings({
          modules: {
            ...DEFAULT_SETTINGS.modules,
            ...data.modules,
          },
          notifications: {
            ...DEFAULT_SETTINGS.notifications,
            ...data.notifications,
          },
          companyProfile: {
            ...DEFAULT_SETTINGS.companyProfile,
            ...data.companyProfile,
          },
        });
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load company settings."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateField = (section, field, value) => {
    setSettings((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }));
  };

  const saveSettings = async () => {
    if (!isAdmin) return;

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await API.put("/settings", settings);

      if (response.data.data) {
        const data = response.data.data;

        setSettings({
          modules: {
            ...DEFAULT_SETTINGS.modules,
            ...data.modules,
          },
          notifications: {
            ...DEFAULT_SETTINGS.notifications,
            ...data.notifications,
          },
          companyProfile: {
            ...DEFAULT_SETTINGS.companyProfile,
            ...data.companyProfile,
          },
        });
      }

      setMessage("CONFIGURATION SAVED SUCCESSFULLY.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to save settings."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-loading">
        LOADING SYSTEM CONFIGURATION...
      </div>
    );
  }

  return (
    <div className="forge-settings">
      <div className="settings-heading">
        <div>
          <div className="settings-eyebrow">
            MSME / SYSTEM / CONFIGURATION
          </div>
          <h1>SETTINGS & CONFIGURATION</h1>
          <p>Manage your company's operational preferences.</p>
        </div>

        <div className="settings-access">
          {isAdmin ? "ADMIN ACCESS" : "READ ONLY ACCESS"}
        </div>
      </div>

      <div className="settings-tabs">
        <button
          className={activeTab === "company" ? "active" : ""}
          onClick={() => setActiveTab("company")}
        >
          COMPANY PREFERENCES
        </button>

        <button
          className={activeTab === "modules" ? "active" : ""}
          onClick={() => setActiveTab("modules")}
        >
          MODULE CONTROL
        </button>

        <button
          className={activeTab === "notifications" ? "active" : ""}
          onClick={() => setActiveTab("notifications")}
        >
          NOTIFICATIONS
        </button>
      </div>

      {message && (
        <div className="settings-message success">{message}</div>
      )}

      {error && (
        <div className="settings-message error">{error}</div>
      )}

      {activeTab === "company" && (
        <section className="settings-panel">
          <div className="settings-panel-heading">
            <div>
              <h2>COMPANY PREFERENCES</h2>
              <span>REGIONAL AND BUSINESS CONFIGURATION</span>
            </div>
          </div>

          <div className="settings-form-grid">
            <label>
              INDUSTRY
              <input
                value={settings.companyProfile.industry}
                disabled={!isAdmin}
                placeholder="e.g. Manufacturing"
                onChange={(e) =>
                  updateField("companyProfile", "industry", e.target.value)
                }
              />
            </label>

            <label>
              CURRENCY
              <select
                value={settings.companyProfile.currency}
                disabled={!isAdmin}
                onChange={(e) =>
                  updateField("companyProfile", "currency", e.target.value)
                }
              >
                <option value="INR">INR — Indian Rupee</option>
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="AED">AED — UAE Dirham</option>
              </select>
            </label>

            <label>
              TIMEZONE
              <select
                value={settings.companyProfile.timezone}
                disabled={!isAdmin}
                onChange={(e) =>
                  updateField("companyProfile", "timezone", e.target.value)
                }
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC</option>
                <option value="Asia/Dubai">Asia/Dubai</option>
                <option value="Europe/London">Europe/London</option>
                <option value="America/New_York">America/New_York</option>
              </select>
            </label>

            <label>
              DATE FORMAT
              <select
                value={settings.companyProfile.dateFormat}
                disabled={!isAdmin}
                onChange={(e) =>
                  updateField("companyProfile", "dateFormat", e.target.value)
                }
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </label>
          </div>
        </section>
      )}

      {activeTab === "modules" && (
        <section className="settings-panel">
          <div className="settings-panel-heading">
            <div>
              <h2>MODULE CONTROL</h2>
              <span>ENABLE OR DISABLE COMPANY MODULES</span>
            </div>
          </div>

          <div className="settings-options">
            {Object.entries(MODULE_LABELS).map(([key, label]) => (
              <label className="settings-option" key={key}>
                <div>
                  <strong>{label}</strong>
                  <small>Control access to the {label.toLowerCase()} module.</small>
                </div>

                <input
                  type="checkbox"
                  checked={settings.modules[key]}
                  disabled={!isAdmin}
                  onChange={(e) =>
                    updateField("modules", key, e.target.checked)
                  }
                />
              </label>
            ))}
          </div>
        </section>
      )}

      {activeTab === "notifications" && (
        <section className="settings-panel">
          <div className="settings-panel-heading">
            <div>
              <h2>NOTIFICATION PREFERENCES</h2>
              <span>SELECT WHICH SYSTEM EVENTS SHOULD GENERATE ALERTS</span>
            </div>
          </div>

          <div className="settings-options">
            {Object.entries(NOTIFICATION_LABELS).map(([key, label]) => (
              <label className="settings-option" key={key}>
                <div>
                  <strong>{label}</strong>
                  <small>Enable or disable this notification category.</small>
                </div>

                <input
                  type="checkbox"
                  checked={settings.notifications[key]}
                  disabled={!isAdmin}
                  onChange={(e) =>
                    updateField("notifications", key, e.target.checked)
                  }
                />
              </label>
            ))}
          </div>
        </section>
      )}

      <div className="settings-footer">
        <span>
          {isAdmin
            ? "CHANGES APPLY TO YOUR COMPANY CONFIGURATION"
            : "CONTACT YOUR ADMINISTRATOR TO MODIFY SETTINGS"}
        </span>

        {isAdmin && (
          <button onClick={saveSettings} disabled={saving}>
            {saving ? "SAVING..." : "SAVE CONFIGURATION"}
          </button>
        )}
      </div>
    </div>
  );
}
