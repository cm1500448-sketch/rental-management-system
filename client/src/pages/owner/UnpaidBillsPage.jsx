import React, { useState } from 'react';
import { useUnpaidBills } from '../../hooks/useBills.js';
import BillStatusBadge from '../../components/bills/BillStatusBadge.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const UnpaidBillsPage = () => {
  const [billingPeriod, setBillingPeriod] = useState(getCurrentMonth());
  const [statusFilter, setStatusFilter] = useState('');

  const { data: bills, isLoading, isError, error } = useUnpaidBills(billingPeriod);

  const filtered = bills?.filter((b) => !statusFilter || b.status === statusFilter) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          Unpaid Bills
          {bills && <span className="ml-2 text-base font-normal text-gray-500">({bills.length} total)</span>}
        </h1>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div>
          <label className="text-sm text-gray-600 mr-2">Period:</label>
          <input
            type="month"
            value={billingPeriod}
            onChange={(e) => setBillingPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          {['', 'pending', 'under_review'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${statusFilter === s ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
            >
              {s === '' ? 'All' : s === 'under_review' ? 'Under Review' : 'Pending'}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <LoadingSpinner />}
      {isError && <ErrorMessage message={error?.message} />}

      {!isLoading && !isError && filtered.length === 0 && (
        <p className="text-gray-400 text-sm">No unpaid bills for this period.</p>
      )}

      {filtered.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tenant</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Property</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Amount Due</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Due Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-gray-800">{b.tenantFullName}</td>
                  <td className="px-4 py-3 text-gray-600">{b.propertyName}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{formatCurrency(b.amountDue)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(b.dueDate)}</td>
                  <td className="px-4 py-3"><BillStatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UnpaidBillsPage;
