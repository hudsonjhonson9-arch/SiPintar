const API_URL = import.meta.env.VITE_API_URL;
const API_TOKEN = import.meta.env.VITE_API_TOKEN;
const STORAGE_KEY = "sipintar_admin_pw";

async function call(action, payload = {}) {
  const adminPassword = sessionStorage.getItem(STORAGE_KEY) || "";

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ action, token: API_TOKEN, adminPassword, ...payload }),
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

export const adminApi = {
  login: async (password) => {
    sessionStorage.setItem(STORAGE_KEY, password);
    try {
      await call("adminLogin");
      return true;
    } catch (err) {
      sessionStorage.removeItem(STORAGE_KEY);
      throw err;
    }
  },
  logout: () => sessionStorage.removeItem(STORAGE_KEY),
  isLoggedIn: () => Boolean(sessionStorage.getItem(STORAGE_KEY)),

  daftarAlat: () => call("adminDaftarAlat"),
  tambahAlat: (data) => call("adminTambahAlat", { data }),
  editAlat: (idAlat, data) => call("adminEditAlat", { idAlat, data }),
  hapusAlat: (idAlat) => call("adminHapusAlat", { idAlat }),

  daftarPegawai: () => call("adminDaftarPegawai"),
  tambahPegawai: (data) => call("adminTambahPegawai", { data }),
  editPegawai: (nip, data) => call("adminEditPegawai", { nip, data }),
  hapusPegawai: (nip) => call("adminHapusPegawai", { nip }),

  riwayat: () => call("adminRiwayat"),
};
