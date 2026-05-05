import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUnit, useDeleteUnit, useDeleteCharge, useBillPreview, useUpdateUnit } from '../../hooks/useUnits.js';
import { useCreateBill } from '../../hooks/useBills.js';
import UnitStatusBadge from '../../components/units/UnitStatusBadge.jsx';
import UnitChargeForm from '../../components/units/UnitChargeForm.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { UNIT_TYPES, getUnitTypeLabel, UNIT_TYPE_COLORS } from '../../utils/unitTypes.js';

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const UnitDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState(getCurrentMonth());
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteUnit, setShowDeleteUnit] = useState(false);
  const [billSent, setBillSent] = useState(false);
  const [billError, setBillError] = useState('');
  const [editingType, setEditingType] = useState(false);
  const [selectedType, setSelectedType] = useState('');

  const { data: unit, isLoading, isError, refetch } = useUnit(id, billingPeriod);
  const deleteUnit = useDeleteUnit();
  const deleteCharge = useDeleteCharge();
  const createBill = useCreateBill();
  const updateUnit = useUpdateUnit();
  const { data: preview, isLoading: previewLoading, isError: previewError } = useBillPreview(
    id,
    billingPeriod
  );

  const handleSaveType = async () => {
    try {
      await updateUnit.mutateAsync({ unitId: id, data: { unitType: selectedType || null } });
      setEditingType(false);
      refetch();
    } catch (err) {
      alert(err.message || 'Failed to update unit type');
    }
  };

  const handleDeleteUnit = async () => {    try {
      await deleteUnit.mutateAsync(id);
      navigate(-1);
    } catch (err) {
      alert(err.message || 'Failed to delete unit');
      setShowDeleteUnit(false);
    }
  };

  const handleDeleteCharge = async () => {
    try {
      await deleteCharge.mutateAsync({ unitId: id, chargeId: deleteTarget });
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      alert(err.message || 'Failed to delete charge');
    }
  };

  const handleSendBill = async () => {
    if (!preview) return;
    setBillError('');
    setBillSent(false);
    try {
      await createBill.mutateAsync({
        tenantId: preview.tenantId,
        billingPeriod: preview.billingPeriod,
        amountDue: preview.totalAmountDue,
        dueDate: preview.suggestedDueDate,
        notes: `Unit ${unit?.unitNumber} — includes base rent${preview.charges.length > 0 ? ' + additional charges' : ''}`,
      });
      setBillSent(true);
    } catch (err) {
      setBillError(err.message || 'Failed to send bill');
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError || !unit) return <ErrorMessage message="Unit not found." />;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:underline mb-1">
            ← Back to Property
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800">Unit {unit.unitNumber}</h1>
            <UnitStatusBadge status={unit.status} />
          </div>
          {unit.propertyName && (
            <p className="text-sm text-gray-500">{unit.propertyName}</p>
          )}
          {/* Unit type display / edit */}
          <div className="flex items-center gap-2 mt-1">
            {!editingType ? (
              <>
                {unit.unitType ? (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${UNIT_TYPE_COLORS[unit.unitType] || 'bg-gray-100 text-gray-600'}`}>
                    {getUnitTypeLabel(unit.unitType)}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400 italic">No type set</span>
                )}
                <button
                  onClick={() => { setSelectedType(unit.unitType || ''); setEditingType(true); }}
                  className="text-xs text-blue-500 hover:underline"
                >
                  {unit.unitType ? 'Change' : 'Set type'}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">No type</option>
                  {UNIT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <button
                  onClick={handleSaveType}
                  disabled={updateUnit.isPending}
                  className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-60"
                >
                  Save
                </button>
                <button onClick={() => setEditingType(false)} className="text-xs text-gray-500 hover:text-gray-700">
                  Cancel
                </button>
              </div>
            )}
          </div>
          {unit.description && (
            <p className="text-sm text-gray-400 italic">{unit.description}</p>
          )}
        </div>
        <button
          onClick={() => setShowDeleteUnit(true)}
          className="text-sm px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
        >
          Delete Unit
        </button>
      </div>

      {/* Tenant / Lease Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-700 mb-4">Current Tenant</h2>
        {unit.status === 'occupied' && unit.activeLease ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Tenant</span>
              <p className="font-medium text-gray-800">{unit.activeLease.tenantFullName}</p>
            </div>
            <div>
              <span className="text-gray-500">Monthly Rent</span>
              <p className="font-medium text-gray-800">{formatCurrency(unit.activeLease.monthlyRent)}</p>
            </div>
            <div>
              <span className="text-gray-500">Lease Start</span>
              <p className="font-medium">{formatDate(unit.activeLease.startDate)}</p>
            </div>
            <div>
              <span className="text-gray-500">Lease End</span>
              <p className="font-medium">{formatDate(unit.activeLease.endDate)}</p>
            </div>
            <div>
              <span className="text-gray-500">Lease Status</span>
              <p className="font-medium capitalize">{unit.activeLease.status}</p>
            </div>
            <div>
              <span className="text-gray-500">Manage Leases</span>
              <p>
                <Link to="/leases" className="text-blue-600 hover:underline text-sm">
                  View all leases →
                </Link>
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-400 text-sm mb-3">This unit is currently vacant.</p>
            <Link
              to="/leases"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
            >
              Create a Lease for this Unit
            </Link>
          </div>
        )}
      </div>

      {/* Charges & Billing — only show when occupied */}
      {unit.status === 'occupied' && unit.activeLease && (
        <>
          {/* Billing Period Selector */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Billing Period:</label>
            <input
              type="month"
              value={billingPeriod}
              onChange={(e) => setBillingPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Additional Charges */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="text-base font-semibold text-gray-700">
              Additional Charges — {billingPeriod}
            </h2>

            {unit.charges && unit.charges.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="pb-2 font-medium">Label</th>
                    <th className="pb-2 font-medium">Amount</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {unit.charges.map((charge) => (
                    <tr key={charge.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-2 text-gray-700">{charge.label}</td>
                      <td className="py-2 font-medium text-gray-800">{formatCurrency(charge.amount)}</td>
                      <td className="py-2 text-right">
                        <button
                          onClick={() => setDeleteTarget(charge.id)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-400">No additional charges for this period.</p>
            )}

            <UnitChargeForm
              unitId={id}
              defaultBillingPeriod={billingPeriod}
              onChargeAdded={refetch}
            />
          </div>

          {/* Bill Preview & Send */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="text-base font-semibold text-gray-700">Bill Preview — {billingPeriod}</h2>

            {previewLoading && <LoadingSpinner message="Calculating..." />}

            {previewError && (
              <p className="text-sm text-amber-600 bg-amber-50 rounded-lg px-4 py-3">
                Cannot generate preview — unit may be vacant or no active lease.
              </p>
            )}

            {preview && !previewLoading && (
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Rent</span>
                    <span className="font-medium">{formatCurrency(preview.baseRent)}</span>
                  </div>
                  {preview.charges.map((c) => (
                    <div key={c.id} className="flex justify-between">
                      <span className="text-gray-600">{c.label}</span>
                      <span className="font-medium">{formatCurrency(c.amount)}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-gray-800">
                    <span>Total Due</span>
                    <span className="text-blue-700 text-base">{formatCurrency(preview.totalAmountDue)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 text-xs">
                    <span>Suggested Due Date</span>
                    <span>{formatDate(preview.suggestedDueDate)}</span>
                  </div>
                </div>

                {billSent && (
                  <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
                    ✓ Bill sent to {preview.tenantFullName} for {billingPeriod}.
                  </div>
                )}

                {billError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                    {billError}
                  </div>
                )}

                <button
                  onClick={handleSendBill}
                  disabled={createBill.isPending || billSent}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm transition-colors disabled:opacity-60"
                >
                  {createBill.isPending
                    ? 'Sending...'
                    : billSent
                    ? '✓ Bill Sent'
                    : `Send Bill — ${formatCurrency(preview.totalAmountDue)}`}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Confirm dialogs */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Remove Charge"
        message="Remove this charge? This cannot be undone."
        confirmLabel="Remove"
        danger
        onConfirm={handleDeleteCharge}
        onCancel={() => setDeleteTarget(null)}
      />
      <ConfirmDialog
        isOpen={showDeleteUnit}
        title="Delete Unit"
        message={`Delete Unit ${unit.unitNumber}? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDeleteUnit}
        onCancel={() => setShowDeleteUnit(false)}
      />
    </div>
  );
};

export default UnitDetailPage;
