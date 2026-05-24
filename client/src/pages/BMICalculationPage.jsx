import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Navbar from '../components/Navbar';


function BMICalculationPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const user = location.state; // data passed from Register

  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const heightMeters = height / 100;
    const bmi = weight / (heightMeters * heightMeters);

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
          placeholder="Height (cm)"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
        />

        <br />

        <input
          placeholder="Weight (kg)"
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