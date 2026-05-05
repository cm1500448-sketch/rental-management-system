import React, { useState } from 'react';
import { useLeases, useCreateLease, useTerminateLease } from '../hooks/useLeases.js';
import LeaseForm from '../components/leases/LeaseForm.jsx';
import LeaseStatusBadge from '../components/leases/LeaseStatusBadge.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import { formatDate, formatCurrency } from '../utils/formatters.js';

const LeasesPage = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [terminateTarget, setTerminateTarget] = useState(null);
  const [formError, setFormError] = useState('');

  const { data: leases, isLoading, isError, error } = useLeases(statusFilter);
  const createLease = useCreateLease();
  const terminateLease = useTerminateLease();

  const handleCreate = async (formData) => {
    setFormError('');
    try {
      await createLease.mutateAsync(formData);
      setShowForm(false);
    } catch (err) {
      setFormError(err.message || 'Failed to create lease');
    }
  };

  const handleTerminate = async () => {
    try {
      await terminateLease.mutateAsync(terminateTarget.id);
      setTerminateTarget(null);
    } catch (err) {
      alert(err.message || 'Failed to terminate lease');
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message={error?.message} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Rentals</h1>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
          + New Rental
        </button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {['', 'active', 'expired', 'terminated'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${statusFilter === s ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
          >
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">New Rental</h2>
          {formError && <ErrorMessage message={formError} />}
          <LeaseForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} isSubmitting={createLease.isPending} />
        </div>
      )}

      {!leases || leases.length === 0 ? (
        <p className="text-gray-400 text-sm">No rentals found.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Start</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">End</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Rent</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {leases.map((l) => (
                <tr key={l.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3"><LeaseStatusBadge lease={l} /></td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(l.startDate)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(l.endDate)}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{formatCurrency(l.monthlyRent)}</td>
                  <td className="px-4 py-3 text-right">
                    {l.status === 'active' && (
                      <button onClick={() => setTerminateTarget(l)} className="text-xs text-red-500 hover:text-red-700">
                        Terminate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(terminateTarget)}
        title="Terminate Rental"
        message="Are you sure you want to terminate this rental? This action cannot be undone."
        confirmLabel="Terminate"
        danger
        onConfirm={handleTerminate}
        onCancel={() => setTerminateTarget(null)}
      />
    </div>
  );
};

export default LeasesPage;
