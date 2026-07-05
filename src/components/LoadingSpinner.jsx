export default function LoadingSpinner({ label = 'Menyusun modul...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative w-14 h-14 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-papan/10"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-kapurkuning animate-spin"></div>
      </div>
      <p className="font-display text-papan font-medium">{label}</p>
      <p className="text-sm text-tinta-soft mt-1">Biasanya butuh 10–20 detik</p>
    </div>
  )
}
