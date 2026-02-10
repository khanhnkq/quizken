import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { PageSkeleton } from "@/components/ui/loading-skeleton";

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageSkeleton />;
  }

  if (!user) {
    // Redirect to login page or home page with login modal trigger
    // For now, redirect to home page
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
