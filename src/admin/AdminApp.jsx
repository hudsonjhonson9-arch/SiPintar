import { useEffect, useState } from "react";
import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import AdminLogin from "./AdminLogin";
import TabAlat from "./TabAlat";
import TabPegawai from "./TabPegawai";
import TabRiwayat from "./TabRiwayat";
import { adminApi } from "../lib/adminApi";

export default function AdminApp() {
  const [loggedIn, setLoggedIn] = useState(adminApi.isLoggedIn());

  useEffect(() => {
    document.title = "SiPintar — Admin";
  }, []);

  if (!loggedIn) {
    return <AdminLogin onSuccess={() => setLoggedIn(true)} />;
  }

  function handleLogout() {
    adminApi.logout();
    setLoggedIn(false);
  }

  return (
    <div className="admin-screen">
      <header className="admin-header">
        <div>
          <span className="brand-mark">SiPintar</span>
          <span className="brand-sub" style={{ marginLeft: "8px" }}>Admin</span>
        </div>
        <button className="admin-logout-btn" onClick={handleLogout}>
          Keluar
        </button>
      </header>

      <nav className="admin-tabs">
        <NavLink to="/admin/alat" className={({ isActive }) => "admin-tab" + (isActive ? " admin-tab--active" : "")}>
          Alat
        </NavLink>
        <NavLink to="/admin/pegawai" className={({ isActive }) => "admin-tab" + (isActive ? " admin-tab--active" : "")}>
          Pegawai
        </NavLink>
        <NavLink to="/admin/riwayat" className={({ isActive }) => "admin-tab" + (isActive ? " admin-tab--active" : "")}>
          Riwayat
        </NavLink>
      </nav>

      <main className="admin-content">
        <Routes>
          <Route path="/" element={<Navigate to="alat" replace />} />
          <Route path="alat" element={<TabAlat />} />
          <Route path="pegawai" element={<TabPegawai />} />
          <Route path="riwayat" element={<TabRiwayat />} />
        </Routes>
      </main>
    </div>
  );
}
