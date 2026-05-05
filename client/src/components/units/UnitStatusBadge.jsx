import React from 'react';

const UnitStatusBadge = ({ status }) => {
  const isVacant = status === 'vacant';
  const colorClass = isVacant
    ? 'bg-gray-100 text-gray-800'
    : 'bg-green-100 text-green-800';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
    >
      {isVacant ? 'VACANT' : 'OCCUPIED'}
    </span>
  );
};

export default UnitStatusBadge;
