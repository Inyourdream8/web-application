import axios from "axios";

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

enum WithdrawalStatus {
  PROCESSING = "processing",
  COMPLETED = "completed",
  SUCCESSFUL = "successful",
  ON_HOLD = "on-hold",
  EXCEPTION = "exception",
  REJECTED = "rejected",
  FAILED = "failed",
  PAID = "paid",
  ISSUED = "issued",
  PENDING = "pending",
  INVALID_BANK_DETAILS = "invalid bank details",
  ACCOUNT_FROZEN = "account frozen",
  OVERDUE = "overdue",
  TAX_PAYMENT_REQUIRED = "tax payment required",
  FROZEN = "frozen",
  CANCELLED = "cancelled",
}

export interface AccountData {
  applicationNumber: string;
  balance: number;
  date: Date;
  loan_status: LoanStatus;
  description: string;
  approvedDate: Date;
  approvedBy: string;
  account_status: AccountStatus;
}

export interface LoanDetails {
  application_number: string;
  loan_amount: number;
  termMonths: number;
  interest_rate: number;
  monthly_payment: number;
  firstDueDate: Date;
}

export interface UserDashboardDetails {
  balance: number;
  loanDetails: LoanDetails;
  accountData?: AccountData;
}

export interface LoanApplicationData {
  account_status: AccountStatus;
  loan_status: LoanStatus;
  withdrawal_status: WithdrawalStatus;
  user_id: string;
  application_id?: string;
  application_number?: string;
  national_id: string;
  address?: string;
  loan_amount: number;
  interest_rate?: number;
  termMonths: number;
  purpose?: string;
  employment_status?: string;
  employer?: string;
  employment_duration?: string;
  monthly_income?: string;
  bank_name?: string;
  account_name?: string;
  account_number?: string;
  idDocuments: string;
  status: AccountStatus | LoanStatus | WithdrawalStatus;
  firstDueDate: Date;
}

export interface LoanContract {
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

// Function to fetch account data
export const getUserDashboardDetails =
  async (): Promise<UserDashboardDetails> => {
    const response = await axios.get<UserDashboardDetails>("/api/account");
    return response.data;
  };
