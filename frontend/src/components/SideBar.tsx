import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Receipt,
  ArrowLeftRight,
  Bell,
  User,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleLogout: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  handleLogout,
}: SidebarProps) {
  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "repayment", icon: Receipt, label: "Repayment" },
    { id: "transaction", icon: ArrowLeftRight, label: "Transaction" },
    { id: "notifications", icon: Bell, label: "Notifications" },
    { id: "account", icon: User, label: "Account" },
  ];

  return (
    <div className="hidden md:flex w-64 flex-col bg-white border-r border-gray-200">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-primary">LoanWise</h2>
      </div>

      <nav className="flex-1 mt-6">
        <div className="px-2 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                activeTab === item.id
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <item.icon size={20} className="mr-3" />
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="p-4 mt-auto">
        <Button
          variant="outline"
          className="w-full flex items-center justify-center"
          onClick={handleLogout}
        >
          <LogOut size={18} className="mr-2" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
