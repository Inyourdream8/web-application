import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

interface Loan {
  created_at: string;
  loan_amount: number;
}

interface OtpDetails {
  otp_code: string;
  created_at: string;
}

const loans: Loan[] = [{ created_at: "2023-01-01", loan_amount: 1000 }];

if (loans.length > 0) {
  console.log(loans[0].created_at);
}

const AdminOtpManager = () => {
  const [customerId, setCustomerId] = useState("");
  const [otpLength, setOtpLength] = useState(6);
  const [otpDetails, setOtpDetails] = useState<OtpDetails | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateOtp = async () => {
    if (!customerId.trim()) {
      toast.error("Customer ID is required");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "/admin/generate_otp",
        { customer_id: customerId, otp_length: otpLength },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setOtpDetails(response.data);
      toast.success("OTP generated successfully!");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to generate OTP");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(otpDetails?.otp_code || "");
    toast.success("OTP copied to clipboard!");
  };

  return (
    <div>
      <h2>OTP Management</h2>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <div>
          <label htmlFor="customerId">Customer ID</label>
          <input
            id="customerId"
            type="text"
            placeholder="Customer ID"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="form-input"
          />
        </div>
        <div>
          <label htmlFor="otpLength">OTP Length</label>
          <select
            id="otpLength"
            value={otpLength}
            onChange={(e) => setOtpLength(Number(e.target.value))}
            className="form-select"
          >
            <option value={6}>6-digit OTP</option>
            <option value={8}>8-digit OTP</option>
            <option value={10}>10-digit OTP</option>
          </select>
        </div>
        <button
          type="submit"
          onClick={handleGenerateOtp}
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate OTP"}
        </button>
      </form>

      {otpDetails && (
        <div>
          <p>
            <strong>OTP Code:</strong> {otpDetails.otp_code}
          </p>
          <p>
            <strong>Generated At:</strong>{" "}
            {new Date(otpDetails.created_at).toLocaleString()}
          </p>
          <button onClick={copyToClipboard}>Copy OTP</button>
        </div>
      )}
    </div>
  );
};

export default AdminOtpManager;
