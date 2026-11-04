import { Navigate, Outlet } from 'react-router-dom';

// Membatasi akses rute hanya untuk pengguna yang memiliki token autentikasi aktif
export default function ProtectedRoute() {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

