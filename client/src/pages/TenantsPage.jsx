import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTenants, useCreateTenant, useDeleteTenant } from '../hooks/useTenants.js';
import TenantForm from '../components/tenants/TenantForm.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import Pagination from '../components/common/Pagination.jsx';

const TenantsPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formError, setFormError] = useState('');

  const { data, isLoading, isError, error } = useTenants(page, search);
  const createTenant = useCreateTenant();
  const deleteTenant = useDeleteTenant();

  const handleCreate = async (formData) => {
    setFormError('');
    try {
      await createTenant.mutateAsync(formData);
      setShowForm(false);
    } catch (err) {
      setFormError(err.message || 'Failed to create tenant');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTenant.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      alert(err.message || 'Failed to delete tenant');
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message={error?.message} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Tenants</h1>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
          + Add Tenant
        </button>
      </div>

      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">New Tenant</h2>
          {formError && <ErrorMessage message={formError} />}
          <TenantForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} isSubmitting={createTenant.isPending} />
        </div>
      )}

      {data?.data?.length === 0 ? (
        <p className="text-gray-400 text-sm">No tenants found.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Lease</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map((t) => (
                <tr key={t.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    <Link to={`/tenants/${t.id}`} className="hover:text-blue-600">{t.fullName}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.email}</td>
                  <td className="px-4 py-3 text-gray-600">{t.phone}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${t.leaseStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {t.leaseStatus === 'active' ? 'Active Lease' : 'No Lease'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setDeleteTarget(t)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} pageSize={data?.meta?.pageSize} total={data?.meta?.total} onPageChange={setPage} />

      <ConfirmDialog isOpen={Boolean(deleteTarget)} title="Delete Tenant" message={`Delete "${deleteTarget?.fullName}"? This cannot be undone.`} confirmLabel="Delete" danger onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
};

export default TenantsPage;
