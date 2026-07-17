// Vercel serverless function: POST /api/generate-pertemuan
// Generates Langkah Pembelajaran + LKPD for ONE specific pertemuan.
// Called once per pertemuan from the frontend, so each individual call
// stays well under the serverless function time limit.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Metode tidak diizinkan. Gunakan POST.' })
  }

  try {
    const { generatePertemuan } = await import('./_shared/geminiModul.js')
    const { identitas, cp, tp, kegiatan, pertemuanKe, jumlahPertemuan } = req.body || {}

    const result = await generatePertemuan({
      apiKey: process.env.GEMINI_API_KEY,
      identitas,
      cp,
      tp,
      kegiatan,
      pertemuanKe,
      jumlahPertemuan,
    })

    if (!result.ok) {
      return res.status(result.status).json({ error: result.error })
    }

    return res.status(200).json(result.data)
  } catch (err) {
    console.error('generate-pertemuan.js fatal error:', err)
    return res.status(500).json({
      error: 'Terjadi kesalahan tak terduga di server. Cek Function Logs di dashboard Vercel untuk detail.',
    })
  }
}
