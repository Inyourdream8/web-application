import React from "react";
import { Check, User, Building, CreditCard, Upload } from "lucide-react";
import { LoanFormData } from "../types";

interface ReviewProps {
  formData: LoanFormData;
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
}

const ReviewSection = ({ formData }: ReviewProps) => {
  // Removed individual section data references

  return (
    <div className="space-y-6">
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
        <p className="text-amber-800 text-sm">
          Please review your information carefully before submitting. Once
          submitted, this application cannot be edited.
        </p>
      </div>

      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg divide-y">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
            <div className="p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <User className="size-4 mr-2 text-accent" />
                Personal Information
              </h4>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-gray-500">Full Name</dt>
                  <dd className="font-medium text-gray-900">
                    {formData.full_name || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Phone Number</dt>
                  <dd className="font-medium text-gray-900">
                    {formData.phone_number || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Email</dt>
                  <dd className="font-medium text-gray-900">
                    {formData.email || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Address</dt>
                  <dd className="font-medium text-gray-900">
                    {formData.address || "Not provided"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Building className="size-4 mr-2 text-accent" />
                Employment Details
              </h4>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-gray-500">Status</dt>
                  <dd className="font-medium text-gray-900 capitalize">
                    {formData.employment_status || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Employer</dt>
                  <dd className="font-medium text-gray-900">
                    {formData.employer || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Monthly Income</dt>
                  <dd className="font-medium text-gray-900">
                    {formData.monthly_income
                      ? `$${formData.monthly_income}`
                      : "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Employment Duration</dt>
                  <dd className="font-medium text-gray-900 capitalize">
                    {formData.employmentDuration?.replace(/-/g, " ") ||
                      "Not provided"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
            <div className="p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <CreditCard className="size-4 mr-2 text-accent" />
                Banking Information
              </h4>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-gray-500">Bank Name</dt>
                  <dd className="font-medium text-gray-900">
                    {formData.bank_name || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Account Number</dt>
                  <dd className="font-medium text-gray-900">
                    {formData.accout_number
                      ? `**** ${formData.accout_number.slice(-4)}`
                      : "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Account Type</dt>
                  <dd className="font-medium text-gray-900 capitalize"></dd>
                </div>
              </dl>
            </div>

            <div className="p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Upload className="size-4 mr-2 text-accent" />
                Documents
              </h4>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-gray-500">ID Document</dt>
                  <dd className="font-medium text-gray-900">
                    {formData.idDocument ? (
                      <span className="text-accent flex items-center">
                        <Check className="size-4 mr-1" /> Uploaded
                      </span>
                    ) : (
                      "Not uploaded"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Selfie Photo</dt>
                  <dd className="font-medium text-gray-900">
                    {formData.selfiePhoto ? (
                      <span className="text-accent flex items-center">
                        <Check className="size-4 mr-1" /> Uploaded
                      </span>
                    ) : (
                      "Not uploaded"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Signature</dt>
                  <dd className="font-medium text-gray-900">
                    {formData.signature ? (
                      <span className="text-accent flex items-center">
                        <Check className="size-4 mr-1" /> Uploaded
                      </span>
                    ) : (
                      "Not uploaded"
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 mt-6">
          <input
            id="agree"
            name="agree"
            type="checkbox"
            className="mt-1"
            required
          />
          <label htmlFor="agree" className="text-sm text-gray-700">
            I confirm that the information provided is accurate and complete. I
            authorize LendWise to verify this information and check my credit
            history. I agree to the{" "}
            <a href="#" className="text-accent hover:underline">
              Terms of Service
            </a>{" "}
            and
            <a href="#" className="text-accent hover:underline">
              {" "}
              Privacy Policy
            </a>
            .
          </label>
        </div>
      </div>
    </div>
  );
};

export default ReviewSection;
