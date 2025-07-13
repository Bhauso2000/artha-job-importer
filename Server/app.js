require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const historyRoutes = require('./route/history');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/history', historyRoutes);
app.get('/', (req, res) => res.send('Artha Job Importer API is running '));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

module.exports = app;
