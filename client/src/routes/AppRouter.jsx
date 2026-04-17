import { Navigate, Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { AdminLayout } from "../layouts/AdminLayout";
import { AppLayout } from "../layouts/AppLayout";
import { MarketingLayout } from "../layouts/MarketingLayout";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { ResetPasswordPage } from "../pages/auth/ResetPasswordPage";
import { AdminAppliancesPage } from "../pages/admin/AdminAppliancesPage";
import { AdminAutomationRulesPage } from "../pages/admin/AdminAutomationRulesPage";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { AdminNotificationsPage } from "../pages/admin/AdminNotificationsPage";
import { AdminReportsPage } from "../pages/admin/AdminReportsPage";
import { AdminRoomsPage } from "../pages/admin/AdminRoomsPage";
import { AdminSensorsPage } from "../pages/admin/AdminSensorsPage";
import { AdminSettingsPage } from "../pages/admin/AdminSettingsPage";
import { CategoriesPage } from "../pages/admin/CategoriesPage";
import { LogsPage } from "../pages/admin/LogsPage";
import { UsersPage } from "../pages/admin/UsersPage";
import { ApplianceDetailsPage } from "../pages/app/ApplianceDetailsPage";
import { AppliancesPage } from "../pages/app/AppliancesPage";
import { AutomationRulesPage } from "../pages/app/AutomationRulesPage";
import { EnergyMonitoringPage } from "../pages/app/EnergyMonitoringPage";
import { NotificationsPage } from "../pages/app/NotificationsPage";
import { ProfilePage } from "../pages/app/ProfilePage";
import { ReportsPage } from "../pages/app/ReportsPage";
import { RoomDetailsPage } from "../pages/app/RoomDetailsPage";
import { RoomsPage } from "../pages/app/RoomsPage";
import { SensorsPage } from "../pages/app/SensorsPage";
import { SettingsPage } from "../pages/app/SettingsPage";
import { UserDashboardPage } from "../pages/app/UserDashboardPage";
import { AboutPage } from "../pages/public/AboutPage";
import { ContactPage } from "../pages/public/ContactPage";
import { FeaturesPage } from "../pages/public/FeaturesPage";
import { HomePage } from "../pages/public/HomePage";

function ProtectedRoute({ roles }) {
  const { isAuthenticated, loading, hasRole } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-brand-muted">Loading workspace...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !hasRole(roles)) {
    return <Navigate to={hasRole("admin") ? "/admin/dashboard" : "/app/dashboard"} replace />;
  }

  return <Outlet />;
}

function PublicOnlyRoute() {
  const { isAuthenticated, hasRole, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-brand-muted">Loading workspace...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to={hasRole("admin") ? "/admin/dashboard" : "/app/dashboard"} replace />;
  }

  return <Outlet />;
}

const router = createBrowserRouter([
  {
    element: <MarketingLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/about", element: <AboutPage /> },
      { path: "/features", element: <FeaturesPage /> },
      { path: "/contact", element: <ContactPage /> },
    ],
  },
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/reset-password", element: <ResetPasswordPage /> },
    ],
  },
  {
    element: <ProtectedRoute roles={["admin", "resident", "operator"]} />,
    children: [
      {
        path: "/app",
        element: <AppLayout />,
        children: [
          { path: "dashboard", element: <UserDashboardPage /> },
          { path: "rooms", element: <RoomsPage /> },
          { path: "rooms/:id", element: <RoomDetailsPage /> },
          { path: "appliances", element: <AppliancesPage /> },
          { path: "appliances/:id", element: <ApplianceDetailsPage /> },
          { path: "sensors", element: <SensorsPage /> },
          { path: "automation-rules", element: <AutomationRulesPage /> },
          { path: "energy-monitoring", element: <EnergyMonitoringPage /> },
          { path: "notifications", element: <NotificationsPage /> },
          { path: "reports", element: <ReportsPage /> },
          { path: "profile", element: <ProfilePage /> },
          { path: "settings", element: <SettingsPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute roles="admin" />,
    children: [
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          { path: "dashboard", element: <AdminDashboardPage /> },
          { path: "users", element: <UsersPage /> },
          { path: "rooms", element: <AdminRoomsPage /> },
          { path: "appliances", element: <AdminAppliancesPage /> },
          { path: "categories", element: <CategoriesPage /> },
          { path: "sensors", element: <AdminSensorsPage /> },
          { path: "automation-rules", element: <AdminAutomationRulesPage /> },
          { path: "notifications", element: <AdminNotificationsPage /> },
          { path: "reports", element: <AdminReportsPage /> },
          { path: "logs", element: <LogsPage /> },
          { path: "settings", element: <AdminSettingsPage /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;
