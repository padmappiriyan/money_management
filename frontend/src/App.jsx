import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthContext } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import PublicRatesPage from './pages/auth/PublicRatesPage';
import ChangePasswordPage from './pages/auth/ChangePasswordPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import UsersPage from './pages/dashboard/admin/UsersPage';
import ActivityPage from './pages/dashboard/common/ActivityPage';
import ProfilePage from './pages/dashboard/common/ProfilePage';
// import TransactionsPage from './pages/dashboard/common/TransactionsPage';
import ChangeRequestPage from './pages/dashboard/common/ChangeRequestPage';
import ChangeRequestListPage from './pages/dashboard/common/ChangeRequestListPage';
import AuditLogsPage from "./pages/dashboard/common/AuditLogsPage";
import PlatformsPage from "./pages/dashboard/admin/PlatformsPage";
import RatesPage from "./pages/dashboard/common/RatesPage";
import ReportsPage from "./pages/dashboard/common/ReportsPage";
import AdminChangeRequestReviewPage from './pages/dashboard/admin/AdminChangeRequestReviewPage';
import AdminReportsPage from './pages/dashboard/admin/AdminReportsPage';
import UserRecordsPage from './pages/dashboard/admin/UserRecordsPage';
import ExcelPage from './pages/dashboard/common/ExcelPage';
import AdminExcelPage from './pages/dashboard/common/AdminExcelPage';
import TransactionHistoryPage from './pages/dashboard/common/TransactionHistoryPage';
import DashboardLayout from './layouts/DashboardLayout';
import LandingLayout from './components/layout/LandingLayout';

import { ROLES } from './constants/roles';

function App() {
  const { userInfo } = useAuthContext();

  return (
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* Public routes */}
        <Route element={<LandingLayout />}>
          <Route path="/public-rates" element={<PublicRatesPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected routes — require authentication */}
        <Route element={<ProtectedRoute />}>
          {/* Dashboard Layout Shared for all authenticated users */}
          {/* Dashboard Layout Shared for all authenticated users */}
          <Route element={<DashboardLayout />}>
            {/* The base /dashboard path */}
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Common shared routes */}
            {/* <Route path="/dashboard/transactions" element={<TransactionsPage />} /> */}
            <Route path="/dashboard/transaction-history" element={<TransactionHistoryPage />} />
            <Route path="/dashboard/transactions/:id/change-request" element={<ChangeRequestPage />} />
            <Route path="/dashboard/change-requests" element={<ChangeRequestListPage />} />
            <Route path="/dashboard/profile" element={<ProfilePage />} />
            <Route path="/dashboard/audit-logs" element={<AuditLogsPage />} />
            <Route path="/dashboard/activity-timeline" element={<ActivityPage />} />
            <Route path="/dashboard/rates" element={<RatesPage />} />
            <Route path="/dashboard/excel" element={
              userInfo?.role === 'admin'
                ? <AdminExcelPage />
                : <ExcelPage />
            } />

            {/* Consolidated Reports Route — Logic inside component handles role branching */}
            <Route path="/dashboard/reports" element={
              userInfo?.role === 'admin' || userInfo?.role === 'supervisor'
                ? <AdminReportsPage />
                : <ReportsPage />
            } />

            <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.SUPERVISOR]} />}>
              <Route path="/dashboard/change-requests/:id" element={<AdminChangeRequestReviewPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
              <Route path="/dashboard/users" element={<UsersPage />} />
              <Route path="/dashboard/platforms" element={<PlatformsPage />} />
              <Route path="/dashboard/user-records" element={<UserRecordsPage />} />
            </Route>
          </Route>

          <Route path="/auth/change-password" element={<ChangePasswordPage />} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/public-rates" replace />} />
        <Route path="*" element={<Navigate to="/public-rates" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
