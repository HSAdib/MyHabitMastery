import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, createHashRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import ProtectedAdminRoute from './components/ProtectedAdminRoute.jsx';
import { isNativePlatform } from './platform/nativeAuth';

const routes = [
  { path: '/', element: <App /> },
  {
    path: '/admin-panel',
    element: (
      <ProtectedAdminRoute>
        <AdminPanel />
      </ProtectedAdminRoute>
    ),
  },
];

const router = isNativePlatform()
  ? createHashRouter(routes)
  : createBrowserRouter(routes);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
