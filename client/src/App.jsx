import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

// Carpool
import PostCarpool from "./pages/PostCarpool";
import BrowseCarpool from "./pages/BrowseCarpool";
import MyRides from "./pages/MyRides";
import MyRatingsPage from "./pages/MyRatingsPage";

// Parking
import CreateListingPage from "./features/parking/pages/CreateListingPage";
import MyListingsPage from "./features/parking/pages/MyListingsPage";
import ParkingMapPage from "./features/parking/pages/ParkingMapPage";
import EarningsDashboard from "./features/parking/pages/EarningsDashboard";

// SOS
import SOSPage from "./features/sos/pages/SOSPage";

// Profile
import ProfilePage from "./features/profile/pages/ProfilePage";

// Admin
import VerificationsPage from "./features/admin/pages/VerificationsPage";
import AdminCarpoolPage from "./pages/AdminCarpoolPage";

// Auth pages
import RegisterPage from "./features/auth/pages/RegisterPage";
import VerifyEmailPage from "./features/auth/pages/VerifyEmailPage";
import LoginPage from "./features/auth/pages/LoginPage";
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "./features/auth/pages/ResetPasswordPage";

// App pages
import DashboardPage from "./pages/DashboardPage";

// Incident Pages
import ReportIncidentPage from "./features/incidents/pages/ReportIncidentPage";
import AdminIncidentsPage from "./features/incidents/pages/AdminIncidentsPage";

// Booking
import MyBookingsPage from "./features/bookings/pages/MyBookingsPage";
import BookSpotPage from "./features/bookings/pages/BookSpotPage";

// Payment
import PaymentSuccessPage from "./features/payment/pages/PaymentSuccessPage";
import PaymentFailPage from "./features/payment/pages/PaymentFailPage";
import PaymentCancelPage from "./features/payment/pages/PaymentCancelPage";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
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

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Parking */}
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

          {/* SOS */}
          <Route
            path="/dashboard/sos"
            element={
              <ProtectedRoute>
                <SOSPage />
              </ProtectedRoute>
            }
          />

          {/* Profile */}
          <Route
            path="/dashboard/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Ratings */}
          <Route
            path="/dashboard/ratings"
            element={
              <ProtectedRoute>
                <MyRatingsPage />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/dashboard/verifications"
            element={
              <ProtectedRoute>
                <VerificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/carpool"
            element={
              <ProtectedRoute>
                <AdminCarpoolPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/incidents"
            element={
              <ProtectedRoute>
                <AdminIncidentsPage />
              </ProtectedRoute>
            }
          />

          {/* Incidents */}
          <Route
            path="/dashboard/report-incident"
            element={
              <ProtectedRoute>
                <ReportIncidentPage />
              </ProtectedRoute>
            }
          />

          {/* Bookings */}
          <Route
            path="/dashboard/bookings"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/book-spot/:spotId"
            element={
              <ProtectedRoute>
                <BookSpotPage />
              </ProtectedRoute>
            }
          />

          {/* Carpool */}
          <Route
            path="/dashboard/carpool"
            element={
              <ProtectedRoute>
                <BrowseCarpool />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/carpool/post"
            element={
              <ProtectedRoute>
                <PostCarpool />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/carpool/my-rides"
            element={
              <ProtectedRoute>
                <MyRides />
              </ProtectedRoute>
            }
          />

          {/* Payment */}
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/fail" element={<PaymentFailPage />} />
          <Route path="/payment/cancel" element={<PaymentCancelPage />} />

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
