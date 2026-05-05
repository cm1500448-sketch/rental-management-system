import React from 'react';

const styles = {
  pending: 'bg-yellow-100 text-yellow-700',
  under_review: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const labels = {
  pending: 'Pending',
  under_review: 'Under Review',
  paid: 'Paid',
  rejected: 'Rejected',
};

const BillStatusBadge = ({ status }) => (
  <span className={`text-xs px-2 py-1 rounded-full font-medium ${styles[status] || 'bg-gray-100 text-gray-500'}`}>
    {labels[status] || status}
  </span>
);

export default BillStatusBadge;
