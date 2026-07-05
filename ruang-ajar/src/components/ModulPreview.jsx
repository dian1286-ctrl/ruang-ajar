function Block({ title, children }) {
  return (
    <div className="mb-6 last:mb-0">
      <h3 className="font-display text-base font-semibold text-papan border-b border-papan/15 pb-2 mb-3">
        {title}
      </h3>
      <div className="text-sm text-tinta leading-relaxed space-y-2">{children}</div>
    </div>
  )
}

function ListOrText({ content }) {
  if (Array.isArray(content)) {
    return (
      <ul className="list-disc pl-5 space-y-1.5">
        {content.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    )
  }
  return <p className="whitespace-pre-line">{content}</p>
}

function TahapKegiatan({ label, items }) {
  if (!items) return null
  return (
    <div className="mb-4 last:mb-0">
      <p className="text-xs font-mono uppercase tracking-wide text-teal-line mb-1.5">{label}</p>
      <ListOrText content={items} />
    </div>
  )
}

export default function ModulPreview({ identitas, cp, tp, hasil, onCetak }) {
  const langkah = hasil.langkahPembelajaran || {}
  const asesmen = hasil.asesmen || {}

  return (
    <div>
      <div className="flex items-center justify-between mb-4 no-print">
        <h2 className="font-display text-lg font-semibold text-papan">Pratinjau Modul Ajar</h2>
        <button
          onClick={onCetak}
          className="inline-flex items-center gap-2 rounded-lg bg-papan text-kapur px-4 py-2 text-sm font-medium hover:bg-papan-dark transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z"/>
          </svg>
          Cetak ke PDF
        </button>
      </div>

      <div id="cetak-area" className="bg-white rounded-2xl border border-papan/10 shadow-sm p-6 sm:p-10 print:shadow-none print:border-none">
        {/* Kop Modul */}
        <div className="text-center border-b-2 border-papan pb-4 mb-6">
          <p className="font-mono text-xs tracking-widest text-teal-line uppercase mb-1">Modul Ajar — Kurikulum Merdeka</p>
          <h1 className="font-display text-xl font-bold text-papan">{identitas.mapel || 'Mata Pelajaran'}</h1>
        </div>

        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1 text-sm mb-8">
          <p><span className="text-tinta-soft">Nama Guru</span><br/><span className="font-medium">{identitas.namaGuru}</span></p>
          <p><span className="text-tinta-soft">Sekolah</span><br/><span className="font-medium">{identitas.sekolah}</span></p>
          <p><span className="text-tinta-soft">Fase / Kelas</span><br/><span className="font-medium">{identitas.faseKelas}</span></p>
          <p><span className="text-tinta-soft">Alokasi Waktu</span><br/><span className="font-medium">{identitas.alokasiWaktu}</span></p>
        </div>

        <Block title="Capaian Pembelajaran (CP)">
          <p className="whitespace-pre-line">{cp}</p>
        </Block>

        <Block title="Tujuan Pembelajaran (TP)">
          <p className="whitespace-pre-line">{tp}</p>
        </Block>

        <Block title="Pemahaman Bermakna">
          <ListOrText content={hasil.pemahamanBermakna} />
        </Block>

        <Block title="Pertanyaan Pemantik">
          <ListOrText content={hasil.pertanyaanPemantik} />
        </Block>

        <Block title="Langkah-Langkah Pembelajaran">
          <TahapKegiatan label="Pendahuluan" items={langkah.pendahuluan} />
          <TahapKegiatan label="Inti" items={langkah.inti} />
          <TahapKegiatan label="Penutup" items={langkah.penutup} />
        </Block>

        <Block title="Rencana Asesmen">
          <TahapKegiatan label="Asesmen Formatif" items={asesmen.formatif} />
          <TahapKegiatan label="Asesmen Sumatif" items={asesmen.sumatif} />
        </Block>

        <Block title="Rubrik Penilaian">
          {Array.isArray(hasil.rubrikPenilaian) ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-papan/15">
                <thead>
                  <tr className="bg-kapur">
                    <th className="border border-papan/15 px-3 py-2 text-left">Aspek</th>
                    <th className="border border-papan/15 px-3 py-2 text-left">Kriteria</th>
                  </tr>
                </thead>
                <tbody>
                  {hasil.rubrikPenilaian.map((row, i) => (
                    <tr key={i}>
                      <td className="border border-papan/15 px-3 py-2 align-top font-medium">{row.aspek}</td>
                      <td className="border border-papan/15 px-3 py-2 align-top whitespace-pre-line">{row.kriteria}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <ListOrText content={hasil.rubrikPenilaian} />
          )}
        </Block>

        <Block title="Lampiran — Lembar Kerja Peserta Didik (LKPD)">
          <ListOrText content={hasil.lkpd} />
        </Block>
      </div>
    </div>
  )
}
