export function TextField({ label, value, onChange, placeholder, required }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-tinta">
        {label} {required && <span className="text-kapurkuning-dark">*</span>}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-1.5 w-full rounded-lg border border-papan/15 bg-white px-3.5 py-2.5 text-sm text-tinta placeholder:text-tinta-soft/60 focus:border-papan focus:ring-1 focus:ring-papan outline-none transition-colors"
      />
    </label>
  )
}

export function TextAreaField({ label, value, onChange, placeholder, required, rows = 5, hint }) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-tinta">
          {label} {required && <span className="text-kapurkuning-dark">*</span>}
        </span>
        {hint && <span className="text-xs text-tinta-soft">{hint}</span>}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className="mt-1.5 w-full rounded-lg border border-papan/15 bg-white px-3.5 py-2.5 text-sm text-tinta placeholder:text-tinta-soft/60 focus:border-papan focus:ring-1 focus:ring-papan outline-none transition-colors resize-y"
      />
    </label>
  )
}
