import { useState } from 'react'

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

function TahapKegiatan({ label, tahap }) {
  if (!tahap) return null
  return (
    <div className="mb-4 last:mb-0">
      <p className="text-xs font-mono uppercase tracking-wide text-teal-line mb-1.5">
        {label} {tahap.durasi && <span className="normal-case text-tinta-soft">({tahap.durasi})</span>}
      </p>
      <ListOrText content={tahap.kegiatan} />
    </div>
  )
}

function KeyValueTable({ rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-papan/15">
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td className="border border-papan/15 px-3 py-2 align-top font-medium w-1/3 bg-kapur">{row.label}</td>
              <td className="border border-papan/15 px-3 py-2 align-top whitespace-pre-line">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function ModulPreview({ identitas, cp, tp, hasil, onCetak }) {
  const [downloading, setDownloading] = useState(false)
  const langkah = hasil.langkahPembelajaran || {}
  const asesmen = hasil.asesmen || {}
  const remedialPengayaan = hasil.remedialPengayaan || {}

  async function handleUnduhWord() {
    setDownloading(true)
    try {
      const { exportModulToDocx } = await import('../utils/exportDocx.js')
      await exportModulToDocx({ identitas, cp, tp, hasil })
    } catch (err) {
      console.error('Gagal membuat file Word:', err)
      alert('Gagal membuat file Word. Silakan coba lagi.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 no-print">
        <h2 className="font-display text-lg font-semibold text-papan">Pratinjau Modul Ajar</h2>
        <div className="flex gap-2">
          <button
            onClick={handleUnduhWord}
            disabled={downloading}
            className="inline-flex items-center gap-2 rounded-lg border border-papan/20 bg-white text-papan px-4 py-2 text-sm font-medium hover:bg-kapur disabled:opacity-50 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {downloading ? 'Menyiapkan...' : 'Unduh Word (.docx)'}
          </button>
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
      </div>

      <div id="cetak-area" className="bg-white rounded-2xl border border-papan/10 shadow-sm p-6 sm:p-10 print:shadow-none print:border-none">
        {/* Kop Modul */}
        <div className="text-center border-b-2 border-papan pb-4 mb-6">
          <p className="font-mono text-xs tracking-widest text-teal-line uppercase mb-1">Modul Ajar — Kurikulum Merdeka</p>
          <h1 className="font-display text-xl font-bold text-papan">{identitas.mapel || 'Mata Pelajaran'}</h1>
        </div>

        <Block title="Identitas Modul">
          <KeyValueTable
            rows={[
              { label: 'Nama Guru', value: identitas.namaGuru },
              { label: 'Sekolah', value: identitas.sekolah },
              { label: 'Kepala Sekolah', value: identitas.kepalaSekolah },
              { label: 'Mata Pelajaran', value: identitas.mapel },
              { label: 'Fase / Kelas', value: identitas.faseKelas },
              { label: 'Alokasi Waktu', value: identitas.alokasiWaktu },
            ]}
          />
        </Block>

        <Block title="Capaian Pembelajaran (CP)">
          {Array.isArray(hasil.cpTerstruktur) && hasil.cpTerstruktur.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-papan/15">
                <thead>
                  <tr className="bg-kapur">
                    <th className="border border-papan/15 px-3 py-2 text-left w-1/4">Elemen</th>
                    <th className="border border-papan/15 px-3 py-2 text-left">Capaian Pembelajaran</th>
                  </tr>
                </thead>
                <tbody>
                  {hasil.cpTerstruktur.map((row, i) => (
                    <tr key={i}>
                      <td className="border border-papan/15 px-3 py-2 align-top font-medium">{row.elemen}</td>
                      <td className="border border-papan/15 px-3 py-2 align-top whitespace-pre-line">{row.capaian}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="whitespace-pre-line">{cp}</p>
          )}
        </Block>

        <Block title="Tujuan Pembelajaran (TP)">
          <p className="whitespace-pre-line">{tp}</p>
        </Block>

        {hasil.delapanDimensiProfilLulusan && (
          <Block title="8 Dimensi Profil Lulusan">
            <ListOrText content={hasil.delapanDimensiProfilLulusan} />
          </Block>
        )}

        {(hasil.modelPembelajaran || hasil.saranaPrasarana || hasil.targetPesertaDidik) && (
          <Block title="Identitas Kegiatan">
            <KeyValueTable
              rows={[
                hasil.modelPembelajaran && { label: 'Model Pembelajaran', value: hasil.modelPembelajaran },
                hasil.saranaPrasarana && {
                  label: 'Sarana & Prasarana',
                  value: Array.isArray(hasil.saranaPrasarana) ? hasil.saranaPrasarana.join(', ') : hasil.saranaPrasarana,
                },
                hasil.targetPesertaDidik && { label: 'Target Peserta Didik', value: hasil.targetPesertaDidik },
              ].filter(Boolean)}
            />
          </Block>
        )}

        <Block title="Pemahaman Bermakna">
          <ListOrText content={hasil.pemahamanBermakna} />
        </Block>

        <Block title="Pertanyaan Pemantik">
          <ListOrText content={hasil.pertanyaanPemantik} />
        </Block>

        <Block title="Langkah-Langkah Pembelajaran">
          <TahapKegiatan label="Pendahuluan" tahap={langkah.pendahuluan} />
          <TahapKegiatan label="Inti" tahap={langkah.inti} />
          <TahapKegiatan label="Penutup" tahap={langkah.penutup} />
        </Block>

        <Block title="Rencana Asesmen">
          <div className="mb-4 last:mb-0">
            <p className="text-xs font-mono uppercase tracking-wide text-teal-line mb-1.5">Asesmen Formatif</p>
            <ListOrText content={asesmen.formatif} />
          </div>
          <div className="mb-4 last:mb-0">
            <p className="text-xs font-mono uppercase tracking-wide text-teal-line mb-1.5">Asesmen Sumatif</p>
            <ListOrText content={asesmen.sumatif} />
          </div>
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

        {(remedialPengayaan.remedial || remedialPengayaan.pengayaan) && (
          <Block title="Program Remedial dan Pengayaan">
            <div className="mb-4 last:mb-0">
              <p className="text-xs font-mono uppercase tracking-wide text-teal-line mb-1.5">Remedial</p>
              <ListOrText content={remedialPengayaan.remedial} />
            </div>
            <div className="mb-4 last:mb-0">
              <p className="text-xs font-mono uppercase tracking-wide text-teal-line mb-1.5">Pengayaan</p>
              <ListOrText content={remedialPengayaan.pengayaan} />
            </div>
          </Block>
        )}

        {hasil.refleksiGuru && (
          <Block title="Refleksi Guru">
            <ListOrText content={hasil.refleksiGuru} />
          </Block>
        )}

        {hasil.refleksiPesertaDidik && (
          <Block title="Refleksi Peserta Didik">
            <ListOrText content={hasil.refleksiPesertaDidik} />
          </Block>
        )}

        {hasil.glosarium && (
          <Block title="Glosarium">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-papan/15">
                <tbody>
                  {hasil.glosarium.map((item, i) => (
                    <tr key={i}>
                      <td className="border border-papan/15 px-3 py-2 align-top font-medium w-1/3">{item.istilah}</td>
                      <td className="border border-papan/15 px-3 py-2 align-top">{item.penjelasan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Block>
        )}

        {hasil.daftarPustaka && (
          <Block title="Daftar Pustaka">
            <ListOrText content={hasil.daftarPustaka} />
          </Block>
        )}

        <Block title="Lampiran — Lembar Kerja Peserta Didik (LKPD)">
          <ListOrText content={hasil.lkpd} />
        </Block>

        {/* Lembar Pengesahan */}
        <div className="mt-10 pt-6 border-t-2 border-papan">
          <h3 className="font-display text-base font-semibold text-papan mb-6 text-center">Lembar Pengesahan</h3>
          <p className="text-sm text-tinta text-center mb-8">
            {identitas.sekolah || '.....................'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <div className="grid sm:grid-cols-2 gap-8 text-sm text-center">
            <div>
              <p>Mengetahui,</p>
              <p>Kepala Sekolah</p>
              <div className="h-20"></div>
              <p className="font-semibold underline">{identitas.kepalaSekolah || '.....................'}</p>
              <p className="text-tinta-soft text-xs mt-1">NIP. .....................</p>
            </div>
            <div>
              <p>&nbsp;</p>
              <p>Guru Mata Pelajaran</p>
              <div className="h-20"></div>
              <p className="font-semibold underline">{identitas.namaGuru || '.....................'}</p>
              <p className="text-tinta-soft text-xs mt-1">NIP. .....................</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
