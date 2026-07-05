import SectionCard from './SectionCard.jsx'
import { TextAreaField } from './Field.jsx'

export function CPForm({ value, onChange }) {
  return (
    <SectionCard
      number="02"
      title="Capaian Pembelajaran (CP)"
      description="Tempelkan CP sesuai fase dari dokumen Kurikulum Merdeka."
    >
      <TextAreaField
        label="Capaian Pembelajaran"
        value={value}
        onChange={onChange}
        placeholder="Tempelkan teks CP di sini..."
        rows={5}
        required
      />
    </SectionCard>
  )
}

export function TPForm({ value, onChange }) {
  return (
    <SectionCard
      number="03"
      title="Tujuan Pembelajaran (TP)"
      description="Rumusan TP yang sudah diturunkan dari CP."
    >
      <TextAreaField
        label="Tujuan Pembelajaran"
        value={value}
        onChange={onChange}
        placeholder="cth. Peserta didik mampu menganalisis struktur teks argumentasi..."
        rows={5}
        required
      />
    </SectionCard>
  )
}
