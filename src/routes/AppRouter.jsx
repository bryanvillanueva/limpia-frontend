import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';
import UnauthorizedPage from '../pages/UnauthorizedPage';

// Pages
import DashboardPage from '../pages/dashboard/DashboardPage';
import UsersPage from '../pages/users/UsersPage';
import TeamsPage from '../pages/teams/TeamsPage';
import TeamDetailPage from '../pages/teams/TeamDetailPage';
import ClientsPage from '../pages/clients/ClientsPage';
import SitesPage from '../pages/sites/SitesPage';
import SiteDetailPage from '../pages/sites/SiteDetailPage';
import MisSitiosPage from '../pages/logs/MisSitiosPage';
import MySitesPage from '../pages/my-sites/MySitesPage';
import MyReportsPage from '../pages/my-reports/MyReportsPage';
import SuppliesPage from '../pages/supplies/SuppliesPage';
import OrdersPage from '../pages/orders/OrdersPage';
import OrderCatalogPage from '../pages/orders/OrderCatalogPage';
import MyOrdersPage from '../pages/orders/MyOrdersPage';
import ToolsPage from '../pages/tools/ToolsPage';
import CarsPage from '../pages/cars/CarsPage';
import CarDetailPage from '../pages/cars/CarDetailPage';
import VacationsPage from '../pages/vacations/VacationsPage';
import ReportsPage from '../pages/reports/ReportsPage';
import ReportDetailPage from '../pages/reports/ReportDetailPage';
import ComplaintsPage from '../pages/complaints/ComplaintsPage';
import PlannerPage from '../pages/planner/PlannerPage';

const ADMIN_MANAGER   = ['admin', 'manager'];
const ADMIN_ONLY      = ['admin'];
const ADMIN_ACCOUNTANT = ['admin', 'accountant'];
const ADMIN_MANAGER_ACCOUNTANT = ['admin', 'manager', 'accountant'];
const ALL_AUTH        = ['admin', 'manager', 'accountant', 'cleaner'];
const CLEANER_ONLY    = ['cleaner'];

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/no-autorizado" element={<UnauthorizedPage />} />

        {/* All authenticated — inside MainLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Admin + Manager */}
            <Route element={<ProtectedRoute roles={ADMIN_MANAGER} />}>
              <Route path="/usuarios"     element={<UsersPage />} />
              <Route path="/equipos"      element={<TeamsPage />} />
              <Route path="/equipos/:id"  element={<TeamDetailPage />} />
              <Route path="/supplies"     element={<SuppliesPage />} />
              <Route path="/herramientas" element={<ToolsPage />} />
              <Route path="/vehiculos"    element={<CarsPage />} />
              <Route path="/vehiculos/:id" element={<CarDetailPage />} />
              <Route path="/vacaciones"   element={<VacationsPage mode="admin" />} />
            </Route>

            {/* Admin + Manager + Accountant — orders list + creation catalog */}
            <Route element={<ProtectedRoute roles={ADMIN_MANAGER_ACCOUNTANT} />}>
              <Route path="/pedidos"       element={<OrdersPage />} />
              <Route path="/pedidos/nuevo" element={<OrderCatalogPage />} />
            </Route>

            {/* Admin + Manager + Accountant */}
            <Route element={<ProtectedRoute roles={ADMIN_MANAGER_ACCOUNTANT} />}>
              <Route path="/clientes"   element={<ClientsPage />} />
              <Route path="/sitios"     element={<SitesPage />} />
            </Route>

            {/* All authenticated (site detail + planner) */}
            <Route element={<ProtectedRoute roles={ALL_AUTH} />}>
              <Route path="/sitios/:id" element={<SiteDetailPage />} />
              <Route path="/planner" element={<PlannerPage />} />
            </Route>

            {/* Admin + Accountant */}
            <Route element={<ProtectedRoute roles={ADMIN_ACCOUNTANT} />}>
              <Route path="/reportes"      element={<ReportsPage />} />
              <Route path="/reportes/:id"  element={<ReportDetailPage />} />
            </Route>

            {/* Admin + Manager (complaints) */}
            <Route element={<ProtectedRoute roles={ADMIN_MANAGER} />}>
              <Route path="/quejas" element={<ComplaintsPage />} />
            </Route>

            {/* Cleaner only */}
            <Route element={<ProtectedRoute roles={CLEANER_ONLY} />}>
              <Route path="/mis-sitios"      element={<MySitesPage />} />
              <Route path="/registrar-logs"  element={<MisSitiosPage />} />
              <Route path="/mis-pedidos"     element={<MyOrdersPage />} />
              <Route path="/mis-pedidos/nuevo" element={<OrderCatalogPage />} />
              <Route path="/mis-vacaciones"  element={<VacationsPage mode="cleaner" />} />
            </Route>

            {/* Mis Reportes — all authenticated (cleaner generates, accountant/admin can view via this path too) */}
            <Route element={<ProtectedRoute roles={ALL_AUTH} />}>
              <Route path="/mis-reportes"     element={<MyReportsPage />} />
              <Route path="/mis-reportes/:id" element={<ReportDetailPage />} />
            </Route>
          </Route>
        </Route>

        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
