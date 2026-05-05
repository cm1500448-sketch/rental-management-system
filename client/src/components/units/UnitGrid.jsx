import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import UnitStatusBadge from './UnitStatusBadge.jsx';
import { useUnitsByProperty, useCreateUnit } from '../../hooks/useUnits.js';
import Button from '../common/Button.jsx';
import Input from '../common/Input.jsx';
import Modal from '../common/Modal.jsx';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { UNIT_TYPES, getUnitTypeLabel, UNIT_TYPE_COLORS } from '../../utils/unitTypes.js';

const unitSchema = z.object({
  unitNumber: z.string().min(1, 'Unit number is required').max(50),
  unitType: z.string().optional(),
  description: z.string().max(255).optional(),
});

const UnitTypeBadge = ({ unitType }) => {
  if (!unitType) return null;
  const colorClass = UNIT_TYPE_COLORS[unitType] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${colorClass}`}>
      {getUnitTypeLabel(unitType)}
    </span>
  );
};

const UnitGrid = ({ propertyId, onUnitCountChange }) => {
  const { data: units = [], isLoading } = useUnitsByProperty(propertyId);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const createMutation = useCreateUnit();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(unitSchema) });

  const onSubmit = (data) => {
    createMutation.mutate(
      { propertyId, data },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          reset();
          if (onUnitCountChange) onUnitCountChange();
        },
      }
    );
  };

  if (isLoading) return <div className="p-4 text-gray-500">Loading units...</div>;

  const occupiedCount = units.filter((u) => u.status === 'occupied').length;
  const vacantCount = units.length - occupiedCount;

  // Group by unit type for summary
  const typeSummary = units.reduce((acc, u) => {
    const key = u.unitType || 'unspecified';
    if (!acc[key]) acc[key] = { total: 0, occupied: 0 };
    acc[key].total++;
    if (u.status === 'occupied') acc[key].occupied++;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Units ({occupiedCount} occupied / {vacantCount} vacant)
        </h3>
        <Button onClick={() => setIsModalOpen(true)} variant="primary" size="sm">
          + Add Unit
        </Button>
      </div>

      {/* Type summary */}
      {Object.keys(typeSummary).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(typeSummary).map(([type, counts]) => (
            <div key={type} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs">
              <span className="font-medium text-gray-700">
                {type === 'unspecified' ? 'Unspecified' : getUnitTypeLabel(type)}
              </span>
              <span className="text-gray-400">·</span>
              <span className="text-green-600">{counts.occupied} occupied</span>
              <span className="text-gray-400">/</span>
              <span className="text-gray-500">{counts.total - counts.occupied} vacant</span>
            </div>
          ))}
        </div>
      )}

      {units.length === 0 ? (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center text-gray-500">
          No units added yet. Add a unit to start tracking occupancy individually.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {units.map((unit) => (
            <Link
              key={unit.id}
              to={`/units/${unit.id}`}
              className="block bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-gray-900 truncate pr-2">{unit.unitNumber}</span>
                <UnitStatusBadge status={unit.status} />
              </div>
              {unit.unitType && (
                <div className="mb-2">
                  <UnitTypeBadge unitType={unit.unitType} />
                </div>
              )}
              <div className="text-sm text-gray-500 min-h-[1.25rem]">
                {unit.status === 'occupied' && unit.activeLease ? (
                  unit.activeLease.tenantFullName
                ) : (
                  <span className="italic text-gray-400">Available</span>
                )}
              </div>
              {unit.description && (
                <p className="text-xs text-gray-400 mt-1 truncate">{unit.description}</p>
              )}
            </Link>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Unit">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Unit Number / Label"
            {...register('unitNumber')}
            error={errors.unitNumber?.message}
            placeholder="e.g. 1A, 101, Ground Floor"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Type</label>
            <select
              {...register('unitType')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select type (optional)</option>
              {UNIT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <Input
            label="Description (Optional)"
            {...register('description')}
            error={errors.description?.message}
            placeholder="e.g. Ground floor, sea view"
          />

          {createMutation.isError && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {createMutation.error?.message || 'Failed to create unit.'}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={createMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Saving...' : 'Save Unit'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UnitGrid;
