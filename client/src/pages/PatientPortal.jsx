import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import SurgeryCleared from '../components/SurgeryCleared';

function PatientPortal() {
  const { user } = useAuth();
  const [progress, setProgress] = useState({ completed: 0, total: 0 });

  useEffect(() => {
    if (!user?.patientId) return;
  
    fetch(`/api/patients/${user.patientId}`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(data => setProgress(data.progress))
      .catch(err => console.error('Failed to fetch progress:', err));
  }, [user]);

  const isCleared = progress.completed === progress.total && progress.total > 0;

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h2>Patient Portal</h2>
        <p>Welcome, {user?.name}. Your role is: {user?.role}</p>
        <p className="text-muted">Patient features coming soon.</p>
        {/* Progress section */}

        {isCleared && <SurgeryCleared />}

        {/* Checklist section */}
      </div>
    </>
  );
}

export default PatientPortal;
