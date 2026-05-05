import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePortalBills } from '../../hooks/usePortalBills.js';
import { useAuth } from '../../context/AuthContext.jsx';
import BillStatusBadge from '../../components/bills/BillStatusBadge.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import apiClient from '../../api/client.js';

const PortalBillsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: bills, isLoading, isError, error } = usePortalBills();

  const handleLogout = async () => {
    try { await apiClient.post('/api/auth/logout'); } catch (_) {}
    logout();
    navigate('/login');
  };

  const outstanding = bills?.filter((b) => b.status === 'pending' || b.status === 'rejected')
    .reduce((sum, b) => sum + b.amountDue, 0) ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-700 text-white shadow-md">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between h-16">
          <span className="text-xl font-bold">Tenant Portal</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-blue-200">{user?.email}</span>
            <button onClick={handleLogout} className="bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded text-sm">Logout</button>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Bills</h1>
          {outstanding > 0 && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-sm text-red-700">
                Outstanding balance: <span className="font-bold text-lg">{formatCurrency(outstanding)}</span>
              </p>
            </div>
          )}
        </div>

        {isLoading && <LoadingSpinner />}
        {isError && <ErrorMessage message={error?.message} />}

        {!isLoading && !isError && bills?.length === 0 && (
          <p className="text-gray-400 text-sm">No bills yet.</p>
        )}

        {bills && bills.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Period</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Amount Due</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Due Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((b) => (
                  <tr key={b.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/portal/bills/${b.id}`)}>
                    <td className="px-4 py-3 font-medium text-gray-800">{b.billingPeriod}</td>
                    <td className="px-4 py-3 text-gray-700">{formatCurrency(b.amountDue)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(b.dueDate)}</td>
                    <td className="px-4 py-3"><BillStatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default PortalBillsPage;
