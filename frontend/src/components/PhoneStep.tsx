import { useState } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";

interface PhoneStepProps {
  phone_number: string;
  setPhoneNumber: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  onContinue: (e: React.FormEvent) => void;
  isLoading: boolean;
  isFormValid: boolean;
}

const PhoneStep = ({
  phone_number,
  setPhoneNumber,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  onContinue,
  isLoading,
}: PhoneStepProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isFormValid =
    phone_number && password && confirmPassword && password === confirmPassword;

  return (
    <form onSubmit={onContinue}>
      <div className="mb-4">
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Phone Number
        </label>
        <input
          id="phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={phone_number}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
          className="input-field w-full"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-field w-full pr-10"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="mb-6">
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="input-field w-full pr-10"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {password && confirmPassword && password !== confirmPassword && (
          <p className="text-red-500 text-xs mt-1">Passwords don't match</p>
        )}
      </div>

      <button
        type="submit"
        disabled={!isFormValid || isLoading}
        className={`w-full py-3 px-4 rounded-lg font-medium ${
          !isFormValid || isLoading
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-primary hover:bg-primary-dark text-white"
        }`}
      >
        {isLoading ? "Processing..." : "Create Account"}
      </button>

      <p className="mt-4 text-sm text-center text-gray-600">
        Already have an account?{" "}
        <Link to="/login" className="text-accent hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
};

export default PhoneStep;
