import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import PatientPortal from './pages/PatientPortal';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import DirectorDashboard from './pages/DirectorDashboard';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/patient" element={<PatientPortal />} />
        <Route path="/coordinator" element={<CoordinatorDashboard />} />
        <Route path="/director" element={<DirectorDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;