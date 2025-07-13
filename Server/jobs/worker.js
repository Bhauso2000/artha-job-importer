const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const { io: Client } = require('socket.io-client');
const mongoose = require('mongoose');
require('dotenv').config();

const Job = require('../model/Job');
const ImportLog = require('../model/ImportLog');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Worker connected to MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

const socketServerUrl = process.env.SOCKET_SERVER_URL || 'http://localhost:8081';
const socket = Client(socketServerUrl, {
  transports: ['websocket'],
  reconnectionAttempts: 5,
  timeout: 10000,
  reconnectionDelay: 2000,
});

socket.on('connect', () => {
  console.log(`✅ Connected to Socket.IO server at ${socketServerUrl}`);
});
socket.on('connect_error', (err) => {
  console.error('❌ Socket.IO connection error:', err.message);
});
socket.on('disconnect', (reason) => {
  console.warn('⚠️ Socket.IO disconnected:', reason);
});
socket.on('reconnect_attempt', () => {
  console.warn('🔁 Socket.IO reconnecting...');
});
socket.on('reconnect_failed', () => {
  console.error('❌ Socket.IO reconnection failed');
});

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const MAX_CONCURRENCY = parseInt(process.env.MAX_CONCURRENCY || '5');

const worker = new Worker('job-import', async (job) => {
  const { jobs, sourceUrl } = job.data;

  let newJobs = 0;
  let updatedJobs = 0;
  const failedJobs = [];

  for (let i = 0; i < jobs.length; i++) {
    const raw = jobs[i];

    try {
      const jobId = raw.guid?._ || raw.guid || raw.id || raw.link || raw.title;
      if (!jobId) {
        console.warn('⚠️ Missing job ID, marking as failed');
        failedJobs.push({ error: 'Missing job ID', data: raw });
        continue;
      }

      const jobData = {
        jobId,
        title: raw.title,
        link: raw.link,
        pubDate: new Date(raw.pubDate || Date.now()),
        shortDescription: raw.shortDescription,
        fullDescription: raw.fullDescription,
        image: raw.image,
        location: raw.location,
        jobType: raw.jobType,
        company: raw.company,
      };

      const existing = await Job.findOne({ jobId });

      if (!existing) {
        await new Job(jobData).save();
        newJobs++;
        console.log(`🆕 Inserted: ${jobId}`);
      } else {
        const isChanged = Object.keys(jobData).some(
          key => String(existing[key]) !== String(jobData[key])
        );

        if (isChanged) {
          const result = await Job.updateOne({ jobId }, { $set: jobData });
          if (result.modifiedCount > 0) {
            updatedJobs++;
            console.log(`✅ Updated: ${jobId}`);
          }
        } else {
          console.log(`⏭️ No changes for: ${jobId}`);
        }
      }
    } catch (err) {
      console.error(`❌ Error processing job: ${err.message}`);
      failedJobs.push({ error: err.message, data: raw });
    }
  }

  // Save import log
  let logEntry;
  try {
    logEntry = new ImportLog({
      timestamp: new Date(),
      sourceUrl,
      totalFetched: jobs.length,
      totalImported: newJobs + updatedJobs,
      newJobs,
      updatedJobs,
      failedJobs,
    });
    await logEntry.save();
    console.log('📝 Import log saved');
  } catch (logErr) {
    console.error('❌ Import log save failed:', logErr.message);
  }

  // Emit import status
  console.log('[EMIT DEBUG] Socket connected:', socket.connected);
  try {
    if (socket.connected && logEntry) {
      const logData = logEntry.toObject();
      delete logData.__v;
      socket.emit('import_status', logData);
      console.log('📤 Emitted import_status to Socket.IO');
    }
  } catch (emitErr) {
    console.error('❌ Emit error:', emitErr.message);
  }

}, {
  connection,
  concurrency: MAX_CONCURRENCY,
});

// Worker lifecycle events
worker.on('completed', job => {
  console.log(`🎉 Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`🔥 Job ${job.id} failed: ${err.message}`);
});

worker.on('error', err => {
  console.error('💥 Worker error:', err.message);
});
