import React, { useState } from "react";
import axios from "axios";

export const LoanModification = ({
  application_number,
}: {
  application_number: string;
}) => {
  const [LoanModification, seLoanModification] =
    useState<LoanModificationState>({
      application_number: application_number,
      full_name: "",
      nationalId: "",
      phone_number: "",
      address: "",
      email: "",
      employment_status: "",
      employer: "",
      monthly_income: "",
      duration: "",
      bank_name: "",
      account_name: "",
      account_number: "",
      loan_amount: "",
      loan_term: "",
      documents: [] as unknown[],
      status: "pending",
    });

  interface LoanModificationState {
    application_number: string;
    full_name: string;
    nationalId: string;
    phone_number: string;
    address: string;
    email: string;
    employment_status: string;
    employer: string;
    monthly_income: string;
    duration: string;
    bank_name: string;
    account_name: string;
    account_number: string;
    loan_amount: string;
    loan_term: string;
    documents: unknown[];
    status: string;
  }

  type HandleChangeEvent = React.ChangeEvent<HTMLInputElement>;

  const handleChange = (e: HandleChangeEvent) => {
    const { name, value } = e.target;
    seLoanModification((prev: LoanModificationState) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`/api/loans/${application_number}`, LoanModification, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Customer information updated successfully!");
    } catch (error) {
      console.error("Failed to update customer information", error);
      alert("Error updating customer information");
    }
  };

  return (
    <div>
      <h3>Loan Application Details</h3>
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          name="full_name"
          value={LoanModification.full_name}
          onChange={handleChange}
          placeholder="Full Name"
        />
        <input
          type="text"
          name="nationalId"
          value={LoanModification.nationalId}
          onChange={handleChange}
          placeholder="National ID"
        />
        <input
          type="text"
          name="phone_number"
          value={LoanModification.phone_number}
          onChange={handleChange}
          placeholder="Phone Number"
        />
        <input
          type="text"
          name="address"
          value={LoanModification.address}
          onChange={handleChange}
          placeholder="Address"
        />
        <input
          type="email"
          name="email"
          value={LoanModification.email}
          onChange={handleChange}
          placeholder="Email"
        />

        <input
          type="text"
          name="employment_status"
          value={LoanModification.employment_status}
          onChange={handleChange}
          placeholder="Employment Status"
        />

        <input
          type="text"
          name="employer"
          value={LoanModification.employer}
          onChange={handleChange}
          placeholder="Employed"
        />

        <input
          type="text"
          name="monthly_income"
          value={LoanModification.monthly_income}
          onChange={handleChange}
          placeholder="Monthly Income"
        />

        <input
          type="text"
          name="duration"
          value={LoanModification.duration}
          onChange={handleChange}
          placeholder="Duration"
        />

        <input
          type="text"
          name="loan_amount"
          value={LoanModification.loan_amount}
          onChange={handleChange}
          placeholder="Loan Amount"
        />

        <input
          type="text"
          name="loan_term"
          value={LoanModification.loan_term}
          onChange={handleChange}
          placeholder="Loan Term"
        />

        <input
          type="text"
          name="bank_name"
          value={LoanModification.bank_name}
          onChange={handleChange}
          placeholder="Bank Name"
        />

        <input
          type="text"
          name="account_name"
          value={LoanModification.account_name}
          onChange={handleChange}
          placeholder="Account Name"
        />

        <button type="submit" onClick={handleUpdate}>
          Update
        </button>
      </form>
    </div>
  );
};

export default LoanModification;
