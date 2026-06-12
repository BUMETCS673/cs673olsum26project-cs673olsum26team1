// AI-USAGE SUMMARY
// Tools: Claude
// Overall AI Contribution: ~30%
// AI-Assisted Areas: initial component structure, API integration
// Human Contributions: general layout and structure, syling consistent with coordinator dashboard and ui examples

import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import AIChatWidget from '../components/AIChatWidget';
import ReadOnlyBanner from '../components/ReadOnlyBanner';
import SearchBar from '../components/SearchBar';
import PatientMetrics from '../components/PatientMetrics';

function DirectorDashboard() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <ReadOnlyBanner />
      <div className="container mt-4">
        <h2>Program Director Dashboard</h2>
        <p className="text-muted">Pipeline overview — all patients across the program</p>
        <PatientMetrics />
        <SearchBar disableClick />
      </div>
      <AIChatWidget
        role="PROGRAM_DIRECTOR"
        patientContext={{ role: 'program_director' }}
      />
    </>
  );
}

export default DirectorDashboard;