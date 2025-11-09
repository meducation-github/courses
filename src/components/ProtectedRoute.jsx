import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/userContext";
import { redirectToLogin } from "../utils/authUtils";

const ProtectedRoute = ({
  children,
  requiredRole = null,
  redirectTo = null,
}) => {
  const { user, userRole, loading } = useContext(AuthContext);
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is not authenticated, return null (App component will handle redirect)
  if (!user) {
    return null;
  }

  // If specific role is required and user doesn't have it
  if (requiredRole && userRole !== requiredRole) {
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    // Default redirect based on user role
    if (userRole === "student") {
      return <Navigate to="/courses" replace />;
    } else if (userRole === "staff") {
      return <Navigate to="/create-courses" replace />;
    }
  }

  // Special case: Students should not access create-courses
  if (location.pathname.includes("/create-courses") && userRole === "student") {
    return <Navigate to="/courses" replace />;
  }

  return children;
};

export default ProtectedRoute;
