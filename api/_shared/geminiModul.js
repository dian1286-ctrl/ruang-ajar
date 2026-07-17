import { GoogleGenAI } from '@google/genai'

// Shared core logic for generating a Modul Ajar via Gemini.
// Used by both the Vercel handlers (api/generate-inti.js, api/generate-pertemuan.js)
// and the Netlify handlers, so the prompts and schemas only live in one place.
//
// The generation is split into TWO smaller calls instead of one big call:
//   1. generateModulInti  -> everything that applies to the whole "bab" once
//      (CP, 8 Dimensi, model pembelajaran, sarana, asesmen, rubrik, dst.)
//   2. generatePertemuan  -> Langkah Pembelajaran + LKPD for ONE specific pertemuan
// This keeps each individual AI call small and fast, avoiding the serverless
// function timeout that a single giant call used to hit.

export const RESPONSE_SCHEMA_INTI = {
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
    'asesmen',
    'rubrikPenilaian',
    'remedialPengayaan',
    'refleksiGuru',
    'refleksiPesertaDidik',
    'glosarium',
    'daftarPustaka',
  ],
}

export const RESPONSE_SCHEMA_PERTEMUAN = {
  type: 'object',
  properties: {
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
    lkpd: { type: 'array', items: { type: 'string' } },
  },
  required: ['langkahPembelajaran', 'lkpd'],
}

function buildPromptInti({ identitas, cp, tp, kegiatan, jumlahPertemuan }) {
  return `Anda adalah widyaiswara dan penulis Modul Ajar berpengalaman di Indonesia, ahli dalam kerangka Kurikulum Merdeka Revisi 2025 (pendekatan Pembelajaran Mendalam / Deep Learning). Modul ini mencakup 1 bab yang akan diajarkan dalam ${jumlahPertemuan} kali pertemuan.

Konteks dari guru:
- Mata Pelajaran: ${identitas.mapel}
- Fase/Kelas: ${identitas.faseKelas}
- Alokasi Waktu per pertemuan: ${identitas.alokasiWaktu}
- Jumlah Pertemuan: ${jumlahPertemuan}

Capaian Pembelajaran (CP) — teks mentah yang ditempel guru, biasanya berisi beberapa elemen:
"""${cp}"""

Tujuan Pembelajaran (TP):
"""${tp}"""

Gambaran keseluruhan kegiatan pembelajaran sepanjang bab ini (mencakup semua pertemuan):
"""${kegiatan}"""

Susun komponen-komponen berikut yang berlaku untuk KESELURUHAN bab (bukan per pertemuan), dalam Bahasa Indonesia yang jelas dan kontekstual:

1. cpTerstruktur: PECAH teks CP mentah menjadi baris per elemen, masing-masing berisi "elemen" dan "capaian". Jika tidak berelemen jelas, buat satu baris elemen "Umum".
2. delapanDimensiProfilLulusan: pilih 2-3 dari 8 Dimensi Profil Lulusan (Beriman-Bertakwa-Berakhlak Mulia, Berkebinekaan Global, Bergotong Royong, Mandiri, Bernalar Kritis, Kreatif, Cinta Lingkungan, Sehat Jasmani dan Rohani) paling relevan, masing-masing dengan penjelasan singkat kaitannya.
3. modelPembelajaran: model/pendekatan pembelajaran yang cocok untuk keseluruhan bab beserta alasan singkat.
4. saranaPrasarana: 3-5 alat/bahan/media yang dibutuhkan sepanjang bab ini.
5. targetPesertaDidik: satu-dua kalimat karakteristik target peserta didik.
6. pemahamanBermakna: 2-3 kalimat pemahaman bermakna untuk keseluruhan bab.
7. pertanyaanPemantik: 3-4 pertanyaan pemantik pembuka bab.
8. asesmen: formatif (2-3 poin, dilakukan sepanjang pertemuan) dan sumatif (2-3 poin, di akhir bab).
9. rubrikPenilaian: 3-4 baris "aspek" dan "kriteria" (4 level: Sangat Baik/Baik/Cukup/Perlu Bimbingan, dipisah baris baru).
10. remedialPengayaan: "remedial" (2-3 poin) dan "pengayaan" (2-3 poin) untuk keseluruhan bab.
11. refleksiGuru: 3 pertanyaan reflektif guru untuk keseluruhan bab.
12. refleksiPesertaDidik: 3 pertanyaan reflektif peserta didik.
13. glosarium: 3-5 istilah kunci dari keseluruhan materi bab.
14. daftarPustaka: 2-3 referensi relevan.

Kembalikan HANYA JSON sesuai skema yang diberikan, tanpa teks tambahan, tanpa markdown code fence.`
}

function buildPromptPertemuan({ identitas, cp, tp, kegiatan, pertemuanKe, jumlahPertemuan }) {
  return `Anda adalah widyaiswara dan penulis Modul Ajar berpengalaman di Indonesia, ahli dalam kerangka Kurikulum Merdeka Revisi 2025. Fokus Anda SEKARANG HANYA untuk PERTEMUAN KE-${pertemuanKe} dari total ${jumlahPertemuan} pertemuan dalam bab ini.

Konteks:
- Mata Pelajaran: ${identitas.mapel}
- Fase/Kelas: ${identitas.faseKelas}
- Alokasi Waktu pertemuan ini: ${identitas.alokasiWaktu}
- Ini adalah pertemuan ke-${pertemuanKe} dari ${jumlahPertemuan} pertemuan.

Tujuan Pembelajaran (TP) keseluruhan bab:
"""${tp}"""

Gambaran keseluruhan kegiatan pembelajaran sepanjang bab (mencakup semua pertemuan — kalau teks ini sudah menyebutkan pembagian per pertemuan secara eksplisit, seperti "Pertemuan ${pertemuanKe}: ...", GUNAKAN KHUSUS bagian itu saja. Kalau tidak disebutkan secara eksplisit per pertemuan, bagi sendiri secara proporsional dan logis bagian mana yang cocok untuk pertemuan ke-${pertemuanKe} dari ${jumlahPertemuan}, dengan mempertimbangkan urutan alur belajar yang wajar dari awal bab sampai akhir bab):
"""${kegiatan}"""

Susun KHUSUS untuk pertemuan ke-${pertemuanKe} ini saja:

1. langkahPembelajaran: untuk MASING-MASING dari pendahuluan, inti, dan penutup, berikan:
   - "durasi": SATU perkiraan total waktu untuk tahap itu (mis. "10 menit"), TOTAL ketiga durasi harus sesuai alokasi waktu pertemuan ini (${identitas.alokasiWaktu}).
   - "kegiatan": daftar poin kegiatan konkret dan actionable TANPA mencantumkan menit per poin. Pendahuluan 4-5 poin (salam & doa, presensi, apersepsi yang mengaitkan dengan pertemuan sebelumnya jika pertemuan ke-${pertemuanKe} > 1, penyampaian tujuan pertemuan ini, motivasi). Inti 6-8 poin, konkret dan sesuai fokus pertemuan ini saja. Penutup 3-4 poin (kesimpulan, refleksi singkat, tindak lanjut ke pertemuan berikutnya jika ada, doa penutup).
2. lkpd: 5-7 poin instruksi Lembar Kerja Peserta Didik khusus untuk kegiatan inti pertemuan ini saja, siap dibagikan ke siswa.

Kembalikan HANYA JSON sesuai skema yang diberikan, tanpa teks tambahan, tanpa markdown code fence.`
}

async function callGemini({ apiKey, prompt, schema }) {
  const ai = new GoogleGenAI({ apiKey })
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: schema,
      temperature: 0.6,
    },
  })
  return JSON.parse(response.text)
}

/**
 * Generates the "inti" (core, once-per-bab) parts of the Modul Ajar.
 * Returns { ok: true, data } or { ok: false, status, error }
 */
export async function generateModulInti({ apiKey, identitas, cp, tp, kegiatan, jumlahPertemuan }) {
  if (!apiKey) {
    return { ok: false, status: 500, error: 'GEMINI_API_KEY belum dikonfigurasi di server.' }
  }
  if (!identitas || !cp?.trim() || !tp?.trim() || !kegiatan?.trim()) {
    return { ok: false, status: 400, error: 'Data tidak lengkap. Mohon isi semua kolom yang diperlukan.' }
  }

  try {
    const prompt = buildPromptInti({ identitas, cp, tp, kegiatan, jumlahPertemuan: jumlahPertemuan || 1 })
    const data = await callGemini({ apiKey, prompt, schema: RESPONSE_SCHEMA_INTI })
    return { ok: true, data }
  } catch (err) {
    console.error('Gemini API error (inti):', err)
    return { ok: false, status: 500, error: 'Gagal menghubungi layanan AI untuk bagian inti modul. Silakan coba lagi.' }
  }
}

/**
 * Generates Langkah Pembelajaran + LKPD for ONE specific pertemuan.
 * Returns { ok: true, data } or { ok: false, status, error }
 */
export async function generatePertemuan({ apiKey, identitas, cp, tp, kegiatan, pertemuanKe, jumlahPertemuan }) {
  if (!apiKey) {
    return { ok: false, status: 500, error: 'GEMINI_API_KEY belum dikonfigurasi di server.' }
  }
  if (!identitas || !tp?.trim() || !kegiatan?.trim() || !pertemuanKe) {
    return { ok: false, status: 400, error: 'Data tidak lengkap untuk membuat pertemuan.' }
  }

  try {
    const prompt = buildPromptPertemuan({
      identitas,
      cp,
      tp,
      kegiatan,
      pertemuanKe,
      jumlahPertemuan: jumlahPertemuan || 1,
    })
    const data = await callGemini({ apiKey, prompt, schema: RESPONSE_SCHEMA_PERTEMUAN })
    return { ok: true, data }
  } catch (err) {
    console.error(`Gemini API error (pertemuan ${pertemuanKe}):`, err)
    return { ok: false, status: 500, error: `Gagal menyusun pertemuan ke-${pertemuanKe}. Silakan coba lagi.` }
  }
}
