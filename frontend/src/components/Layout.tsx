import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell } from "lucide-react";
import { useAuth } from "../context/Authcontext";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">LoanWise</h1>
            <p className="text-sm text-blue-100">
              Assessing Your Current Financial Situation
            </p>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm">
              Welcome back, {user?.username || "username"}
            </p>
            <button
              className="p-2 hover:bg-blue-700 rounded-full"
              onClick={() => navigate("/notifications")}
            >
              <Bell size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto flex flex-col md:flex-row">
        <aside className="w-full md:w-64 bg-white shadow-md md:min-h-screen">
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigate("/dashboard")}
                  className={`flex items-center w-full p-3 rounded-lg ${
                    isActive("/dashboard")
                      ? "bg-blue-700 text-white"
                      : "hover:bg-blue-50"
                  }`}
                >
                  <span className="mr-3">📊</span>
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/repayment")}
                  className={`flex items-center w-full p-3 rounded-lg ${
                    isActive("/repayment")
                      ? "bg-blue-700 text-white"
                      : "hover:bg-blue-50"
                  }`}
                >
                  <span className="mr-3">📝</span>
                  Repayment
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/transaction")}
                  className={`flex items-center w-full p-3 rounded-lg ${
                    isActive("/transaction")
                      ? "bg-blue-700 text-white"
                      : "hover:bg-blue-50"
                  }`}
                >
                  <span className="mr-3">💸</span>
                  Transaction
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/notifications")}
                  className={`flex items-center w-full p-3 rounded-lg ${
                    isActive("/notifications")
                      ? "bg-blue-700 text-white"
                      : "hover:bg-blue-50"
                  }`}
                >
                  <span className="mr-3">🔔</span>
                  Notifications
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/account")}
                  className={`flex items-center w-full p-3 rounded-lg ${
                    isActive("/account")
                      ? "bg-blue-700 text-white"
                      : "hover:bg-blue-50"
                  }`}
                >
                  <span className="mr-3">👤</span>
                  Account
                </button>
              </li>
            </ul>
          </nav>
          <div className="p-4 mt-auto">
            <button
              onClick={logout}
              className="flex items-center w-full p-3 rounded-lg hover:bg-red-50 text-red-600"
            >
              <span className="mr-3">🚪</span>
              Sign out
            </button>
          </div>
        </aside>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
