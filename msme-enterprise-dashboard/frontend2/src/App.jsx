
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import PlatformDashboard from "./pages/PlatformDashboard";
import Dashboard from "./pages/Dashboard";
import DataSources from "./pages/DataSources";
import Production from "./pages/Production";
import Inventory from "./pages/Inventory";
import RawMaterials from "./pages/RawMaterials";
import Finance from "./pages/Finance";
import Sales from "./pages/Sales";
import Alerts from "./pages/Alerts";
import Reports from "./pages/Reports";
import Workforce from "./pages/Workforce";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";
import Register from "./pages/Register";
import Login from "./pages/Login";
import AcceptInvitation from "./pages/AcceptInvitation";
import ForgotPassword from "./pages/ForgotPassword";
import API from "./services/api";

import "./index.css";

const App = () => {
  // ======================================================
  // ROUTER
  // ======================================================

  const location = useLocation();
  const navigate = useNavigate();

  const isAcceptInvitation =
    location.pathname === "/accept-invitation";
  const isResetPassword = location.pathname === "/reset-password";
  // ======================================================
  // AUTH STATE
  // ======================================================

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
   const [showForgotPassword, setShowForgotPassword] = useState(false);
  // ======================================================
  // PAGE STATE
  // ======================================================

  const [activePage, setActivePage] = useState("Dashboard");

  // ======================================================
  // THEME STATE
  // ======================================================

  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("forge-theme");

    return stored === "light" ? "light" : "dark";
  });

  // ======================================================
  // APPLY THEME
  // ======================================================

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("forge-theme", theme);
  }, [theme]);

  // ======================================================
  // TOGGLE THEME
  // ======================================================

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "dark" ? "light" : "dark"
    );
  };

  // ======================================================
  // CHECK EXISTING LOGIN SESSION
  // ======================================================

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await API.get("/auth/me");
        setUser(response.data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    checkSession();
  }, []);

  // ======================================================
  // LOGIN
  // ======================================================

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setShowRegister(false);
    setActivePage("Dashboard");
  };

  // ======================================================
  // REGISTER
  // ======================================================

  const handleRegister = (registeredUser) => {
    setUser(registeredUser);
    setShowRegister(false);
    setActivePage("Dashboard");
  };

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setShowRegister(false);
      setActivePage("Dashboard");
    }
  };

  // ======================================================
  // PAGE RENDERING
  // ======================================================

  const renderPage = () => {
    switch (activePage) {
      case "Dashboard":
        return <Dashboard />;

      case "Data Sources":
        return <DataSources />;

      case "Production":
        return <Production />;

      case "Inventory":
        return <Inventory />;

      case "Raw Materials":
        return <RawMaterials />;

      case "Finance":
        return <Finance />;

      case "Sales":
        return <Sales />;

      case "Alerts":
        return <Alerts />;

      case "Reports":
        return <Reports />;

      case "Workforce":
        return <Workforce user={user} />;

      case "Settings":
        return <Settings user={user} />;

      case "Profile":
        return (
          <Profile
            user={user}
            onProfileUpdate={(updatedUser) => {
              setUser((currentUser) => ({
                ...currentUser,
                ...updatedUser,
              }));
            }}
          />
        );

      default:
        return <Dashboard />;
    }
  };

  // ======================================================
  // PUBLIC INVITATION ACCEPTANCE PAGE
  // ======================================================

  if (isAcceptInvitation) {
    return (
      <AcceptInvitation
        onGoToLogin={() => navigate("/", { replace: true })}
      />
    );
  }
  // PUBLIC PASSWORD RESET PAGE
if (isResetPassword) {
  return (
    <ResetPassword
      theme={theme}
      onToggleTheme={toggleTheme}
      onGoToLogin={() => navigate("/", { replace: true })}
    />
  );
}
  // ======================================================
  // CHECKING SESSION
  // ======================================================

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--forge-dark)",
          color: "var(--text-faint)",
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          letterSpacing: "0.18em",
        }}
      >
        VERIFYING SECURE SESSION...
      </div>
    );
  }

  // ======================================================
  // NOT LOGGED IN
  // ======================================================

  if (!user) {
    // REGISTER
    if (showRegister) {
      return (
        <Register
          onRegister={handleRegister}
          theme={theme}
          onToggleTheme={toggleTheme}
          onBackToLogin={() => setShowRegister(false)}
        />
      );
    }
    // FORGOT PASSWORD
if (showForgotPassword) {
  return (
    <ForgotPassword
      theme={theme}
      onToggleTheme={toggleTheme}
      onBackToLogin={() => setShowForgotPassword(false)}
    />
  );
}

    // LOGIN
    return (
      <Login
        onLogin={handleLogin}
        theme={theme}
        onToggleTheme={toggleTheme}
        onRegisterClick={() => {
    setShowRegister(true);
    setShowForgotPassword(false);
  }}
  onForgotPasswordClick={() => setShowForgotPassword(true)}
      />
    );
  }
  // ======================================================
// SUPER ADMIN PLATFORM APPLICATION
// ======================================================

if (user.role === "super_admin") {
  return (
    <PlatformDashboard
      user={user}
      onLogout={handleLogout}
      theme={theme}
      onToggleTheme={toggleTheme}
    />
  );
}
  // ======================================================
  // AUTHENTICATED APPLICATION
  // ======================================================
  
  return (
    
    <div
      className="app"
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--forge-dark)",
      }}
    >
      {/* SIDEBAR */}

      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      {/* MAIN APPLICATION */}

      <div
        style={{
          marginLeft: 262,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        {/* NAVBAR */}

        <Navbar
          activePage={activePage}
          theme={theme}
          onToggleTheme={toggleTheme}
          onAlertsClick={() => setActivePage("Alerts")}
          user={user}
          onLogout={handleLogout}
          onProfileClick={() => setActivePage("Profile")}
        />

        {/* CONTENT */}

        <main
          className="main-content"
          style={{
            marginTop: 62,
            flex: 1,
            overflowY: "auto",
          }}
        >
          <section className="page-content">
            {renderPage()}
          </section>
        </main>
      </div>
    </div>
  );
};

export default App;
