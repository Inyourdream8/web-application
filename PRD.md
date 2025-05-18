# LendWise Web Application - Functional Requirements

This document outlines the functional requirements for the **LendWise Web Application**, organized into key modules.

---

## 📘 User Management

| Requirement ID | Description        | User Story                                                | Expected Behavior/Outcome                                                                                                                                     |
| -------------- | ------------------ | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OL001          | User Registration  | As a customer, I want to create an account.               | The system should support customer registration using email and phone number.                                                                                 |
| OL002          | Account Management | As an admin, I want to manage customer accounts.          | The system should allow admins to create, edit, remove customer accounts and approve/reject applications.                                                     |
| OL003          | Account Lookup     | As an admin, I want to retrieve customer account details. | The system should allow lookups by phone number, application number, or customer name. Customers can view (read-only) submitted info and request corrections. |

---

## 💸 Loan Application & Management

| Requirement ID | Description           | User Story                                                          | Expected Behavior/Outcome                                                   |
| -------------- | --------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| OL004          | Loan Application      | As a customer, I want to apply for a loan by submitting my details. | The system should provide a secure loan application form.                   |
| OL005          | Loan Repayment Table  | As a borrower, I want to view and manage my repayment schedule.     | The system should calculate and display repayment schedules. Details below: |
|                |                       |                                                                     | - **Interest Rate**: Fixed at 4% annual                                     |
|                |                       |                                                                     | - **Loan Term**: 6, 12, 24, 36, 48 months                                   |
|                |                       |                                                                     | - **Amount**: PHP 100,000 to PHP 3,000,000                                  |
|                |                       |                                                                     | - **Calculation**: Simple Interest = Principal × Rate × Time                |
|                |                       |                                                                     | - **Example**: PHP 100,000 @ 4% for 4 years = PHP 16,000 interest           |
| OL006          | Loan Approval Process | As an admin, I want to review loan applications.                    | Admins can review, approve/reject, and leave notes on each application.     |
| OL007          | Loan Status Tracking  | As a borrower, I want to see my loan status.                        | Status options: `Pending`, `Approved`, `Rejected`, or `Needs Correction`.   |

---

## 💰 Financial Transactions

| Requirement ID | Description         | User Story                                                        | Expected Behavior/Outcome                                                           |
| -------------- | ------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| OL008          | Transactions        | As a customer, I want to deposit or withdraw funds post-approval. | The system must support secure deposits/withdrawals using OTP-based authentication. |
| OL009          | Transaction History | As a customer, I want to view all my past transactions.           | The system should provide a detailed log of all payment and withdrawal activity.    |

---

## 📄 Usage

You may place this file in one of the following locations within your repo:

- `README.md`: Add this content at the bottom or in a dedicated section.
- `docs/requirements.md`: Ideal for keeping documentation organized.

Feel free to copy this structure into GitHub Wiki once it is available.

---
