// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const listingsRoutes = require('./routes/listings');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');

const { authMiddleware } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { 
  cors: { 
    origin: ["http://localhost:3000", "http://localhost:5173"], 
    methods: ["GET", "POST"]
  } 
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Socket.io for real-time chat
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('No token'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.user.id);
  socket.on('join-room', (roomId) => socket.join(roomId)); // Room per listing
  socket.on('send-message', (data) => {
    io.to(data.listingId).emit('receive-message', { ...data, from: socket.user });
  });
  socket.on('disconnect', () => console.log('User disconnected'));
});

// MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bimsdb')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Test
app.get('/', (req, res) => res.json({ message: 'BIMS Backend Running' }));

server.listen(PORT, () => console.log(`Server on port ${PORT}`));