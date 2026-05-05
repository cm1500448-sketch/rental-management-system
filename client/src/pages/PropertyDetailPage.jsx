import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProperty, useUpdateProperty, useDeleteProperty } from '../hooks/useProperties.js';
import { useLeases } from '../hooks/useLeases.js';
import PropertyForm from '../components/properties/PropertyForm.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import UnitGrid from '../components/units/UnitGrid.jsx';

const PropertyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editError, setEditError] = useState('');
  const [activeTab, setActiveTab] = useState('units');

  const { data: property, isLoading, isError, refetch } = useProperty(id);
  const { data: leases } = useLeases();
  const updateProperty = useUpdateProperty();
  const deleteProperty = useDeleteProperty();

  const propertyLeases = leases?.filter((l) => l.propertyId === id) ?? [];

  const handleUpdate = async (formData) => {
    setEditError('');
    try {
      await updateProperty.mutateAsync({ id, ...formData });
      setEditing(false);
    } catch (err) {
      setEditError(err.message || 'Failed to update property');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProperty.mutateAsync(id);
      navigate('/properties');
    } catch (err) {
      alert(err.message || 'Failed to delete property');
      setShowDelete(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError || !property) return <ErrorMessage message="Property not found." />;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/properties')} className="text-sm text-blue-600 hover:underline mb-1">← Back</button>
          <h1 className="text-2xl font-bold text-gray-800">{property.name}</h1>
          <p className="text-sm text-gray-500">{property.address}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditing(!editing)} className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50">
            {editing ? 'Cancel' : 'Edit'}
          </button>
          <button onClick={() => setShowDelete(true)} className="text-sm px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">
            Delete
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('units')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'units' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Units
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Details & Leases
          </button>
        </nav>
      </div>

      {activeTab === 'units' && (
        <UnitGrid propertyId={id} onUnitCountChange={refetch} />
      )}

      {activeTab === 'details' && (
        <div className="space-y-6">
          {editing ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              {editError && <ErrorMessage message={editError} />}
              <PropertyForm
                defaultValues={{ name: property.name, address: property.address, type: property.type, units: property.units, monthlyRent: property.monthlyRent }}
                onSubmit={handleUpdate}
                onCancel={() => setEditing(false)}
                isSubmitting={updateProperty.isPending}
              />
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-6 grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Type</span><p className="font-medium capitalize">{property.type}</p></div>
              <div><span className="text-gray-500">Units</span><p className="font-medium">{property.units}</p></div>
              <div><span className="text-gray-500">Monthly Rent</span><p className="font-medium">{formatCurrency(property.monthlyRent)}</p></div>
              <div><span className="text-gray-500">Status</span>
                <p className={`font-medium ${property.occupancyStatus === 'occupied' ? 'text-green-600' : 'text-gray-500'}`}>
                  {property.occupancyStatus === 'occupied' ? 'Occupied' : 'Vacant'}
                </p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-700 mb-4">Leases</h2>
            {propertyLeases.length === 0 ? (
              <p className="text-sm text-gray-400">No leases for this property.</p>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="text-left text-gray-500 border-b"><th className="pb-2">Status</th><th className="pb-2">Start</th><th className="pb-2">End</th><th className="pb-2">Rent</th></tr></thead>
                <tbody>
                  {propertyLeases.map((l) => (
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
        </div>
      )}

      <ConfirmDialog isOpen={showDelete} title="Delete Property" message={`Delete "${property.name}"? This cannot be undone.`} confirmLabel="Delete" danger onConfirm={handleDelete} onCancel={() => setShowDelete(false)} />
    </div>
  );
};

export default PropertyDetailPage;
