import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import CreateListingPage from "./features/parking/pages/CreateListingPage";
import MyListingsPage from "./features/parking/pages/MyListingsPage";
import ParkingMapPage from "./features/parking/pages/ParkingMapPage";
import EarningsDashboard from "./features/parking/pages/EarningsDashboard";
import SOSPage from "./features/sos/pages/SOSPage";
import ProfilePage from "./features/profile/pages/ProfilePage";
import VerificationsPage from "./features/admin/pages/VerificationsPage";
// Auth pages
import RegisterPage from "./features/auth/pages/RegisterPage";
import VerifyEmailPage from "./features/auth/pages/VerifyEmailPage";
import LoginPage from "./features/auth/pages/LoginPage";
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "./features/auth/pages/ResetPasswordPage";

// App pages
import DashboardPage from "./pages/DashboardPage";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Sonner toast container — top-center, clean style */}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontFamily: "inherit",
              fontSize: "0.875rem",
              borderRadius: "0.625rem",
              border: "1px solid #e7e5e4",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            },
          }}
        />

        <Routes>
          {/* Public auth routes */}
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/create-listing"
            element={
              <ProtectedRoute>
                <CreateListingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/my-listings"
            element={
              <ProtectedRoute>
                <MyListingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/parking"
            element={
              <ProtectedRoute>
                <ParkingMapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/earnings"
            element={
              <ProtectedRoute>
                <EarningsDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/sos"
            element={
              <ProtectedRoute>
                <SOSPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/verifications"
            element={
              <ProtectedRoute>
                <VerificationsPage />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
