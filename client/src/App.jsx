// AI-USAGE SUMMARY
// Tools: ChatGPT
// Overall AI Contribution: ~25%
// AI-Assisted Areas: Initial component structure and routing suggestions
// Human Contributions: UI integration, debugging, Firebase integration, styling adjustments, and testing
// Notes: Code was adapted to fit BariatricPath authentication and routing requirements.

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RegisterPage from './pages/Register';
import BMICalculationPage from './pages/BMICalculationPage';
import BmiIneligiblePage from './pages/BmiIneligiblePage';
import LoginPage from './pages/LoginPage';
import PatientPortal from './pages/PatientPortal';
import BMIForm from './pages/BMIForm';
import ThankYouPage from './pages/ThankYouPage';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import PatientDetail from './pages/PatientDetail';
import DirectorDashboard from './pages/DirectorDashboard';
import PrivacyPolicyPage from './pages/PrivacyPolicy';

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
          <Route path="/bmi-calculation" element={<BMICalculationPage />} />
          <Route path="/bmi-ineligible" element={<BmiIneligiblePage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

          {/* Protected routes — one canonical path each */}
          <Route
            path="/bmi"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <BMIForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/thank-you/:id"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <ThankYouPage />
              </ProtectedRoute>
            }
          />
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
            path="/coordinator/patients/:id"
            element={
              <ProtectedRoute allowedRoles={['COORDINATOR']}>
                <PatientDetail />
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