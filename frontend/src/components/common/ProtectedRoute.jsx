import { useAuthContext } from '../../contexts/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

/**
 * Wraps routes that require the user to be authenticated.
 * Redirects unauthenticated users to /login.
 */
/**
 * Wraps routes that require the user to be authenticated and optionally 
 * have specific roles.
 * @param {string[]} allowedRoles - List of roles permitted to access these routes.
 */
const ProtectedRoute = ({ allowedRoles }) => {
    const { userInfo } = useAuthContext();
    const location = useLocation();

    if (!userInfo) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Role-based authorization check
    if (allowedRoles && !allowedRoles.includes(userInfo.role)) {
        return <Navigate to="/dashboard" replace />; 
        // Or to a dedicated /unauthorized page if created
    }

    // Force redirection if password reset is required
    if (userInfo.isPasswordResetRequired && location.pathname !== '/auth/change-password') {
        return <Navigate to="/auth/change-password" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
