import { Outlet } from 'react-router-dom'
import AppHeader from '../components/layout/AppHeader'
import BottomNavbar from '../components/layout/BottomNavBar'

function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <AppHeader />

      <main className="mx-auto w-full max-w-4xl flex-1 px-0 py-4">
        <Outlet />
      </main>

      <BottomNavbar />
    </div>
  )
}

export default MainLayout