/**
 * EMI calculation utilities using the standard EMI formula with monthly compounding.
 */

export interface EMIResult {
  monthlyEMI: number;
  totalPayment: number;
  totalInterest: number;
  principal: number;
  tenureMonths: number;
}

/**
 * Calculate EMI (Equated Monthly Installment) using the standard formula:
 * EMI = [P × r × (1 + r)^n] / [(1 + r)^n - 1]
 * 
 * Where:
 * P = Principal loan amount
 * r = Monthly interest rate (annual rate / 12 / 100)
 * n = Loan tenure in months
 * 
 * Special case: If interest rate is 0%, EMI = P / n
 * 
 * @param principal - The principal loan amount (must be > 0)
 * @param annualInterestRate - Annual interest rate in percentage (must be >= 0)
 * @param tenureMonths - Loan tenure in months (must be > 0)
 * @returns EMIResult object containing monthly EMI, total payment, and total interest
 */
export function calculateEMI(
  principal: number,
  annualInterestRate: number,
  tenureMonths: number
): EMIResult {
  // Validate inputs
  if (principal <= 0 || tenureMonths <= 0 || annualInterestRate < 0) {
    throw new Error('Invalid input: principal and tenure must be positive, interest rate must be non-negative');
  }

  let monthlyEMI: number;

  // Special case: 0% interest rate
  if (annualInterestRate === 0) {
    monthlyEMI = principal / tenureMonths;
  } else {
    // Convert annual interest rate to monthly rate (as decimal)
    const monthlyRate = annualInterestRate / 12 / 100;

    // Calculate EMI using the standard formula
    const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths);
    const denominator = Math.pow(1 + monthlyRate, tenureMonths) - 1;
    monthlyEMI = numerator / denominator;
  }

  const totalPayment = monthlyEMI * tenureMonths;
  const totalInterest = totalPayment - principal;

  return {
    monthlyEMI,
    totalPayment,
    totalInterest,
    principal,
    tenureMonths
  };
}
