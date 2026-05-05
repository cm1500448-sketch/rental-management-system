import 'dotenv/config';
import createApp from './app.js';
import { config } from './config/index.js';
import { startBillingCronJob } from './modules/cron/billing.job.js';

const app = createApp();

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port} [${config.nodeEnv}]`);
  startBillingCronJob();
});
