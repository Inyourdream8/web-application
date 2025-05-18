import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  Mail,
  Lock,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { auth } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AdminRegistrationForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Basic email validation
  const isEmailValid = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Basic password validation (min 6 chars with at least 1 number)
  const isPasswordValid = (password: string) => {
    return /^(?=.*[0-9])(?=.*[a-zA-Z]).{6,}$/.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEmailValid(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!isPasswordValid(password)) {
      toast.error(
        "Password must be at least 6 characters and contain at least one number"
      );
      return;
    }

    setIsLoading(true);

    try {
      // In a development or preview environment, simulate success
      // This allows testing the UI without a running backend
      if (window.location.hostname === "localhost") {
        console.log(
          "Development mode: Simulating successful admin registration"
        );

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Store admin credentials in localStorage for demo purposes
        localStorage.setItem("demoAdminEmail", email);
        localStorage.setItem("demoAdminLoggedIn", "true");

        setIsLoading(false);
        setIsComplete(true);
        toast.success("Admin account created successfully!", {
          position: "top-center",
        });

        return;
      }

      // In production, call actual API
      await auth.register(username, email, password);

      setIsLoading(false);
      setIsComplete(true);
      toast.success("Admin account created successfully!", {
        position: "top-center",
      });
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <Link
          to="/"
          className="inline-flex items-center text-primary hover:text-accent"
        >
          <ArrowLeft className="size-4 mr-2" />
          Back to Home
        </Link>

        <h1 className="text-2xl font-bold mt-6 text-primary">
          {!isComplete ? "Admin Registration" : "Registration Complete"}
        </h1>

        <p className="text-gray-600 mt-2">
          {!isComplete
            ? "Create an admin account to access the admin dashboard"
            : "Your admin account has been created successfully"}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
        {!isComplete ? (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    className="pl-10"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {email && !isEmailValid(email) && (
                  <p className="mt-1 text-xs text-red-500">
                    Please enter a valid email address
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Admin Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="username"
                    type="text"
                    className="pl-10"
                    placeholder="John Doe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    className="pl-10"
                    placeholder="Create a secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {password && !isPasswordValid(password) && (
                  <p className="mt-1 text-xs text-red-500">
                    Password must be at least 6 characters and contain at least
                    one number
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 6 characters with at least one number
                </p>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-6"
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Admin Account"
              )}
            </Button>

            <p className="mt-4 text-sm text-center text-gray-600">
              Already have an admin account?{" "}
              <Link to="/admin/login" className="text-accent hover:underline">
                Log in
              </Link>
            </p>
          </form>
        ) : (
          <div className="text-center py-6">
            <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="size-10 text-green-600" />
            </div>

            <h3 className="text-xl font-semibold text-primary mb-2">
              Admin Account Created!
            </h3>

            <p className="text-gray-600 mb-6">
              You can now access the admin dashboard and manage the application.
            </p>

            <Button
              onClick={() => navigate("/admin_dashboard")}
              className="w-full"
            >
              Go to Admin Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRegistrationForm;
