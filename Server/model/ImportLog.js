const mongoose = require('mongoose');
const ImportLogSchema = new mongoose.Schema({
  timestamp: Date,
  sourceUrl: String,
  totalFetched: Number,
  totalImported: Number,
  newJobs: Number,
  updatedJobs: Number,
  failedJobs: [{ reason: String, data: Object }],
});
module.exports = mongoose.model('ImportLog', ImportLogSchema);
