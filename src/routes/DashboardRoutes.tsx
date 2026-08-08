import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LayoutDashboard, Droplets, Factory as History, FileText, Receipt, Bell, Lightbulb, User, Users, Gauge, BookOpen, CreditCard, ShoppingCart, AlertTriangle as AlertTriangle, BarChart as BarChart2, UserCheck, Building2, Settings, LifeBuoy } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import ResidentDashboard from '../pages/dashboard/ResidentDashboard';
import CommunityAdminDashboard from '../pages/dashboard/CommunityAdminDashboard';
import MainAdminDashboard from '../pages/dashboard/MainAdminDashboard';
import ResidentsPage from '../pages/dashboard/ResidentsPage';
import CommunityAdminsPage from '../pages/dashboard/CommunityAdminsPage';
import AllUsersPage from '../pages/dashboard/AllUsersPage';
import MeterReadingsPage from '../pages/dashboard/MeterReadingsPage';
import MyUsagePage from '../pages/dashboard/MyUsagePage';
import MyBillsPage from '../pages/dashboard/MyBillsPage';
import ReportsPage from '../pages/dashboard/ReportsPage';
import PendingApprovalsPage from '../pages/dashboard/PendingApprovalsPage';
import ResidentProfilePage from '../pages/dashboard/ResidentProfilePage';
import WaterTipsPage from '../pages/dashboard/WaterTipsPage';
import ProtectedRoute from './ProtectedRoute';
import PlaceholderPage from '../pages/PlaceholderPage';
import TariffsPage from '../pages/dashboard/TariffsPage';
import NotificationsPage from '../pages/dashboard/NotificationsPage';
import ApartmentsPage from '../pages/dashboard/ApartmentsPage';

import BillingPage from '../pages/dashboard/BillingPage';
import BulkPurchasesPage from '../pages/dashboard/BulkPurchasesPage';
import AdminWaterUsagePage from '../pages/dashboard/AdminWaterUsagePage';
import UsageHistoryPage from '../pages/dashboard/UsageHistoryPage';
import MyInvoicesPage from '../pages/dashboard/MyInvoicesPage';
import SupportPage from '../pages/dashboard/SupportPage';
import SupportTicketsAdminPage from '../pages/dashboard/SupportTicketsAdminPage';
import SettingsPage from '../pages/dashboard/SettingsPage';
import AdminProfilePage from '../pages/dashboard/AdminProfilePage';
import AdminInvoicesPage from '../pages/dashboard/AdminInvoicesPage';

const residentNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/user' },
  { label: 'My Usage', icon: Droplets, path: '/dashboard/user/usage' },
  { label: 'Usage History', icon: History, path: '/dashboard/user/history' },
  { label: 'My Bills', icon: FileText, path: '/dashboard/user/bills' },
  { label: 'My Invoices', icon: Receipt, path: '/dashboard/user/invoices' },
  { label: 'Notifications', icon: Bell, path: '/dashboard/user/notifications' },
  { label: 'Water Tips', icon: Lightbulb, path: '/dashboard/user/tips' },
  { label: 'Support', icon: LifeBuoy, path: '/dashboard/user/support' },
  { label: 'Profile', icon: User, path: '/dashboard/user/profile' },
];

const residentNavSections = [
  { title: 'Overview', items: residentNav.slice(0, 1) },
  { title: 'Water & Usage', items: residentNav.slice(1, 3) },
  { title: 'Billing', items: residentNav.slice(3, 5) },
  { title: 'Account', items: residentNav.slice(5) },
];

const adminNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/admin' },
  { label: 'Residents', icon: Users, path: '/dashboard/admin/residents' },
  { label: 'Meter Readings', icon: Gauge, path: '/dashboard/admin/meters' },
  { label: 'Water Usage', icon: Droplets, path: '/dashboard/admin/usage' },
  { label: 'Billing', icon: CreditCard, path: '/dashboard/admin/billing' },
  { label: 'Tariff Plans', icon: BookOpen, path: '/dashboard/admin/tariffs' },
  { label: 'Water Purchase', icon: ShoppingCart, path: '/dashboard/admin/purchase' },
  { label: 'Invoices', icon: Receipt, path: '/dashboard/admin/invoices' },
  { label: 'Alerts', icon: AlertTriangle, path: '/dashboard/admin/alerts' },
  { label: 'Reports', icon: BarChart2, path: '/dashboard/admin/reports' },
  { label: 'Support', icon: LifeBuoy, path: '/dashboard/admin/support' },
  { label: 'Profile', icon: User, path: '/dashboard/admin/profile' },
];

const adminNavSections = [
  { title: 'Overview', items: adminNav.slice(0, 1) },
  { title: 'Community', items: adminNav.slice(1, 3) },
  { title: 'Water & Billing', items: adminNav.slice(3, 7) },
  { title: 'Reports & Support', items: adminNav.slice(7, 11) },
  { title: 'Account', items: adminNav.slice(11) },
];

const mainAdminNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/main-admin' },
  { label: 'Community Admins', icon: UserCheck, path: '/dashboard/main-admin/admins' },
  { label: 'Pending Approvals', icon: UserCheck, path: '/dashboard/main-admin/pending' },
  { label: 'Apartments', icon: Building2, path: '/dashboard/main-admin/apartments' },
  { label: 'All Users', icon: Users, path: '/dashboard/main-admin/users' },
  { label: 'Reports', icon: BarChart2, path: '/dashboard/main-admin/reports' },
  { label: 'Support Tickets', icon: LifeBuoy, path: '/dashboard/main-admin/support' },
  { label: 'System Settings', icon: Settings, path: '/dashboard/main-admin/settings' },
  { label: 'Profile', icon: User, path: '/dashboard/main-admin/profile' },
];

const mainAdminNavSections = [
  { title: 'Overview', items: mainAdminNav.slice(0, 1) },
  { title: 'Management', items: mainAdminNav.slice(1, 5) },
  { title: 'Analytics', items: mainAdminNav.slice(5, 6) },
  { title: 'System', items: mainAdminNav.slice(6) },
];

const DashboardRoutes: React.FC = () => (
  <Routes>
    {/* Resident Routes */}
    <Route element={<ProtectedRoute allowedRoles={['RESIDENT']} />}>
      <Route
        path="user/*"
        element={<DashboardLayout navItems={residentNav} navSections={residentNavSections} role="Resident" basePath="/dashboard/user" />}
      >
        <Route index element={<ResidentDashboard />} />
        <Route path="usage" element={<MyUsagePage />} />
        <Route path="history" element={<UsageHistoryPage />} />
        <Route path="bills" element={<MyBillsPage />} />
        <Route path="invoices" element={<MyInvoicesPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="tips" element={<WaterTipsPage />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="profile" element={<ResidentProfilePage />} />
      </Route>
    </Route>

    {/* Community Admin Routes */}
    <Route element={<ProtectedRoute allowedRoles={['COMMUNITY_ADMIN']} />}>
      <Route
        path="admin/*"
        element={<DashboardLayout navItems={adminNav} navSections={adminNavSections} role="Community Admin" basePath="/dashboard/admin" />}
      >
        <Route index element={<CommunityAdminDashboard />} />
        <Route path="residents" element={<ResidentsPage />} />
        <Route path="meters" element={<MeterReadingsPage />} />
        <Route path="usage" element={<AdminWaterUsagePage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="tariffs" element={<TariffsPage />} />
        <Route path="purchase" element={<BulkPurchasesPage />} />
        <Route path="invoices" element={<AdminInvoicesPage />} />
        <Route path="alerts" element={<NotificationsPage />} />
        <Route path="reports" element={<ReportsPage role="COMMUNITY_ADMIN" />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="profile" element={<AdminProfilePage />} />
      </Route>
    </Route>

    {/* Main Admin Routes */}
    <Route element={<ProtectedRoute allowedRoles={['MAIN_ADMIN']} />}>
      <Route
        path="main-admin/*"
        element={<DashboardLayout navItems={mainAdminNav} navSections={mainAdminNavSections} role="Main Admin" basePath="/dashboard/main-admin" />}
      >
        <Route index element={<MainAdminDashboard />} />
        <Route path="admins" element={<CommunityAdminsPage />} />
        <Route path="pending" element={<PendingApprovalsPage />} />
        <Route path="apartments" element={<ApartmentsPage />} />
        <Route path="users" element={<AllUsersPage />} />
        <Route path="reports" element={<ReportsPage role="MAIN_ADMIN" />} />
        <Route path="support" element={<SupportTicketsAdminPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<PlaceholderPage title="Profile" />} />
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

export default DashboardRoutes;
