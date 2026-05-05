import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Navbar from './components/layout/Navbar.jsx';

import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import TenantRegisterPage from './pages/TenantRegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import PropertiesPage from './pages/PropertiesPage.jsx';
import PropertyDetailPage from './pages/PropertyDetailPage.jsx';
import TenantsPage from './pages/TenantsPage.jsx';
import TenantDetailPage from './pages/TenantDetailPage.jsx';
import LeasesPage from './pages/LeasesPage.jsx';
import PaymentsPage from './pages/PaymentsPage.jsx';
import BillsPage from './pages/owner/BillsPage.jsx';
import UnpaidBillsPage from './pages/owner/UnpaidBillsPage.jsx';
import UnitDetailPage from './pages/owner/UnitDetailPage.jsx';
import PortalBillsPage from './pages/portal/PortalBillsPage.jsx';
import PortalBillDetailPage from './pages/portal/PortalBillDetailPage.jsx';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const RoleRoute = ({ role, children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    return <Navigate to={user.role === 'owner' ? '/dashboard' : '/portal/bills'} replace />;
  }
  return children;
};

const AppLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <Navbar />
    <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
  </div>
);

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/tenant/register" element={<TenantRegisterPage />} />

      {/* Owner routes */}
      <Route path="/dashboard" element={<RoleRoute role="owner"><AppLayout><DashboardPage /></AppLayout></RoleRoute>} />
      <Route path="/properties" element={<RoleRoute role="owner"><AppLayout><PropertiesPage /></AppLayout></RoleRoute>} />
      <Route path="/properties/:id" element={<RoleRoute role="owner"><AppLayout><PropertyDetailPage /></AppLayout></RoleRoute>} />
      <Route path="/units/:id" element={<RoleRoute role="owner"><AppLayout><UnitDetailPage /></AppLayout></RoleRoute>} />
      <Route path="/tenants" element={<RoleRoute role="owner"><AppLayout><TenantsPage /></AppLayout></RoleRoute>} />
      <Route path="/tenants/:id" element={<RoleRoute role="owner"><AppLayout><TenantDetailPage /></AppLayout></RoleRoute>} />
      <Route path="/leases" element={<RoleRoute role="owner"><AppLayout><LeasesPage /></AppLayout></RoleRoute>} />
      <Route path="/payments" element={<RoleRoute role="owner"><AppLayout><PaymentsPage /></AppLayout></RoleRoute>} />
      <Route path="/bills" element={<RoleRoute role="owner"><AppLayout><BillsPage /></AppLayout></RoleRoute>} />
      <Route path="/bills/unpaid" element={<RoleRoute role="owner"><AppLayout><UnpaidBillsPage /></AppLayout></RoleRoute>} />
      <Route path="/units/:id" element={<RoleRoute role="owner"><AppLayout><UnitDetailPage /></AppLayout></RoleRoute>} />

      {/* Tenant portal routes */}
      <Route path="/portal/bills" element={<RoleRoute role="tenant"><PortalBillsPage /></RoleRoute>} />
      <Route path="/portal/bills/:id" element={<RoleRoute role="tenant"><PortalBillDetailPage /></RoleRoute>} />

      {/* Default redirect based on role */}
      <Route path="/" element={
        user?.role === 'tenant' ? <Navigate to="/portal/bills" replace /> : <Navigate to="/dashboard" replace />
      } />
      <Route path="*" element={
        user?.role === 'tenant' ? <Navigate to="/portal/bills" replace /> : <Navigate to="/dashboard" replace />
      } />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
