import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText } from "lucide-react";

interface LoanDetailsCardProps {
  data: {
    loan_amount?: number;
    loan_term?: number;
    interest_rate?: number;
    monthly_payment?: number;
    firstDueDate?: string;
  };
  isLoading: boolean;
  onViewContract: () => void;
}

export default function LoanDetailsCard({
  data,
  isLoading,
  onViewContract,
}: LoanDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Loan Details</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <p className="text-gray-600">Loan Amount:</p>
          <div className="flex items-center gap-2">
            <p className="font-medium">
              PHP{" "}
              {isLoading ? "Loading..." : data.loan_amount?.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <p className="text-gray-600">Loan Term:</p>
          <div className="flex items-center gap-2">
            <p className="font-medium">
              {isLoading ? "Loading..." : `${data.loan_term} Month`}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <p className="text-gray-600">Interest Rate:</p>
          <div className="flex items-center gap-2">
            <p className="font-medium">
              {isLoading ? "Loading..." : `${data.interest_rate}%`}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <p className="text-gray-600">Monthly Payment:</p>
          <div className="flex items-center gap-2">
            <p className="font-medium">
              PHP{" "}
              {isLoading
                ? "Loading..."
                : data.monthly_payment?.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center pb-2">
          <p className="text-gray-600">First Due Date:</p>
          <div className="flex items-center gap-2">
            <p className="font-medium">
              {isLoading ? "Loading..." : data.firstDueDate}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          variant="outline"
          className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
          onClick={onViewContract}
        >
          <FileText className="mr-2 h-4 w-4" />
          View Loan Contract
        </Button>
      </CardFooter>
    </Card>
  );
}
