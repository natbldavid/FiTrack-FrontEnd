import { Outlet } from 'react-router-dom'

function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow-sm">
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout