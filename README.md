# SiPintar — Sistem Inventaris Peralatan Berbasis QR Code

## 1. Ringkasan

SiPintar adalah sistem peminjaman/pengembalian peralatan kantor menggunakan QR Code sebagai identitas alat dan NIP sebagai identitas peminjam. Data tersimpan di Google Sheets, diakses melalui Google Apps Script sebagai backend, dan diakses pegawai lewat web app (React, mobile-friendly).

```
[Pegawai - HP/Browser]
        |
        |  scan QR alat (kamera)
        v
[React Web App] --- HTTPS POST (+ API token) --- [Google Apps Script Web App]
                                                            |
                                                            v
                                                  [Google Sheets: Pegawai, Alat, Transaksi]
```

## 2. Struktur Data (Google Sheets)

### Sheet `Pegawai`
| Kolom | Tipe | Keterangan |
|---|---|---|
| NIP | string (18 digit) | Primary key pegawai |
| Nama | string | Nama lengkap |
| Jabatan | string | |
| Unit_Kerja | string | |
| Status | enum | `AKTIF` / `NONAKTIF` — nonaktif tidak bisa transaksi |

### Sheet `Alat`
| Kolom | Tipe | Keterangan |
|---|---|---|
| ID_Alat | string | Primary key, isi dari QR Code (mis. `ALT-0001`) |
| Nama_Alat | string | |
| Kategori | string | mis. Elektronik, ATK, Kendaraan |
| Lokasi | string | Lokasi penyimpanan default |
| Kondisi | enum | `BAIK` / `RUSAK_RINGAN` / `RUSAK_BERAT` |
| Status | enum | `TERSEDIA` / `DIPINJAM` — dihitung otomatis dari transaksi aktif |
| NIP_Peminjam | string | Terisi kalau status `DIPINJAM`, kosong kalau `TERSEDIA` |

### Sheet `Transaksi` (log, append-only)
| Kolom | Tipe | Keterangan |
|---|---|---|
| ID_Transaksi | string | UUID/timestamp-based, auto-generate server-side |
| ID_Alat | string | |
| Nama_Alat | string | snapshot saat transaksi |
| NIP | string | |
| Nama_Pegawai | string | snapshot saat transaksi |
| Jenis | enum | `PINJAM` / `KEMBALI` |
| Waktu | datetime | server-side timestamp (bukan dari client) |
| Kondisi_Saat_Itu | enum | kondisi alat dilaporkan saat transaksi |
| Catatan | string | opsional, mis. alasan rusak |

## 3. Alur Sistem

### 3.0 Mekanisme QR
QR Code yang ditempel pada tiap alat **bukan dipindai di dalam web app**, melainkan langsung berisi URL ke web app dengan ID alat sebagai parameter, misalnya:

```
https://sipintar-app.vercel.app/?id=ALT-0001
```

Pegawai cukup scan pakai kamera HP bawaan (tanpa perlu buka app dulu) → browser otomatis terbuka ke halaman alat tersebut. Tidak ada langkah scan kedua di dalam web.

### 3.1 Alur saat Web App Dibuka (via scan QR)
1. Pegawai scan QR di alat → browser terbuka ke `?id=ALT-xxxx`.
2. Web app baca parameter `id` dari URL, langsung panggil backend (`cekAlat`) untuk ambil data alat.
3. Halaman menampilkan: Nama Alat, Kategori, Lokasi, Kondisi, dan Status saat ini.
   - Jika `TERSEDIA` → tampilkan satu form: input **NIP** + tombol "Pinjam Alat Ini".
   - Jika `DIPINJAM` → tampilkan info "Sedang dipinjam oleh [Nama Pegawai] sejak [waktu]" + satu form: input **NIP** + tombol "Kembalikan Alat Ini".
4. Tidak ada menu/navigasi tambahan — satu QR = satu halaman = satu aksi (pinjam atau kembali, otomatis ditentukan dari status alat).

### 3.2 Proses Pinjam (saat status alat TERSEDIA)
1. Pegawai isi NIP → submit.
2. Backend validasi NIP:
   - Tidak ditemukan di sheet `Pegawai` → tolak, "NIP tidak terdaftar".
   - Status pegawai `NONAKTIF` → tolak.
3. Backend (dibungkus `LockService` agar tidak race condition antar 2 scan bersamaan):
   - Insert baris baru di `Transaksi` (Jenis = PINJAM, Waktu = server time, snapshot Nama Alat & Nama Pegawai).
   - Update `Alat`: Status = `DIPINJAM`, NIP_Peminjam = NIP pegawai.
4. Web app tampilkan konfirmasi sukses "Alat berhasil dipinjam atas nama [Nama]".

### 3.3 Proses Kembali (saat status alat DIPINJAM)
1. Pegawai isi NIP → submit.
2. Backend validasi: NIP yang diinput harus sama dengan `NIP_Peminjam` tercatat di sheet `Alat` (mencegah orang lain asal-asalan mengembalikan/membatalkan pinjaman orang lain).
   - Tidak cocok → tolak, "NIP tidak cocok dengan peminjam tercatat".
3. Backend:
   - Insert baris baru `Transaksi` (Jenis = KEMBALI, Waktu = server time).
   - Update `Alat`: Status = `TERSEDIA`, NIP_Peminjam = kosong.
4. Web app tampilkan konfirmasi sukses "Alat berhasil dikembalikan".

### 3.3 Alur Validasi & Keamanan (tiap request)
1. Setiap request dari frontend menyertakan header/token API.
2. Apps Script cek token terhadap `Script Properties` — request tanpa token valid ditolak (403).
3. Semua input disanitasi (trim, regex NIP, regex ID_Alat) sebelum diproses.
4. Operasi tulis (pinjam/kembali) dibungkus `LockService.getScriptLock()` supaya tidak terjadi 2 transaksi bentrok pada alat yang sama di waktu bersamaan.
5. Waktu transaksi diambil dari `new Date()` di server (Apps Script), bukan dikirim dari client, agar tidak bisa dipalsukan.

### 3.4 Fitur Tambahan (opsional, fase 2)
- Riwayat peminjaman per alat / per pegawai.
- Dashboard admin: daftar alat sedang dipinjam, alat overdue (lewat X hari belum dikembalikan), laporan kondisi rusak.
- Notifikasi (email/WA) untuk peminjaman lewat batas waktu.
- Generate & cetak QR Code untuk alat baru langsung dari admin panel.

## 4. Endpoint Backend (Apps Script Web App)

Semua lewat satu URL Web App, dibedakan oleh field `action` di body POST.

| Action | Input | Output |
|---|---|---|
| `cekAlat` | `idAlat` | detail alat + status (+ nama peminjam & waktu jika sedang dipinjam) |
| `prosesPinjam` | `idAlat`, `nip` | sukses/gagal + pesan |
| `prosesKembali` | `idAlat`, `nip` | sukses/gagal + pesan |
| `riwayatAlat` | `idAlat` | list transaksi alat tsb |
| `riwayatPegawai` | `nip` | list transaksi pegawai tsb |
| `daftarAlatDipinjam` | - (admin) | list semua alat berstatus DIPINJAM |

## 5. Struktur Folder Proyek

```
sipintar/
├── README.md
├── apps-script/
│   └── Code.gs          # backend, deploy sebagai Web App di Google Apps Script
└── frontend/
    └── src/
        ├── lib/
        │   └── api.js    # wrapper fetch ke Apps Script Web App
        └── components/
            ├── ScanAlat.jsx
            ├── FormPinjam.jsx
            └── FormKembali.jsx
```

## 6. Catatan Deploy
- Apps Script: Deploy → New deployment → Web app → Execute as "Me", Access "Anyone" (tetap aman karena token dicek manual di kode, bukan via access control bawaan Apps Script).
- Simpan `API_TOKEN` di Project Settings → Script Properties, jangan hardcode di `Code.gs`.
- Frontend deploy ke Vercel (sesuai workflow yang biasa dipakai), simpan URL Web App + token di environment variable.
