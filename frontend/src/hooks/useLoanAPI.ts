import { useCallback } from "react";
import { LoanApplicationData } from "@/lib/api/client";

// Type for document data in form
type LoanDocument = {
  type: string;
  file: File;
};

// Response type for loan creation
type LoanResponse = {
  id: string;
  [key: string]: string; // Additional loan properties
};

// Type for loans list
type LoanList = Array<{
  id: string;
  [key: string]: string;
}>;

const useLoanAPI = () => {
  const getAllLoans = useCallback(async (): Promise<LoanList> => {
    const response = await fetch("/api/loans");
    if (!response.ok) {
      throw new Error("Failed to fetch loans");
    }
    return response.json();
  }, []);

  const createLoan = useCallback(
    async (data: LoanApplicationData): Promise<LoanResponse> => {
      const response = await fetch("/api/loans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create loan");
      }
      return response.json();
    },
    []
  );

  return { getAllLoans, createLoan };
};

const useDocumentAPI = () => {
  const uploadDocument = useCallback(
    async (loanId: string, type: string, file: File): Promise<void> => {
      const formData = new FormData();
      formData.append("documentType", type);
      formData.append("file", file);

      const response = await fetch(`/api/loans/${loanId}/documents`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload document");
      }
    },
    []
  );

  return { uploadDocument };
};

const LoanApplicationComponent = () => {
  const { getAllLoans, createLoan } = useLoanAPI();
  const { uploadDocument } = useDocumentAPI();

  const handleSubmit = async (
    formData: LoanApplicationData & { documents?: LoanDocument[] }
  ) => {
    try {
      // Create loan
      const loan = await createLoan(formData);

      // Upload documents if they exist
      if (formData.documents?.length) {
        const results = await Promise.allSettled(
          formData.documents.map((doc: { type: string; file: File }) =>
            uploadDocument(loan.id, doc.type, doc.file)
          )
        );

        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            console.log(`Document ${index + 1} uploaded successfully.`);
          } else {
            console.error(
              `Document ${index + 1} failed to upload:`,
              result.reason
            );
          }
        });
      }

      // Refresh loan list
      const updatedLoans = await getAllLoans();
      // ... update state with updatedLoans
    } catch (error) {
      console.error("Loan submission failed:", error);
      // Handle error (show toast, etc.)
    }
  };

  // ... rest of component implementation
};
