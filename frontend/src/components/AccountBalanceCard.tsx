import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Wallet } from "lucide-react";

// eslint-disable-next-line react-refresh/only-export-components
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return "N/A";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
};

interface AccountBalanceCardProps {
  data: {
    available_balance: number;
    application_number?: string;
    loan_status?: string;
    description?: string;
    approvedDate?: string;
    approvedBy?: string;
    activated?: boolean;
  };
  isLoading: boolean;
  onWithdraw: () => void;
}

const maskAccountNumber = (number?: string) => {
  if (!number) return "";
  return "******" + number.slice(-4);
};

export default function AccountBalanceCard({
  data,
  isLoading,
  onWithdraw,
}: AccountBalanceCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl">My Account & Balance</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="bg-blue-500 text-white rounded-lg p-6 mb-4">
          <div className="mb-4">
            <p>Available Balance: {formatCurrency(data.available_balance)}</p>
            <h3
              className="text-3xl font-bold flex items-baseline"
              aria-live="polite"
            >
              ₱{" "}
              {isLoading
                ? "Loading..."
                : formatCurrency(data.available_balance || 0)}
            </h3>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-80">Application Number</p>
            </div>

            <div className="text-right">
              <p className="text-xs opacity-80">Date</p>
              <p className="font-medium">April 2025</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="font-medium">Loan Status:</p>
              <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
                {isLoading ? "Loading..." : data.loan_status}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-4">Description:</p>
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-4">
              <p className="text-sm">
                {isLoading ? "Loading..." : data.description}
              </p>
              <p className="text-sm mt-2">
                <span className="text-gray-600">Approved Date:</span>{" "}
                {isLoading ? "Loading..." : data.approvedDate}
              </p>
              <p className="text-sm">
                <span className="text-gray-600">Approved By:</span>{" "}
                {isLoading ? "Loading..." : data.approvedBy}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-green-600 mb-2">
              {isLoading
                ? ""
                : data.activated
                ? "Activated"
                : "Pending Activation"}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <button
          onClick={onWithdraw}
          className="btn-withdraw"
          aria-label="Withdraw funds"
          role="button"
        >
          Withdraw Funds
        </button>
      </CardFooter>
    </Card>
  );
}
