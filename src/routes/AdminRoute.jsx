import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

export default function AdminRoute({ children }) {
  const { currentUser } = useAuth();
  return (
    <ProtectedRoute>
      {currentUser?.role !== 'ADMIN' ? <Navigate to="/dashboard" replace /> : children}
    </ProtectedRoute>
  );
}