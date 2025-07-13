const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  jobId: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  link: { type: String, required: true },
  pubDate: { type: Date, default: Date.now },
  shortDescription: { type: String, default: '' },
  fullDescription: { type: String, default: '' },
  image: { type: String, default: null },
  location: { type: String, default: 'Unknown' },
  jobType: { type: String, default: 'Unknown' },
  company: { type: String, default: 'Unknown' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Job', JobSchema);
