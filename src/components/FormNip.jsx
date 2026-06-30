import { useState } from "react";

export default function FormNip({ mode, onSubmit, loading }) {
  const [nip, setNip] = useState("");
  const [touched, setTouched] = useState(false);

  const valid = /^\d{18}$/.test(nip.trim());
  const isPinjam = mode === "PINJAM";

  function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);
    if (!valid || loading) return;
    onSubmit(nip.trim());
  }

  return (
    <form className="nip-form" onSubmit={handleSubmit}>
      <label className="nip-label" htmlFor="nip">
        NIP Anda
      </label>
      <input
        id="nip"
        className="nip-input"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="18 digit NIP"
        value={nip}
        onChange={(e) => setNip(e.target.value.replace(/\D/g, "").slice(0, 18))}
        onBlur={() => setTouched(true)}
        disabled={loading}
      />
      {touched && !valid && (
        <span className="nip-error">NIP harus 18 digit angka</span>
      )}

      <button
        type="submit"
        className={`nip-submit ${isPinjam ? "nip-submit--pinjam" : "nip-submit--kembali"}`}
        disabled={loading}
      >
        {loading ? "Memproses..." : isPinjam ? "Pinjam Alat Ini" : "Kembalikan Alat Ini"}
      </button>
    </form>
  );
}
