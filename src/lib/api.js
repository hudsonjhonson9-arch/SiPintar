// Wrapper fetch ke Google Apps Script Web App
// Simpan URL deploy & token di environment variable (.env):
//   VITE_API_URL=https://script.google.com/macros/s/XXXX/exec
//   VITE_API_TOKEN=isi-token-rahasia

const API_URL = import.meta.env.VITE_API_URL;
const API_TOKEN = import.meta.env.VITE_API_TOKEN;

async function call(action, payload = {}) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" }, // hindari preflight CORS di Apps Script
    body: JSON.stringify({ action, token: API_TOKEN, ...payload }),
  });

  if (!res.ok) {
    throw new Error("Gagal menghubungi server. Coba lagi.");
  }

  const data = await res.json();
  if (!data.ok) {
    throw new Error(data.message || "Terjadi kesalahan.");
  }
  return data.result;
}

export const api = {
  cekAlat: (idAlat) => call("cekAlat", { idAlat }),
  prosesPinjam: (idAlat, nip) => call("prosesPinjam", { idAlat, nip }),
  prosesKembali: (idAlat, nip) => call("prosesKembali", { idAlat, nip }),
};
