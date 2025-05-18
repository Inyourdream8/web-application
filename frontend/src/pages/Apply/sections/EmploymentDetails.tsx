import { FormSectionProps } from "../types";

const EmploymentSection = ({
  formData,
  handleInputChange,
}: FormSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="employment_status"
          className="block text-sm font-medium text-gray-700"
        >
          Employment Status
        </label>
        <select
          id="employment_status"
          name="employment_status"
          className="input-field"
          value={formData.employment_status}
          onChange={handleInputChange}
          required
        >
          <option value="employed">Employed</option>
          <option value="self-employed">Self-Employed</option>
          <option value="unemployed">Unemployed</option>
          <option value="retired">Retired</option>
          <option value="student">Student</option>
        </select>
      </div>

      {(formData.employment_status === "employed" ||
        formData.employment_status === "self-employed") && (
        <>
          <div className="space-y-2">
            <label
              htmlFor="employer"
              className="block text-sm font-medium text-gray-700"
            >
              {formData.employment_status === "self-employed"
                ? "Business Name"
                : "Employer Name"}
            </label>
            <input
              id="employer"
              name="employer"
              type="text"
              className="input-field"
              placeholder="Company Inc."
              value={formData.employer}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="monthly_income"
                className="block text-sm font-medium text-gray-700"
              >
                Monthly Income (PHP)
              </label>
              <input
                id="monthly_income"
                name="monthly_income"
                type="number"
                className="input-field"
                placeholder="25000"
                value={formData.monthly_income}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="employmentDuration"
                className="block text-sm font-medium text-gray-700"
              >
                Employment Duration
              </label>
              <select
                id="employmentDuration"
                name="employmentDuration"
                className="input-field"
                value={formData.employmentDuration}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Duration</option>
                <option value="less-than-1">Less than 1 year</option>
                <option value="1-3">1-3 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5-10">5-10 years</option>
                <option value="more-than-10">More than 10 years</option>
              </select>
            </div>
          </div>
        </>
      )}

      {formData.employment_status === "unemployed" && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-amber-800">
            Please note that employment information is required for loan
            approval. If you're currently between jobs, please provide your most
            recent employment details.
          </p>
        </div>
      )}
    </div>
  );
};

export default EmploymentSection;
