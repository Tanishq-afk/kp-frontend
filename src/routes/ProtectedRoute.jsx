import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import FullScreenLoader from '../components/FullScreenLoader.jsx';

// Gate for authenticated areas: waits for the session check, then either
// renders the nested routes or redirects to /login.
export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}
