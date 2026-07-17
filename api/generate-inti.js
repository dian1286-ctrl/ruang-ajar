// Vercel serverless function: POST /api/generate-inti
// Generates the once-per-bab parts of the Modul Ajar (CP, 8 Dimensi, model
// pembelajaran, sarana, asesmen, rubrik, dst). Kept separate from
// generate-pertemuan.js so each call stays small and fast (avoids timeout).

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Metode tidak diizinkan. Gunakan POST.' })
  }

  try {
    const { generateModulInti } = await import('./_shared/geminiModul.js')
    const { identitas, cp, tp, kegiatan, jumlahPertemuan } = req.body || {}

    const result = await generateModulInti({
      apiKey: process.env.GEMINI_API_KEY,
      identitas,
      cp,
      tp,
      kegiatan,
      jumlahPertemuan,
    })

    if (!result.ok) {
      return res.status(result.status).json({ error: result.error })
    }

    return res.status(200).json(result.data)
  } catch (err) {
    console.error('generate-inti.js fatal error:', err)
    return res.status(500).json({
      error: 'Terjadi kesalahan tak terduga di server. Cek Function Logs di dashboard Vercel untuk detail.',
    })
  }
}
