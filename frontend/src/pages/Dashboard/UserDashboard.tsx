import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  auth,
  dashboard,
  LoanStatus,
  WithdrawalStatus,
} from "@/lib/api/client";
import { Loan } from "../Apply/types";

// Components
import Sidebar from "@/components/SideBar";
import MobileHeader from "@/components/MobileHeader";
import AccountBalanceCard from "@/components/AccountBalanceCard";
import LoanDetailsCard from "@/components/LoanDetailsCard";
import LoanProgressSteps from "@/components/LoanProgressSteps";
import WithdrawModal from "@/components/WithdrawModal";
import ContractModal from "@/components/ContractModal";
import useWebSocket from "@/hooks/useWebSocket";
import axios from "axios";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("/auth/dashboard");
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);

  interface UserProfile {
    user_id: string;
    application_number: string;
    full_name: string;
    phone_number: string;
  }

  const { data: userProfile } = useQuery<UserProfile>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/user/profile`
      );
      const profileData = response.data;
      return {
        user_id: profileData.user_id,
        full_name: profileData.full_name,
        application_number: profileData.application_number,
        phone_number: profileData.phone_number,
      } as UserProfile;
    },
  });

  // Fetch user's loan applications
  const { data: fetchedUserLoans, isLoading: loansLoading } = useQuery<Loan[]>({
    queryKey: ["userLoans", userProfile?.user_id],
    queryFn: async () => {
      const response = await axios.get<Loan[]>(
        `${import.meta.env.VITE_API_BASE_URL}/user-loans/${
          userProfile?.user_id
        }`
      );
      return response.data;
    },
  });

  // Define allowed statuses
  const allowedAccountStatuses = ["active"];
  const allowedStatuses = [LoanStatus.APPROVED];
  const allowedWithdrawalStatuses = [WithdrawalStatus.PENDING];

  // Define user loans with the correct type
  const userLoans: Loan[] = fetchedUserLoans || [];

  const activeLoan = userLoans.find(
    (loan) =>
      allowedAccountStatuses.includes(loan.account_status as string) &&
      allowedStatuses.includes(loan.loan_status as LoanStatus) &&
      allowedWithdrawalStatuses.includes(
        loan.withdrawal_status as WithdrawalStatus
      )
  );

  console.log(activeLoan);

  // Fetch dashboard data (balance, etc.)
  interface SummaryData {
    available_balance: number;
    total_borrowed: number;
    total_repaid: number;
    next_payment: number;
    next_payment_date: string;
    monthly_payment?: number;
  }

  const { data: dashboardData, isLoading: dashboardLoading } =
    useQuery<SummaryData>({
      queryKey: ["summaryData"],
      queryFn: async (): Promise<SummaryData> => {
        const response = await dashboard.getUserDashboard();
        if (
          !response ||
          typeof response !== "object" ||
          !("data" in response)
        ) {
          throw new Error("Invalid response from dashboard API");
        }
        return response.data as SummaryData;
      },
    });

  // Handle incoming WebSocket messages
  const handleSocketMessage = (message: MessageEvent) => {
    const parsedData = JSON.parse(message.data);
    console.log("WebSocket message:", parsedData);

    if (parsedData.type === "notification") {
      toast.success(parsedData.message);
    }

    // Handle loan status updates
    if (parsedData.type === "loan_update") {
      toast.success(
        `Your loan status has been updated to: ${parsedData.status}`
      );
    }
  };

  // Establish WebSocket connection
  useWebSocket("ws://localhost:5173", handleSocketMessage);

  const handleViewContract = () => {
    if (activeLoan) {
      setIsContractModalOpen(true);
    }
  };

  const confirmWithdrawFunds = async (_amount: number, _otp: string) => {
    try {
      // Call withdrawal API here
      // await withdrawals.create({ amount: _amount, otp: _otp });

      setIsWithdrawModalOpen(false);
      toast.success("Withdrawal request submitted successfully!");
    } catch (error) {
      toast.error("Withdrawal failed. Please try again.");
    }
  };

  const handleLogout = () => {
    auth.signOut();
    navigate("/");
    toast.success("Successfully logged out.");
  };

  function handleWithdrawFunds(): void {
    setIsWithdrawModalOpen(true);
  }

  function getCurrentLoanStep(): number {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
      />

      {/* Mobile Header */}
      <MobileHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileMenuOpen={isWithdrawModalOpen}
        setIsMobileMenuOpen={setIsWithdrawModalOpen}
        handleLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Welcome back, {userProfile?.full_name || "User"}!
          </h1>
          <p className="text-gray-600">
            {activeLoan
              ? `Your ${(
                  activeLoan.account_status || "active"
                ).toLowerCase()} loan details`
              : "Assessing Your Current Financial Situation"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Balance */}
          <AccountBalanceCard
            data={{
              available_balance: dashboardData?.available_balance || 0,
              application_number: activeLoan?.application_number,
              loan_status: activeLoan?.loan_status,
              description: "Your loan is active",
              approvedDate: activeLoan?.firstDueDate,
              approvedBy: "System",
              activated: true,
            }}
            isLoading={dashboardLoading}
            onWithdraw={handleWithdrawFunds}
          />

          {/* Loan Details */}
          <LoanDetailsCard
            data={
              activeLoan
                ? {
                    loan_amount: activeLoan.loan_amount || undefined,
                    loan_term: activeLoan.loan_term || undefined,
                    interest_rate: activeLoan.interest_rate || undefined,
                    monthly_payment:
                      dashboardData?.monthly_payment || undefined,
                    firstDueDate: activeLoan.firstDueDate || undefined,
                  }
                : {}
            }
            isLoading={loansLoading}
            onViewContract={handleViewContract}
          />
        </div>

        {/* Loan Progress Steps - only show if there's an active loan */}
        {activeLoan && (
          <div className="mt-6">
            <LoanProgressSteps currentStep={getCurrentLoanStep()} />
          </div>
        )}
      </main>

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onOpenChange={setIsWithdrawModalOpen}
        balance={dashboardData?.available_balance || 0}
        isLoading={dashboardLoading}
        onConfirm={async () => {
          try {
            await confirmWithdrawFunds(0, "");
            toast.success("Withdrawal successful!");
          } catch (error) {
            console.error("Withdrawal failed:", error);
            toast.error("Failed to withdraw funds. Please try again.");
          }
        }}
      />

      {/* Contract Modal */}
      <ContractModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        data={
          activeLoan
            ? {
                loanDetails: {
                  application_number: activeLoan.application_number as string,
                  loan_amount: activeLoan.loan_amount as number,
                  termMonths: activeLoan.loan_term as number,
                  interest_rate: activeLoan.interest_rate as 4,
                  monthly_payment: activeLoan.monthly_payment as number,
                  firstDueDate: activeLoan.firstDueDate as string,
                },
              }
            : undefined
        }
        isLoading={loansLoading}
      />
    </div>
  );
};

export default UserDashboard;
