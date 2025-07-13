const cron = require('node-cron');
const fetchJobsFromXML = require('../services/jobFetcher');
const jobQueue = require('../jobs/queue');

const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '50');

const feeds = [
  'https://jobicy.com/?feed=job_feed',
  'https://jobicy.com/?feed=job_feed&job_categories=smm&job_types=full-time',
  'https://jobicy.com/?feed=job_feed&job_categories=seller&job_types=full-time&search_region=france',
  'https://jobicy.com/?feed=job_feed&job_categories=design-multimedia',
  'https://jobicy.com/?feed=job_feed&job_categories=data-science',
  'https://jobicy.com/?feed=job_feed&job_categories=copywriting',
  'https://jobicy.com/?feed=job_feed&job_categories=business',
  'https://jobicy.com/?feed=job_feed&job_categories=management',
  'https://www.higheredjobs.com/rss/articleFeed.cfm'
];

// 🔁 Runs every hour at minute 0
cron.schedule('0 * * * *', async () => {
  console.log(`Cron started at ${new Date().toLocaleString()}`);

  for (const feed of feeds) {
    try {
      console.log(`📡 Fetching from: ${feed}`);
      const jobs = await fetchJobsFromXML(feed);
      console.log(`📥 Fetched ${jobs.length} jobs`);

      for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
        const batch = jobs.slice(i, i + BATCH_SIZE);
        await jobQueue.add('job-import', { jobs: batch, sourceUrl: feed });
        console.log(`📤 Queued batch of ${batch.length} jobs`);
      }

    } catch (err) {
      console.error(`❌ Error fetching from ${feed}:`, err.message);
    }
  }

  console.log(`Cron run completed\n`);
});
