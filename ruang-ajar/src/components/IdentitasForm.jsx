import SectionCard from './SectionCard.jsx'
import { TextField } from './Field.jsx'

export default function IdentitasForm({ data, onChange }) {
  const set = (key) => (val) => onChange({ ...data, [key]: val })

  return (
    <SectionCard
      number="01"
      title="Identitas Modul"
      description="Data ini akan muncul di kop Modul Ajar."
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <TextField label="Nama Guru" value={data.namaGuru} onChange={set('namaGuru')} placeholder="cth. Siti Rahma, S.Pd." required />
        <TextField label="Nama Sekolah" value={data.sekolah} onChange={set('sekolah')} placeholder="cth. SMP Negeri 1 Malang" required />
        <TextField label="Mata Pelajaran" value={data.mapel} onChange={set('mapel')} placeholder="cth. Bahasa Indonesia" required />
        <TextField label="Fase / Kelas" value={data.faseKelas} onChange={set('faseKelas')} placeholder="cth. Fase D / Kelas VIII" required />
        <TextField label="Alokasi Waktu" value={data.alokasiWaktu} onChange={set('alokasiWaktu')} placeholder="cth. 2 x 40 menit (1 pertemuan)" required />
      </div>
    </SectionCard>
  )
}
