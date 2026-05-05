import React from 'react';
import { useDashboard } from '../hooks/useDashboard.js';
import MetricCard from '../components/dashboard/MetricCard.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import { formatCurrency, formatDate } from '../utils/formatters.js';

const DashboardPage = () => {
  const { data, isLoading, isError, error } = useDashboard();

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message={error?.message} />;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard label="Total Properties" value={data.totalProperties} color="blue" />
        <MetricCard label="Occupied" value={data.occupiedProperties} color="green" />
        <MetricCard label="Vacant" value={data.vacantProperties} color="gray" />
        <MetricCard
          label="Expected Rent"
          value={formatCurrency(data.totalMonthlyRentExpected)}
          sub="this month"
          color="blue"
        />
        <MetricCard
          label="Collected"
          value={formatCurrency(data.totalPaymentsThisMonth)}
          sub="this month"
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent payments */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Recent Payments</h2>
          {data.recentPayments.length === 0 ? (
            <p className="text-sm text-gray-400">No payments recorded yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Method</th>
                </tr>
              </thead>
              <tbody>
                {data.recentPayments.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2 text-gray-600">{formatDate(p.paymentDate)}</td>
                    <td className="py-2 font-medium text-gray-800">{formatCurrency(p.amount)}</td>
                    <td className="py-2 text-gray-500 capitalize">{p.method.replace('_', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Expiring leases */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">
            Leases Expiring Soon
            {data.expiringLeases.length > 0 && (
              <span className="ml-2 bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">
                {data.expiringLeases.length}
              </span>
            )}
          </h2>
          {data.expiringLeases.length === 0 ? (
            <p className="text-sm text-gray-400">No leases expiring in the next 30 days.</p>
          ) : (
            <ul className="space-y-2">
              {data.expiringLeases.map((l) => (
                <li key={l.id} className="flex justify-between text-sm border-b border-gray-50 pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-gray-800">{l.tenantFullName}</p>
                    <p className="text-gray-400 text-xs">{l.propertyName}</p>
                  </div>
                  <span className="text-amber-600 font-medium">{formatDate(l.endDate)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Overdue leases */}
      {data.overdueLeases.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <h2 className="text-base font-semibold text-red-700 mb-4">
            Overdue This Month ({data.overdueLeases.length})
          </h2>
          <ul className="space-y-2">
            {data.overdueLeases.map((l) => (
              <li key={l.id} className="flex justify-between text-sm">
                <div>
                  <p className="font-medium text-red-800">{l.tenantFullName}</p>
                  <p className="text-red-400 text-xs">{l.propertyName}</p>
                </div>
                <span className="text-red-600 font-medium">{formatCurrency(l.monthlyRent)} / mo</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
