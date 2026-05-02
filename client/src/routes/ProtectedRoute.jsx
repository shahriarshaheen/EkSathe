import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Shows a minimal full-screen loader while auth state is hydrating from token.
// Redirects to /login with the original path preserved in state so the user
// is sent back after successful login.
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-stone-400 font-medium tracking-wide">
            Loading
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role guard — if allowedRoles is provided, check membership
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
