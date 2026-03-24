const TABS = [
  { key: 'all', label: 'All' },
  { key: 'favourites', label: 'Favourites' },
  { key: 'meals', label: 'My Meals' },
  { key: 'foods', label: 'My Foods' },
]

function FoodFilterTabsSection({ selectedTab, onChangeTab }) {
  return (
    <section className="pb-4">
      <div className="overflow-x-auto">
        <div className="flex min-w-max gap-6 border-b border-slate-300 px-1">
          {TABS.map((tab) => {
            const isSelected = tab.key === selectedTab

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onChangeTab(tab.key)}
                className={`relative pb-3 text-sm ${
                  isSelected
                    ? 'font-semibold text-black'
                    : 'font-medium text-slate-500'
                }`}
              >
                {tab.label}

                {isSelected ? (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-black" />
                ) : null}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default FoodFilterTabsSection