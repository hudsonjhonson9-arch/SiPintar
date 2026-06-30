import { useEffect, useState, useCallback } from "react";
import QRCode from "qrcode";
import { adminApi } from "../lib/adminApi";

const KOSONG = { idAlat: "", namaAlat: "", kategori: "", lokasi: "", kondisi: "BAIK" };

export default function TabAlat() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(KOSONG);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setError("");
    try {
      const data = await adminApi.daftarAlat();
      setItems(data);
    } catch (err) {
      setError(err.message);
    }
  }

  function openTambah() {
    setForm(KOSONG);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(item) {
    setForm({
      idAlat: item.idAlat,
      namaAlat: item.namaAlat,
      kategori: item.kategori,
      lokasi: item.lokasi,
      kondisi: item.kondisi,
    });
    setEditingId(item.idAlat);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await adminApi.editAlat(editingId, {
          namaAlat: form.namaAlat,
          kategori: form.kategori,
          lokasi: form.lokasi,
          kondisi: form.kondisi,
        });
      } else {
        await adminApi.tambahAlat(form);
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleHapus(idAlat) {
    if (!confirm(`Hapus alat ${idAlat}?`)) return;
    setError("");
    try {
      await adminApi.hapusAlat(idAlat);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  const handleDownloadQr = useCallback(async (idAlat, namaAlat, qrCode) => {
    const data = qrCode || (window.location.origin + "/?id=" + idAlat);
    try {
      const c = document.createElement("canvas");
      await QRCode.toCanvas(c, data, { width: 300 });
      const blob = await new Promise((r) => c.toBlob(r, "image/png"));
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `QR-${idAlat}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setError("Gagal mengunduh QR. Coba lagi.");
    }
  }, [setError]);

  async function handlePaksaKembali(idAlat) {
    if (!confirm(`Tandai alat ${idAlat} sebagai tersedia? (mengabaikan peminjaman saat ini)`)) return;
    setError("");
    try {
      await adminApi.editAlat(idAlat, { status: "TERSEDIA" });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="admin-tab-content">
      <div className="admin-tab-toolbar">
        <h2 className="admin-section-title">Daftar alat</h2>
        <button className="admin-add-btn" onClick={openTambah}>+ Tambah alat</button>
      </div>

      {error && <p className="form-error">{error}</p>}

      {showForm && (
        <form className="admin-form" onSubmit={handleSubmit}>
          {!editingId && (
            <Field label="ID alat" value={form.idAlat} onChange={(v) => setForm({ ...form, idAlat: v })} placeholder="ALT-0001" mono />
          )}
          <Field label="Nama alat" value={form.namaAlat} onChange={(v) => setForm({ ...form, namaAlat: v })} placeholder="Proyektor Epson" />
          <Field label="Kategori" value={form.kategori} onChange={(v) => setForm({ ...form, kategori: v })} placeholder="Elektronik" />
          <Field label="Lokasi" value={form.lokasi} onChange={(v) => setForm({ ...form, lokasi: v })} placeholder="Ruang IT" />
          <FieldSelect
            label="Kondisi"
            value={form.kondisi}
            onChange={(v) => setForm({ ...form, kondisi: v })}
            options={["BAIK", "RUSAK_RINGAN", "RUSAK_BERAT"]}
          />
          <div className="admin-form-actions">
            <button type="button" className="admin-cancel-btn" onClick={() => setShowForm(false)}>Batal</button>
            <button type="submit" className="nip-submit nip-submit--pinjam" disabled={saving} style={{ marginTop: 0 }}>
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      )}

      {items === null && <p className="state-body">Memuat...</p>}
      {items && items.length === 0 && <p className="state-body">Belum ada alat.</p>}

      <div className="admin-list">
        {items && items.map((item) => (
          <div className="admin-row-card" key={item.idAlat}>
            <div className="admin-row-main">
              <div>
                <p className="admin-row-title">{item.namaAlat}</p>
                <p className="admin-row-sub">{item.idAlat} &middot; {item.kategori} &middot; {item.lokasi}</p>
                {item.status === "DIPINJAM" && (
                  <p className="admin-row-sub">
                    Dipinjam: <strong>{item.namaPeminjam}</strong> sejak {item.sejak}
                  </p>
                )}
              </div>
              <span className={`admin-badge ${item.status === "DIPINJAM" ? "admin-badge--busy" : "admin-badge--free"}`}>
                {item.status === "DIPINJAM" ? "Dipinjam" : "Tersedia"}
              </span>
            </div>
            <div className="admin-row-actions">
              <button className="admin-link-btn" onClick={() => openEdit(item)}>Edit</button>
              <button className="admin-link-btn" onClick={() => handleDownloadQr(item.idAlat, item.namaAlat, item.qrCode)}>Download QR</button>
              {item.status === "DIPINJAM" && (
                <button className="admin-link-btn" onClick={() => handlePaksaKembali(item.idAlat)}>Paksa kembali</button>
              )}
              <button className="admin-link-btn admin-link-btn--danger" onClick={() => handleHapus(item.idAlat)}>Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, mono }) {
  return (
    <div className="admin-field">
      <label className="nip-label">{label}</label>
      <input
        className="nip-input"
        style={mono ? {} : { fontFamily: "var(--font-body)", fontSize: "0.95rem" }}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </div>
  );
}

function FieldSelect({ label, value, onChange, options }) {
  return (
    <div className="admin-field">
      <label className="nip-label">{label}</label>
      <select className="nip-input admin-select" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}