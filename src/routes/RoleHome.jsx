import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { ROLE } from '../config/constants.js';

// The index route ("/") sends each role to its landing page:
// admin -> billing counter, superadmin -> dashboard.
export default function RoleHome() {
  const { role } = useAuth();
  if (role === ROLE.SUPERADMIN) return <Navigate to="/dashboard" replace />;
  return <Navigate to="/billing" replace />;
}
