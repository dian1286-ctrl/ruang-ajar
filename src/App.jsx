import { useState, useEffect } from 'react'
import Header from './components/Header.jsx'
import IdentitasForm from './components/IdentitasForm.jsx'
import { CPForm, TPForm } from './components/CPTPForm.jsx'
import KegiatanForm from './components/KegiatanForm.jsx'
import ModulPreview from './components/ModulPreview.jsx'
import LoadingSpinner from './components/LoadingSpinner.jsx'

const INITIAL_IDENTITAS = {
  namaGuru: '',
  sekolah: '',
  kepalaSekolah: '',
  mapel: '',
  faseKelas: '',
  alokasiWaktu: '',
  jumlahPertemuan: 1,
}

const RIWAYAT_KEY = 'ruangajar_riwayat_identitas'
const MAX_RIWAYAT = 5

function loadRiwayat() {
  try {
    const raw = localStorage.getItem(RIWAYAT_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveRiwayat(identitas) {
  try {
    const existing = loadRiwayat()
    const entry = {
      namaGuru: identitas.namaGuru,
      sekolah: identitas.sekolah,
      kepalaSekolah: identitas.kepalaSekolah,
    }
    const filtered = existing.filter(
      (r) => !(r.namaGuru === entry.namaGuru && r.sekolah === entry.sekolah)
    )
    const updated = [entry, ...filtered].slice(0, MAX_RIWAYAT)
    localStorage.setItem(RIWAYAT_KEY, JSON.stringify(updated))
    return updated
  } catch {
    return loadRiwayat()
  }
}

async function postJSON(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.error || 'Gagal menghasilkan modul. Silakan coba lagi.')
  }
  return data
}

export default function App() {
  const [identitas, setIdentitas] = useState(INITIAL_IDENTITAS)
  const [cp, setCp] = useState('')
  const [tp, setTp] = useState('')
  const [kegiatan, setKegiatan] = useState('')
  const [riwayat, setRiwayat] = useState([])

  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [loadingLabel, setLoadingLabel] = useState('Menyusun modul...')
  const [errorMsg, setErrorMsg] = useState('')
  const [hasil, setHasil] = useState(null)

  useEffect(() => {
    setRiwayat(loadRiwayat())
  }, [])

  function handlePilihRiwayat(r) {
    setIdentitas((prev) => ({
      ...prev,
      namaGuru: r.namaGuru,
      sekolah: r.sekolah,
      kepalaSekolah: r.kepalaSekolah,
    }))
  }

  const isFormValid =
    identitas.namaGuru && identitas.sekolah && identitas.kepalaSekolah && identitas.mapel &&
    identitas.faseKelas && identitas.alokasiWaktu && identitas.jumlahPertemuan >= 1 &&
    cp.trim() && tp.trim() && kegiatan.trim()

  async function handleGenerate(e) {
    e.preventDefault()
    if (!isFormValid || status === 'loading') return

    setStatus('loading')
    setErrorMsg('')
    setHasil(null)

    const jumlahPertemuan = identitas.jumlahPertemuan || 1

    try {
      setLoadingLabel('Menyusun bagian inti modul (CP, asesmen, rubrik, dll)...')
      const inti = await postJSON('/api/generate-inti', { identitas, cp, tp, kegiatan, jumlahPertemuan })

      const pertemuan = []
      for (let i = 1; i <= jumlahPertemuan; i++) {
        setLoadingLabel(
          jumlahPertemuan > 1
            ? `Menyusun pertemuan ${i} dari ${jumlahPertemuan}...`
            : 'Menyusun langkah pembelajaran...'
        )
        const dataPertemuan = await postJSON('/api/generate-pertemuan', {
          identitas,
          cp,
          tp,
          kegiatan,
          pertemuanKe: i,
          jumlahPertemuan,
        })
        pertemuan.push({ nomor: i, ...dataPertemuan })
      }

      setHasil({ ...inti, pertemuan })
      setStatus('success')
      setRiwayat(saveRiwayat(identitas))

      setTimeout(() => {
        document.getElementById('hasil-modul')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan tak terduga.')
      setStatus('error')
    }
  }

  function handleCetak() {
    window.print()
  }

  return (
    <div className="min-h-screen bg-kapur">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-10 no-print">
          <p className="font-mono text-xs tracking-widest text-kapurkuning-dark uppercase mb-2">Susun modul dalam 4 langkah</p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-papan leading-tight">
            Isi form-nya, sisanya biar AI yang merapikan.
          </h1>
          <p className="text-tinta-soft mt-3 max-w-2xl">
            Ruang Ajar menyusun Langkah Pembelajaran, Pemahaman Bermakna, Asesmen, Rubrik, hingga LKPD —
            langsung dari CP, TP, dan ide kegiatan yang Anda tulis. Mendukung satu bab dengan beberapa pertemuan sekaligus.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="space-y-6 no-print">
          <IdentitasForm
            data={identitas}
            onChange={setIdentitas}
            riwayat={riwayat}
            onPilihRiwayat={handlePilihRiwayat}
          />
          <CPForm value={cp} onChange={setCp} />
          <TPForm value={tp} onChange={setTp} />
          <KegiatanForm value={kegiatan} onChange={setKegiatan} />

          {status === 'error' && (
            <div className="rounded-lg border border-red-300 bg-red-50 text-red-700 text-sm px-4 py-3">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-tinta-soft">
              {isFormValid ? 'Semua isian sudah lengkap.' : 'Lengkapi semua isian bertanda *.'}
            </p>
            <button
              type="submit"
              disabled={!isFormValid || status === 'loading'}
              className="inline-flex items-center gap-2 rounded-lg bg-kapurkuning text-papan-dark font-semibold px-6 py-3 text-sm hover:bg-kapurkuning-dark hover:text-kapur disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {status === 'loading' ? 'Menyusun...' : 'Generate Modul'}
            </button>
          </div>
        </form>

        {status === 'loading' && <LoadingSpinner label={loadingLabel} />}

        {status === 'success' && hasil && (
          <div id="hasil-modul" className="mt-12 scroll-mt-6">
            <ModulPreview identitas={identitas} cp={cp} tp={tp} hasil={hasil} onCetak={handleCetak} />
          </div>
        )}
      </main>

      <footer className="no-print border-t border-papan/10 py-6">
        <p className="text-center text-xs text-tinta-soft">Ruang Ajar — dibuat untuk membantu guru menyusun Modul Ajar Kurikulum Merdeka lebih cepat.</p>
      </footer>
    </div>
  )
}
