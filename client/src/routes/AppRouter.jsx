import { Navigate, Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { AppLayout } from "../layouts/AppLayout";
import { LoginPage } from "../pages/auth/LoginPage";
import { AppliancesPage } from "../pages/app/AppliancesPage";
import { AutomationRulesPage } from "../pages/app/AutomationRulesPage";
import { EnergyMonitoringPage } from "../pages/app/EnergyMonitoringPage";
import { SensorsPage } from "../pages/app/SensorsPage";
import { UserDashboardPage } from "../pages/app/UserDashboardPage";

function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-brand-muted">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function PublicOnlyRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-brand-muted">Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <Outlet />;
}

function RootRedirect() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-brand-muted">Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRedirect />,
  },
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: "/login", element: <LoginPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/app",
        element: <AppLayout />,
        children: [
          { path: "dashboard", element: <UserDashboardPage /> },
          { path: "sensors", element: <SensorsPage /> },
          { path: "appliances", element: <AppliancesPage /> },
          { path: "automation-rules", element: <AutomationRulesPage /> },
          { path: "energy-monitoring", element: <EnergyMonitoringPage /> },
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
