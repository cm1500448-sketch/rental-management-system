import * as dashboardRepository from './dashboard.repository.js';

export const getDashboard = async (ownerId) => {
  return dashboardRepository.getDashboardMetrics(ownerId);
};
