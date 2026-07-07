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

function tahapSection(label, tahap) {
  const durasiSuffix = tahap?.durasi ? ` (${tahap.durasi})` : ''
  return labeledBullets(`${label}${durasiSuffix}`, tahap?.kegiatan)
}

function makeCell(text, { bold = false, width, shading } = {}) {
  return new TableCell({
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    borders: CELL_BORDERS,
    shading: shading ? { fill: shading } : undefined,
    children: (text || '-')
      .split('\n')
      .map((line) => new Paragraph({ children: [new TextRun({ text: line, bold })] })),
  })
}

function twoColKeyValueTable(rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(
      (row) =>
        new TableRow({
          children: [
            makeCell(row.label, { bold: true, width: 30, shading: 'F7F5F0' }),
            makeCell(row.value, { width: 70 }),
          ],
        })
    ),
  })
}

function cpTable(rows) {
  if (!rows || rows.length === 0) return bodyText('-')
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          makeCell('Elemen', { bold: true, width: 25, shading: 'F0EDE3' }),
          makeCell('Capaian Pembelajaran', { bold: true, width: 75, shading: 'F0EDE3' }),
        ],
      }),
      ...rows.map(
        (row) =>
          new TableRow({
            children: [makeCell(row.elemen, { width: 25 }), makeCell(row.capaian, { width: 75 })],
          })
      ),
    ],
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

function pengesahanSection(identitas) {
  const tanggal = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  const blank = (n) => Array.from({ length: n }, () => new Paragraph({ text: '' }))

  return [
    new Paragraph({
      text: '',
      spacing: { before: 400 },
      border: { top: { style: BorderStyle.SINGLE, size: 6, color: '1F3D2B' } },
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.CENTER,
      text: 'Lembar Pengesahan',
      spacing: { before: 200, after: 200 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      text: `${identitas.sekolah || '.....................'}, ${tanggal}`,
      spacing: { after: 200 },
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [
                new Paragraph({ text: 'Mengetahui,', alignment: AlignmentType.CENTER }),
                new Paragraph({ text: 'Kepala Sekolah', alignment: AlignmentType.CENTER }),
                ...blank(3),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: identitas.kepalaSekolah || '.....................', bold: true, underline: {} })],
                }),
                new Paragraph({ text: 'NIP. .....................', alignment: AlignmentType.CENTER }),
              ],
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [
                new Paragraph({ text: ' ', alignment: AlignmentType.CENTER }),
                new Paragraph({ text: 'Guru Mata Pelajaran', alignment: AlignmentType.CENTER }),
                ...blank(3),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: identitas.namaGuru || '.....................', bold: true, underline: {} })],
                }),
                new Paragraph({ text: 'NIP. .....................', alignment: AlignmentType.CENTER }),
              ],
            }),
          ],
        }),
      ],
    }),
  ]
}

export async function exportModulToDocx({ identitas, cp, tp, hasil }) {
  const langkah = hasil.langkahPembelajaran || {}
  const asesmen = hasil.asesmen || {}
  const remedialPengayaan = hasil.remedialPengayaan || {}

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

    heading('Identitas Modul'),
    twoColKeyValueTable([
      { label: 'Nama Guru', value: identitas.namaGuru },
      { label: 'Sekolah', value: identitas.sekolah },
      { label: 'Kepala Sekolah', value: identitas.kepalaSekolah },
      { label: 'Mata Pelajaran', value: identitas.mapel },
      { label: 'Fase / Kelas', value: identitas.faseKelas },
      { label: 'Alokasi Waktu', value: identitas.alokasiWaktu },
    ]),

    heading('Capaian Pembelajaran (CP)'),
    Array.isArray(hasil.cpTerstruktur) && hasil.cpTerstruktur.length > 0 ? cpTable(hasil.cpTerstruktur) : bodyText(cp),

    heading('Tujuan Pembelajaran (TP)'),
    bodyText(tp),

    heading('8 Dimensi Profil Lulusan'),
    ...bulletList(hasil.delapanDimensiProfilLulusan),

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
    ...tahapSection('Pendahuluan', langkah.pendahuluan),
    ...tahapSection('Inti', langkah.inti),
    ...tahapSection('Penutup', langkah.penutup),

    heading('Rencana Asesmen'),
    ...labeledBullets('Asesmen Formatif', asesmen.formatif),
    ...labeledBullets('Asesmen Sumatif', asesmen.sumatif),

    heading('Rubrik Penilaian'),
    rubrikTable(hasil.rubrikPenilaian),

    heading('Program Remedial dan Pengayaan'),
    ...labeledBullets('Remedial', remedialPengayaan.remedial),
    ...labeledBullets('Pengayaan', remedialPengayaan.pengayaan),

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

    ...pengesahanSection(identitas),
  ]

  const doc = new Document({
    sections: [{ properties: {}, children }],
  })

  const blob = await Packer.toBlob(doc)
  const safeName = (identitas.mapel || 'modul-ajar').replace(/[^a-z0-9]+/gi, '-').toLowerCase()
  saveAs(blob, `modul-ajar-${safeName}.docx`)
}
