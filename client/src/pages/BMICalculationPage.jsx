import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import { calculateBMI } from "../utils/bmi";


function BMICalculationPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const user = location.state; // data passed from Register

  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const heightInches = Number(height);
    const weightPounds = Number(weight)
    const bmi = calculateBMI(heightInches, weightPounds);

    alert(`Your BMI is ${bmi.toFixed(1)}`);

    // later: save to backend here

    
    if (bmi > 27) {
      navigate('/patient/portal', {
        state: {
          ...user,
          bmi: bmi.toFixed(1),
        },
      });
    } else {
      navigate('/bmi-ineligible', {
        state: {
          ...user,
          bmi: bmi.toFixed(1),
        },
      });
    }
  };

  return (
    <>
    <Navbar />
    <div style={{ padding: 20 }}>
      <h2>BMI Calculation</h2>

      {user && <p>Welcome {user.name}, let's calculate your BMI.</p>}

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Height (inches)"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
        />

        <br />

        <input
          placeholder="Weight (pounds)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />

        <br />

        <button type="submit">Calculate BMI</button>
      </form>
    </div>
    </>
  );
}

export default BMICalculationPage;