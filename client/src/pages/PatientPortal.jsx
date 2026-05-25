import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

function PatientPortal() {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h2>Patient Portal</h2>
        <p>Welcome, {user?.name}. Your role is: {user?.role}</p>
        <p className="text-muted">Patient features coming soon.</p>
      </div>
    </>
  );
}

export default PatientPortal;