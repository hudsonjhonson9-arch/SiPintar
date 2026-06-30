import { useState } from "react";
import { adminApi } from "../lib/adminApi";

export default function AdminLogin({ onSuccess }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError("");
    try {
      await adminApi.login(password);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-screen">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <span className="brand-mark">SiPintar</span>
        <span className="brand-sub">Masuk sebagai admin</span>

        <label className="nip-label" htmlFor="adminpw" style={{ marginTop: "20px" }}>
          Password
        </label>
        <input
          id="adminpw"
          className="nip-input"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          autoFocus
        />

        {error && <p className="form-error" style={{ marginTop: "10px" }}>{error}</p>}

        <button
          type="submit"
          className="nip-submit nip-submit--pinjam"
          disabled={loading}
          style={{ marginTop: "16px" }}
        >
          {loading ? "Memeriksa..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}
