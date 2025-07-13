// server/socket.js
const { Server } = require('socket.io');

let io;

function createSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('📡 Client connected:', socket.id);

    // ✅ Listen for import_status from ANY client (e.g., worker)
    socket.on('import_status', (data) => {
      console.log('📥 Received import_status from client (probably worker):', data);

      // 🔁 Rebroadcast to all connected clients (e.g., frontend)
      io.emit('import_status', data);
    });

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });
  });

  return Promise.resolve(io);
}

module.exports = {
  createSocket,
  getIO: () => io,
};
