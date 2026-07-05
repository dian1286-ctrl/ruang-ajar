import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
} from 'docx'
import { saveAs } from 'file-saver'

const THIN_BORDER = { style: BorderStyle.SINGLE, size: 2, color: 'CCCCCC' }
const CELL_BORDERS = { top: THIN_BORDER, bottom: THIN_BORDER, left: THIN_BORDER, right: THIN_BORDER }

function heading(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150 },
  })
}

function bodyText(text) {
  return new Paragraph({ text: text || '-', spacing: { after: 120 } })
}

function bulletList(items) {
  if (!items || items.length === 0) return [bodyText('-')]
  return items.map(
    (item) =>
      new Paragraph({
        text: item,
        bullet: { level: 0 },
        spacing: { after: 80 },
      })
  )
}

function labeledBullets(label, items) {
  return [
    new Paragraph({
      children: [new TextRun({ text: label, bold: true, color: '3B6E71' })],
      spacing: { before: 100, after: 60 },
    }),
    ...bulletList(items),
  ]
}

function makeCell(text, { bold = false, width, shading } = {}) {
  return new TableCell({
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    borders: CELL_BORDERS,
    shading: shading ? { fill: shading } : undefined,
    children: text
      .split('\n')
      .map((line) => new Paragraph({ children: [new TextRun({ text: line, bold })] })),
  })
}

function rubrikTable(rows) {
  if (!rows || rows.length === 0) return bodyText('-')
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          makeCell('Aspek', { bold: true, width: 30, shading: 'F0EDE3' }),
          makeCell('Kriteria', { bold: true, width: 70, shading: 'F0EDE3' }),
        ],
      }),
      ...rows.map(
        (row) =>
          new TableRow({
            children: [makeCell(row.aspek, { width: 30 }), makeCell(row.kriteria, { width: 70 })],
          })
      ),
    ],
  })
}

function glosariumTable(items) {
  if (!items || items.length === 0) return bodyText('-')
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          makeCell('Istilah', { bold: true, width: 30, shading: 'F0EDE3' }),
          makeCell('Penjelasan', { bold: true, width: 70, shading: 'F0EDE3' }),
        ],
      }),
      ...items.map(
        (item) =>
          new TableRow({
            children: [makeCell(item.istilah, { width: 30 }), makeCell(item.penjelasan, { width: 70 })],
          })
      ),
    ],
  })
}

export async function exportModulToDocx({ identitas, cp, tp, hasil }) {
  const langkah = hasil.langkahPembelajaran || {}
  const asesmen = hasil.asesmen || {}

  const children = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'MODUL AJAR — KURIKULUM MERDEKA', bold: true, size: 20, color: '3B6E71' }),
      ],
      spacing: { after: 40 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: identitas.mapel || 'Mata Pelajaran', bold: true, size: 32 })],
      spacing: { after: 300 },
    }),

    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            makeCell('Nama Guru', { bold: true, width: 25, shading: 'F7F5F0' }),
            makeCell(identitas.namaGuru || '-', { width: 25 }),
            makeCell('Sekolah', { bold: true, width: 25, shading: 'F7F5F0' }),
            makeCell(identitas.sekolah || '-', { width: 25 }),
          ],
        }),
        new TableRow({
          children: [
            makeCell('Fase / Kelas', { bold: true, width: 25, shading: 'F7F5F0' }),
            makeCell(identitas.faseKelas || '-', { width: 25 }),
            makeCell('Alokasi Waktu', { bold: true, width: 25, shading: 'F7F5F0' }),
            makeCell(identitas.alokasiWaktu || '-', { width: 25 }),
          ],
        }),
      ],
    }),

    heading('Capaian Pembelajaran (CP)'),
    bodyText(cp),

    heading('Tujuan Pembelajaran (TP)'),
    bodyText(tp),

    heading('Profil Pelajar Pancasila'),
    ...bulletList(hasil.profilPelajarPancasila),

    heading('Model Pembelajaran'),
    bodyText(hasil.modelPembelajaran),

    heading('Sarana dan Prasarana'),
    ...bulletList(hasil.saranaPrasarana),

    heading('Target Peserta Didik'),
    bodyText(hasil.targetPesertaDidik),

    heading('Pemahaman Bermakna'),
    ...bulletList(hasil.pemahamanBermakna),

    heading('Pertanyaan Pemantik'),
    ...bulletList(hasil.pertanyaanPemantik),

    heading('Langkah-Langkah Pembelajaran'),
    ...labeledBullets('Pendahuluan', langkah.pendahuluan),
    ...labeledBullets('Inti', langkah.inti),
    ...labeledBullets('Penutup', langkah.penutup),

    heading('Rencana Asesmen'),
    ...labeledBullets('Asesmen Formatif', asesmen.formatif),
    ...labeledBullets('Asesmen Sumatif', asesmen.sumatif),

    heading('Rubrik Penilaian'),
    rubrikTable(hasil.rubrikPenilaian),

    heading('Refleksi Guru'),
    ...bulletList(hasil.refleksiGuru),

    heading('Refleksi Peserta Didik'),
    ...bulletList(hasil.refleksiPesertaDidik),

    heading('Glosarium'),
    glosariumTable(hasil.glosarium),

    heading('Daftar Pustaka'),
    ...bulletList(hasil.daftarPustaka),

    heading('Lampiran — Lembar Kerja Peserta Didik (LKPD)'),
    ...bulletList(hasil.lkpd),
  ]

  const doc = new Document({
    sections: [{ properties: {}, children }],
  })

  const blob = await Packer.toBlob(doc)
  const safeName = (identitas.mapel || 'modul-ajar').replace(/[^a-z0-9]+/gi, '-').toLowerCase()
  saveAs(blob, `modul-ajar-${safeName}.docx`)
}
