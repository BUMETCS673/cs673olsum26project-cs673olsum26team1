// AI-USAGE SUMMARY
// Tools: Claude Code (review fixes applied by team lead)
// Overall AI Contribution: ~50%
// AI-Assisted Areas: Initial component structure and BMI calculation logic
// Human Contributions: Fixed eligibility threshold (>= 27), added input validation,
//   replaced alert() with inline display, replaced location.state with AuthContext,
//   wired calculateBMI utility, added Bootstrap styling

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { calculateBMI } from '../utils/bmi';
import { showError } from '../utils/toast';

function BMICalculationPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const heightInches = Number(height);
    const weightPounds = Number(weight);

    const bmi = calculateBMI(heightInches, weightPounds);

    if (!bmi || isNaN(bmi)) {
      showError('Please enter valid height and weight values.');
      return;
    }

    // TODO: save BMI to the Patient record via POST /api/patients once
    // the backend endpoint is implemented and User→Patient link exists.

    if (bmi >= 27) {
      navigate('/patient/portal', { state: { ...user, bmi: bmi.toFixed(1) } });
    } else {
      navigate('/bmi-ineligible', { state: { ...user, bmi: bmi.toFixed(1) } });
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-4" style={{ maxWidth: 500 }}>
        <h2>BMI Calculation</h2>
        {user && <p>Welcome {user.name}, let&apos;s calculate your BMI.</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Height (inches)</label>
            <input
              type="number"
              className="form-control"
              placeholder="e.g. 65"
              min="1"
              required
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Weight (pounds)</label>
            <input
              type="number"
              className="form-control"
              placeholder="e.g. 180"
              min="1"
              required
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Calculate BMI
          </button>
        </form>
      </div>
    </>
  );
}

export default BMICalculationPage;
