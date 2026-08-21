import {
  LayoutDashboard,
  Factory,
  Package,
  Boxes,
  Wallet,
  ShoppingCart,
  Upload,
  Bell,
  FileText,
} from "lucide-react";

const Sidebar = ({ activePage, setActivePage }) => {
  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Production",
      icon: Factory,
    },
    {
      name: "Inventory",
      icon: Package,
    },
    {
      name: "Raw Materials",
      icon: Boxes,
    },
    {
      name: "Finance",
      icon: Wallet,
    },
    {
      name: "Sales",
      icon: ShoppingCart,
    },
    {
      name: "Data Sources",
      icon: Upload,
    },
    {
      name: "Alerts",
      icon: Bell,
    },
    {
      name: "Reports",
      icon: FileText,
    },
  ];

  return (
    <aside className="sidebar">

      <div className="logo">
        <div className="logo-icon">
          M
        </div>

        <div>
          <h2>MSME</h2>
          <span>Enterprise Analytics</span>
        </div>
      </div>

      <nav>
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.name}
              className={
                activePage === item.name
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() => setActivePage(item.name)}
            >
              <Icon size={19} />

              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <span>Enterprise Data Platform</span>
        <small>v1.0.0</small>
      </div>

    </aside>
  );
};

export default Sidebar;