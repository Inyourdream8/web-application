import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  User,
  Building,
  CreditCard,
  Upload,
  Check,
} from "lucide-react";
import PersonalInfo from "./sections/PersonalInfo";
import EmploymentDetails from "./sections/EmploymentDetails";
import BankDetails from "./sections/BankDetails";
import Documents from "./sections/Documents";
import Review from "./sections/Review";
import { FormSection, LoanFormData } from "./types";

interface ApplicationFormProps {
  formData: LoanFormData; // Changed from Record<FormSection, LoanFormData>
  currentSection: FormSection; // The active form section
  isLoading: boolean;
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  handleFileChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) => void; // Updated to match implementation
  handlePrevious: () => void;
  handleNext: () => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({
  formData,
  currentSection,
  isLoading,
  handleInputChange,
  handleFileChange,
  handlePrevious,
  handleNext,
  handleSubmit,
}) => {
  const getSectionTitle = () => {
    switch (currentSection) {
      case "personalInfo":
        return "Personal Information";
      case "employmentDetails":
        return "Employment Details";
      case "bankDetails":
        return "Banking Information";
      case "documents":
        return "Required Documents";
      case "review":
        return "Review & Submit";
      default:
        return "Application Form";
    }
  };

  const getSectionIcon = () => {
    switch (currentSection) {
      case "personalInfo":
        return <User className="size-5" />;
      case "employmentDetails":
        return <Building className="size-5" />;
      case "bankDetails":
        return <CreditCard className="size-5" />;
      case "documents":
        return <Upload className="size-5" />;
      case "review":
        return <Check className="size-5" />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent mr-3">
          {getSectionIcon()}
        </div>
        <h2 className="text-xl font-semibold text-primary">
          {getSectionTitle()}
        </h2>
      </div>

      <form
        onSubmit={
          currentSection === "review" ? handleSubmit : (e) => e.preventDefault()
        }
      >
        {currentSection === "personalInfo" && (
          <PersonalInfo
            formData={formData}
            handleInputChange={handleInputChange}
          />
        )}

        {currentSection === "employmentDetails" && (
          <EmploymentDetails
            formData={formData}
            handleInputChange={handleInputChange}
          />
        )}

        {currentSection === "bankDetails" && (
          <BankDetails
            formData={formData}
            handleInputChange={handleInputChange}
          />
        )}

        {currentSection === "documents" && (
          <Documents
            formData={formData}
            handleInputChange={handleInputChange}
            handleFileChange={handleFileChange}
          />
        )}

        {currentSection === "review" && (
          <Review formData={formData} handleInputChange={handleInputChange} />
        )}

        <div className="mt-8 flex justify-between">
          {currentSection !== "personalInfo" && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handlePrevious}
            >
              <ArrowLeft className="size-4 mr-2" />
              Previous
            </button>
          )}

          {currentSection !== "review" && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNext}
            >
              Next
              <ArrowRight className="size-4 ml-2" />
            </button>
          )}

          {currentSection === "review" && (
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </button>
          )}
        </div>
      </form>
    </>
  );
};

export default ApplicationForm;
