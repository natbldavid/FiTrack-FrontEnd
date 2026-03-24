import { useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { ROUTES } from '../../routes/routePaths'

function AppHeader() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleSignOut = () => {
    logout()
    navigate(ROUTES.LOGIN)
  }

  return (
    <header className="border-b border-slate-200 bg-white px-4 py-3">
      <div className="mx-auto grid max-w-4xl grid-cols-3 items-center">
        <div className="flex justify-start">
          <button type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: '#23a802' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              className="h-8 w-8"
            >
              <path d="M15.0778418,12.9406987 L18.5345074,14.5119103 C19.4269931,14.9175857 20,15.8074678 20,16.7878265 L20,17.5 C20,18.8807119 18.8807119,20 17.5,20 L6.5,20 C5.11928813,20 4,18.8807119 4,17.5 L4,16.7878265 C4,15.8074678 4.57300693,14.9175857 5.46549264,14.5119103 L8.92215823,12.9406987 C7.75209123,12.0255364 7,10.6005984 7,9 C7,6.23857625 9.23857625,4 12,4 C14.7614237,4 17,6.23857625 17,9 C17,10.6005984 16.2479088,12.0255364 15.0778418,12.9406987 L15.0778418,12.9406987 Z M9.96126583,13.5668358 L5.87929558,15.4222768 C5.34380416,15.665682 5,16.1996113 5,16.7878265 L5,17.5 C5,18.3284271 5.67157288,19 6.5,19 L17.5,19 C18.3284271,19 19,18.3284271 19,17.5 L19,16.7878265 C19,16.1996113 18.6561958,15.665682 18.1207044,15.4222768 L14.0387342,13.5668358 C13.4161054,13.8452135 12.7261289,14 12,14 C11.2738711,14 10.5838946,13.8452135 9.96126583,13.5668358 L9.96126583,13.5668358 Z M12,13 C14.209139,13 16,11.209139 16,9 C16,6.790861 14.209139,5 12,5 C9.790861,5 8,6.790861 8,9 C8,11.209139 9.790861,13 12,13 Z" />
            </svg>
          </button>
        </div>

        <div className="flex justify-center">
          <h1 className="text-xl font-bold tracking-tight" style={{ color: '#23a802' }}>
            FiTrack
          </h1>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Sign out"
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M21.593 10.943c.584.585.584 1.53 0 2.116L18.71 15.95c-.39.39-1.03.39-1.42 0a.996.996 0 0 1 0-1.41 9.552 9.552 0 0 1 1.689-1.345l.387-.242-.207-.206a10 10 0 0 1-2.24.254H8.998a1 1 0 1 1 0-2h7.921a10 10 0 0 1 2.24.254l.207-.206-.386-.241a9.562 9.562 0 0 1-1.69-1.348.996.996 0 0 1 0-1.41c.39-.39 1.03-.39 1.42 0l2.883 2.893zM14 16a1 1 0 0 0-1 1v1.5a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v1.505a1 1 0 1 0 2 0V5.5A2.5 2.5 0 0 0 12.5 3h-7A2.5 2.5 0 0 0 3 5.5v13A2.5 2.5 0 0 0 5.5 21h7a2.5 2.5 0 0 0 2.5-2.5V17a1 1 0 0 0-1-1z"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}

export default AppHeader