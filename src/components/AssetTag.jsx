export default function AssetTag({ alat }) {
  const dipinjam = alat.status === "DIPINJAM";

  return (
    <div className="tag-card">
      <div className="tag-notch" aria-hidden="true" />

      <div className="tag-row">
        <span className="tag-eyebrow">ID ASET</span>
        <span className="tag-id">{alat.idAlat}</span>
      </div>

      <h1 className="tag-name">{alat.namaAlat}</h1>
      <p className="tag-meta">{alat.kategori} &middot; {alat.lokasi}</p>

      <div className="tag-perforation" aria-hidden="true" />

      <div className="tag-status-row">
        <span className={`tag-dot ${dipinjam ? "tag-dot--busy" : "tag-dot--free"}`} />
        <span className="tag-status-label">
          {dipinjam ? "Sedang dipinjam" : "Tersedia"}
        </span>
      </div>

      {dipinjam && (
        <p className="tag-borrower">
          oleh <strong>{alat.namaPeminjam}</strong>
          {alat.sejak && <span className="tag-since"> &middot; sejak {alat.sejak}</span>}
        </p>
      )}

      <p className="tag-kondisi">Kondisi: {alat.kondisi}</p>
    </div>
  );
}
