import React, { useState } from 'react';
import { useProperties, useCreateProperty, useDeleteProperty } from '../hooks/useProperties.js';
import PropertyCard from '../components/properties/PropertyCard.jsx';
import PropertyForm from '../components/properties/PropertyForm.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import Pagination from '../components/common/Pagination.jsx';

const PropertiesPage = () => {
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formError, setFormError] = useState('');

  const { data, isLoading, isError, error } = useProperties(page);
  const createProperty = useCreateProperty();
  const deleteProperty = useDeleteProperty();

  const handleCreate = async (formData) => {
    setFormError('');
    try {
      await createProperty.mutateAsync(formData);
      setShowForm(false);
    } catch (err) {
      setFormError(err.message || 'Failed to create property');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProperty.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      alert(err.message || 'Failed to delete property');
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message={error?.message} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Properties</h1>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
          + Add Property
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">New Property</h2>
          {formError && <ErrorMessage message={formError} />}
          <PropertyForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            isSubmitting={createProperty.isPending}
          />
        </div>
      )}

      {data?.data?.length === 0 ? (
        <p className="text-gray-400 text-sm">No properties yet. Add your first one above.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.data?.map((p) => (
            <PropertyCard key={p.id} property={p} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      <Pagination page={page} pageSize={data?.meta?.pageSize} total={data?.meta?.total} onPageChange={setPage} />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Property"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default PropertiesPage;
