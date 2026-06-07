import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import AIChatWidget from '../components/AIChatWidget';


const CoordinatorDashboard = () => (
  <>
    <Navbar />
    <div className="container mt-4">
      <h2>Coordinator Portal</h2>
      <SearchBar />
    </div>
    <AIChatWidget
      role="COORDINATOR"
      patientContext={{ role: 'coordinator' }}
    />
  </>
);

export default CoordinatorDashboard;
