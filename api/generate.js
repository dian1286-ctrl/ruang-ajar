export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Metode tidak diizinkan. Gunakan POST.' })
  }

  try {
    const { generateModul } = await import('./_shared/geminiModul.js')
    const { identitas, cp, tp, kegiatan } = req.body || {}

    const result = await generateModul({
      apiKey: process.env.GEMINI_API_KEY,
      identitas,
      cp,
      tp,
      kegiatan,
    })

    if (!result.ok) {
      return res.status(result.status).json({ error: result.error })
    }

    return res.status(200).json(result.data)
  } catch (err) {
    console.error('generate.js fatal error:', err)
    return res.status(500).json({
      error: 'Terjadi kesalahan tak terduga di server. Cek Function Logs di dashboard Vercel untuk detail.',
    })
  }
}
