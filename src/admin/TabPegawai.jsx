import { useEffect, useState } from "react";
import { adminApi } from "../lib/adminApi";

const KOSONG = { nip: "", nama: "", jabatan: "", unitKerja: "", status: "AKTIF" };

export default function TabPegawai() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(KOSONG);
  const [editingNip, setEditingNip] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setError("");
    try {
      const data = await adminApi.daftarPegawai();
      setItems(data);
    } catch (err) {
      setError(err.message);
    }
  }

  function openTambah() {
    setForm(KOSONG);
    setEditingNip(null);
    setShowForm(true);
  }

  function openEdit(item) {
    setForm({
      nip: item.nip,
      nama: item.nama,
      jabatan: item.jabatan,
      unitKerja: item.unitKerja,
      status: item.status,
    });
    setEditingNip(item.nip);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingNip) {
        await adminApi.editPegawai(editingNip, {
          nama: form.nama,
          jabatan: form.jabatan,
          unitKerja: form.unitKerja,
          status: form.status,
        });
      } else {
        await adminApi.tambahPegawai(form);
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleHapus(nip, nama) {
    if (!confirm(`Hapus pegawai ${nama}?`)) return;
    setError("");
    try {
      await adminApi.hapusPegawai(nip);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="admin-tab-content">
      <div className="admin-tab-toolbar">
        <h2 className="admin-section-title">Daftar pegawai</h2>
        <button className="admin-add-btn" onClick={openTambah}>+ Tambah pegawai</button>
      </div>

      {error && <p className="form-error">{error}</p>}

      {showForm && (
        <form className="admin-form" onSubmit={handleSubmit}>
          {!editingNip && (
            <div className="admin-field">
              <label className="nip-label">NIP</label>
              <input
                className="nip-input"
                value={form.nip}
                placeholder="18 digit NIP"
                onChange={(e) => setForm({ ...form, nip: e.target.value.replace(/\D/g, "").slice(0, 18) })}
                required
              />
            </div>
          )}
          <Field label="Nama" value={form.nama} onChange={(v) => setForm({ ...form, nama: v })} placeholder="Nama lengkap" />
          <Field label="Jabatan" value={form.jabatan} onChange={(v) => setForm({ ...form, jabatan: v })} placeholder="Auditor Ahli Pertama" />
          <Field label="Unit kerja" value={form.unitKerja} onChange={(v) => setForm({ ...form, unitKerja: v })} placeholder="Inspektorat" />
          <div className="admin-field">
            <label className="nip-label">Status</label>
            <select className="nip-input admin-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="AKTIF">AKTIF</option>
              <option value="NONAKTIF">NONAKTIF</option>
            </select>
          </div>
          <div className="admin-form-actions">
            <button type="button" className="admin-cancel-btn" onClick={() => setShowForm(false)}>Batal</button>
            <button type="submit" className="nip-submit nip-submit--pinjam" disabled={saving} style={{ marginTop: 0 }}>
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      )}

      {items === null && <p className="state-body">Memuat...</p>}
      {items && items.length === 0 && <p className="state-body">Belum ada pegawai.</p>}

      <div className="admin-list">
        {items && items.map((item) => (
          <div className="admin-row-card" key={item.nip}>
            <div className="admin-row-main">
              <div>
                <p className="admin-row-title">{item.nama}</p>
                <p className="admin-row-sub">{item.nip} &middot; {item.jabatan}</p>
                <p className="admin-row-sub">{item.unitKerja}</p>
              </div>
              <span className={`admin-badge ${item.status === "AKTIF" ? "admin-badge--free" : "admin-badge--busy"}`}>
                {item.status}
              </span>
            </div>
            <div className="admin-row-actions">
              <button className="admin-link-btn" onClick={() => openEdit(item)}>Edit</button>
              <button className="admin-link-btn admin-link-btn--danger" onClick={() => handleHapus(item.nip, item.nama)}>Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div className="admin-field">
      <label className="nip-label">{label}</label>
      <input
        className="nip-input"
        style={{ fontFamily: "var(--font-body)", fontSize: "0.95rem" }}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </div>
  );
}
