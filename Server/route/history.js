const express = require('express');
const router = express.Router();
const ImportLog = require('../model/ImportLog');

router.get('/', async (req, res) => {
  const logs = await ImportLog.find().sort({ timestamp: -1 });
  res.json(logs);
});

module.exports = router;
