import { useState, useEffect } from "react";
import useUserProfile from "@/hooks/useUserProfile";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const Login = () => {
  const [phone_number, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Use custom hook to get user profile (after login)
  const { profile, loading, error } = useUserProfile();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone_number || !password) {
      toast.error("Both phone number and password are required.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Incorrect phone number or password.");
        } else {
          toast.error(data.error || "Login failed. Please try again.");
        }
        return;
      }

      localStorage.setItem("access_token", data.tokens.access);

      // Fetch profile after successful login
      await useUserProfile();

      navigate(data.applicationCompleted ? "/user/dashboard" : "/apply");

      toast.success("Login successful!", { position: "top-center" });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong.";
      console.error("Login Error:", errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <Link
                to="/"
                className="inline-flex items-center text-primary hover:text-accent"
              >
                <ArrowLeft className="size-4 mr-2" /> Back to Home
              </Link>
              <h1 className="text-2xl font-bold mt-6 text-primary">
                Log In to Your Account
              </h1>
              <p className="text-gray-600 mt-2">
                Enter your credentials to access your account
              </p>
            </div>

            <div className="bg-white shadow-soft p-8 border border-gray-200 rounded-xl">
              <form onSubmit={handleLogin}>
                {loading ? (
                  <p>Loading user profile...</p>
                ) : error ? (
                  <p className="text-red-500">{error}</p>
                ) : profile ? (
                  <p>Welcome back, {profile.username}!</p>
                ) : null}

                <div className="mb-4">
                  <Label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phone_number}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                <div className="mb-6">
                  <Label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !phone_number || !password}
                  className="w-full font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" /> Logging
                      in...
                    </>
                  ) : (
                    "Log In"
                  )}
                </Button>

                <p className="mt-4 text-sm text-center text-gray-600">
                  Don't have an account?{" "}
                  <Link to="/register" className="text-accent hover:underline">
                    Sign up
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
