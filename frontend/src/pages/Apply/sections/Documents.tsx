import React, { useState } from "react";
import { Check, Upload } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";
import { FormSectionProps } from "../types";

interface DocumentsSectionProps extends FormSectionProps {
  handleFileChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) => void;
}

interface FormData {
  [key: string]: File | undefined;
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  formData,
  handleFileChange,
}) => {
  const [filePreview, setFilePreview] = useState<{
    [key: string]: string | null;
  }>({
    idDocument: null,
    selfiePhoto: null,
    signature: null,
  });

  const [signatureData, setSignatureData] = useState<string | null>(null);
  const signaturePadRef = React.useRef<SignatureCanvas>(null);

  const handleClearSignature = () => {
    setSignatureData(null);
    signaturePadRef.current?.clear(); // Clear the canvas
  };

  const handleLocalPreview = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) => {
    handleFileChange(e, fieldName);

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);

      setFilePreview((prev) => ({
        ...prev,
        [fieldName]: previewUrl,
      }));
    }
  };

  const validateFile = (file: File, fieldName: string): boolean => {
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const validFileTypes = ["image/jpeg", "image/png", "application/pdf"];

    if (!validFileTypes.includes(file.type)) {
      alert(
        `Invalid file type for ${fieldName}. Accepted types: JPG, PNG, PDF.`
      );
      return false;
    }

    if (file.size > maxFileSize) {
      alert(`File size for ${fieldName} exceeds the 5MB limit.`);
      return false;
    }

    return true;
  };

  const renderDocumentUploader = (
    id: string,
    title: string,
    description: string,
    acceptTypes: string,
    fieldName: string
  ) => {
    const preview = filePreview[fieldName];

    return (
      <div className="space-y-2">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {title}
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
          <input
            id={id}
            name={id}
            type="file"
            accept={acceptTypes}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && validateFile(file, fieldName)) {
                handleLocalPreview(e, fieldName);
              }
            }}
          />
          <label
            htmlFor={id}
            className="cursor-pointer block"
            aria-label={`Upload ${title}`}
          >
            {(formData as any)[fieldName] ? (
              <div className="flex flex-col items-center justify-center">
                <div className="flex items-center justify-center text-accent mb-2">
                  <Check className="size-5 mr-2" />
                  <span>{(formData as any)[fieldName]?.name}</span>
                </div>
                {preview && (
                  <img
                    src={preview}
                    alt={`${title} preview`}
                    className="max-h-40 max-w-full object-contain rounded border border-gray-200"
                  />
                )}
              </div>
            ) : (
              <div>
                <Upload className="size-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">{description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Accepted formats: {acceptTypes.replace("image/*", "JPG, PNG")}{" "}
                  (max 5MB)
                </p>
              </div>
            )}
          </label>
        </div>
      </div>
    );
  };

  const renderSignatureInput = () => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Digital Signature
      </label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
        <SignatureCanvas
          ref={signaturePadRef}
          penColor="black"
          canvasProps={{
            className: "w-full h-40 rounded border border-gray-200",
          }}
          onEnd={() => {
            const dataUrl = signaturePadRef.current?.toDataURL();
            setSignatureData(dataUrl || null);
          }}
        />
        {signatureData && (
          <div className="mt-4 flex justify-center items-center">
            <img
              src={signatureData}
              alt="Digital Signature Preview"
              className="max-h-40 max-w-full object-contain"
            />
            <button
              type="button"
              onClick={handleClearSignature}
              className="btn btn-secondary ml-4"
            >
              Clear Signature
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {renderDocumentUploader(
        "idDocument",
        "Government-Issued ID",
        "Upload a photo or scan of your passport or driver's license",
        "image/*,.pdf",
        "idDocument"
      )}

      {renderDocumentUploader(
        "selfiePhoto",
        "Selfie Photo",
        "Upload a clear photo of yourself (selfie)",
        "image/*",
        "selfiePhoto"
      )}

      {renderSignatureInput()}
    </div>
  );
};

export default DocumentsSection;
