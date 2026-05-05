import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTenant, useUpdateTenant, useDeleteTenant } from '../hooks/useTenants.js';
import { useLeases } from '../hooks/useLeases.js';
import TenantForm from '../components/tenants/TenantForm.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import { formatDate, formatCurrency } from '../utils/formatters.js';

const TenantDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editError, setEditError] = useState('');

  const { data: tenant, isLoading, isError } = useTenant(id);
  const { data: leases } = useLeases();
  const updateTenant = useUpdateTenant();
  const deleteTenant = useDeleteTenant();

  const tenantLeases = leases?.filter((l) => l.tenantId === id) ?? [];

  const handleUpdate = async (formData) => {
    setEditError('');
    try {
      await updateTenant.mutateAsync({ id, ...formData });
      setEditing(false);
    } catch (err) {
      setEditError(err.message || 'Failed to update tenant');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTenant.mutateAsync(id);
      navigate('/tenants');
    } catch (err) {
      alert(err.message || 'Failed to delete tenant');
      setShowDelete(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError || !tenant) return <ErrorMessage message="Tenant not found." />;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/tenants')} className="text-sm text-blue-600 hover:underline mb-1">← Back</button>
          <h1 className="text-2xl font-bold text-gray-800">{tenant.fullName}</h1>
          <p className="text-sm text-gray-500">{tenant.email}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditing(!editing)} className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50">{editing ? 'Cancel' : 'Edit'}</button>
          <button onClick={() => setShowDelete(true)} className="text-sm px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">Delete</button>
        </div>
      </div>

      {editing ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {editError && <ErrorMessage message={editError} />}
          <TenantForm
            defaultValues={{ fullName: tenant.fullName, email: tenant.email, phone: tenant.phone, emergencyContactName: tenant.emergencyContactName ?? '', emergencyContactPhone: tenant.emergencyContactPhone ?? '' }}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(false)}
            isSubmitting={updateTenant.isPending}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6 grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">Phone</span><p className="font-medium">{tenant.phone}</p></div>
          <div><span className="text-gray-500">Lease Status</span>
            <p className={`font-medium ${tenant.leaseStatus === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
              {tenant.leaseStatus === 'active' ? 'Active Lease' : 'No Active Lease'}
            </p>
          </div>
          {tenant.emergencyContactName && <div><span className="text-gray-500">Emergency Contact</span><p className="font-medium">{tenant.emergencyContactName}</p></div>}
          {tenant.emergencyContactPhone && <div><span className="text-gray-500">Emergency Phone</span><p className="font-medium">{tenant.emergencyContactPhone}</p></div>}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-700 mb-4">Lease History</h2>
        {tenantLeases.length === 0 ? (
          <p className="text-sm text-gray-400">No leases for this tenant.</p>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500 border-b"><th className="pb-2">Status</th><th className="pb-2">Start</th><th className="pb-2">End</th><th className="pb-2">Rent</th></tr></thead>
            <tbody>
              {tenantLeases.map((l) => (
                <tr key={l.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-2 capitalize">{l.status}</td>
                  <td className="py-2">{formatDate(l.startDate)}</td>
                  <td className="py-2">{formatDate(l.endDate)}</td>
                  <td className="py-2">{formatCurrency(l.monthlyRent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog isOpen={showDelete} title="Delete Tenant" message={`Delete "${tenant.fullName}"? This cannot be undone.`} confirmLabel="Delete" danger onConfirm={handleDelete} onCancel={() => setShowDelete(false)} />
    </div>
  );
};

export default TenantDetailPage;
