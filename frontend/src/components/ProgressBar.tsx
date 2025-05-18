interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressBar = ({ currentStep, totalSteps }: ProgressBarProps) => {
  return (
    <div className="mb-8">
      <div className="w-full bg-gray-200 h-2 rounded-full">
        <div
          className="bg-accent h-full rounded-full transition-all duration-500"
          style={{
            width: `${(currentStep / totalSteps) * 100}%`,
          }}
        ></div>
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span className={currentStep >= 1 ? "text-accent font-medium" : ""}>
          Account Details
        </span>
        <span className={currentStep >= 3 ? "text-accent font-medium" : ""}>
          Complete
        </span>
      </div>
    </div>
  );
};

export default ProgressBar;
