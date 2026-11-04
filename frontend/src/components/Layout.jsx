import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  Dumbbell,
  Menu,
  X,
  LogOut,
  FileText,
  ExternalLink
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
      <header className="md:hidden flex items-center justify-between px-5 h-14 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center">
            <Dumbbell className="h-4 w-4" />
          </div>
          <span className="text-base font-bold tracking-tight">Gymnasyum</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Backdrop Mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden backdrop-blur-xs"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Gaya Shadcn */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-gray-200/90 flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Bagian Atas: Logo & Navigasi */}
        <div className="flex flex-col">
          {/* Logo & Judul Aplikasi */}
          <div className="h-14 flex items-center justify-between px-5 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center">
                <Dumbbell className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight leading-tight">Gymnasyum</span>
                <span className="text-[10px] text-gray-400 font-medium">Smart Reminder</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1 rounded-md text-gray-400 hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigasi Menu */}
          <div className="p-3 space-y-6">
            <div>
              <p className="px-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Operasional
              </p>
              <nav className="space-y-0.5">
                {mainNavItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-gray-100 text-gray-900 font-semibold shadow-2xs'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={16} className={isActive ? 'text-gray-900' : 'text-gray-400'} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div>
              <p className="px-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Dokumentasi
              </p>
              <nav className="space-y-0.5">
                <a
                  href="http://localhost:5000/api-docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText size={16} className="text-gray-400" />
                    <span>Swagger API</span>
                  </div>
                  <ExternalLink size={12} className="text-gray-400" />
                </a>
              </nav>
            </div>
          </div>
        </div>

        {/* Bagian Bawah: Profil Admin & Tombol Keluar */}
        <div className="p-3 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-gray-200/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center shrink-0">
                A
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">Admin Gym</p>
                <p className="text-[10px] text-gray-400 truncate">admin@gymnasyum.id</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
              title="Logout"
            >
              <LogOut size={16} />
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
