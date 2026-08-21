import { useState } from "react";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import RawMaterials from "./pages/RawMaterials";
import Dashboard from "./pages/Dashboard";
import DataSources from "./pages/DataSources";
import Production from "./pages/Production";
import Inventory from "./pages/Inventory";

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
        return (
          <div className="coming-soon">
            <h2>Finance</h2>
            <p>
              Finance module is under development.
            </p>
          </div>
        );

      case "Sales":
        return (
          <div className="coming-soon">
            <h2>Sales</h2>
            <p>
              Sales module is under development.
            </p>
          </div>
        );

      case "Alerts":
        return (
          <div className="coming-soon">
            <h2>Alerts</h2>
            <p>
              Alerts module is under development.
            </p>
          </div>
        );

      case "Reports":
        return (
          <div className="coming-soon">
            <h2>Reports</h2>
            <p>
              Reports module is under development.
            </p>
          </div>
        );

      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">

      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main className="main-content">

        <Navbar />

        <section className="page-content">
          {renderPage()}
        </section>

      </main>

    </div>
  );
};

export default App;