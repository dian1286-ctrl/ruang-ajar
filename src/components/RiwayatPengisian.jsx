function formatTanggal(iso) {
  try {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

export default function RiwayatPengisian({ riwayat, onPakai, onHapus }) {
  if (!riwayat || riwayat.length === 0) return null

  return (
    <div className="bg-kapur-card rounded-2xl border border-papan/10 shadow-sm p-5 sm:p-6 no-print">
      <div className="flex items-start gap-3 mb-3">
        <span className="font-mono text-xs text-teal-line bg-teal-line/10 border border-teal-line/25 rounded-full w-8 h-8 flex items-center justify-center shrink-0">
          ⟲
        </span>
        <div>
          <h2 className="font-display text-base font-semibold text-papan">Riwayat Pengisian</h2>
          <p className="text-xs text-tinta-soft mt-0.5">
            Isian sebelumnya tersimpan di browser ini. Klik "Gunakan" untuk mengisi ulang form secara otomatis.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {riwayat.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-papan/10 bg-kapur px-3.5 py-2.5"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-tinta truncate">
                {r.identitas.mapel || 'Tanpa mata pelajaran'} — {r.identitas.faseKelas || '-'}
              </p>
              <p className="text-xs text-tinta-soft truncate">
                {r.identitas.namaGuru} · {formatTanggal(r.savedAt)}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onPakai(r)}
                className="text-xs font-medium rounded-full bg-papan text-kapur px-3.5 py-1.5 hover:bg-papan-dark transition-colors"
              >
                Gunakan
              </button>
              <button
                type="button"
                onClick={() => onHapus(r.id)}
                aria-label="Hapus riwayat ini"
                className="text-tinta-soft hover:text-red-600 transition-colors text-lg leading-none px-1"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
