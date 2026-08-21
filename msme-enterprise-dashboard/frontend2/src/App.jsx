import { useState } from "react";

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