import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROLE } from '../config/constants.js';
import ProtectedRoute from './ProtectedRoute.jsx';
import RoleRoute from './RoleRoute.jsx';
import RoleHome from './RoleHome.jsx';
import AppLayout from '../layouts/AppLayout.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';

// Feature pages are code-split so each route loads on demand (keeps the initial
// bundle small — e.g. the charts only load when the dashboard is opened).
const LoginPage = lazy(() => import('../features/auth/LoginPage.jsx'));
const BillingPage = lazy(() => import('../features/billing/BillingPage.jsx'));
const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage.jsx'));
const CategoriesPage = lazy(() => import('../features/categories/CategoriesPage.jsx'));
const ProductsPage = lazy(() => import('../features/products/ProductsPage.jsx'));
const ProductFormPage = lazy(() => import('../features/products/ProductFormPage.jsx'));
const PrintQueuePage = lazy(() => import('../features/barcodes/PrintQueuePage.jsx'));
const CustomersPage = lazy(() => import('../features/customers/CustomersPage.jsx'));
const BillsPage = lazy(() => import('../features/bills/BillsPage.jsx'));

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
          { path: 'products', element: adminOnly(<ProductsPage />) },
          { path: 'products/new', element: adminOnly(<ProductFormPage />) },
          { path: 'products/:id/edit', element: adminOnly(<ProductFormPage />) },
          { path: 'categories', element: adminOnly(<CategoriesPage />) },
          { path: 'print-queue', element: adminOnly(<PrintQueuePage />) },
          { path: 'customers', element: adminOnly(<CustomersPage />) },

          // Bills history — both roles
          { path: 'bills', element: <BillsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
