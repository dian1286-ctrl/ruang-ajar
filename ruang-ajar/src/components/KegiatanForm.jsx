import SectionCard from './SectionCard.jsx'
import { TextAreaField } from './Field.jsx'

export default function KegiatanForm({ value, onChange }) {
  return (
    <SectionCard
      number="04"
      title="Kegiatan Pembelajaran Umum"
      description="Ceritakan garis besar ide kegiatan Anda — AI akan merincikannya menjadi Pendahuluan, Inti, dan Penutup."
    >
      <TextAreaField
        label="Ide / Garis Besar Kegiatan"
        value={value}
        onChange={onChange}
        placeholder="cth. Siswa berdiskusi kelompok menganalisis contoh teks, lalu presentasi, ditutup dengan kuis singkat..."
        rows={5}
        hint="Semakin detail, semakin akurat hasilnya"
        required
      />
    </SectionCard>
  )
}
