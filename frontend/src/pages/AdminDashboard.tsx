import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface CustomerData {
  id: string;
  full_name: string;
  phone: string;
  national_id: string;
  email: string;
  address: string;
  loanAmount: number;
  termMonths: number;
  applicationDate: string;
  status: string;
  employmentStatus: string;
  employer: string;
  monthly_income: number;
  bank_name: string;
  account_name: string;
  account_number: string;
}

type Props = {
  open: boolean;
  onClose: () => void;
  data: CustomerData;
};

export function ApplicationDetailForm({ open, onClose, data }: Props) {
  const [formData, setFormData] = useState<CustomerData>(data);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CustomerData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData(data);
      setErrors({});
    }
  }, [open, data]);

  const handleChange = (field: keyof CustomerData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof CustomerData, string>> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;
    const routingRegex = /^\d{9}$/;

    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Valid email required";
    }
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "10-digit number required";
    }
    if (formData.loanAmount <= 100000 || formData.loanAmount > 3000000) {
      newErrors.loanAmount = "Amount must be between ₱100K-₱3M";
    }
    if (formData.routingNumber && !routingRegex.test(formData.routingNumber)) {
      newErrors.routingNumber = "9-digit routing number required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/loans/${formData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Update failed");

      toast.success("Application updated successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const maskSensitiveData = (value: string, visibleDigits = 4) => {
    if (!value) return "";
    return value.replace(/.(?=.{4})/g, "*");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="text-lg font-semibold">
          Application #{formData.id}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <section className="space-y-4">
            <h3 className="font-medium">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                required
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                required
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                error={errors.email}
                required
              />
              <Input
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  handleChange("phone", e.target.value.replace(/\D/g, ""))
                }
                maxLength={10}
                error={errors.phone}
                required
              />
            </div>
          </section>

          {/* Loan Details Section */}
          <section className="space-y-4">
            <h3 className="font-medium">Loan Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <Select
                value={formData.loanType}
                onValueChange={(value) => handleChange("loanType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select loan type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal Loan</SelectItem>
                  <SelectItem value="business">Business Loan</SelectItem>
                  <SelectItem value="mortgage">Mortgage</SelectItem>
                </SelectContent>
              </Select>

              <Input
                label="Loan Amount (₱)"
                type="number"
                value={formData.loanAmount}
                onChange={(e) =>
                  handleChange("loanAmount", Number(e.target.value))
                }
                min={100000}
                max={3000000}
                step={5000}
                error={errors.loanAmount}
                required
              />
              <Input
                label="Term (months)"
                type="number"
                value={formData.termMonths}
                onChange={(e) =>
                  handleChange("termMonths", Number(e.target.value))
                }
                min={6}
                max={60}
                required
              />
            </div>
          </section>

          {/* Employment Information */}
          <section className="space-y-4">
            <h3 className="font-medium">Employment Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <Select
                value={formData.employmentStatus}
                onValueChange={(value) =>
                  handleChange("employmentStatus", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Employment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employed">Employed</SelectItem>
                  <SelectItem value="self-employed">Self-Employed</SelectItem>
                  <SelectItem value="unemployed">Unemployed</SelectItem>
                </SelectContent>
              </Select>

              <Input
                label="Employer"
                value={formData.employer}
                onChange={(e) => handleChange("employer", e.target.value)}
              />
              <Input
                label="Annual Income (₱)"
                type="number"
                value={formData.annualIncome}
                onChange={(e) =>
                  handleChange("annualIncome", Number(e.target.value))
                }
                min={0}
              />
            </div>
          </section>

          {/* Banking Information */}
          <section className="space-y-4">
            <h3 className="font-medium">Banking Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Bank Name"
                value={formData.bankName}
                onChange={(e) => handleChange("bankName", e.target.value)}
              />
              <Input
                label="Account Number"
                value={maskSensitiveData(formData.accountNumber)}
                onChange={(e) => handleChange("accountNumber", e.target.value)}
                disabled
              />
              <Input
                label="Routing Number"
                value={formData.routingNumber}
                onChange={(e) =>
                  handleChange(
                    "routingNumber",
                    e.target.value.replace(/\D/g, "")
                  )
                }
                maxLength={9}
                error={errors.routingNumber}
              />
            </div>
          </section>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
