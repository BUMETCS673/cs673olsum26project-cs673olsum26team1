import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import PatientPortal from './pages/PatientPortal';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import DirectorDashboard from './pages/DirectorDashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import ThankYouPage from './pages/ThankYouPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/patient" element={<PatientPortal />} />
        <Route path="/coordinator" element={<CoordinatorDashboard />} />
        <Route path="/director" element={<DirectorDashboard />} />
        <Route path="/thank-you/:id" element={<ThankYouPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;