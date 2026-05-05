import bcrypt from 'bcrypt';

/**
 * Seed: 01_demo_data
 * Inserts representative demo data:
 *   - 1 owner user
 *   - 3 properties
 *   - 3 tenants
 *   - 2 active leases
 *   - 4 payments
 */

export async function seed(knex) {
  // Clean up in reverse FK order
  await knex('payments').del();
  await knex('leases').del();
  await knex('tenants').del();
  await knex('properties').del();
  await knex('users').del();

  // ── Owner user ──────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const [owner] = await knex('users')
    .insert({
      name: 'Alice Owner',
      email: 'alice@example.com',
      password: passwordHash,
    })
    .returning('*');

  // ── Properties ──────────────────────────────────────────────────────────────
  const [propA, propB, propC] = await knex('properties')
    .insert([
      {
        owner_id: owner.id,
        name: 'Sunset Apartments 1A',
        address: '12 Sunset Blvd, Unit 1A, Springfield, IL 62701',
        type: 'apartment',
        units: 1,
        monthly_rent: 1200.00,
      },
      {
        owner_id: owner.id,
        name: 'Oak Street House',
        address: '45 Oak Street, Springfield, IL 62702',
        type: 'house',
        units: 3,
        monthly_rent: 2500.00,
      },
      {
        owner_id: owner.id,
        name: 'Downtown Commercial Unit',
        address: '100 Main Street, Suite 5, Springfield, IL 62703',
        type: 'commercial',
        units: 1,
        monthly_rent: 3000.00,
      },
    ])
    .returning('*');

  // ── Tenants ──────────────────────────────────────────────────────────────────
  const [tenantA, tenantB, tenantC] = await knex('tenants')
    .insert([
      {
        owner_id: owner.id,
        full_name: 'Bob Tenant',
        email: 'bob@example.com',
        phone: '+1-555-0101',
        emergency_contact_name: 'Carol Tenant',
        emergency_contact_phone: '+1-555-0102',
      },
      {
        owner_id: owner.id,
        full_name: 'Diana Renter',
        email: 'diana@example.com',
        phone: '+1-555-0201',
        emergency_contact_name: null,
        emergency_contact_phone: null,
      },
      {
        owner_id: owner.id,
        full_name: 'Eve Business',
        email: 'eve@example.com',
        phone: '+1-555-0301',
        emergency_contact_name: 'Frank Business',
        emergency_contact_phone: '+1-555-0302',
      },
    ])
    .returning('*');

  // ── Leases (2 active) ────────────────────────────────────────────────────────
  const today = new Date();
  const leaseStartA = new Date(today.getFullYear(), today.getMonth() - 3, 1);
  const leaseEndA = new Date(today.getFullYear() + 1, today.getMonth() - 3, 1);

  const leaseStartB = new Date(today.getFullYear(), today.getMonth() - 1, 15);
  const leaseEndB = new Date(today.getFullYear() + 1, today.getMonth() - 1, 15);

  const [leaseA, leaseB] = await knex('leases')
    .insert([
      {
        property_id: propA.id,
        tenant_id: tenantA.id,
        start_date: leaseStartA.toISOString().split('T')[0],
        end_date: leaseEndA.toISOString().split('T')[0],
        monthly_rent: 1200.00,
        status: 'active',
      },
      {
        property_id: propB.id,
        tenant_id: tenantB.id,
        start_date: leaseStartB.toISOString().split('T')[0],
        end_date: leaseEndB.toISOString().split('T')[0],
        monthly_rent: 2500.00,
        status: 'active',
      },
    ])
    .returning('*');

  // ── Payments (4 total across the 2 leases) ───────────────────────────────────
  const pmtDate1 = new Date(today.getFullYear(), today.getMonth() - 2, 5);
  const pmtDate2 = new Date(today.getFullYear(), today.getMonth() - 1, 5);
  const pmtDate3 = new Date(today.getFullYear(), today.getMonth(), 5);
  const pmtDate4 = new Date(today.getFullYear(), today.getMonth() - 1, 10);

  await knex('payments').insert([
    {
      lease_id: leaseA.id,
      amount: 1200.00,
      payment_date: pmtDate1.toISOString().split('T')[0],
      method: 'bank_transfer',
      balance_remaining: 0.00,
    },
    {
      lease_id: leaseA.id,
      amount: 1200.00,
      payment_date: pmtDate2.toISOString().split('T')[0],
      method: 'bank_transfer',
      balance_remaining: 0.00,
    },
    {
      lease_id: leaseA.id,
      amount: 1200.00,
      payment_date: pmtDate3.toISOString().split('T')[0],
      method: 'cash',
      balance_remaining: 0.00,
    },
    {
      lease_id: leaseB.id,
      amount: 2500.00,
      payment_date: pmtDate4.toISOString().split('T')[0],
      method: 'cheque',
      balance_remaining: 0.00,
    },
  ]);
}
