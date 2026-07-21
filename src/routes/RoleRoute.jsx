import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

// Restricts a route to the given roles; the wrong role is sent to their home.
export default function RoleRoute({ allow, children }) {
  const { role } = useAuth();
  if (!allow.includes(role)) return <Navigate to="/" replace />;
  return children;
}
