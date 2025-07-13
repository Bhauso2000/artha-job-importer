require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const { createSocket } = require('./socket');
const app = require('./app'); 

const server = http.createServer(app);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

const PORT = process.env.PORT || 8081;
server.listen(PORT, async () => {
  await createSocket(server);
  console.log(`🚀 API Server running at http://localhost:${PORT}`);
});
