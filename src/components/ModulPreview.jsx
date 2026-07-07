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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
