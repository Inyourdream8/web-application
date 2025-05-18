import Layout from "../components/Layout";

const Notifications = () => {
  const notifications = [
    {
      id: 1,
      type: "loan",
      title: "Loan Approved",
      message: "Congratulations! Your loan application has been approved.",
      date: "March 25, 2025",
      read: true,
    },
    {
      id: 2,
      type: "payment",
      title: "Upcoming Payment Reminder",
      message:
        "Your first loan payment of PHP 2,166.67 is due on April 25, 2025.",
      date: "April 15, 2025",
      read: false,
    },
    {
      id: 3,
      type: "system",
      title: "Account Activated",
      message: "Your LoanWise account has been successfully activated.",
      date: "March 23, 2025",
      read: true,
    },
  ];

  return (
    <Layout>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold mb-6">Notifications</h1>

        <div className="mb-6 flex justify-between items-center">
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
              All
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm">
              Unread
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm">
              Loan Updates
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm">
              Payments
            </button>
          </div>

          <button className="text-blue-600 hover:underline text-sm">
            Mark all as read
          </button>
        </div>

        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border rounded-lg ${
                notification.read ? "bg-white" : "bg-blue-50"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div
                    className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-white
                    ${
                      notification.type === "loan"
                        ? "bg-green-500"
                        : notification.type === "payment"
                        ? "bg-orange-500"
                        : "bg-blue-500"
                    }
                  `}
                  >
                    {notification.type === "loan"
                      ? "💰"
                      : notification.type === "payment"
                      ? "📅"
                      : "🔔"}
                  </div>

                  <div>
                    <h3 className="font-medium">{notification.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {notification.message}
                    </p>
                    <p className="text-gray-400 text-xs mt-2">
                      {notification.date}
                    </p>
                  </div>
                </div>

                {!notification.read && (
                  <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <button className="text-blue-600 hover:underline text-sm">
            Load more notifications
          </button>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-medium mb-2">Notification Preferences</h2>
          <p className="text-sm text-gray-700 mb-4">
            Control how and when you receive notifications from LoanWise.
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
            Manage Preferences
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;
