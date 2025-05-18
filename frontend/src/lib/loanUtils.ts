import { Loan, PaymentScheduleItem } from "@/pages/Apply/types";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
}

// src/lib/loanUtils.ts
export function formatLoanDate(date: string | Date): string {
  const parsedDate = typeof date === "string" ? new Date(date) : date;
  return parsedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function calculateAmortization(loan: Loan): PaymentScheduleItem[] {
  const {
    id: loanId = "loan-id",
    amount = loan.loan_amount || 0,
    interest_rate = 0,
    term = loan.loan_term || 12,
    startDate = new Date(),
  } = loan;

  const monthlyRate = interest_rate / 100 / 12;
  const monthly_payment =
    (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term));

  return Array.from({ length: term }, (_, i) => {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);

    const interest = amount * monthlyRate;
    const principal = monthly_payment - interest;
    const remaining_balance = amount - principal;

    return {
      id: `${loanId}-${i + 1}`, // Generate a unique ID for each payment
      loanId, // Use the loan's ID
      number: i + 1,
      dueDate,
      paymentAmount: monthly_payment,
      principal,
      interest,
      remaining_balance,
      status:
        i < (loan.paymentsMade || 0)
          ? "paid"
          : i === (loan.paymentsMade || 0)
          ? "pending"
          : "overdue",
    };
  });
}
