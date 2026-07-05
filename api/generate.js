import { GoogleGenAI } from '@google/generative-ai';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API Key tidak ditemukan' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const { identitas, cp, tp, kegiatan } = req.body || {};
    
    const promptStruktur = `Buatkan Modul Ajar Kurikulum Merdeka lengkap dengan komponen Informasi Umum, Komponen Inti (Pendahuluan, Inti, Penutup), Asesmen, dan Lampiran berdasarkan data ini:\nIdentitas: ${JSON.stringify(identitas)}\nCP: ${cp}\nTP: ${tp}\nKegiatan: ${kegiatan}`;

    const result = await model.generateContent(promptStruktur);
    const response = await result.response;
    const textOutput = response.text();
    
    // Pastikan server mengirimkan format JSON murni yang valid
    return res.status(200).json({ text: textOutput, data: textOutput });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
