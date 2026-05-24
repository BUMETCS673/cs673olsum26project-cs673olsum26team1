import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

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

    navigate('/patient/portal');
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>BMI Calculation Page</h2>

      {user && <p>Welcome {user.name}</p>}

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
  );
}

export default BMICalculationPage;