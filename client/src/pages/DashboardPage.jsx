import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import StudentDashboard from "./StudentDashboard";
import HomeownerDashboard from "./HomeownerDashboard";
import AdminDashboard from "./AdminDashboard";

// Role router — renders the correct dashboard based on user.role.
const DashboardPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-6 h-6 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "student") return <StudentDashboard />;
  if (user.role === "homeowner") return <HomeownerDashboard />;
  if (user.role === "admin") return <AdminDashboard />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <p className="text-stone-500 text-sm">Unknown role: {user.role}</p>
    </div>
  );
};

export default DashboardPage;
