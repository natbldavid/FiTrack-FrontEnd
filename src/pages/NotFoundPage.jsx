import { Link } from 'react-router-dom'
import { ROUTES } from '../routes/routePaths'

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-md rounded-xl bg-white p-6 text-center shadow-sm">
        <h1 className="text-2xl font-bold">Page not found</h1>
        <Link to={ROUTES.LOGIN} className="mt-4 inline-block underline">
          Go to Login
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage