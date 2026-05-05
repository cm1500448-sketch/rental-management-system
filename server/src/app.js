import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes.js';
import propertiesRoutes from './modules/properties/properties.routes.js';
import tenantsRoutes from './modules/tenants/tenants.routes.js';
import leasesRoutes from './modules/leases/leases.routes.js';
import paymentsRoutes from './modules/payments/payments.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import billsRoutes from './modules/bills/bills.routes.js';
import portalRoutes from './modules/portal/portal.routes.js';
import unitsRoutes from './modules/units/units.routes.js';
import errorHandler from './middleware/errorHandler.js';

const createApp = () => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/properties', propertiesRoutes);
  app.use('/api/tenants', tenantsRoutes);
  app.use('/api/leases', leasesRoutes);
  // Payments are nested under leases: /api/leases/:leaseId/payments
  app.use('/api/leases/:leaseId/payments', paymentsRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/units', unitsRoutes);
  app.use('/api/bills', billsRoutes);
  app.use('/api/portal', portalRoutes);

  // 404 handler for unmatched routes
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Route not found', details: [] },
    });
  });

  // Centralised error handler — must be last
  app.use(errorHandler);

  return app;
};

export default createApp;
