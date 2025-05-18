import React, { useState, useEffect } from "react";
import { AccountStatus, LoanStatus, WithdrawalStatus } from "../../Apply/types";

// Define RawLoanData interface for API response shape
interface RawLoanData {
  account_status: AccountStatus;
  withdrawal_status: WithdrawalStatus;
  termMonths: number;
  due_date: string;
  loan_status: LoanStatus;
  application_date?: string;
}

// Define Loan interface for transformed loan data
interface Loan extends RawLoanData {
  amount: number;
  interest_rate: number;
  term: number;
  startDate: string;
  monthly_payment: number;
  remaining_balance: number;
}

const LoansPage = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/loans"); // Replace with your API endpoint
        const rawData: RawLoanData[] = await response.json();

        const transformedLoans: Loan[] = rawData.map((data) => ({
          ...data,
          amount: 0, // Default values or derived values
          interest_rate: 0,
          term: data.termMonths,
          startDate: "", // This could be derived based on application_date
          monthly_payment: 0, // Can be calculated using loan amount and interest rate
          remaining_balance: 0, // Default remaining balance
        }));

        setLoans(transformedLoans);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load loans");
        setIsLoading(false);
      }
    };

    fetchLoans();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Loans</h1>
      <table>
        <thead>
          <tr>
            <th>Account Status</th>
            <th>Loan Status</th>
            <th>Term (months)</th>
            <th>Due Date</th>
          </tr>
        </thead>
        <tbody>
          {loans.map((loan, index) => (
            <tr key={index}>
              <td>{loan.account_status}</td>
              <td>{loan.loan_status}</td>
              <td>{loan.termMonths}</td>
              <td>{loan.due_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LoansPage;
