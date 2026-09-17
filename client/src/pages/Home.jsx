import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'ADMIN' ? '/admin' : user.role === 'STORE_OWNER' ? '/owner' : '/stores'} replace />;
}
