# Ruang Ajar

Generator Modul Ajar Kurikulum Merdeka otomatis berbasis AI (Google Gemini). Guru cukup mengisi 4 bagian form — Identitas, CP, TP, dan garis besar Kegiatan — lalu AI menyusun langkah pembelajaran rinci, pemahaman bermakna, pertanyaan pemantik, rencana asesmen, rubrik penilaian, dan LKPD.

## Struktur Proyek

```
ruang-ajar/
├── api/
│   ├── generate.js          # Serverless function untuk Vercel
│   └── _shared/
│       └── geminiModul.js   # Logika inti pemanggilan Gemini (dipakai bersama)
├── netlify/
│   └── functions/
│       └── generate.js      # Serverless function untuk Netlify
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── SectionCard.jsx
│   │   ├── Field.jsx
│   │   ├── IdentitasForm.jsx
│   │   ├── CPTPForm.jsx
│   │   ├── KegiatanForm.jsx
│   │   ├── ModulPreview.jsx
│   │   └── LoadingSpinner.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
│   └── favicon.svg
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── vercel.json
├── netlify.toml
├── .env.example
└── package.json
```

## 1. Menjalankan secara lokal

```bash
npm install
```

Dapatkan API key gratis di [Google AI Studio](https://aistudio.google.com/app/apikey), lalu buat file `.env.local` (bukan `.env`) di root proyek:

```
GEMINI_API_KEY=isi_dengan_api_key_anda
```

Untuk menjalankan frontend **sekaligus** serverless function di lokal, gunakan Vercel CLI (paling praktis):

```bash
npm install -g vercel
vercel dev
```

Buka `http://localhost:3000`.

> Jika hanya menjalankan `npm run dev` (Vite murni), tombol Generate Modul tidak akan berfungsi karena route `/api/generate` hanya aktif lewat `vercel dev`, `netlify dev`, atau setelah deploy.

## 2. Deploy ke Vercel (disarankan)

1. Push proyek ini ke repository GitHub.
2. Buka [vercel.com](https://vercel.com) → **Add New Project** → impor repo tersebut. Vercel otomatis mendeteksi framework Vite.
3. Di tab **Environment Variables**, tambahkan:
   - `GEMINI_API_KEY` = API key Gemini Anda
4. Klik **Deploy**. Anda akan mendapat URL publik seperti `ruang-ajar.vercel.app` (nama subdomain bisa diganti lewat **Project Settings → Domains**, misalnya menjadi `ruangajar.vercel.app` jika tersedia).

Tidak ada langkah tambahan — `vercel.json` sudah mengatur build command, output directory, dan konfigurasi function.

## 3. Deploy ke Netlify (alternatif)

1. Push proyek ke GitHub.
2. Buka [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**.
3. Netlify akan membaca `netlify.toml` secara otomatis (build command `npm run build`, publish `dist`, functions `netlify/functions`).
4. Di **Site settings → Environment variables**, tambahkan `GEMINI_API_KEY`.
5. Deploy. Frontend memanggil `/api/generate`, yang oleh `netlify.toml` di-redirect ke `/.netlify/functions/generate` — jadi kode frontend tidak perlu diubah sama sekali antara Vercel dan Netlify.

## Keamanan API Key

- API key Gemini **tidak pernah** dikirim atau disimpan di browser.
- Key hanya dibaca lewat `process.env.GEMINI_API_KEY` di dalam serverless function, yang berjalan di server Vercel/Netlify.
- Pengguna aplikasi (guru) tidak perlu dan tidak diminta memasukkan API key apa pun.

## Fitur

- Form input bersih: Identitas Modul, Capaian Pembelajaran, Tujuan Pembelajaran, Kegiatan Pembelajaran Umum.
- AI (Gemini 1.5 Flash) menyusun modul lengkap dalam format JSON terstruktur.
- Pratinjau modul rapi, siap dicetak ke PDF langsung dari browser (`window.print()` dengan CSS khusus cetak — tidak perlu library tambahan).
- Tidak ada elemen kode/workspace yang tampil ke pengguna akhir — antarmuka murni form dan hasil.
- Tidak perlu database; setiap sesi bersifat stateless.

## Kustomisasi Model

Model default adalah `gemini-1.5-flash` (cepat & hemat kuota gratis), diatur di `api/_shared/geminiModul.js`. Untuk mengganti model (misalnya ke varian Gemini yang lebih baru), ubah nilai `model:` pada bagian `genAI.getGenerativeModel({...})`.
