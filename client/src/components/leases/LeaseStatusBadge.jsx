import React from 'react';

const LeaseStatusBadge = ({ lease }) => {
  if (lease.isOverdue) {
    return <span className="text-xs px-2 py-1 rounded-full font-medium bg-red-100 text-red-700">Overdue</span>;
  }
  if (lease.isExpiringSoon) {
    return <span className="text-xs px-2 py-1 rounded-full font-medium bg-amber-100 text-amber-700">Expiring Soon</span>;
  }
  if (lease.status === 'active') {
    return <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-700">Active</span>;
  }
  if (lease.status === 'terminated') {
    return <span className="text-xs px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-500">Terminated</span>;
  }
  return <span className="text-xs px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-500">Expired</span>;
};

export default LeaseStatusBadge;
