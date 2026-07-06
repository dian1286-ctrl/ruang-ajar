import { GoogleGenAI } from '@google/genai'

export const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    profilPelajarPancasila: { type: 'array', items: { type: 'string' } },
    modelPembelajaran: { type: 'string' },
    saranaPrasarana: { type: 'array', items: { type: 'string' } },
    targetPesertaDidik: { type: 'string' },
    pemahamanBermakna: { type: 'array', items: { type: 'string' } },
    pertanyaanPemantik: { type: 'array', items: { type: 'string' } },
    langkahPembelajaran: {
      type: 'object',
      properties: {
        pendahuluan: { type: 'array', items: { type: 'string' } },
        inti: { type: 'array', items: { type: 'string' } },
        penutup: { type: 'array', items: { type: 'string' } },
      },
      required: ['pendahuluan', 'inti', 'penutup'],
    },
    asesmen: {
      type: 'object',
      properties: {
        formatif: { type: 'array', items: { type: 'string' } },
        sumatif: { type: 'array', items: { type: 'string' } },
      },
      required: ['formatif', 'sumatif'],
    },
    rubrikPenilaian: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          aspek: { type: 'string' },
          kriteria: { type: 'string' },
        },
        required: ['aspek', 'kriteria'],
      },
    },
    lkpd: { type: 'array', items: { type: 'string' } },
    refleksiGuru: { type: 'array', items: { type: 'string' } },
    refleksiPesertaDidik: { type: 'array', items: { type: 'string' } },
    glosarium: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          istilah: { type: 'string' },
          penjelasan: { type: 'string' },
        },
        required: ['istilah', 'penjelasan'],
      },
    },
    daftarPustaka: { type: 'array', items: { type: 'string' } },
  },
  required: [
    'profilPelajarPancasila',
    'modelPembelajaran',
    'saranaPrasarana',
    'targetPesertaDidik',
    'pemahamanBermakna',
    'pertanyaanPemantik',
    'langkahPembelajaran',
    'asesmen',
    'rubrikPenilaian',
    'lkpd',
    'refleksiGuru',
    'refleksiPesertaDidik',
    'glosarium',
    'daftarPustaka',
  ],
}

function buildPrompt({ identitas, cp, tp, kegiatan }) {
  return `Anda adalah widyaiswara dan penulis Modul Ajar berpengalaman di Indonesia, ahli dalam kerangka Kurikulum Merdeka. Tugas Anda menyusun Modul Ajar yang LENGKAP, RINCI, dan SIAP PAKAI langsung oleh guru di kelas — setara kualitas modul ajar terbaik yang biasa dijadikan rujukan sesama guru, bukan sekadar draf kasar.

Konteks dari guru:
- Mata Pelajaran: ${identitas.mapel}
- Fase/Kelas: ${identitas.faseKelas}
- Alokasi Waktu:
