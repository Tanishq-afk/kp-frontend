import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROLE } from 'src/config/constants.js';
import ProtectedRoute from './ProtectedRoute.jsx';
import RoleRoute from './RoleRoute.jsx';
import RoleHome from './RoleHome.jsx';
import AppLayout from 'src/layouts/AppLayout.jsx';
import AuthLayout from 'src/layouts/AuthLayout.jsx';

// Feature pages are code-split so each route loads on demand (keeps the initial
// bundle small — e.g. the charts only load when the dashboard is opened).
const LoginPage = lazy(() => import('src/pages/Login'));
const BillingPage = lazy(() => import('src/pages/Billing'));
const ReturnsPage = lazy(() => import('src/pages/Returns'));
const DashboardPage = lazy(() => import('src/pages/Dashboard'));
const CategoriesPage = lazy(() => import('src/pages/Categories'));
const ProductsPage = lazy(() => import('src/pages/Products'));
const ProductFormPage = lazy(() => import('src/pages/Products/form.jsx'));
const PrintQueuePage = lazy(() => import('src/pages/PrintQueue'));
const CustomersPage = lazy(() => import('src/pages/Customers'));
const BillsPage = lazy(() => import('src/pages/Bills'));
const DaySummaryPage = lazy(() => import('src/pages/DaySummary'));

// Helpers to keep the route table readable.
const adminOnly = (el) => <RoleRoute allow={[ROLE.ADMIN]}>{el}</RoleRoute>;
const superadminOnly = (el) => <RoleRoute allow={[ROLE.SUPERADMIN]}>{el}</RoleRoute>;

// All app routes are declared here, in one place.
export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <RoleHome /> },

          // Superadmin
          { path: 'dashboard', element: superadminOnly(<DashboardPage />) },

          // Admin — inventory & POS
          { path: 'billing', element: adminOnly(<BillingPage />) },
          { path: 'returns', element: adminOnly(<ReturnsPage />) },
          { path: 'products', element: adminOnly(<ProductsPage />) },
          { path: 'products/new', element: adminOnly(<ProductFormPage />) },
          { path: 'products/:id/edit', element: adminOnly(<ProductFormPage />) },
          { path: 'categories', element: adminOnly(<CategoriesPage />) },
          { path: 'print-queue', element: adminOnly(<PrintQueuePage />) },
          { path: 'customers', element: adminOnly(<CustomersPage />) },

          // Bills history + day summary — both roles
          { path: 'bills', element: <BillsPage /> },
          { path: 'day-summary', element: <DaySummaryPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
