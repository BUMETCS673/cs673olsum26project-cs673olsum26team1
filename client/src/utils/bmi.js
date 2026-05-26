export function calculateBMI(heightInches, weightPounds) {
  if (!heightInches || heightInches <= 0) return null;
  if (!weightPounds || weightPounds <= 0) return null;

  return (weightPounds * 703) / (heightInches * heightInches);
}
