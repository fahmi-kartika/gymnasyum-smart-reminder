import { Link, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarClock, Dumbbell } from 'lucide-react';

export default function Layout({ children }) {
  const location = useLocation();

  // Daftar menu navigasi
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/customers', label: 'Member', icon: Users },
    { path: '/schedules', label: 'Jadwal Kelas', icon: CalendarClock },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar Navigasi */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Area Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Dumbbell className="h-6 w-6 text-blue-600 mr-2" />
          <span className="text-xl font-bold text-gray-900">Gymnasyum</span>
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 font-semibold' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-blue-700' : 'text-gray-500'} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        {/* Profil Admin Singkat */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              A
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Admin Gym</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Area Konten Utama */}
      <main className="flex-1 overflow-y-auto p-8">
        {/* Mendukung penggunaan sebagai wrapper ({children}) atau nested routes (<Outlet />) */}
        {children || <Outlet />}
      </main>
    </div>
  );
}