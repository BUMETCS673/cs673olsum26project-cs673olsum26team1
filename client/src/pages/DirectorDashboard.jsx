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

function DirectorDashboard() {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h2>Program Director Dashboard</h2>
        <p>Welcome, {user?.name}. Your role is: {user?.role}</p>
        <p className="text-muted">DirectorDashboard features coming soon.</p>
      </div>
    </>
  );
}

export default DirectorDashboard;