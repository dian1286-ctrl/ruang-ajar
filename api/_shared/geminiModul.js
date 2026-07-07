import { GoogleGenAI } from '@google/genai'

// Shared core logic for generating a Modul Ajar via Gemini.
// Used by both the Vercel handler (api/generate.js) and the
// Netlify handler (netlify/functions/generate.js) so the prompt
// and schema only live in one place.

export const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    cpTerstruktur: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          elemen: { type: 'string' },
          capaian: { type: 'string' },
        },
        required: ['elemen', 'capaian'],
      },
    },
    delapanDimensiProfilLulusan: { type: 'array', items: { type: 'string' } },
    modelPembelajaran: { type: 'string' },
    saranaPrasarana: { type: 'array', items: { type: 'string' } },
    targetPesertaDidik: { type: 'string' },
    pemahamanBermakna: { type: 'array', items: { type: 'string' } },
    pertanyaanPemantik: { type: 'array', items: { type: 'string' } },
    langkahPembelajaran: {
      type: 'object',
      properties: {
        pendahuluan: {
          type: 'object',
          properties: {
            durasi: { type: 'string' },
            kegiatan: { type: 'array', items: { type: 'string' } },
          },
          required: ['durasi', 'kegiatan'],
        },
        inti: {
          type: 'object',
          properties: {
            durasi: { type: 'string' },
            kegiatan: { type: 'array', items: { type: 'string' } },
          },
          required: ['durasi', 'kegiatan'],
        },
        penutup: {
          type: 'object',
          properties: {
            durasi: { type: 'string' },
            kegiatan: { type: 'array', items: { type: 'string' } },
          },
          required: ['durasi', 'kegiatan'],
        },
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
    remedialPengayaan: {
      type: 'object',
      properties: {
        remedial: { type: 'array', items: { type: 'string' } },
        pengayaan: { type: 'array', items: { type: 'string' } },
      },
      required: ['remedial', 'pengayaan'],
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
    'cpTerstruktur',
    'delapanDimensiProfilLulusan',
    'modelPembelajaran',
    'saranaPrasarana',
    'targetPesertaDidik',
    'pemahamanBermakna',
    'pertanyaanPemantik',
    'langkahPembelajaran',
    'asesmen',
    'rubrikPenilaian',
    'remedialPengayaan',
    'lkpd',
    'refleksiGuru',
    'refleksiPesertaDidik',
    'glosarium',
    'daftarPustaka',
  ],
}

function buildPrompt({ identitas, cp, tp, kegiatan }) {
  return `Anda adalah widyaiswara dan penulis Modul Ajar berpengalaman di Indonesia, ahli dalam kerangka Kurikulum Merdeka Revisi 2025 (pendekatan Pembelajaran Mendalam / Deep Learning). Tugas Anda menyusun Modul Ajar yang LENGKAP, RINCI, dan SIAP PAKAI langsung oleh guru di kelas.

Konteks dari guru:
- Mata Pelajaran: ${identitas.mapel}
- Fase/Kelas: ${identitas.faseKelas}
- Alokasi Waktu: ${identitas.alokasiWaktu}

Capaian Pembelajaran (CP) — teks mentah yang ditempel guru, biasanya berisi beberapa elemen (mis. Menyimak, Membaca dan Memirsa, Berbicara dan Mempresentasikan, Menulis) masing-masing dengan uraian capaiannya:
"""${cp}"""

Tujuan Pembelajaran (TP):
"""${tp}"""

Ide/Garis Besar Kegiatan Pembelajaran dari guru:
"""${kegiatan}"""

Susun seluruh komponen berikut dalam Bahasa Indonesia yang jelas, konkret, dan kontekstual dengan mata pelajaran serta fase/kelas di atas:

1. cpTerstruktur: PECAH teks CP mentah di atas menjadi baris-baris terpisah per elemen. Setiap baris berisi "elemen" (nama elemen, mis. "Menyimak", "Membaca dan Memirsa") dan "capaian" (uraian capaian pembelajaran elemen tersebut, apa adanya/diringkas rapi tanpa mengubah makna). Jika CP yang ditempel tidak berelemen jelas, buat satu baris dengan elemen "Umum" berisi keseluruhan teks CP.
2. delapanDimensiProfilLulusan: pilih 2-3 dari 8 Dimensi Profil Lulusan Kurikulum Merdeka Revisi 2025 yang PALING relevan dengan TP dan kegiatan ini. Delapan dimensi tersebut adalah: (1) Beriman, Bertakwa kepada Tuhan Yang Maha Esa, dan Berakhlak Mulia, (2) Berkebinekaan Global, (3) Bergotong Royong, (4) Mandiri, (5) Bernalar Kritis, (6) Kreatif, (7) Cinta Lingkungan, (8) Sehat Jasmani dan Rohani. Untuk setiap dimensi yang dipilih, tulis satu string berisi nama dimensi diikuti penjelasan singkat kaitannya dengan kegiatan.
3. modelPembelajaran: satu kalimat menyebutkan model/pendekatan pembelajaran yang paling cocok (mis. Discovery Learning, Problem Based Learning, Cooperative Learning) beserta alasan singkat kenapa cocok untuk kegiatan ini.
4. saranaPrasarana: 3-5 alat/bahan/media yang realistis dibutuhkan.
5. targetPesertaDidik: satu-dua kalimat mendeskripsikan karakteristik target peserta didik.
6. pemahamanBermakna: 2-3 kalimat pemahaman bermakna yang relevan dengan TP.
7. pertanyaanPemantik: 3-4 pertanyaan pemantik, urutkan dari sederhana ke lebih dalam.
8. langkahPembelajaran: untuk MASING-MASING dari pendahuluan, inti, dan penutup, berikan:
   - "durasi": SATU perkiraan total waktu untuk keseluruhan tahap itu saja (mis. "10 menit"), TOTAL ketiga durasi harus sesuai dengan alokasi waktu yang tersedia (${identitas.alokasiWaktu}).
   - "kegiatan": daftar poin kegiatan konkret dan actionable TANPA mencantumkan menit di masing-masing poin (jangan tulis estimasi waktu per poin, cukup di field "durasi" saja). Pendahuluan 4-5 poin (salam & doa, presensi, apersepsi, penyampaian tujuan, motivasi). Inti 6-8 poin (kembangkan ide guru menjadi tahapan runtut dan rinci, sebutkan pengelompokan siswa dan peran guru). Penutup 3-4 poin (kesimpulan bersama, refleksi singkat, tindak lanjut, doa
