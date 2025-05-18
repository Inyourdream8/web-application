import { FormSectionProps } from "../types";

const BankingSection = ({ formData, handleInputChange }: FormSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="bank_name"
          className="block text-sm font-medium text-gray-700"
        >
          Bank Name
        </label>
        <input
          id="bank_name"
          name="bank_name"
          type="text"
          className="input-field"
          value={formData.bank_name}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label
            htmlFor="accout_number"
            className="block text-sm font-medium text-gray-700"
          >
            Account Name
          </label>
          <input
            id="accout_name"
            name="accout_name"
            type="text"
            className="input-field"
            value={formData.accout_name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="accountType"
            className="block text-sm font-medium text-gray-700"
          >
            Account Number
          </label>
          <input
            id="accout_number"
            name="accout_number"
            className="input-field"
            value={formData.accout_number}
            onChange={handleInputChange}
            required
          ></input>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label
            htmlFor="loan_amount"
            className="block text-sm font-medium text-gray-700"
          >
            Loan Amount (PHP)
          </label>
          <input
            id="loan_amount"
            name="loan_amount"
            type="number"
            className="input-field"
            placeholder="100,000.00"
            value={formData.loan_amount}
            onChange={handleInputChange}
            required
            min="100000.00"
            max="3000000.00"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="loan_term"
            className="block text-sm font-medium text-gray-700"
          >
            Loan Term (months)
          </label>
          <select
            id="loan_term"
            name="loan_term"
            className="input-field"
            value={formData.loan_term}
            onChange={handleInputChange}
            required
          >
            <option value="6">6 months</option>
            <option value="12">12 months</option>
            <option value="24">24 months</option>
            <option value="36">36 months</option>
            <option value="48">48 months</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="loanPurpose"
          className="block text-sm font-medium text-gray-700"
        >
          Loan Purpose
        </label>
        <textarea
          id="loanPurpose"
          name="loanPurpose"
          className="input-field min-h-[100px]"
          placeholder="Please describe how you plan to use this loan..."
          value={formData.loanPurpose}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
        <h4 className="font-medium text-gray-800 mb-2">
          Why we need your banking information:
        </h4>
        <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
          <li>To verify your identity and financial status</li>
          <li>To deposit approved loan funds directly to your account</li>
          <li>Your information is secured with bank-level encryption</li>
        </ul>
      </div>
    </div>
  );
};

export default BankingSection;
