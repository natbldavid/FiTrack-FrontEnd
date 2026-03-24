import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { loginUser } from '../api/authApi'
import useAuth from '../hooks/useAuth'
import { ROUTES } from '../routes/routePaths'

function LoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()

  const [formData, setFormData] = useState({
    username: '',
    passcode: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPasscode, setShowPasscode] = useState(false)

  const isFormValid = useMemo(() => {
    return formData.username.trim() !== '' && formData.passcode.trim() !== ''
  }, [formData.username, formData.passcode])

  if (isAuthenticated) {
    return <Navigate to={ROUTES.TODAY} replace />
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!isFormValid || isSubmitting) {
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      const authResponse = await loginUser(formData)
      login(authResponse)
      navigate(ROUTES.TODAY)
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please check your details.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white px-6 py-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-md flex-col">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate(ROUTES.CREATE_ACCOUNT)}
            className="text-sm font-semibold"
            style={{ color: '#23a802' }}
          >
            Sign up
          </button>
        </div>

        <div className="mt-10">
          <h1 className="text-3xl font-bold text-black">Log in to FiTrack</h1>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-slate-400"
            />
          </div>

          <div>
            <label
              htmlFor="passcode"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="passcode"
                name="passcode"
                type={showPasscode ? 'text' : 'password'}
                value={formData.passcode}
                onChange={handleChange}
                autoComplete="current-password"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 pr-12 text-base outline-none transition focus:border-slate-400"
              />

              <button
                type="button"
                onClick={() => setShowPasscode((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-500"
                aria-label={showPasscode ? 'Hide password' : 'Show password'}
              >
                {showPasscode ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 3l18 18"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.58 10.58A2 2 0 0013.42 13.42"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.88 5.09A9.77 9.77 0 0112 4.8c5.25 0 8.78 4.37 9.69 5.63a.91.91 0 010 1.14 17.59 17.59 0 01-4.11 4.22"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.61 6.61A17.34 17.34 0 002.31 10.43a.91.91 0 000 1.14C3.22 12.83 6.75 17.2 12 17.2c1.49 0 2.85-.27 4.08-.73"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.46 12.31C3.73 10.19 7.01 5.8 12 5.8c4.99 0 8.27 4.39 9.54 6.51.13.22.13.48 0 .7C20.27 15.13 16.99 19.2 12 19.2c-4.99 0-8.27-4.07-9.54-6.19a.67.67 0 010-.7z"
                    />
                    <circle cx="12" cy="12.5" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full rounded-full px-4 py-3 text-base font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
            style={{
              backgroundColor:
                !isFormValid || isSubmitting ? undefined : '#23a802',
            }}
          >
            {isSubmitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="mt-6 text-xs leading-5 text-slate-500">
          By continuing, you agree to FiTrack&apos;s Terms of Service and
          acknowledge that you&apos;ve read our Privacy Policy.
        </p>

        <div className="mt-4">
          <Link
            to={ROUTES.CHANGE_PASSCODE}
            className="text-sm text-slate-500 underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage