import { Search, Bell, User } from "lucide-react";

const Navbar = () => {
  return (
    <header className="navbar">

      <div>
        <h1>Enterprise Overview</h1>

        <p>
          Monitor your organization's operational performance
        </p>
      </div>

      <div className="navbar-actions">

        <div className="search-box">
          <Search size={18} />

          <input
            placeholder="Search..."
          />
        </div>

        <button className="icon-button">
          <Bell size={20} />
        </button>

        <div className="user-profile">

          <div className="avatar">
            <User size={18} />
          </div>

          <div>
            <strong>Administrator</strong>
            <span>MSME Manager</span>
          </div>

        </div>

      </div>

    </header>
  );
};

export default Navbar;