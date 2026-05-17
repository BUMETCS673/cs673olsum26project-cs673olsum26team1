import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RegisterPage from './pages/Register';
import LoginPage from './pages/LoginPage';
import PatientPortal from './pages/PatientPortal';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import DirectorDashboard from './pages/DirectorDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes — one canonical path each */}
          <Route
            path="/patient/portal"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <PatientPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coordinator/dashboard"
            element={
              <ProtectedRoute allowedRoles={['COORDINATOR']}>
                <CoordinatorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/director/dashboard"
            element={
              <ProtectedRoute allowedRoles={['PROGRAM_DIRECTOR']}>
                <DirectorDashboard />
              </ProtectedRoute>
            }
          />

          {/* anything unknown goes to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;