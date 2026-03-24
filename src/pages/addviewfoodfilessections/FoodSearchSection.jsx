function SearchIcon({ className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  )
}

function FoodSearchSection({ searchTerm, onChangeSearchTerm }) {
  return (
    <section className="pb-4">
      <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200/70">
        <label className="flex items-center gap-3">
          <SearchIcon className="h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => onChangeSearchTerm(event.target.value)}
            placeholder="Search Food"
            className="w-full bg-transparent text-sm text-black outline-none placeholder:text-slate-400"
          />
        </label>
      </div>
    </section>
  )
}

export default FoodSearchSection