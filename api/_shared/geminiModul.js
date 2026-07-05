import { GoogleGenAI } from '@google/genai'

export const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
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
  },
  required: [
    'pemahamanBermakna',
    'pertanyaanPemantik',
    'langkahPembelajaran',
    'asesmen',
    'rubrikPenilaian',
    'lkpd',
  ],
}

function buildPrompt({ identitas, cp, tp, kegiatan }) {
  return `Anda adalah asisten ahli pedagogi yang membantu guru di Indonesia menyusun Modul Ajar sesuai kerangka Kurikulum Merdeka.

Berikut konteks dari guru:
- Mata Pelajaran: ${identitas.mapel}
- Fase/Kelas: ${identitas.faseKelas}
- Alokasi Waktu: ${identitas.alokasiWaktu}

Capaian Pembelajaran (CP):
"""${cp}"""

Tujuan Pembelajaran (TP):
"""${tp}"""

Ide/Garis Besar Kegiatan Pembelajaran dari guru:
"""${kegiatan}"""

Tugas Anda: susun komponen Modul Ajar berikut, dalam Bahasa Indonesia yang jelas dan siap pakai oleh guru di kelas. Kembangkan ide kegiatan guru menjadi langkah-langkah rinci dan konkret (bukan sekadar mengulang kalimat guru), sesuaikan dengan alokasi waktu yang tersedia:

1. pemahamanBermakna: 2-3 kalimat pemahaman bermakna yang relevan dengan TP.
2. pertanyaanPemantik: 3-4 pertanyaan pemantik untuk membuka rasa ingin tahu siswa.
3. langkahPembelajaran: rincian kegiatan Pendahuluan (3-4 poin), Inti (5-7 poin, kembangkan dari ide guru), dan Penutup (3-4 poin). Setiap poin berupa kalimat kegiatan konkret, bisa disertai estimasi menit jika relevan.
4. asesmen: rencana Asesmen Formatif (2-3 poin, dilakukan selama proses) dan Asesmen Sumatif (2-3 poin, di akhir pembelajaran).
5. rubrikPenilaian: 3-4 baris rubrik, masing-masing berisi "aspek" yang dinilai dan "kriteria" penilaiannya (uraikan kriteria untuk beberapa level capaian dalam satu string, dipisah baris baru).
6. lkpd: 4-6 poin instruksi Lembar Kerja Peserta Didik (LKPD) yang bisa langsung dibagikan ke siswa, sesuai kegiatan inti.

Kembalikan HANYA JSON sesuai skema yang diberikan, tanpa teks tambahan apa pun.`
}

export async function generateModul({ apiKey, identitas, cp, tp, kegiatan }) {
  if (!apiKey) {
    return { ok: false, status: 500, error: 'GEMINI_API_KEY belum dikonfigurasi di server.' }
  }

  if (!identitas || !cp?.trim() || !tp?.trim() || !kegiatan?.trim()) {
    return { ok: false, status: 400, error: 'Data tidak lengkap. Mohon isi semua kolom yang diperlukan.' }
  }

  try {
    const ai = new GoogleGenAI({ apiKey })
    const prompt = buildPrompt({ identitas, cp, tp, kegiatan })

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.6,
      },
    })

    const text = response.text

    let parsed
    try {
      parsed = JSON.parse(text)
    } catch {
      return { ok: false, status: 502, error: 'AI mengembalikan format yang tidak terbaca. Silakan coba lagi.' }
    }

    return { ok: true, data: parsed }
  } catch (err) {
    console.error('Gemini API error:', err)
    return { ok: false, status: 500, error: 'Gagal menghubungi layanan AI. Silakan coba beberapa saat lagi.' }
  }
}
