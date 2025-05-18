import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  LayoutDashboard,
  Receipt,
  ArrowLeftRight,
  Bell,
  User,
  LogOut,
} from "lucide-react";

interface MobileHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  handleLogout: () => void;
}

export default function MobileHeader({
  activeTab,
  setActiveTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  handleLogout,
}: MobileHeaderProps) {
  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "repayment", icon: Receipt, label: "Repayment" },
    { id: "transaction", icon: ArrowLeftRight, label: "Transaction" },
    { id: "notifications", icon: Bell, label: "Notifications" },
    { id: "account", icon: User, label: "Account" },
  ];

  return (
    <div className="md:hidden bg-white p-4 border-b border-gray-200 flex items-center justify-between">
      <h2 className="text-xl font-bold text-primary">LoanWise</h2>

      <Drawer open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <DrawerTrigger asChild>
          <Button variant="outline" size="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-menu"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="p-4">
            <nav className="flex flex-col space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                    activeTab === item.id
                      ? "bg-primary text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <item.icon size={20} className="mr-3" />
                  {item.label}
                </button>
              ))}

              <div className="pt-4 mt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center"
                  onClick={handleLogout}
                >
                  <LogOut size={18} className="mr-2" />
                  Sign out
                </Button>
              </div>
            </nav>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
