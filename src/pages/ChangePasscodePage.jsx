import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { changePasscode } from '../api/authApi'
import useAuth from '../hooks/useAuth'
import { ROUTES } from '../routes/routePaths'

function ChangePasscodePage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const [formData, setFormData] = useState({
    currentPasscode: '',
    newPasscode: '',
    confirmNewPasscode: '',
  })
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccessMessage('')

    if (formData.newPasscode.length < 6) {
      setError('New passcode must be at least 6 characters.')
      return
    }

    if (formData.newPasscode !== formData.confirmNewPasscode) {
      setError('New passcodes do not match.')
      return
    }

    setIsSubmitting(true)

    try {
      await changePasscode({
        currentPasscode: formData.currentPasscode,
        newPasscode: formData.newPasscode,
      })

      setSuccessMessage('Passcode changed successfully.')
      setFormData({
        currentPasscode: '',
        newPasscode: '',
        confirmNewPasscode: '',
      })
    } catch (err) {
      setError(
        err.response?.data?.message || 'Could not change passcode.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div>
        <h1 className="mb-2 text-2xl font-bold">Change Passcode</h1>
        <p className="mb-4 text-sm text-slate-600">
          Your current API only supports changing passcode for a logged-in user,
          and it requires the current passcode.
        </p>

        <button
          type="button"
          onClick={() => navigate(ROUTES.LOGIN)}
          className="w-full rounded-md bg-slate-900 px-4 py-2 text-white"
        >
          Back to Login
        </button>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Change Passcode</h1>
      <p className="mb-6 text-sm text-slate-600">
        Enter your current passcode and your new one.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Current Passcode
          </label>
          <input
            name="currentPasscode"
            type="password"
            value={formData.currentPasscode}
            onChange={handleChange}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            New Passcode
          </label>
          <input
            name="newPasscode"
            type="password"
            value={formData.newPasscode}
            onChange={handleChange}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Confirm New Passcode
          </label>
          <input
            name="confirmNewPasscode"
            type="password"
            value={formData.confirmNewPasscode}
            onChange={handleChange}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save New Passcode'}
        </button>
      </form>

      <div className="mt-4">
        <Link to={ROUTES.TODAY} className="text-sm text-slate-500 underline">
          Back to Today
        </Link>
      </div>
    </div>
  )
}

export default ChangePasscodePage