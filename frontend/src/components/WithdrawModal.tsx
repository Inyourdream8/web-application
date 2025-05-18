import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WithdrawModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  balance: number;
  isLoading: boolean;
  onConfirm: () => void;
}

export default function WithdrawModal({
  isOpen,
  onOpenChange,
  balance,
  isLoading,
  onConfirm,
}: WithdrawModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
        </DialogHeader>

        <div className="p-4">
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Available Balance</p>
            <p className="text-2xl font-bold">
              PHP {isLoading ? "Loading..." : balance?.toLocaleString()}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Withdrawal Amount (PHP)
              </label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OTP-Code
              </label>
              <select className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter withdrawal code"
                />
              </select>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <p className="text-sm text-gray-500">
              Funds will be transferred to your account within 10-15 minutes.
            </p>
            <Button className="w-full" onClick={onConfirm}>
              Proceed with Withdrawal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
