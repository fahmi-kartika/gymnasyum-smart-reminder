import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import API from '../services/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await API.post('/auth/login', { username, password });

      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('admin_user', JSON.stringify(response.data.user));
        navigate('/');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Username atau password salah';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans">
      {/* Kolom Kiri: Formulir Login */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 sm:p-12 lg:p-16">
        {/* Brand Header */}
        <div className="flex items-center gap-2 text-blue-600">
          <Dumbbell className="h-6 w-6" />
          <span className="text-lg font-bold tracking-tight text-gray-900">
            Gymnasyum <span className="text-blue-600 font-medium text-sm ml-1">Smart Reminder</span>
          </span>
        </div>

        {/* Konten Utama Formulir */}
        <div className="w-full max-w-sm mx-auto my-auto py-8 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Selamat Datang Kembali!
            </h1>
            <p className="text-sm text-gray-500">
              Silakan masuk ke akun admin Anda.
            </p>
          </div>

          {/* Pesan Kesalahan */}
          {error && (
            <div className="p-3 text-xs rounded-lg bg-red-50 text-red-600 border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Username</label>
              <input
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-11 px-3.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Password</label>
              <input
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-3.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition shadow-sm disabled:opacity-50"
            >
              {loading ? 'Memverifikasi...' : 'Masuk'}
            </button>
          </form>
        </div>

        {/* Footer Hak Cipta */}
        <p className="text-xs text-gray-400 text-center lg:text-left">
          &copy; {new Date().getFullYear()} Gymnasyum. Sistem Manajemen Follow-up Pelanggan.
        </p>
      </div>

      {/* Kolom Kanan: Foto Banner (Tampil di Layar Desktop/Laptop) */}
      <div className="hidden lg:block lg:w-1/2 relative bg-slate-900 overflow-hidden">
        <img
          src="/login-banner-gymnasyum.webp"
          alt="Gymnasyum Workout Banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay gradien halus agar gambar terlihat estetik dan kontras */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/20 to-transparent" />
        
        {/* Teks kutipan motivasi di atas foto */}
        <div className="absolute bottom-12 left-12 right-12 text-white space-y-2">
          <p className="text-xl font-bold tracking-tight">
            Kebugaran &amp; Kenyamanan Member adalah Prioritas Kami.
          </p>
          <p className="text-sm text-slate-300">
            Kelola jadwal, pantau komitmen latihan, dan jalin komunikasi hangat dengan para pelanggan Gymnasyum.
          </p>
        </div>
      </div>
    </div>
  );
}
