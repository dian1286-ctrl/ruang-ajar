export default function SectionCard({ number, title, description, children }) {
  return (
    <section className="bg-kapur-card rounded-2xl border border-papan/10 shadow-sm p-6 sm:p-8">
      <div className="flex items-start gap-4 mb-6">
        <span className="font-mono text-xs text-kapurkuning-dark bg-kapurkuning/15 border border-kapurkuning/30 rounded-full w-8 h-8 flex items-center justify-center shrink-0 mt-0.5">
          {number}
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold text-papan">{title}</h2>
          {description && <p className="text-sm text-tinta-soft mt-1">{description}</p>}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}
