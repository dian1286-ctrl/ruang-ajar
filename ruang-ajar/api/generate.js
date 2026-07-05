import { generateModul } from './_shared/geminiModul.js'

// Vercel serverless function: POST /api/generate
// The Gemini API key never touches the browser — it's read from an
// environment variable configured in the Vercel dashboard
// (Project Settings -> Environment Variables -> GEMINI_API_KEY).

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Metode tidak diizinkan. Gunakan POST.' })
  }

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
}
