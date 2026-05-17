//5-16-2026
//for BARI-8 testing
// App.jsx
// Main routing file for BariatricPath
// Defines which URL shows which page
// Wraps app in AuthProvider

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import { AuthProvider, useAuth }
  from './context/AuthContext';

// Page imports
import LoginPage
  from './pages/LoginPage';
import PatientPortal
  from './pages/PatientPortal';
import CoordinatorDashboard
  from './pages/CoordinatorDashboard';
import DirectorDashboard
  from './pages/DirectorDashboard';
import ProtectedRoute
  from './components/ProtectedRoute';



import 'bootstrap/dist/css/bootstrap.min.css';

// RoleRouter sends logged in users
// to the correct dashboard
// based on their role
const RoleRouter = () => {
  const { currentUser, userRole } = useAuth();

  // Not logged in → show login page
  // This uses LoginPage.jsx
  // which  (BARI-7) owns
  // For now it shows placeholder
  if (!currentUser) return <LoginPage />;

  // Logged in → redirect by role
  if (userRole === 'COORDINATOR')
    return <Navigate to="/coordinator" replace />;
  if (userRole === 'PROGRAM_DIRECTOR')
    return <Navigate to="/director" replace />;
  return <Navigate to="/patient" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* Main route
              Shows login or redirects
              based on role */}
          <Route
            path="/"
            element={<RoleRouter />}
          />

         

          {/* Patient portal
              Protected — PATIENT only */}
          <Route
            path="/patient"
            element={
              <ProtectedRoute
                allowedRoles={['PATIENT']}
              >
                <PatientPortal />
              </ProtectedRoute>
            }
          />

          {/* Coordinator dashboard
              Protected — COORDINATOR only */}
          <Route
            path="/coordinator"
            element={
              <ProtectedRoute
                allowedRoles={['COORDINATOR']}
              >
                <CoordinatorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Director dashboard
              Protected — PROGRAM_DIRECTOR only */}
          <Route
            path="/director"
            element={
              <ProtectedRoute
                allowedRoles={['PROGRAM_DIRECTOR']}
              >
                <DirectorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch all → redirect to home */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;