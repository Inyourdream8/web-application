import { FormSectionProps } from "../types";

const PersonalSection = ({ formData, handleInputChange }: FormSectionProps) => {
  const fields = [
    {
      id: "full_name",
      label: "Full Name",
      type: "text",
      placeholder: "John Doe",
      value: formData.full_name,
      required: true,
    },
    {
      id: "phone_number",
      label: "Phone Number",
      type: "tel",
      placeholder: "+1 (555) 123-4567",
      value: formData.phone_number,
      required: true,
    },
    {
      id: "nationalId",
      label: "National ID",
      type: "text",
      placeholder: "123-45-6789",
      value: formData.nationalId,
      required: true,
    },
    {
      id: "email",
      label: "Email Address",
      type: "email",
      placeholder: "johndoe@example.com",
      value: formData.email,
      required: true,
    },
    {
      id: "address",
      label: "Residential Address",
      type: "text",
      placeholder: "123 Main St, City, Country",
      value: formData.address,
      required: true,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.slice(0, 2).map((field) => (
          <div key={field.id} className="space-y-2">
            <label
              htmlFor={field.id}
              className="block text-sm font-medium text-gray-700"
            >
              {field.label}
            </label>
            <input
              id={field.id}
              name={field.id}
              type={field.type}
              className="input-field"
              placeholder={field.placeholder}
              value={field.value}
              onChange={handleInputChange}
              required={field.required}
            />
          </div>
        ))}
      </div>
      {fields.slice(2).map((field) => (
        <div key={field.id} className="space-y-2">
          <label
            htmlFor={field.id}
            className="block text-sm font-medium text-gray-700"
          >
            {field.label}
          </label>
          <input
            id={field.id}
            name={field.id}
            type={field.type}
            className="input-field"
            placeholder={field.placeholder}
            value={field.value}
            onChange={handleInputChange}
            required={field.required}
          />
        </div>
      ))}
    </div>
  );
};

export default PersonalSection;
