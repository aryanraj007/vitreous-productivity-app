const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const authRoutes = require("./routes/user");
const taskRoutes = require("./routes/task");

// ─── Express App ────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// ─── HTTP Server + Socket.io ────────────────────────────────────
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
    },
});

// Make io accessible in route handlers via req.app.get("io")
app.set("io", io);

// ─── Socket.io Authentication & Room Joining ────────────────────
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error("Authentication error: No token provided."));
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        next();
    } catch (err) {
        return next(new Error("Authentication error: Invalid token."));
    }
});

io.on("connection", (socket) => {
    console.log(`⚡ Socket connected: ${socket.id} (User: ${socket.userId})`);
    // Join user-specific room for targeted event emission
    socket.join(socket.userId);

    socket.on("disconnect", () => {
        console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
});

// ─── API Routes ─────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Real-Time Productivity Management System API" });
});

// ─── Global Error Handler ───────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
});

// ─── MongoDB Connection & Server Start ──────────────────────────
const PORT = process.env.PORT || 8800;
const { MongoMemoryServer } = require("mongodb-memory-server");

async function startServer() {
    try {
        console.log("⏳ Attempting to connect to MongoDB Atlas...");
        await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
        console.log("✅ MongoDB Atlas connected successfully.");
    } catch (err) {
        console.warn("⚠️ Atlas connection failed (likely an IP Whitelist issue). Error:", err.message);
        console.log("🚀 Booting up an emergency Local In-Memory Database so your project still works!...");
        
        const mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
        console.log("✅ Local In-Memory MongoDB connected successfully.");
    }

    server.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}

startServer();
