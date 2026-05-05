import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useBills, useCreateBill, useReviewBill } from '../../hooks/useBills.js';
import BillStatusBadge from '../../components/bills/BillStatusBadge.jsx';
import BillForm from '../../components/bills/BillForm.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

const ReviewForm = ({ bill, onClose }) => {
  const [decision, setDecision] = useState('paid');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const reviewBill = useReviewBill();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await reviewBill.mutateAsync({ id: bill.id, decision, rejectionReason: reason });
      onClose();
    } catch (err) {
      setError(err.message || 'Review failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-4 border-t border-gray-100 pt-4">
      {bill.proofFile && (
        <div className="text-sm">
          <span className="text-gray-500">Proof: </span>
          <a href={`/api/portal/bills/${bill.id}/proof/file`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
            {bill.proofFile.originalName}
          </a>
        </div>
      )}
      <div className="flex gap-3">
        <label className="flex items-center gap-1.5 text-sm cursor-pointer">
          <input type="radio" value="paid" checked={decision === 'paid'} onChange={() => setDecision('paid')} /> Mark as Paid
        </label>
        <label className="flex items-center gap-1.5 text-sm cursor-pointer">
          <input type="radio" value="rejected" checked={decision === 'rejected'} onChange={() => setDecision('rejected')} /> Reject
        </label>
      </div>
      {decision === 'rejected' && (
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for rejection (10–500 characters)"
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={reviewBill.isPending} className="px-4 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
          {reviewBill.isPending ? 'Submitting...' : 'Submit Review'}
        </button>
        <button type="button" onClick={onClose} className="px-4 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
      </div>
    </form>
  );
};

const BillsPage = () => {
  const location = useLocation();
  const prefillBill = location.state?.prefillBill;

  const [showForm, setShowForm] = useState(!!prefillBill);
  const [reviewingBill, setReviewingBill] = useState(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (prefillBill) {
      setShowForm(true);
    }
  }, [prefillBill]);

  const { data: bills, isLoading, isError, error } = useBills();
  const createBill = useCreateBill();

  const handleCreate = async (data) => {
    setFormError('');
    try {
      await createBill.mutateAsync(data);
      setShowForm(false);
    } catch (err) {
      setFormError(err.message || 'Failed to create bill');
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message={error?.message} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Bills</h1>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg">
          + Send Bill
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">New Bill</h2>
          {formError && <ErrorMessage message={formError} />}
          <BillForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} isSubmitting={createBill.isPending} prefill={prefillBill} />
        </div>
      )}

      {!bills || bills.length === 0 ? (
        <p className="text-gray-400 text-sm">No bills sent yet.</p>
      ) : (
        <div className="space-y-3">
          {bills.map((b) => (
            <div key={b.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{b.tenantFullName} — {b.billingPeriod}</p>
                  <p className="text-sm text-gray-500">{b.propertyName} · Due {formatDate(b.dueDate)} · {formatCurrency(b.amountDue)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <BillStatusBadge status={b.status} />
                  {b.status === 'under_review' && (
                    <button onClick={() => setReviewingBill(reviewingBill?.id === b.id ? null : b)} className="text-xs text-blue-600 hover:underline">
                      Review
                    </button>
                  )}
                </div>
              </div>
              {reviewingBill?.id === b.id && (
                <ReviewForm bill={b} onClose={() => setReviewingBill(null)} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BillsPage;
