import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const SuccessStep = () => {
  return (
    <div className="text-center py-6">
      <div className="bg-accent/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="size-10 text-accent" />
      </div>

      <h3 className="text-xl font-semibold text-primary mb-2">
        Registration Successful!
      </h3>

      <p className="text-gray-600 mb-6">
        Your account has been created. You can now apply for a loan.
      </p>

      <Link to="/apply" className="btn btn-primary">
        Apply for a Loan
      </Link>
    </div>
  );
};

export default SuccessStep;
