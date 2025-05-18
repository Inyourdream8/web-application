import Layout from "../components/Layout";

const Transaction = () => {
  const transactions = [
    {
      id: 1,
      date: "April 15, 2025",
      type: "Loan Disbursement",
      amount: 100000,
      status: "Completed",
      reference: "TX-2025041501",
    },
    {
      id: 2,
      date: "April 15, 2025",
      type: "Processing Fee",
      amount: -1500,
      status: "Completed",
      reference: "TX-2025041502",
    },
    {
      id: 3,
      date: "April 16, 2025",
      type: "Withdrawal",
      amount: -25000,
      status: "Completed",
      reference: "TX-2025041601",
    },
  ];

  return (
    <Layout>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold mb-6">Transaction History</h1>

        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search transactions..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-64"
            />
            <span className="absolute left-3 top-2.5">🔍</span>
          </div>

          <div className="flex gap-2">
            <select className="px-4 py-2 border border-gray-300 rounded-lg">
              <option>All Types</option>
              <option>Loan Disbursement</option>
              <option>Withdrawal</option>
              <option>Payment</option>
              <option>Processing Fee</option>
            </select>

            <select className="px-4 py-2 border border-gray-300 rounded-lg">
              <option>Last 30 Days</option>
              <option>Last 3 Months</option>
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-3 text-left">Date</th>
                <th className="border p-3 text-left">Type</th>
                <th className="border p-3 text-left">Amount</th>
                <th className="border p-3 text-left">Status</th>
                <th className="border p-3 text-left">Reference</th>
                <th className="border p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="border p-3">{transaction.date}</td>
                  <td className="border p-3">{transaction.type}</td>
                  <td
                    className={`border p-3 ${
                      transaction.amount >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    ₱{Math.abs(transaction.amount).toLocaleString()}
                    {transaction.amount >= 0 ? " (Credit)" : " (Debit)"}
                  </td>
                  <td className="border p-3">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      {transaction.status}
                    </span>
                  </td>
                  <td className="border p-3">{transaction.reference}</td>
                  <td className="border p-3">
                    <button className="text-blue-600 hover:underline text-sm">
                      View Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <p className="text-sm text-gray-600">Showing 1-3 of 3 transactions</p>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 border border-gray-300 rounded-md text-gray-500"
              disabled
            >
              Previous
            </button>
            <button
              className="px-3 py-1 border border-gray-300 rounded-md text-gray-500"
              disabled
            >
              Next
            </button>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-lg font-medium mb-2">
            Need a Transaction Statement?
          </h2>
          <p className="text-sm text-gray-700 mb-4">
            Download a comprehensive statement of all your transactions for your
            records or tax purposes.
          </p>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
              Download PDF
            </button>
            <button className="px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 text-sm">
              Export to Excel
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Transaction;
