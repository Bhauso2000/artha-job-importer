const { Queue } = require('bullmq');
const IORedis = require('ioredis');

const connection = new IORedis({  maxRetriesPerRequest: null});
const jobQueue = new Queue('job-import', { connection });

module.exports = jobQueue;
