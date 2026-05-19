export function calculateBMI(height, weight){
    if (height <= 0 || weight <= 0) {
        throw new Error("Height and weight must be greater than zero.");
    }

    return (weight / (height * height)) * 703;
}