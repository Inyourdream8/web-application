import { useCallback } from "react";
import {
  auth,
  loanApplications,
  documents,
  dashboard,
  otpManagement,
  isAuthenticated,
  LoanApplicationData,
} from "@/lib/api/client";

/**
 * Custom hook for memoized API callbacks
 */
export const useCallbacks = () => {
  // Auth-related callbacks
  const register = useCallback(
    (phone_number: string, password: string) =>
      auth.register(phone_number, password),
    []
  );

  const login = useCallback(
    (phone_number: string, password: string) =>
      auth.login(phone_number, password),
    []
  );

  const signOut = useCallback(() => auth.signOut(), []);

  // User profile callbacks
  const getCurrentUser = useCallback(async () => {
    try {
      const response = await auth.getCurrentUser();
      return response;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  }, []);

  // Loan application callbacks
  const getAllLoans = useCallback(() => loanApplications.getAll(), []);

  const createLoan = useCallback((data: LoanApplicationData) => {
    const completeData: LoanApplicationData = {
      ...data,
      user_id: data.user_id ?? "",
      national_id: data.national_id ?? "",
      loan_amount: data.loan_amount ?? 0,
      termMonths: data.termMonths ?? 12,
    };

    return loanApplications.create(completeData);
  }, []);

  // Document callbacks
  const uploadDocument = useCallback(
    (loanApplicationId: string, documentType: string, file: File) =>
      documents.upload(loanApplicationId, documentType, file),
    []
  );

  // Dashboard callbacks
  const getUserDashboard = useCallback(() => dashboard.getUserDashboard(), []);

  const getAdminDashboard = useCallback(
    () => dashboard.getAdminDashboard(),
    []
  );

  // OTP management callbacks
  const generateOtp = useCallback(async (user_id: string, type: string) => {
    try {
      const response = await otpManagement.generateOtp(user_id, type);
      return response;
    } catch (error) {
      console.error("Error generating OTP:", error);
      return null;
    }
  }, []);

  // Utility callbacks
  const checkRole = useCallback(() => {
    console.log("Role check not implemented");
    return Promise.resolve("user");
  }, []);

  const checkAuth = useCallback(() => isAuthenticated(), []);

  return {
    // Auth
    register,
    login,
    signOut,

    // User
    getCurrentUser,

    // Loans
    getAllLoans,
    createLoan,

    // Documents
    uploadDocument,

    // Dashboard
    getUserDashboard,
    getAdminDashboard,

    // OTP
    generateOtp,

    // Utilities
    checkRole,
    checkAuth,
  };
};

// Type for the useCallbacks return value
export type UseCallbacksReturn = ReturnType<typeof useCallbacks>;
