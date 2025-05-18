import axios, {
  AxiosInstance,
  AxiosProgressEvent,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { toast } from "sonner";

/**
 * API client for the loan application system
 */

// Environment configuration
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Types
export enum AccountStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BANNED = "BANNED",
  SUSPENDED = "SUSPENDED",
  UNKNOWN = "UNKNOWN",
}

export enum LoanStatus {
  PENDING = "pending",
  UNDER_REVIEW = "under review",
  APPROVED = "approved",
  REJECTED = "rejected",
  COMPLETED = "completed",
  OTP_6_DIGIT_REQUIRED = "6-digit OTP Required",
  OTP_8_DIGIT_REQUIRED = "8-digit OTP Required",
  AMLC_INVESTIGATION = "AMLC Investigation",
  INVALID_BANK_DETAILS = "invalid bank details",
  LOAN_CANCELLATION = "loan cancellation",
  INVALID_WITHDRAWAL_AMOUNT = "invalid withdrawal amount",
  OVERDUE = "overdue",
  ON_HOLD = "on-hold",
  CLOSED = "closed",
  PENALTIES = "penalties",
  INSUFFICIENT_CREDIT_SCORE = "insufficient credit score",
  RESTRUCTURED = "restructured",
  DEFAULTED = "defaulted",
  TAX_PAYMENT_REQUIRED = "tax payment required",
  CANCELLED = "cancelled",
  ACCOUNT_FROZEN = "account frozen",
  PAID = "paid",
  loan_status = "loan_status",
}

export enum WithdrawalStatus {
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

export type AdminCredentials = {
  username: string;
  email: string;
  password: string;
};

export type CustomerData = {
  user_id: string;
  application_id?: string;
  application_number?: string;
  full_name: string;
  phone_number: string;
  password: string;
  national_id: string;
  address?: string;
  loan_amount: number;
  interest_rate: number;
  termMonths: number[];
  purpose?: string;
  employment_status?: string;
  employer?: string;
  employment_duration?: string;
  monthly_income?: string;
  bank_name?: string;
  account_name?: string;
  account_number?: string;
  idDocuments: string;
  application_date?: Date;
  created_at: Date;
  status: AccountStatus | LoanStatus | WithdrawalStatus;
};

export interface LoanApplicationData
  extends Partial<{
    application_id: string;
    application_number: string;
    address: string;
    interest_rate: number;
    purpose: string;
    employment_status: string;
    employer: string;
    employment_duration: string;
    monthly_income: string;
    bank_name: string;
    account_name: string;
    account_number: string;
  }> {
  user_id: string;
  national_id: string;
  loan_amount: number;
  termMonths: number;
  idDocuments: string;
  status: AccountStatus | LoanStatus | WithdrawalStatus;
  extraFields?: Record<string, unknown>;
}

export interface UserProfileData {
  user_id?: string;
  username?: string;
  email?: string;
  phone?: string;
  role?: string;
  [key: string]: any;
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
}

export type OtpData = {
  id: string;
  phone_number: string;
  code: string;
  type: string;
  status: string;
  created_at: string;
  expires_at: string;
};

export type Document = {
  id: string;
  application_id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
};

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
  withCredentials: true,
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh and error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle token expiration (401)
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          // Attempt token refresh
          const response = await axios.post<TokenResponse>(
            `${VITE_API_BASE_URL}/auth/refresh`,
            {},
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
              },
            }
          );

          if (response.status === 200) {
            // Store new tokens
            const { access_token, refresh_token } = response.data;
            localStorage.setItem("accessToken", access_token);
            if (refresh_token) {
              localStorage.setItem("refreshToken", refresh_token);
            }

            // Update authorization header
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
            }

            // Retry the original request
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // Clear tokens on refresh failure
          clearAuthTokens();
          toast.error("Session expired. Please log in again.");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      } else {
        clearAuthTokens();
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login";
      }
    }

    // Handle other errors
    if (error.response) {
      const errorData = error.response.data as {
        message?: string;
        error?: string;
      };
      const errorMessage =
        errorData?.message ||
        errorData?.error ||
        error.message ||
        "An error occurred";

      // Don't show toast for 401 errors (already handled above)
      if (error.response.status !== 401) {
        toast.error(errorMessage);
      }
    } else {
      toast.error("Network error. Please check your connection.");
    }

    return Promise.reject(error);
  }
);

/**
 * Generic API request wrapper with type safety
 */
const apiRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
  // eslint-disable-next-line no-useless-catch
  try {
    const response: AxiosResponse<T> = await apiClient(config);
    return response.data;
  } catch (error) {
    // Error is already handled by interceptor
    throw error;
  }
};

/**
 * Helper functions for common HTTP methods with type safety
 */
const http = {
  get: <T>(
    url: string,
    params?: object,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return apiRequest<T>({ method: "GET", url, params, ...config });
  },

  post: <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return apiRequest<T>({ method: "POST", url, data, ...config });
  },

  put: <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return apiRequest<T>({ method: "PUT", url, data, ...config });
  },

  patch: <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return apiRequest<T>({ method: "PATCH", url, data, ...config });
  },

  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return apiRequest<T>({ method: "DELETE", url, ...config });
  },

  postForm: <T>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return apiRequest<T>({
      method: "POST",
      url,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      ...config,
    });
  },
};

/**
 * Clear authentication tokens securely from storage
 */
const clearAuthTokens = (): void => {
  try {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("token");
    console.log("Auth tokens cleared successfully.");
  } catch (error) {
    console.error("Failed to clear auth tokens:", error);
  }
};

/**
 * Check if backend environment is configured
 */
export const isBackendConfigured = (): boolean => {
  return (
    Boolean(VITE_API_BASE_URL) || import.meta.env.VITE_MODE === "development"
  );
};

/**
 * Authentication API endpoints
 */
export const auth = {
  register: async (
    phone_number: string,
    password: string
  ): Promise<TokenResponse> => {
    const response = await http.post<{ data: TokenResponse }>(
      "/auth/register",
      {
        phone_number,
        password,
      }
    );
    storeTokens(response.data);
    return response.data;
  },

  login: async (
    phone_number: string,
    password: string
  ): Promise<TokenResponse> => {
    const response = await http.post<{ data: TokenResponse }>("/auth/login", {
      phone_number,
      password,
    });

    storeTokens(response.data);
    return response.data;
  },

  registerAdmin: async (
    username: string,
    email: string,
    password: string
  ): Promise<TokenResponse> => {
    const response = await http.post<{ data: TokenResponse }>(
      "/auth/admin/register",
      {
        username,
        email,
        password,
      }
    );
    storeTokens(response.data);
    return response.data;
  },

  adminLogin: async (
    email: string,
    password: string
  ): Promise<TokenResponse> => {
    const response = await http.post<{ data: TokenResponse }>(
      "/auth/admin/login",
      {
        email,
        password,
      }
    );
    storeTokens(response.data);
    return response.data;
  },

  getCurrentUser: async (): Promise<UserProfileData> => {
    try {
      const response = await http.get<UserProfileData>("/auth/me");
      return response.data;
    } catch (error) {
      console.error("Error fetching current user:", error);
      throw new Error("Failed to fetch current user.");
    }
  },

  getAllUsers: async (page = 1, limit = 10): Promise<UserProfileData[]> => {
    try {
      const response = await http.get<{ data: UserProfileData[] }>(
        `/auth/users?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Failed to fetch users.");
    }
  },

  refreshToken: async (): Promise<TokenResponse | null> => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      console.warn("No refresh token available");
      return null;
    }

    try {
      const response = await http.post<{ data: TokenResponse }>(
        "/auth/refresh",
        {},
        { headers: { Authorization: `Bearer ${refreshToken}` } }
      );
      storeTokens(response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      return null;
    }
  },

  signOut: (): { success: boolean } => {
    clearAuthTokens();
    return { success: true };
  },
};

/**
 * User profile retrieval function
 */
export const getUserProfile = async (
  user_id: string
): Promise<UserProfileData | null> => {
  if (!user_id) {
    console.error("Invalid user ID");
    return null;
  }

  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/users/${user_id}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    return null;
  }
};

/**
 * Store authentication tokens securely
 */
function storeTokens(response: TokenResponse): void {
  if (!response || !response.access_token) {
    console.error("Invalid token response:", response);
    return;
  }

  try {
    localStorage.setItem("accessToken", response.access_token);

    if (response.refresh_token) {
      localStorage.setItem("refreshToken", response.refresh_token);
    }

    // Legacy support
    localStorage.setItem("token", response.access_token);

    console.log("Auth tokens stored successfully.");
  } catch (error) {
    console.error("Failed to store auth tokens:", error);
  }
}

/**
 * Loan application management
 */
export const loanApplications = {
  getAll: async (): Promise<LoanApplicationData[]> => {
    try {
      return await http.get<LoanApplicationData[]>("/loans");
    } catch (error) {
      console.error("Error fetching loans:", error);
      throw new Error("Failed to fetch loans");
    }
  },

  getById: async (id: string): Promise<LoanApplicationData> => {
    try {
      return await http.get<LoanApplicationData>(`/loans/${id}`);
    } catch (error) {
      console.error(`Error fetching loan with id ${id}:`, error);
      throw new Error("Failed to fetch loan details");
    }
  },

  create: async (data: LoanApplicationData): Promise<LoanApplicationData> => {
    try {
      return await http.post<LoanApplicationData>("/loans", data);
    } catch (error) {
      console.error("Error creating loan:", error);
      throw new Error("Failed to create loan");
    }
  },

  update: async (
    id: string,
    data: Partial<LoanApplicationData>
  ): Promise<LoanApplicationData> => {
    try {
      return await http.put<LoanApplicationData>(`/loans/${id}`, data);
    } catch (error) {
      console.error(`Error updating loan with id ${id}:`, error);
      throw new Error("Failed to update loan");
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      return await http.delete(`/loans/${id}`);
    } catch (error) {
      console.error(`Error deleting loan with id ${id}:`, error);
      throw new Error("Failed to delete loan");
    }
  },

  getStatusOptions: (): LoanStatus[] => {
    return Object.values(LoanStatus) as LoanStatus[];
  },
};

/**
 * Document management
 */
export const documents = {
  upload: async (
    loanApplicationId: string,
    documentType: string,
    file: File,
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
  ) => {
    const formData = new FormData();
    formData.append("key", "value");
    formData.append("document", file);
    formData.append("loanApplicationId", loanApplicationId);
    formData.append("documentType", documentType);

    try {
      return await http.postForm<Document>("/documents", formData, {
        onUploadProgress,
      });
    } catch (error) {
      console.error("Document upload failed:", error);
      throw error;
    }
  },

  getByLoanApplicationId: async (loanApplicationId: string) => {
    return http.get<Document[]>(`/documents/loan/${loanApplicationId}`);
  },

  getById: async (id: string) => {
    return http.get<Document>(`/documents/${id}`);
  },

  delete: async (id: string) => {
    return http.delete(`/documents/${id}`);
  },
};

/**
 * Dashboard data retrieval
 */
export const dashboard = {
  getUserDashboard: async () => {
    return http.get("/dashboard");
  },

  getAdminDashboard: async () => {
    return http.get("/admin_dashboard");
  },
};

/**
 * OTP management
 */
export const otpManagement = {
  getAllOtps: async (): Promise<OtpData[]> => {
    return http.get<OtpData[]>("/admin/otp");
  },

  generateOtp: async (userId: string, type: string) => {
    return http.post<OtpData>("/admin/otp/generate", { userId, type });
  },

  verifyOtp: async (otpId: string, code: string) => {
    return http.post<{ verified: boolean }>("/admin/otp/verify", {
      otpId,
      code,
    });
  },

  cancelOtp: async (otpId: string) => {
    return http.delete(`/admin/otp/${otpId}`);
  },
};

/**
 * Check user role from JWT token
 */
export const checkUserRole = (): string | null => {
  const token =
    localStorage.getItem("accessToken") || localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // Check token expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      clearAuthTokens();
      return null;
    }
    return payload.role;
  } catch (e) {
    console.error("Error decoding token:", e);
    clearAuthTokens();
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token =
    localStorage.getItem("accessToken") || localStorage.getItem("token");
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // Check token expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      clearAuthTokens();
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Format date string
 */
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (e) {
    return "Invalid Date";
  }
};

/**
 * Format currency
 */
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return "N/A";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
};

export default apiClient;
