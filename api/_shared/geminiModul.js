import { GoogleGenAI } from '@google/genai'

// Shared core logic for generating a Modul Ajar via Gemini.
// Used by both the Vercel handler (api/generate.js) and the
// Netlify handler (netlify/functions/generate.js) so the prompt
// and schema only live in one place.
//
// Uses the current @google/genai SDK (the old @google/generative-ai
// package is deprecated) and gemini-2.5-flash (a stable GA model —
// the older gemini-1.5-flash has been fully shut down by Google).

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
- Alokasi Waktu: ${identitas.alokasiWaktu}

Capaian Pembelajaran (CP):
"""${cp}"""

Tujuan Pembelajaran (TP):
"""${tp}"""

Ide/Garis Besar Kegiatan Pembelajaran dari guru:
"""${kegiatan}"""

Susun seluruh komponen berikut dalam Bahasa Indonesia yang jelas, konkret, dan kontekstual dengan mata pelajaran serta fase/kelas di atas. Jangan mengulang kalimat guru mentah-mentah — kembangkan menjadi kalimat kegiatan/instruksi yang benar-benar bisa langsung dijalankan di kelas:

1. profilPelajarPancasila: 2-3 dimensi Profil Pelajar Pancasila yang paling relevan dengan TP dan kegiatan (mis. "Bernalar Kritis", "Gotong Royong", "Mandiri"), masing-masing disertai penjelasan singkat kaitannya dengan kegiatan.
2. modelPembelajaran: satu kalimat menyebutkan model/pendekatan pembelajaran yang paling cocok (mis. Discovery Learning, Problem Based Learning, Cooperative Learning) beserta alasan singkat kenapa cocok untuk kegiatan ini.
3. saranaPrasarana: 3-5 alat/bahan/media yang realistis dibutuhkan (mis. LKPD, proyektor, video pembelajaran, alat tulis kelompok).
4. targetPesertaDidik: satu-dua kalimat mendeskripsikan karakteristik target peserta didik (reguler, atau termasuk pertimbangan untuk peserta didik dengan kesulitan belajar/pencapaian tinggi jika relevan).
5. pemahamanBermakna: 2-3 kalimat pemahaman bermakna yang relevan dengan TP.
6. pertanyaanPemantik: 3-4 pertanyaan pemantik untuk membuka rasa ingin tahu siswa, urutkan dari yang paling sederhana ke yang memancing berpikir lebih dalam.
7. langkahPembelajaran: rincian kegiatan yang benar-benar konkret dan actionable, sesuaikan dengan alokasi waktu yang tersedia (sertakan estimasi menit di setiap poin):
   - pendahuluan (4-5 poin): salam & doa, presensi, apersepsi yang mengaitkan dengan pengalaman siswa, penyampaian tujuan pembelajaran, motivasi.
   - inti (6-8 poin): kembangkan ide guru menjadi tahapan yang runtut dan rinci, sebutkan pengelompokan siswa jika relevan, peran guru di tiap tahap, dan bagaimana diferensiasi sederhana bisa diterapkan.
   - penutup (3-4 poin): kesimpulan bersama siswa, refleksi singkat, informasi tindak lanjut/pekerjaan rumah jika relevan, doa penutup.
8. asesmen: 
   - formatif (2-3 poin): dilakukan selama proses (observasi, pertanyaan lisan, dsb), sebutkan instrumen konkretnya.
   - sumatif (2-3 poin): di akhir pembelajaran, sebutkan bentuk instrumennya (tes tulis, produk, presentasi, dsb).
9. rubrikPenilaian: 3-4 baris rubrik. Setiap baris berisi "aspek" yang dinilai dan "kriteria" — uraikan kriteria untuk 4 level capaian (mis. Sangat Baik/Baik/Cukup/Perlu Bimbingan) dalam satu string, dipisah baris baru per level, supaya siap dijadikan tabel.
10. lkpd: 5-7 poin instruksi Lembar Kerja Peserta Didik yang runtut, bisa langsung dibagikan ke siswa, sesuai kegiatan inti — termasuk instruksi pengerjaan dan pertanyaan/tugas yang harus dijawab siswa.
11. refleksiGuru: 3 pertanyaan reflektif untuk guru evaluasi diri setelah mengajar (mis. tentang efektivitas metode, kendala yang ditemui).
12. refleksiPesertaDidik: 3 pertanyaan reflektif sederhana untuk peserta didik tentang proses belajar mereka.
13. glosarium: 3-5 istilah kunci dari materi beserta penjelasan singkat yang mudah dipahami siswa.
14. daftarPustaka: 2-3 referensi yang relevan dan masuk akal (buku, sumber kurikulum resmi, atau sumber daring kredibel terkait materi) dalam format sitasi sederhana.

Kembalikan HANYA JSON sesuai skema yang diberikan, tanpa teks tambahan, tanpa markdown code fence.`
}

/**
 * Validates input and calls Gemini, returning a plain result object:
 * { ok: true, data } or { ok: false, status, error }
 */
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
