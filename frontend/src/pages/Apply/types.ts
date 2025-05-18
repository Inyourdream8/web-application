export type FormSection =
  | "personalInfo"
  | "employmentDetails"
  | "bankDetails"
  | "documents"
  | "review";

export interface Admin {
  id: string;
  email: string;
  UserRole: "admin";
  permissions: ("manage_loanapplication" | "approve_loans" | "view_reports")[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User {
  id: string;
  role: "user" | "admin";
  email?: string;
  phone_number?: string;
  full_name: string;
  loan_amount: string;
  loan_term: string;
  UserRole: "user";
  registeredAt?: Date;
  isActive?: boolean;
}

export interface LoanFormData {
  full_name: string;
  phone_number: string;
  nationalId: string;
  email: string;
  address: string;
  employment_status: string;
  employer: string;
  monthly_income: string;
  employmentDuration: string;
  bank_name: string;
  accout_name: string;
  accout_number: string;
  loan_amount: string;
  loanPurpose: string;
  loan_term: string;
  idDocument: File | null;
  selfiePhoto: File | null;
  signature: File | null;
}

export interface ApplicationFormProps {
  formData: LoanFormData;
  currentSection: FormSection;
  isLoading: boolean;
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  handleFileChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) => void;
  handlePrevious: () => void;
  handleNext: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export interface FormSectionProps {
  formData: LoanFormData;
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  handleFileChange?: (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) => void;
}

// ============== Status ============== //
export type AccountStatus = "active" | "inactive" | "banned" | "suspended";

export type LoanStatus =
  | "pending"
  | "under review"
  | "approved"
  | "rejected"
  | "completed"
  | "6-digit OTP Required"
  | "8-digit OTP Required"
  | "10-digit OTP Required"
  | "invalid bank details"
  | "loan cancellation"
  | "invalid withdrawal amount"
  | "overdue"
  | "closed"
  | "penalties"
  | "insufficient credit score"
  | "defaulted"
  | "tax payment required"
  | "cancelled"
  | "account frozen"
  | "paid";

export type WithdrawalStatus =
  | "pending"
  | "processing"
  | "completed"
  | "successsful"
  | "onh-old"
  | "exception"
  | "rejected"
  | "failed"
  | "paid"
  | "issued";

export interface Loan {
  id?: string;
  application_number?: string;
  loan_amount?: number;
  amount?: number;
  interest_rate?: number;
  loan_term?: number;
  term?: number;
  termMonths?: number | number[];
  status?: LoanStatus;
  loan_status?: LoanStatus;
  account_status?: string;
  firstDueDate?: string;
  withdrawal_status?: WithdrawalStatus;
  paymentsMade?: number;
  startDate: Date;
  monthly_payment?: number;
}

export type PaymentStatus = "paid" | "overdue" | "pending" | "upcomming";

export interface PaymentScheduleItem {
  number: number;
  dueDate: string | Date;
  paymentAmount: number;
  principal: number;
  interest: number;
  remaining_balance: number;
  status: PaymentStatus;
}

export interface LoanSummary {
  totalPaid: number;
  totalRemaining: number;
  progressPercentage: number;
  nextPaymentDate?: Date;
  totalInterestPaid: number;
  totalPrincipalPaid: number;
}

export interface LoanRepaymentScheduleProps {
  loan: Loan;
  onMakePayment?: () => void;
  className?: string;
}
