const formatCalories = (value) => {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0
  return Math.round(safeValue)
}

const normalizeSearchValue = (value) => String(value || '').trim().toLowerCase()

const includesSearchTerm = (value, searchTerm) => {
  if (!searchTerm) return true
  return normalizeSearchValue(value).includes(normalizeSearchValue(searchTerm))
}

const filterFoodsBySearch = (foods, searchTerm) => {
  return foods.filter((food) => {
    return (
      includesSearchTerm(food.name, searchTerm) ||
      includesSearchTerm(food.servingDescription, searchTerm)
    )
  })
}

const filterMealsBySearch = (meals, searchTerm) => {
  return meals.filter((meal) => {
    return (
      includesSearchTerm(meal.name, searchTerm) ||
      includesSearchTerm(meal.description, searchTerm)
    )
  })
}

function PlusCircleButton({ onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-green-600 disabled:opacity-50"
      aria-label="Add item"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    </button>
  )
}

function ResultCard({ name, calories, subtitle = '', onAdd, disabled = false }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-4 shadow-sm ring-1 ring-slate-200/70">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-black">{name}</div>
          <div className="mt-1 text-xs text-slate-500">
            {formatCalories(calories)} cal{subtitle ? ` · ${subtitle}` : ''}
          </div>
        </div>

        <PlusCircleButton onClick={onAdd} disabled={disabled} />
      </div>
    </div>
  )
}

function ResultGroup({
  title,
  items,
  type,
  onAddFood,
  onAddMeal,
  isSubmitting,
}) {
  return (
    <div className="pb-5">
      <h3 className="pb-3 text-sm font-semibold text-slate-700">{title}</h3>

      <div className="space-y-3">
        {items.map((item) => (
          <ResultCard
            key={`${type}-${item.id}`}
            name={item.name}
            calories={type === 'meal' ? item.totalCalories : item.calories}
            subtitle={type === 'meal' ? '' : item.servingDescription || ''}
            disabled={isSubmitting}
            onAdd={() => {
              if (type === 'meal') {
                onAddMeal(item)
                return
              }

              onAddFood(item)
            }}
          />
        ))}
      </div>
    </div>
  )
}

function EmptyState({ title }) {
  return (
    <div className="pb-5">
      <h3 className="pb-3 text-sm font-semibold text-slate-700">{title}</h3>
    </div>
  )
}

function FoodResultsSection({ pageState }) {
  const {
    selectedTab,
    searchTerm,
    foods,
    meals,
    isLoading,
    errorMessage,
    isSubmitting,
    onAddFood,
    onAddMeal,
  } = pageState

  const filteredFoods = filterFoodsBySearch(foods, searchTerm)
  const filteredMeals = filterMealsBySearch(meals, searchTerm)

  const favouriteFoods = filteredFoods.filter((food) => food.isFavorite)
  const allFavourites = [...favouriteFoods]

  if (selectedTab === 'favourites') {
    return (
      <section>
        {allFavourites.length > 0 ? (
          <ResultGroup
            title="Favourites"
            items={allFavourites}
            type="food"
            onAddFood={onAddFood}
            onAddMeal={onAddMeal}
            isSubmitting={isSubmitting}
          />
        ) : (
          <EmptyState title="Favourites" />
        )}
      </section>
    )
  }

  if (selectedTab === 'foods') {
    return (
      <section>
        {filteredFoods.length > 0 ? (
          <ResultGroup
            title="My Foods"
            items={filteredFoods}
            type="food"
            onAddFood={onAddFood}
            onAddMeal={onAddMeal}
            isSubmitting={isSubmitting}
          />
        ) : (
          <EmptyState title="My Foods" />
        )}
      </section>
    )
  }

  if (selectedTab === 'meals') {
    return (
      <section>
        {filteredMeals.length > 0 ? (
          <ResultGroup
            title="My Meals"
            items={filteredMeals}
            type="meal"
            onAddFood={onAddFood}
            onAddMeal={onAddMeal}
            isSubmitting={isSubmitting}
          />
        ) : (
          <EmptyState title="My Meals" />
        )}
      </section>
    )
  }

  return (
    <section>
      {isLoading ? (
        <div className="rounded-2xl bg-white px-4 py-4 text-sm text-slate-500 shadow-sm ring-1 ring-slate-200/70">
          Loading...
        </div>
      ) : errorMessage ? (
        <div className="rounded-2xl bg-white px-4 py-4 text-sm text-red-500 shadow-sm ring-1 ring-slate-200/70">
          {errorMessage}
        </div>
      ) : (
        <>
          {allFavourites.length > 0 ? (
            <ResultGroup
              title="Favourites"
              items={allFavourites}
              type="food"
              onAddFood={onAddFood}
              onAddMeal={onAddMeal}
              isSubmitting={isSubmitting}
            />
          ) : (
            <EmptyState title="Favourites" />
          )}

          {filteredFoods.length > 0 ? (
            <ResultGroup
              title="My Foods"
              items={filteredFoods}
              type="food"
              onAddFood={onAddFood}
              onAddMeal={onAddMeal}
              isSubmitting={isSubmitting}
            />
          ) : (
            <EmptyState title="My Foods" />
          )}

          {filteredMeals.length > 0 ? (
            <ResultGroup
              title="My Meals"
              items={filteredMeals}
              type="meal"
              onAddFood={onAddFood}
              onAddMeal={onAddMeal}
              isSubmitting={isSubmitting}
            />
          ) : (
            <EmptyState title="My Meals" />
          )}
        </>
      )}
    </section>
  )
}

export default FoodResultsSection