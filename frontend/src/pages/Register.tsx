// src/pages/Register.tsx
import { useState } from "react";
import axios, { AxiosError } from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProgressBar from "@/components/ProgressBar";
import PhoneStep from "@/components/PhoneStep";
import SuccessStep from "@/components/SuccessStep";

interface RegisterFormData {
  phone_number: string;
  password: string;
  confirmPassword: string;
}

interface ApiResponse {
  message?: string;
  data?: any;
}

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<RegisterFormData>({
    phone_number: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { phone_number, password, confirmPassword } = formData;

  const isFormValid =
    phone_number.length >= 10 &&
    password.length >= 4 &&
    password === confirmPassword;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^\d{10,15}$/.test(phone_number)) {
      toast.error("Please enter a valid phone number (10-15 digits)");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post<ApiResponse>(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/user/register`,
        {
          phone_number,
          password,
        }
      );

      if (response.status === 201) {
        toast.success("Registration completed successfully!", {
          position: "top-center",
        });
        setStep(3);
        // Optional: Auto-redirect after delay
        setTimeout(() => navigate("/login"), 5000);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      if (axiosError.response) {
        toast.error(axiosError.response.data?.message || "Registration failed");
      } else if (axiosError.request) {
        toast.error("No response from server. Please try again.");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <Link
                to="/"
                className="inline-flex items-center text-primary hover:text-accent"
              >
                Back to Home
              </Link>

              <h1 className="text-2xl font-bold mt-6 text-primary">
                {step === 1 && "Create Your Account"}
                {step === 3 && "Registration Complete"}
              </h1>

              <p className="text-gray-600 mt-2">
                {step === 1 && "Enter your information to get started"}
                {step === 3 && "Your account has been created successfully"}
              </p>
            </div>

            <ProgressBar currentStep={step} totalSteps={3} />

            <div className="bg-white shadow-soft p-8 border border-gray-200 rounded-xl">
              {step === 1 && (
                <PhoneStep
                  phone_number={phone_number}
                  setPhoneNumber={(value) =>
                    setFormData((prev) => ({ ...prev, phone_number: value }))
                  }
                  password={password}
                  setPassword={(value) =>
                    setFormData((prev) => ({ ...prev, password: value }))
                  }
                  confirmPassword={confirmPassword}
                  setConfirmPassword={(value) =>
                    setFormData((prev) => ({ ...prev, confirmPassword: value }))
                  }
                  onContinue={handleContinue}
                  isLoading={isLoading}
                  isFormValid={isFormValid}
                />
              )}

              {step === 3 && <SuccessStep />}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Register;
