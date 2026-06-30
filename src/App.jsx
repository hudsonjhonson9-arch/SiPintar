import { useEffect, useState } from "react";
import AssetTag from "./components/AssetTag";
import FormNip from "./components/FormNip";
import { api } from "./lib/api";

// status alur: loading -> ready | not_found | error
//              setelah submit: submitting -> success | submit_error

export default function App() {
  const [idAlat, setIdAlat] = useState(null);
  const [alat, setAlat] = useState(null);
  const [phase, setPhase] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) {
      setPhase("no_id");
      return;
    }
    setIdAlat(id);
    loadAlat(id);
  }, []);

  async function loadAlat(id) {
    setPhase("loading");
    try {
      const data = await api.cekAlat(id);
      setAlat(data);
      setPhase("ready");
    } catch (err) {
      setErrorMsg(err.message);
      setPhase("error");
    }
  }

  async function handleSubmit(nip) {
    setSubmitting(true);
    setErrorMsg("");
    try {
      const isPinjam = alat.status !== "DIPINJAM";
      const result = isPinjam
        ? await api.prosesPinjam(idAlat, nip)
        : await api.prosesKembali(idAlat, nip);

      setSuccessMsg(result.message);
      setPhase("success");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="screen">
      <header className="brand">
        <span className="brand-mark">SiPintar</span>
        <span className="brand-sub">Sistem Inventaris Peralatan</span>
      </header>

      <main className="content">
        {phase === "loading" && (
          <div className="state state--loading">
            <div className="spinner" />
            <p>Mengambil data alat...</p>
          </div>
        )}

        {phase === "no_id" && (
          <div className="state state--empty">
            <p className="state-title">Tidak ada alat dipilih</p>
            <p className="state-body">
              Buka halaman ini dengan memindai QR Code yang tertempel pada alat.
            </p>
          </div>
        )}

        {phase === "error" && (
          <div className="state state--error">
            <p className="state-title">Alat tidak ditemukan</p>
            <p className="state-body">{errorMsg}</p>
            <button className="retry-btn" onClick={() => loadAlat(idAlat)}>
              Coba lagi
            </button>
          </div>
        )}

        {phase === "ready" && alat && (
          <>
            <AssetTag alat={alat} />
            {errorMsg && <p className="form-error">{errorMsg}</p>}
            <FormNip
              mode={alat.status === "DIPINJAM" ? "KEMBALI" : "PINJAM"}
              onSubmit={handleSubmit}
              loading={submitting}
            />
          </>
        )}

        {phase === "success" && (
          <div className="state state--success">
            <div className="success-mark">✓</div>
            <p className="state-title">Berhasil</p>
            <p className="state-body">{successMsg}</p>
          </div>
        )}
      </main>
    </div>
  );
}
