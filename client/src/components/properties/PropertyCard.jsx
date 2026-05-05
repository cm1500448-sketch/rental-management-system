import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters.js';

const PropertyCard = ({ property, onDelete }) => {
  const isOccupied = property.occupancyStatus === 'occupied';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">{property.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{property.address}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${isOccupied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {isOccupied ? 'Occupied' : 'Vacant'}
        </span>
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
        <span className="capitalize">{property.type}</span>
        <span>{property.units} unit{property.units !== 1 ? 's' : ''}</span>
        <span className="font-medium text-gray-800">{formatCurrency(property.monthlyRent)}/mo</span>
      </div>
      <div className="flex gap-2">
        <Link to={`/properties/${property.id}`} className="flex-1 text-center text-xs py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
          View
        </Link>
        <button onClick={() => onDelete(property)} className="flex-1 text-xs py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
          Delete
        </button>
      </div>
    </div>
  );
};

export default PropertyCard;
