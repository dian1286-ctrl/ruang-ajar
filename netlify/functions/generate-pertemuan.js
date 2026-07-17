import { generatePertemuan } from '../../api/_shared/geminiModul.js'

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Metode tidak diizinkan. Gunakan POST.' }) }
  }

  let body = {}
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Body request tidak valid.' }) }
  }

  const { identitas, cp, tp, kegiatan, pertemuanKe, jumlahPertemuan } = body

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
    return { statusCode: result.status, body: JSON.stringify({ error: result.error }) }
  }

  return { statusCode: 200, body: JSON.stringify(result.data) }
}
