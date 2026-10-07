import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { WalletProvider } from './context/WalletContext.jsx';
import { AppProvider } from './context/AppContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import UserRoute from './routes/UserRoute.jsx';
import AdminRoute from './routes/AdminRoute.jsx';
import UserLayout from './layouts/UserLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';

import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Wallet from './pages/Wallet.jsx';
import BuySell from './pages/BuySell.jsx';
import Transactions from './pages/Transactions.jsx';
import TransactionDetails from './pages/TransactionDetails.jsx';
import Commission from './pages/Commission.jsx';
import KYC from './pages/KYC.jsx';
import Disputes from './pages/Disputes.jsx';
import Notifications from './pages/Notifications.jsx';
import Profile from './pages/Profile.jsx';
import NotFound from './pages/NotFound.jsx';

import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminUserDetail from './pages/admin/AdminUserDetail.jsx';
import AdminKYC from './pages/admin/AdminKYC.jsx';
import AdminTransactions from './pages/admin/AdminTransactions.jsx';
import AdminOrders from './pages/admin/AdminOrders.jsx';
import AdminCommissions from './pages/admin/AdminCommissions.jsx';
import AdminSettlements from './pages/admin/AdminSettlements.jsx';
import AdminDisputes from './pages/admin/AdminDisputes.jsx';
import AdminReports from './pages/admin/AdminReports.jsx';
import AdminAuditLogs from './pages/admin/AdminAuditLogs.jsx';
import AdminSettings from './pages/admin/AdminSettings.jsx';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <WalletProvider>
          <AppProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route element={<UserRoute><UserLayout /></UserRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/buy-sell" element={<BuySell />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/transactions/:id" element={<TransactionDetails />} />
                <Route path="/commission" element={<Commission />} />
                <Route path="/kyc" element={<KYC />} />
                <Route path="/disputes" element={<Disputes />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/success/:id" element={<TransactionDetails />} />
              </Route>

              <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/users/:id" element={<AdminUserDetail />} />
                <Route path="/admin/kyc" element={<AdminKYC />} />
                <Route path="/admin/transactions" element={<AdminTransactions />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/commissions" element={<AdminCommissions />} />
                <Route path="/admin/settlements" element={<AdminSettlements />} />
                <Route path="/admin/disputes" element={<AdminDisputes />} />
                <Route path="/admin/reports" element={<AdminReports />} />
                <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
              </Route>

              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppProvider>
        </WalletProvider>
      </AuthProvider>
    </ToastProvider>
  );
}