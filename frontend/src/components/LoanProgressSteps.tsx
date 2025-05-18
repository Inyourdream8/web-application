import { Progress } from "@/components/ui/progress";

interface LoanProgressStepsProps {
  currentStep: number;
}

export default function LoanProgressSteps({
  currentStep,
}: LoanProgressStepsProps) {
  const progressValue = currentStep === 1 ? 33 : currentStep === 2 ? 66 : 100;

  return (
    <div className="relative">
      <Progress value={progressValue} className="h-2 mb-6" />

      <div className="flex justify-between mt-2">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex flex-col items-center">
            <div
              className={`${
                step <= currentStep
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-500"
              } rounded-full w-6 h-6 flex items-center justify-center text-xs mb-2`}
            >
              {step < currentStep ? "✓" : step}
            </div>
            <span className="text-xs text-center">
              {step === 1 && "Apply for a Loan"}
              {step === 2 && "Get Approved"}
              {step === 3 && "Withdraw Your Funds"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
