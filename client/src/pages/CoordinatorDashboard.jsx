import React from 'react';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';

const CoordinatorDashboard = () => (
  <>
    <Navbar />
    <div className="container mt-4">
      <h2>Coordinator Portal</h2>
      {/* SearchBarowns all the state, fetch logic, debounce, and filter UI */}
      <SearchBar />
    </div>
  </>
);

export default CoordinatorDashboard;
