import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { ProtectedRoute, RoleRoute } from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ChangePassword from './pages/ChangePassword';
import UserStores from './pages/UserStores';
import AdminDashboard from './pages/AdminDashboard';
import OwnerDashboard from './pages/OwnerDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<PageFrame />}>
            <Route index element={<Home />} />
            <Route path="password" element={<ChangePassword />} />
            <Route element={<RoleRoute roles={['USER']} />}><Route path="stores" element={<UserStores />} /></Route>
            <Route element={<RoleRoute roles={['ADMIN']} />}><Route path="admin" element={<AdminDashboard />} /></Route>
            <Route element={<RoleRoute roles={['STORE_OWNER']} />}><Route path="owner" element={<OwnerDashboard />} /></Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function PageFrame() {
  return <Layout><RoutesOutlet /></Layout>;
}

function RoutesOutlet() {
  return <Outlet />;
}
