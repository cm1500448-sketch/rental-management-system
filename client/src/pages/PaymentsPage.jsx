import React, { useState } from 'react';
import { useLeases } from '../hooks/useLeases.js';
import { usePayments, useRecordPayment } from '../hooks/usePayments.js';
import PaymentForm from '../components/payments/PaymentForm.jsx';
import LeaseStatusBadge from '../components/leases/LeaseStatusBadge.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import { formatDate, formatCurrency } from '../utils/formatters.js';

const LeasePayments = ({ lease }) => {
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const { data: payments, isLoading } = usePayments(lease.id);
  const recordPayment = useRecordPayment(lease.id);

  const handleRecord = async (formData) => {
    setFormError('');
    try {
      await recordPayment.mutateAsync(formData);
      setShowForm(false);
    } catch (err) {
      setFormError(err.message || 'Failed to record payment');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LeaseStatusBadge lease={lease} />
          <span className="text-sm text-gray-600">
            {formatDate(lease.startDate)} → {formatDate(lease.endDate)}
          </span>
          <span className="text-sm font-medium text-gray-800">{formatCurrency(lease.monthlyRent)}/mo</span>
        </div>
        {lease.status === 'active' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            + Record Payment
          </button>
        )}
      </div>

      {showForm && (
        <div className="border-t border-gray-100 pt-4">
          {formError && <ErrorMessage message={formError} />}
          <PaymentForm
            onSubmit={handleRecord}
            onCancel={() => setShowForm(false)}
            isSubmitting={recordPayment.isPending}
          />
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner message="Loading payments..." />
      ) : !payments || payments.length === 0 ? (
        <p className="text-sm text-gray-400">No payments recorded for this lease.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="pb-2 font-medium">Date</th>
              <th className="pb-2 font-medium">Amount</th>
              <th className="pb-2 font-medium">Method</th>
              <th className="pb-2 font-medium">Balance Remaining</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-gray-50 last:border-0">
                <td className="py-2 text-gray-600">{formatDate(p.paymentDate)}</td>
                <td className="py-2 font-medium text-gray-800">{formatCurrency(p.amount)}</td>
                <td className="py-2 text-gray-500 capitalize">{p.method.replace('_', ' ')}</td>
                <td className={`py-2 font-medium ${p.balanceRemaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(p.balanceRemaining)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const PaymentsPage = () => {
  const { data: leases, isLoading, isError, error } = useLeases('active');

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message={error?.message} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Payments</h1>
      <p className="text-sm text-gray-500">Showing payment history for all active leases.</p>

      {!leases || leases.length === 0 ? (
        <p className="text-gray-400 text-sm">No active leases found. Create a lease first.</p>
      ) : (
        <div className="space-y-4">
          {leases.map((lease) => (
            <LeasePayments key={lease.id} lease={lease} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
