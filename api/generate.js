import { GoogleGenAI } from '@google/generative-ai';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metode tidak diizinkan' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API Key belum terpasang di Vercel.' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const { identitas, cp, tp, kegiatan } = req.body;
    
    const promptStruktur = `
      Buatkan sebuah Modul Ajar Kurikulum Merdeka yang lengkap dan sistematis berdasarkan data berikut:
      Nama Guru/Sekolah/Mata Pelajaran: ${JSON.stringify(identitas)}
      Capaian Pembelajaran (CP): ${cp}
      Tujuan Pembelajaran (TP): ${tp}
      Garis Besar Kegiatan: ${kegiatan}
      Susun rancangan ini ke dalam format Modul Ajar resmi yang terstruktur mulai dari Informasi Umum, Komponen Inti (Pendahuluan, Inti, Penutup), Asesmen, hingga Lampiran.
    `;

    const result = await model.generateContent(promptStruktur);
    const response = await result.response;
    
    return res.status(200).json({ data: response.text() });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
