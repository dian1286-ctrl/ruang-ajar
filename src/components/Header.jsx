export default function Header() {
  return (
    <header className="border-b border-papan/10 bg-kapur">
      <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-papan flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 64 64" fill="none">
              <path d="M14 40 L28 18 L36 18 L50 40" stroke="#D9A441" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="20" y1="34" x2="44" y2="34" stroke="#FAF9F4" strokeWidth="4" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p className="font-display text-xl font-semibold text-papan leading-none">Ruang Ajar</p>
            <p className="text-xs text-tinta-soft mt-1 tracking-wide">Generator Modul Ajar Kurikulum Merdeka</p>
          </div>
        </div>
        <a
          href="https://guru.kemdikbud.go.id/kurikulum/"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:inline-block text-sm text-teal-line hover:text-papan transition-colors underline underline-offset-4 decoration-teal-line/40"
        >
          Panduan Kurikulum Merdeka
        </a>
      </div>
    </header>
  )
}
