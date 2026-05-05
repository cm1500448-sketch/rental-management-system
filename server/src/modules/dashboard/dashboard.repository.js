import knex from '../../db/knex.js';

export const getDashboardMetrics = async (ownerId) => {
  // Aggregate metrics via CTE
  const metricsResult = await knex.raw(`
    WITH
      property_stats AS (
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE EXISTS (
            SELECT 1 FROM leases l WHERE l.property_id = p.id AND l.status = 'active'
          )) AS occupied
        FROM properties p
        WHERE p.owner_id = :ownerId
      ),
      monthly_payments AS (
        SELECT COALESCE(SUM(py.amount), 0) AS total
        FROM payments py
        JOIN leases l ON py.lease_id = l.id
        JOIN properties p ON l.property_id = p.id
        WHERE p.owner_id = :ownerId
          AND DATE_TRUNC('month', py.payment_date) = DATE_TRUNC('month', CURRENT_DATE)
      ),
      expected_rent AS (
        SELECT COALESCE(SUM(l.monthly_rent), 0) AS total
        FROM leases l
        JOIN properties p ON l.property_id = p.id
        WHERE p.owner_id = :ownerId AND l.status = 'active'
      )
    SELECT
      ps.total::int          AS total_properties,
      ps.occupied::int       AS occupied_properties,
      (ps.total - ps.occupied)::int AS vacant_properties,
      er.total::numeric      AS total_monthly_rent_expected,
      mp.total::numeric      AS total_payments_this_month
    FROM property_stats ps, monthly_payments mp, expected_rent er
  `, { ownerId });

  const metrics = metricsResult.rows[0];

  // Recent payments (5 most recent)
  const recentPaymentsResult = await knex('payments')
    .join('leases', 'payments.lease_id', 'leases.id')
    .join('properties', 'leases.property_id', 'properties.id')
    .where('properties.owner_id', ownerId)
    .select(
      'payments.id',
      'payments.lease_id as leaseId',
      'payments.amount',
      'payments.payment_date as paymentDate',
      'payments.method',
      'payments.balance_remaining as balanceRemaining',
      'payments.created_at as createdAt'
    )
    .orderBy('payments.payment_date', 'desc')
    .limit(5);

  // Expiring leases (within 30 days)
  const expiringLeasesResult = await knex('leases')
    .join('properties', 'leases.property_id', 'properties.id')
    .join('tenants', 'leases.tenant_id', 'tenants.id')
    .where('properties.owner_id', ownerId)
    .where('leases.status', 'active')
    .whereBetween('leases.end_date', [
      knex.raw('CURRENT_DATE'),
      knex.raw("CURRENT_DATE + INTERVAL '30 days'"),
    ])
    .select(
      'leases.id',
      'leases.property_id as propertyId',
      'leases.tenant_id as tenantId',
      'leases.start_date as startDate',
      'leases.end_date as endDate',
      'leases.monthly_rent as monthlyRent',
      'leases.status',
      'tenants.full_name as tenantFullName',
      'properties.name as propertyName'
    )
    .orderBy('leases.end_date', 'asc');

  // Overdue leases
  const overdueLeasesResult = await knex('leases')
    .join('properties', 'leases.property_id', 'properties.id')
    .join('tenants', 'leases.tenant_id', 'tenants.id')
    .where('properties.owner_id', ownerId)
    .where('leases.status', 'active')
    .whereRaw(`
      CURRENT_DATE > (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '5 days')
      AND NOT EXISTS (
        SELECT 1 FROM payments p
        WHERE p.lease_id = leases.id
          AND DATE_TRUNC('month', p.payment_date) = DATE_TRUNC('month', CURRENT_DATE)
      )
    `)
    .select(
      'leases.id',
      'leases.property_id as propertyId',
      'leases.tenant_id as tenantId',
      'leases.start_date as startDate',
      'leases.end_date as endDate',
      'leases.monthly_rent as monthlyRent',
      'leases.status',
      'tenants.full_name as tenantFullName',
      'properties.name as propertyName'
    );

  return {
    totalProperties: metrics.total_properties,
    occupiedProperties: metrics.occupied_properties,
    vacantProperties: metrics.vacant_properties,
    totalMonthlyRentExpected: parseFloat(metrics.total_monthly_rent_expected),
    totalPaymentsThisMonth: parseFloat(metrics.total_payments_this_month),
    recentPayments: recentPaymentsResult.map((p) => ({
      ...p,
      amount: parseFloat(p.amount),
      balanceRemaining: parseFloat(p.balanceRemaining),
    })),
    expiringLeases: expiringLeasesResult.map((l) => ({
      ...l,
      monthlyRent: parseFloat(l.monthlyRent),
      tenantFullName: l.tenantFullName,
      propertyName: l.propertyName,
    })),
    overdueLeases: overdueLeasesResult.map((l) => ({
      ...l,
      monthlyRent: parseFloat(l.monthlyRent),
      tenantFullName: l.tenantFullName,
      propertyName: l.propertyName,
    })),
  };
};
