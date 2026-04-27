import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem('access_token');
  const userRole = localStorage.getItem('user_role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    const roleRedirects = {
      admin: '/admin-dashboard',
      employee: '/employee-dashboard',
      guest: '/guest-dashboard',
    };
    return <Navigate to={roleRedirects[userRole] || '/login'} replace />;
  }

  return children;
};

export default ProtectedRoute;
