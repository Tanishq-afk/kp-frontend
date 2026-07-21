// Centralized UI route strings — rename a route in one place.
export const PATHS = {
  login: '/login',
  dashboard: '/dashboard',
  billing: '/billing',
  products: '/products',
  productNew: '/products/new',
  productEdit: (id) => `/products/${id}/edit`,
  categories: '/categories',
  printQueue: '/print-queue',
  customers: '/customers',
  bills: '/bills',
};
