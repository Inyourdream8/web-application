import { useState } from "react";
import { UserRound, FileText, SendHorizonal, Activity } from "lucide-react";

const steps = [
  {
    id: 1,
    icon: <UserRound className="size-6" />,
    title: "Register Account",
    description: "Create your account using your phone number.",
    detail:
      "The registration process is quick and efficient, taking no more than a minute to complete. Simply fill out the required fields with your information, follow the prompts, and you'll be registered in no time.",
  },
  {
    id: 2,
    icon: <FileText className="size-6" />,
    title: "Complete Application",
    description:
      "Fill out your personal details, banking information, and upload required documents.",
    detail:
      "Our streamlined application captures all necessary information including personal details, employment status, bank information, and document uploads (ID, selfie, and signature) in a secure environment.",
  },
  {
    id: 3,
    icon: <SendHorizonal className="size-6" />,
    title: "Submit Loan Request",
    description:
      "Review your information and submit your loan application for processing.",
    detail:
      "Before final submission, you can review all provided information. Once submitted, your application enters our verification process and becomes read-only to maintain the integrity of the assessment.",
  },
  {
    id: 4,
    icon: <Activity className="size-6" />,
    title: "Track Status",
    description:
      "Monitor your application status and receive OTP for loan withdrawal when approved.",
    detail:
      "Our real-time tracking system lets you check the progress of your application at any time. Once approved, you'll receive withdrawal instructions and an OTP to securely access your funds.",
  },
];

const ApplicationSteps = () => {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="badge bg-accent/10 text-accent mb-4">
            Simple Process
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-primary">
            How It Works
          </h2>
          <p className="mt-4 text-gray-600">
            Our loan application process is designed to be simple, secure, and
            efficient, allowing you to get the funds you need without
            unnecessary complexity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="col-span-1 lg:col-span-2 space-y-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`rounded-xl p-5 cursor-pointer transition-all duration-300 border ${
                  activeStep === step.id
                    ? "bg-white shadow-soft border-accent/20"
                    : "bg-white/50 hover:bg-white border-transparent hover:border-gray-200"
                }`}
                onClick={() => setActiveStep(step.id)}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      activeStep === step.id
                        ? "bg-accent text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {step.icon}
                  </div>
                  <div>
                    <div className="flex items-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2 ${
                          activeStep === step.id
                            ? "bg-accent text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {step.id}
                      </div>
                      <h3
                        className={`font-semibold ${
                          activeStep === step.id
                            ? "text-accent"
                            : "text-primary"
                        }`}
                      >
                        {step.title}
                      </h3>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="col-span-1 lg:col-span-3">
            <div className="bg-white rounded-xl shadow-soft h-full p-8 border border-gray-200">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white">
                  {steps[activeStep - 1].icon}
                </div>
                <h3 className="text-2xl font-semibold text-primary">
                  Step {activeStep}: {steps[activeStep - 1].title}
                </h3>
              </div>

              <div className="mb-8">
                <div className="w-full bg-gray-200 h-2 rounded-full mb-2">
                  <div
                    className="bg-accent h-full rounded-full transition-all duration-500"
                    style={{ width: `${(activeStep / steps.length) * 100}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-500">
                  Step {activeStep} of {steps.length}
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-lg text-gray-700 leading-relaxed">
                  {steps[activeStep - 1].detail}
                </p>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-primary mb-2">
                    What you'll need for this step:
                  </h4>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    {activeStep === 1 && (
                      <>
                        <li>Your active phone number</li>
                        <li>Creating a Strong Password</li>
                      </>
                    )}
                    {activeStep === 2 && (
                      <>
                        <li>Valid government-issued ID</li>
                        <li>Bank account information</li>
                        <li>Current selfie photo</li>
                        <li>Digital or scanned signature</li>
                      </>
                    )}
                    {activeStep === 3 && (
                      <>
                        <li>Review all entered information</li>
                        <li>Confirm terms and conditions</li>
                      </>
                    )}
                    {activeStep === 4 && (
                      <>
                        <li>Your account login credentials</li>
                        <li>Application reference number</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ApplicationSteps;
