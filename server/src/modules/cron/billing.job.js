import cron from 'node-cron';
import knex from '../../db/knex.js';

export const startBillingCronJob = () => {
  // Run daily at 1:00 AM
  cron.schedule('0 1 * * *', async () => {
    try {
      console.log('Running automated billing job...');
      const now = new Date();
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const targetDay = lastDay - 5;

      if (now.getDate() === targetDay) {
        console.log('Today is 5 days before the end of the month. Generating bills...');
        
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const billingPeriod = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;
        // Let's set due date to the 5th of the next month
        const dueDate = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-05`;

        const activeLeases = await knex('leases').where('status', 'active');

        let billsCreated = 0;

        for (const lease of activeLeases) {
          // Check if bill already exists to avoid duplicates
          const existingBill = await knex('bills').where({
            tenant_id: lease.tenant_id,
            billing_period: billingPeriod
          }).first();

          if (existingBill) continue;

          let amountDue = parseFloat(lease.monthly_rent);

          // If lease has a unit, sum ad-hoc charges
          if (lease.unit_id) {
            const charges = await knex('unit_charges').where({
              unit_id: lease.unit_id,
              billing_period: billingPeriod
            });
            const chargesSum = charges.reduce((sum, c) => sum + parseFloat(c.amount), 0);
            amountDue += chargesSum;
          }

          await knex('bills').insert({
            tenant_id: lease.tenant_id,
            billing_period: billingPeriod,
            amount_due: amountDue,
            due_date: dueDate,
            status: 'pending',
            notes: 'Automated monthly bill'
          });

          billsCreated++;
        }
        console.log(`Automated billing job completed. Generated ${billsCreated} bills for ${billingPeriod}.`);
      } else {
        console.log('Not the target day for billing. Skipping...');
      }
    } catch (err) {
      console.error('Error in automated billing job:', err);
    }
  });
};
