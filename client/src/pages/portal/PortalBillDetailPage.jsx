import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePortalBill } from '../../hooks/usePortalBills.js';
import BillStatusBadge from '../../components/bills/BillStatusBadge.jsx';
import ProofUploadForm from '../../components/portal/ProofUploadForm.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

const PortalBillDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: bill, isLoading, isError } = usePortalBill(id);

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center"><LoadingSpinner /></div>
  );
  if (isError || !bill) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center"><ErrorMessage message="Bill not found." /></div>
  );

  const canUpload = ['pending', 'under_review', 'rejected'].includes(bill.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-700 text-white shadow-md">
        <div className="max-w-3xl mx-auto px-4 flex items-center h-16">
          <button onClick={() => navigate('/portal/bills')} className="text-blue-200 hover:text-white text-sm mr-4">← Back</button>
          <span className="text-xl font-bold">Bill Detail</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Bill for {bill.billingPeriod}</h2>
            <BillStatusBadge status={bill.status} />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">Amount Due</span><p className="font-bold text-xl text-gray-800">{formatCurrency(bill.amountDue)}</p></div>
            <div><span className="text-gray-500">Due Date</span><p className="font-medium">{formatDate(bill.dueDate)}</p></div>
            {bill.notes && <div className="col-span-2"><span className="text-gray-500">Notes</span><p className="text-gray-700">{bill.notes}</p></div>}
          </div>

          {bill.status === 'rejected' && bill.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-sm font-medium text-red-700 mb-1">Proof rejected</p>
              <p className="text-sm text-red-600">{bill.rejectionReason}</p>
            </div>
          )}
        </div>

        {canUpload && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-700 mb-4">
              {bill.proofFile ? 'Replace Proof of Payment' : 'Upload Proof of Payment'}
            </h3>
            <ProofUploadForm billId={id} existingProof={bill.proofFile} />
          </div>
        )}

        {bill.status === 'paid' && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-medium">
            ✓ Payment confirmed by your landlord.
          </div>
        )}
      </main>
    </div>
  );
};

export default PortalBillDetailPage;
