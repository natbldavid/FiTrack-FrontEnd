function BackIcon({ className = 'h-6 w-6' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function LogActivityHeaderSection({ title, onBack }) {
  return (
    <section className="pb-4">
      <div className="relative flex items-center justify-center">
        <button
          type="button"
          onClick={onBack}
          className="absolute left-0 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-200"
          aria-label="Go back"
        >
          <BackIcon />
        </button>

        <h1 className="text-lg font-semibold" style={{ color: '#23a802' }}>
          {title}
        </h1>
      </div>
    </section>
  )
}

export default LogActivityHeaderSection