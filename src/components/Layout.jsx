import { Outlet, Link, useLocation } from 'react-router-dom'

export default function Layout() {
  const location = useLocation()
  const isDetail = location.pathname.startsWith('/church/')

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-[#1e3a5f] shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-lg bg-lime-400 flex items-center justify-center shadow">
                <span className="text-[#1e3a5f] font-black text-base tracking-tight">SN</span>
              </div>
              <div className="leading-tight">
                <div className="text-white font-bold text-base leading-none">Salt Network</div>
                <div className="text-blue-300 text-xs font-medium">Church Onboarding Tracker</div>
              </div>
            </Link>
            {isDetail && (
              <Link to="/" className="text-blue-300 hover:text-white text-sm font-medium flex items-center gap-1 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                All Churches
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}
