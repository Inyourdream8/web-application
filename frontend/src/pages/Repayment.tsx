import Layout from "../components/Layout";

const Repayment = () => {
  return (
    <Layout>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold mb-6">Repayment Schedule</h1>
        <p className="text-gray-600 mb-6">
          Your loan repayment schedule is detailed below. Payments are due on
          the 25th of each month.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-3 text-left">Payment #</th>
                <th className="border p-3 text-left">Due Date</th>
                <th className="border p-3 text-left">Payment Amount</th>
                <th className="border p-3 text-left">Principal</th>
                <th className="border p-3 text-left">Interest</th>
                <th className="border p-3 text-left">Remaining Balance</th>
                <th className="border p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {/* Payment 1 */}
              <tr>
                <td className="border p-3">1</td>
                <td className="border p-3">April 25, 2025</td>
                <td className="border p-3">₱2,166.67</td>
                <td className="border p-3">₱1,833.33</td>
                <td className="border p-3">₱333.34</td>
                <td className="border p-3">₱98,166.67</td>
                <td className="border p-3">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                    Upcoming
                  </span>
                </td>
              </tr>
              {/* Payment 2 */}
              <tr>
                <td className="border p-3">2</td>
                <td className="border p-3">May 25, 2025</td>
                <td className="border p-3">₱2,166.67</td>
                <td className="border p-3">₱1,839.44</td>
                <td className="border p-3">₱327.23</td>
                <td className="border p-3">₱96,327.23</td>
                <td className="border p-3">
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                    Scheduled
                  </span>
                </td>
              </tr>
              {/* Payment 3 */}
              <tr>
                <td className="border p-3">3</td>
                <td className="border p-3">June 25, 2025</td>
                <td className="border p-3">₱2,166.67</td>
                <td className="border p-3">₱1,845.57</td>
                <td className="border p-3">₱321.10</td>
                <td className="border p-3">₱94,481.66</td>
                <td className="border p-3">
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                    Scheduled
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-medium mb-4">Payment Methods</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Bank Transfer</h3>
              <p className="text-sm text-gray-600">
                Transfer your payment to our bank account before the due date.
              </p>
              <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                View Bank Details
              </button>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Online Payment</h3>
              <p className="text-sm text-gray-600">
                Pay securely using our online payment portal.
              </p>
              <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                Pay Online Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Repayment;
