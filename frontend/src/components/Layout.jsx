import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  Dumbbell,
  Menu,
  X,
  LogOut
} from 'lucide-react';

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Menu navigasi utama
  const mainNavItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/customers', label: 'Member', icon: Users },
    { path: '/schedules', label: 'Jadwal Kelas', icon: CalendarClock },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin_user');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#fafafa] font-sans flex-col md:flex-row text-gray-900 antialiased">
      {/* Header Mobile */}
      <header className="md:hidden flex items-center justify-between px-5 h-16 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2.5">
          <Dumbbell className="h-5 w-5 text-blue-600 shrink-0" />
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight leading-tight">Gymnasyum</span>
            <span className="text-[11px] text-blue-600 font-medium">Smart Reminder</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Backdrop Mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden backdrop-blur-xs"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigasi */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200/90 flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Bagian Atas: Logo & Menu Utama */}
        <div className="flex flex-col">
          {/* Logo & Judul Brand */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <Dumbbell className="h-6 w-6 text-blue-600 shrink-0" />
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight leading-tight">Gymnasyum</span>
                <span className="text-xs text-blue-600 font-medium">Smart Reminder</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1.5 rounded-md text-gray-400 hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigasi Menu */}
          <div className="p-4 space-y-6">
            <div>
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
                Menu Utama
              </p>
              <nav className="space-y-1">
                {mainNavItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={19} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Bagian Bawah: Profil Admin & Tombol Logout */}
        <div className="p-3.5 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-gray-200/60">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full border border-blue-600 text-blue-600 bg-white text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs">
                A
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate leading-snug">Admin Gym</p>
                <p className="text-xs text-gray-400 truncate">admin@gymnasyum.id</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
              title="Keluar dari akun"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Area Konten Utama */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
}
