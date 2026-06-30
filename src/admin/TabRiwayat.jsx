import { useEffect, useState } from "react";
import { adminApi } from "../lib/adminApi";

export default function TabRiwayat() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setError("");
    try {
      const data = await adminApi.riwayat();
      setItems(data);
    } catch (err) {
      setError(err.message);
    }
  }

  const filtered = items
    ? items.filter((r) => {
        const q = query.toLowerCase();
        return (
          r.namaAlat.toLowerCase().includes(q) ||
          r.namaPegawai.toLowerCase().includes(q) ||
          r.idAlat.toLowerCase().includes(q) ||
          String(r.nip).includes(q)
        );
      })
    : [];

  return (
    <div className="admin-tab-content">
      <div className="admin-tab-toolbar">
        <h2 className="admin-section-title">Riwayat transaksi</h2>
      </div>

      <input
        className="nip-input"
        style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", marginBottom: "14px" }}
        placeholder="Cari nama alat / nama pegawai / NIP..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {error && <p className="form-error">{error}</p>}
      {items === null && <p className="state-body">Memuat...</p>}
      {items && filtered.length === 0 && <p className="state-body">Tidak ada riwayat.</p>}

      <div className="admin-list">
        {filtered.map((r, i) => (
          <div className="admin-row-card" key={i}>
            <div className="admin-row-main">
              <div>
                <p className="admin-row-title">{r.namaAlat}</p>
                <p className="admin-row-sub">{r.namaPegawai} &middot; {r.nip}</p>
                <p className="admin-row-sub">{r.waktu}</p>
              </div>
              <span className={`admin-badge ${r.jenis === "PINJAM" ? "admin-badge--busy" : "admin-badge--free"}`}>
                {r.jenis}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
