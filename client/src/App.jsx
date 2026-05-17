import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RegisterPage from "./pages/Register";
import LoginPage from './pages/LoginPage';
import PatientPortal from './pages/PatientPortal';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import DirectorDashboard from './pages/DirectorDashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from "react-toastify";


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/patient" element={<PatientPortal />} />
        <Route path="/coordinator" element={<CoordinatorDashboard />} />
        <Route path="/director" element={<DirectorDashboard />} />
        <Route path="/patient/profile" element={<h2 className="text-center mt-5">Patient Profile Coming Soon</h2>} />

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
      </Routes>

      <ToastContainer />

    </BrowserRouter>
    </AuthProvider>
    
  );
}

export default App;