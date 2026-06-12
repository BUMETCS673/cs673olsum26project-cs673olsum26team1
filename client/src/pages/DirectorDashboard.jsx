// const DirectorDashboard = () => {
//   return (
//     <div className="container mt-5">
//       <h1>Program Director Dashboard</h1>
//     </div>
//   );
// };

// export default DirectorDashboard;

import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import AIChatWidget from '../components/AIChatWidget';
import ReadOnlyBanner from '../components/ReadOnlyBanner';


function DirectorDashboard() {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <ReadOnlyBanner />
      <div className="container mt-4">
        <h2>Program Director Dashboard</h2>
        <p>Welcome, {user?.name}. Your role is: {user?.role}</p>
        <p className="text-muted">DirectorDashboard features coming soon.</p>
      </div>
      <AIChatWidget
        role="PROGRAM_DIRECTOR"
        patientContext={{ role: 'program_director' }}
      />
    </>
  );
}

export default DirectorDashboard;