import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../routes/routePaths'

const slides = [
  {
    image: '/runner-home-photo.avif',
    text: 'fitness goals and progress',
    color: '#23a802',
  },
  {
    image: '/person-eating-home.jpg',
    text: 'eating goals and progress',
    color: '#f59e0b',
  },
  {
    image: '/person-weighing-home.jpg',
    text: 'health goals and progress',
    color: '#0ea5e9',
  },
]

function OpeningPage() {
  const navigate = useNavigate()
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length)
    }, 3500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-white px-6 py-10">

      {/* Header */}
      <div className="mb-10 text-center">
        <p className="text-sm font-medium text-slate-500">Welcome to</p>
        <h1
          className="mt-1 text-4xl font-bold tracking-tight"
          style={{ color: '#23a802' }}
        >
          FiTrack
        </h1>
      </div>

      {/* Image slideshow */}
      <div className="mb-8">
        <div className="relative h-[250px] w-full overflow-hidden rounded-3xl shadow-md">
          {slides.map((slide, index) => (
            <img
              key={slide.text}
              src={slide.image}
              alt={slide.text}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                index === activeIndex ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
        </div>

        {/* Text below slideshow */}
        <div className="mt-5 min-h-[72px] text-center">
          <p className="text-xl font-bold text-slate-700">Track your</p>

          <div className="relative mt-1 h-8">
            {slides.map((slide, index) => (
              <p
                key={slide.text}
                className={`absolute inset-0 text-3xl font-bold transition-all duration-700 ${
                  index === activeIndex
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-2 opacity-0'
                }`}
                style={{ color: slide.color }}
              >
                {slide.text}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Push buttons toward bottom */}
      <div className="mt-auto space-y-3">
        <button
          type="button"
          onClick={() => navigate(ROUTES.LOGIN)}
          className="w-full rounded-full px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:opacity-90"
          style={{ backgroundColor: '#23a802' }}
        >
          Log in
        </button>

        <button
          type="button"
          onClick={() => navigate(ROUTES.CREATE_ACCOUNT)}
          className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-base font-semibold shadow-sm transition hover:bg-slate-50"
          style={{ color: '#23a802' }}
        >
          Sign up
        </button>
      </div>
    </div>
  )
}

export default OpeningPage