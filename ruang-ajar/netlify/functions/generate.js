import { generateModul } from '../../api/_shared/geminiModul.js'

// Netlify Function: POST /.netlify/functions/generate
// (netlify.toml redirects /api/generate to this function so the
// frontend fetch('/api/generate') call works unchanged on Netlify.)
// GEMINI_API_KEY is configured in Netlify Site settings -> Environment variables.

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Metode tidak diizinkan. Gunakan POST.' }),
    }
  }

  let body = {}
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Body request tidak valid.' }) }
  }

  const { identitas, cp, tp, kegiatan } = body

  const result = await generateModul({
    apiKey: process.env.GEMINI_API_KEY,
    identitas,
    cp,
    tp,
    kegiatan,
  })

  if (!result.ok) {
    return { statusCode: result.status, body: JSON.stringify({ error: result.error }) }
  }

  return { statusCode: 200, body: JSON.stringify(result.data) }
}
