import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/Authcontext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { NotificationProvider } from "@/context/NotificationContext";
import { socketService } from "@/services/socket";

// Lazy-loaded pages for better performance
const Index = React.lazy(() => import("./pages/Index"));
const Login = React.lazy(() => import("./pages/Login"));
const About = React.lazy(() => import("./pages/About"));
const UserDashboard = React.lazy(
  () => import("@/pages/Dashboard/UserDashboard")
);
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const Account = React.lazy(() => import("./pages/Account"));
const Repayment = React.lazy(() => import("./pages/Repayment"));
const Transaction = React.lazy(() => import("./pages/Transaction"));
const Notifications = React.lazy(() => import("./pages/Notifications"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Register = React.lazy(() => import("./pages/Register"));
const Apply = React.lazy(() => import("./pages/Apply"));
const AdminRegistration = React.lazy(() => import("./pages/AdminRegistration"));
const AdminLogin = React.lazy(() => import("./pages/AdminLogin"));

// React Query Configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
    },
  },
});

function App(): JSX.Element {
  const { token } = useAuth(); // Hook to access authentication state

  // WebSocket setup
  useEffect(() => {
    if (token) {
      socketService.initialize(token);

      socketService.on("new_notification", (payload) => {
        console.log("New notification received:", payload);
      });

      socketService.on("disconnect", () => {
        console.log("WebSocket disconnected");
      });

      return () => {
        socketService.disconnect(); // Cleanup on unmount or token change
      };
    }
  }, [token]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter
            future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
          >
            <TooltipProvider>
              <Toaster />
              <React.Suspense fallback={<div>Loading...</div>}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Index />} />
                  <Route
                    path="/admin/register"
                    element={<AdminRegistration />}
                  />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/about" element={<About />} />

                  {/* Protected User Routes */}
                  <Route
                    element={
                      <ProtectedRoute userOnly={true} children={undefined} />
                    }
                  >
                    <Route path="/apply" element={<Apply />} />
                    <Route path="/dashboard" element={<UserDashboard />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/repayment" element={<Repayment />} />
                    <Route path="/transactions" element={<Transaction />} />
                    <Route path="/notifications" element={<Notifications />} />
                  </Route>

                  {/* Protected Admin Routes */}
                  <Route
                    element={
                      <ProtectedRoute adminOnly={true} children={undefined} />
                    }
                  >
                    <Route
                      path="/admin_dashboard"
                      element={<AdminDashboard />}
                    />
                  </Route>

                  {/* Fallback Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </React.Suspense>
            </TooltipProvider>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
