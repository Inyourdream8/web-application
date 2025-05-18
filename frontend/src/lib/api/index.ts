enum LoanStatus {
  // Lifecycle statuses
  PENDING = "pending",
  UNDER_REVIEW = "under review",
  APPROVED = "approved",
  REJECTED = "rejected",
  CANCELLED = "cancelled",

  // Validation issues
  INVALID_BANK_DETAILS = "invalid bank details",
  INSUFFICIENT_CREDIT_SCORE = "insufficient credit score",
  INVALID_WITHDRAWAL_AMOUNT = "invalid withdrawal amount",

  // Financial issues
  OVERDUE = "overdue",
  TAX_PAYMENT_REQUIRED = "tax payment required",
  PENALTIES = "penalties",

  // Miscellaneous statuses

  CLOSED = "closed",
  DEFAULTED = "defaulted",
  RESTRUCTURED = "restructured",
  PAID = "paid",
  BANNED = "banned",
  ACCOUNT_FROZEN = "account frozen",
  AMLC_INVESTIGATION = "AMLC Investigation",
  LOAN_CANCELLATION = "loan cancellation",
  OTP_6_DIGIT_REQUIRED = "6-digit OTP Required",
  OTP_8_DIGIT_REQUIRED = "8-digit OTP Required",
}

enum AccountStatus {
  ACTIVE = "acvtive",
  INACTIVE = "inactive",
  ON_HOLD = "on-hold",
  BANNED = "banned",
}

interface AccountData {
  application_number: string;
  balance: number;
  date: string;
  loan_status: LoanStatus;
  description: string;
  approvedDate: string;
  approvedBy: string;
  account_status: AccountStatus;
}

interface LoanDetails {
  application_number: string;
  loan_amount: number;
  loan_term: number;
  interest_rate: 4;
  monthly_payment: number;
  firstDueDate: string;
}

interface UserDashboardDetails {
  accountData: AccountData;
  loanDetails: LoanDetails;
}

interface LoanContract {
  application_number: string;
  monthly_payment: number;
  firstDueDate: string;
  contractId: string;
  borrowerName: string;
  loan_amount: number;
  loan_term: number;
  interest_rate: number;
  totalPayable: number;
  termsAndConditions: string[];
  startDate: string;
}

interface User {
  id: string;
  full_name: string;
  phone_number: string;
  password: string;
  role: "user";
}

interface Admin {
  id: string;
  email: string;
  password: string;
  role: "admin";
}

interface AuthCheckResponse {
  user: User | Admin | null;
}

type AuthUser = User | Admin | null;

interface AuthState {
  user: AuthUser;
  setUser: (user: User | Admin) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));

// Mock API functions (in a real app, these would make HTTP requests)
export const fetchAccountData = async (): Promise<AccountData> => {
  // Simulating API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    balance: 100000,
    application_number: "123-456-7890",
    date: "April 2025",
    loan_status: LoanStatus.APPROVED,
    description: "Congratulations! Your loan has been approved.",
    approvedDate: "March 25, 2025",
    approvedBy: "Financial Department",
    account_status: AccountStatus.ACTIVE,
  };
};

export const fetchLoanDetails = async (): Promise<LoanDetails> => {
  // Simulating API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    application_number: "******",
    loan_amount: 100000,
    loan_term: 48,
    interest_rate: 4,
    monthly_payment: 2166.67,
    firstDueDate: "April 25, 2025",
  };
};

export const fetchLoanContract = async (): Promise<LoanContract> => {
  // Simulating API delay to match your other functions
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    application_number: "123-456-7890",
    monthly_payment: 2166.67,
    firstDueDate: "April 25, 2025",
    contractId: "LN-2025-03789",
    borrowerName: "User Name",
    loan_amount: 100000,
    loan_term: 48,
    interest_rate: 4,
    totalPayable: 103996.16,
    termsAndConditions: [
      "Loan repayment will commence on April 25, 2025.",
      "A late payment fee of 5% will be charged for payments made after the due date.",
      "Early repayment is allowed with no additional charges.",
      "The borrower agrees to maintain an active bank account for automatic deductions.",
      "The lender reserves the right to modify terms with 30 days notice.",
    ],
    startDate: "April 25, 2025",
  };
};

function create<T>(initializer: (set: (partial: Partial<T>) => void) => T): T {
  let state: T;
  const set = (partial: Partial<T>) => {
    state = { ...state, ...partial };
  };
  state = initializer(set);
  return state;
}

export const checkAuthStatus = async (): Promise<AuthCheckResponse> => {
  const response = await fetch("/api/auth/check", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Not authenticated");
  }

  const data = await response.json();

  // Validate response matches our user types
  if (data.user && !["user", "admin"].includes(data.user.role)) {
    throw new Error("Invalid user role");
  }

  return data;
};
