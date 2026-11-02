import { Outlet, Link } from 'react-router-dom';
import { Home, Users, CalendarDays } from 'lucide-react';

export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar Navigasi */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600">Gymnasyum</h1>
          <p className="text-sm text-gray-500">Smart Reminder</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors">
            <Home size={20} />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link to="/customers" className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors">
            <Users size={20} />
            <span className="font-medium">Customers</span>
          </Link>
          <Link to="/schedules" className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors">
            <CalendarDays size={20} />
            <span className="font-medium">Schedules</span>
          </Link>
        </nav>
      </aside>

      {/* Area Konten Utama */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet /> {/* Komponen dari react-router-dom untuk me-render halaman */}
      </main>
    </div>
  );
}