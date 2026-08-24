import {useEffect, useState } from "react";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import RawMaterials from "./pages/RawMaterials";
import Dashboard from "./pages/Dashboard";
import DataSources from "./pages/DataSources";
import Production from "./pages/Production";
import Inventory from "./pages/Inventory";
import Finance from "./pages/Finance";
import Sales from "./pages/Sales";
import Alerts from "./pages/Alerts";
import Reports from "./pages/Reports";

import "./index.css";

const App = () => {
  const [activePage, setActivePage] =
    useState("Dashboard");

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
        return <Sales/>;
        
      case "Alerts":
        return <Alerts />;

      case "Reports":
        return <Reports />;

      default:
        return <Dashboard />;
    }
  };
    // Theme state — persisted in localStorage
const [theme, setTheme] = useState(() => {
  const stored = localStorage.getItem("forge-theme")
  return stored === "light" ? "light" : "dark"
})

// Apply theme to <html> element
useEffect(() => {
  document.documentElement.setAttribute("data-theme", theme)
  localStorage.setItem("forge-theme", theme)
}, [theme])

const toggleTheme = () => {
  setTheme((t) => (t === "dark" ? "light" : "dark"))
}

  return (
    <div className="app" style={{ display: "flex", minHeight: "100vh", background: "var(--forge-dark)" }}>
      
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />
   <div style={{ marginLeft: 262, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }} >
        
         <Navbar activePage={activePage} theme={theme} onToggleTheme={toggleTheme} onAlertsClick={() => setActivePage("Alerts")} />

           <main className="main-content" style={{ marginTop: 62, flex: 1, overflowY: "auto" }}>

       
        <section className="page-content">
          {renderPage()}
        </section>
          
      </main>

   </div>
      
    </div>
  );
};

export default App;