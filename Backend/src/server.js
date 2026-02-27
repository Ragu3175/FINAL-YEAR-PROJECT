require("dotenv").config();
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const app = require("./app");
const connectDB = require("./config/db");

const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*", // Adjust for production
        methods: ["GET", "POST"]
    }
});

// Store io instance for use in controllers
app.set('socketio', io);

io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('❌ Client disconnected');
    });
});

const startServer = async () => {
    await connectDB();

    server.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
};

startServer();