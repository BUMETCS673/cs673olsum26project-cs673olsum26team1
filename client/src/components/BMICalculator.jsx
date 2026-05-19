import { useState } from "react";
import { calculateBMI } from "../utils/bmi";

function BMICalculator() {

    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [bmi, setBMI] = useState("");

    const handleCalculate = () => {

        try {

            const result = calculateBMI(
                Number(height),
                Number(weight)
            );

            setBMI(result.toFixed(2));

        } catch (error) {

            setBMI(error.message);
        }
    };

    return (
        <div>
            <h2>BMI Calculator</h2>

            <input
                type="number"
                placeholder="Height (inches)"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
            />

            <input
                type="number"
                placeholder="Weight (pounds)"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
            />

            <button onClick={handleCalculate}>
                Calculate BMI
            </button>

            {bmi && <p>BMI: {bmi}</p>}
        </div>
    );
}

export default BMICalculator;