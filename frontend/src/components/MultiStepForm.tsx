import { useState } from "react";
import ApplicationForm from "../pages/Apply/ApplicationForm";

const MultiStepForm = () => {
  const [formData, setFormData] = useState({
    personalInfo: { name: "", phone_number: "" },
    employmentDetails: { jobTitle: "", companyName: "" },
    bankDetails: { bank_name: "", accout_name: "", accout_number: "" },
    documents: [],
  });

  const [currentSection, setCurrentSection] = useState("personalInfo");
  const [isLoading, setIsLoading] = useState(false);

  const sections = [
    "personalInfo",
    "employmentDetails",
    "bankDetails",
    "documents",
    "review",
  ];

  const handleInputChange = (section: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleFileChange = (section: string, files: FileList) => {
    setFormData((prev) => ({
      ...prev,
      [section]: files,
    }));
  };

  const handlePrevious = () => {
    const currentIndex = sections.indexOf(currentSection);
    if (currentIndex > 0) setCurrentSection(sections[currentIndex - 1]);
  };

  const handleNext = () => {
    const currentIndex = sections.indexOf(currentSection);
    if (currentIndex < sections.length - 1)
      setCurrentSection(sections[currentIndex + 1]);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Simulate form submission (add actual API logic here)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Form submitted successfully:", formData);
    } catch (error) {
      console.error("Error submitting the form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ApplicationForm
      formData={formData}
      currentSection={currentSection}
      isLoading={isLoading}
      handleInputChange={(field, value) =>
        handleInputChange(currentSection, field, value)
      }
      handleFileChange={(files) => handleFileChange(currentSection, files)}
      handlePrevious={handlePrevious}
      handleNext={handleNext}
      handleSubmit={handleSubmit}
    />
  );
};

export default MultiStepForm;
