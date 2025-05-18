import { X } from "lucide-react";

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
  data?: {
    loanDetails: {
      application_number: string;
      loan_amount: number;
      termMonths: number;
      interest_rate: number;
      monthly_payment: number;
      firstDueDate: string;
    };
  };
}

const ContractModal = ({ isOpen, onClose, data }: ContractModalProps) => {
  const loanDetails = data?.loanDetails;
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Loan Contract</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="prose max-w-none">
          <h1>Loan Agreement</h1>
          <p>
            This Loan Agreement (the "Agreement") is entered into as of{" "}
            {loanDetails!.firstDueDate} by and between:
          </p>

          <p>
            <strong>Lender:</strong> LoanWise Financial Services, Inc.
          </p>
          <p>
            <strong>Borrower:</strong> [Borrower Name]
          </p>

          <h2>1. Loan Details</h2>
          <ul>
            <li>
              <strong>Loan Application Number:</strong>{" "}
              {loanDetails!.application_number}
            </li>
            <li>
              <strong>Loan Amount:</strong> PHP{" "}
              {loanDetails!.loan_amount.toLocaleString()}
            </li>
            <li>
              <strong>Loan Term:</strong> {loanDetails!.termMonths} months
            </li>
            <li>
              <strong>Interest Rate:</strong> {loanDetails!.interest_rate}% per
              annum
            </li>
            <li>
              <strong>Monthly Payment:</strong> PHP{" "}
              {loanDetails!.monthly_payment.toLocaleString()}
            </li>
            <li>
              <strong>First Payment Due:</strong> {loanDetails!.firstDueDate}
            </li>
          </ul>

          <h2>2. Repayment</h2>
          <p>
            The Borrower agrees to repay the Loan Amount plus interest in equal
            monthly installments of PHP{" "}
            {loanDetails!.monthly_payment.toLocaleString()} due on the 25th day
            of each month, beginning on {loanDetails!.firstDueDate} and
            continuing until the Loan Amount and all accrued interest have been
            paid in full.
          </p>

          <h2>3. Prepayment</h2>
          <p>
            The Borrower may prepay all or any part of the Loan Amount at any
            time without penalty.
          </p>

          <h2>4. Late Payments</h2>
          <p>
            If any payment is not received within 5 days of its due date, the
            Borrower will be charged a late fee equal to 5% of the payment
            amount.
          </p>

          <h2>5. Default</h2>
          <p>
            The Borrower will be in default if any payment is not made within 30
            days of its due date. Upon default, the Lender may declare the
            entire unpaid Loan Amount immediately due and payable.
          </p>

          <h2>6. Governing Law</h2>
          <p>
            This Agreement shall be governed by and construed in accordance with
            the laws of the Philippines.
          </p>

          <h2>7. Signatures</h2>
          <p>
            By electronically accepting this Agreement, both parties acknowledge
            and agree to its terms and conditions.
          </p>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContractModal;
