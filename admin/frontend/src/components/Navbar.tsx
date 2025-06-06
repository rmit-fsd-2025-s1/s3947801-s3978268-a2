import React from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import styles from "../styles/Navbar.module.css";

export default function Navbar() {
  const history = useHistory();
  const location = useLocation();

  if (location.pathname === "/") return null;

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    history.replace("/");
  };

  return (
    <nav className={styles.adminNavbar}>
      <ul className={styles.navLinks}>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/course-management">Course Management</Link></li>
        <li><Link to="/assign-lecturer">Assign Lecturers</Link></li>
      </ul>
      <button onClick={handleLogout} className={styles.logoutBtn}>
        Logout
      </button>
    </nav>
  );
}