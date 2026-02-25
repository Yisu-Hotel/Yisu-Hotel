import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import AdminOverview from './pages/admin/Overview';
import Overview from './pages/merchant/Overview';

const getAuth = () => {
  const token = localStorage.getItem('token');
  const userRaw = localStorage.getItem('user');
  if (!token || !userRaw) {
    return { token: null, role: null };
  }
  try {
    const user = JSON.parse(userRaw);
    return { token, role: user?.role || null };
  } catch (error) {
    return { token: null, role: null };
  }
};

const getRolePath = (role) => {
  if (role === 'admin') {
    return '/admin';
  }
  return '/merchant';
};

function ProtectedRoute({ allowedRoles, children }) {
  const { token, role } = getAuth();
  if (!token || !role) {
    return <Navigate to="/login" replace />;
  }
  if (!allowedRoles.includes(role)) {
    return <Navigate to={getRolePath(role)} replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/merchant"
          element={
            <ProtectedRoute allowedRoles={['merchant']}>
              <Overview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminOverview />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
