import React from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Navbar from "./Navbar";
import Footer from "./Footer";
import styles from "../styles/App.module.css";

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  if (location.pathname === "/") return <>{children}</>;

  return (
    <div className={styles["admin-app-container"]}>
      <Header />
      <Navbar />
      <main className={styles["admin-main"]}>{children}</main>
      <Footer />
    </div>
  );
}
