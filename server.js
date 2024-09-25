const express = require("express");
const dotenv = require("dotenv");
const { connection } = require("./config/db");
const userRoutes = require("./routes/userRouters");
const chatRoutes = require("./routes/chatRouter");
const messageRoutes = require("./routes/messageRoutes");
const cors = require("cors");
const path = require("path");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use(express.static(path.join(__dirname, 'client')));
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);


// Serve the signup page
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'signup.html'));
});

// Serve the login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'login.html'));
});

// Serve the main chat interface
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, async () => {
    try {
        await connection;
        console.log("MongoDB connected");
        console.log(`Server running on port ${PORT}`);
    } catch (err) {
        console.error("Error connecting to MongoDB", err.message);
    }
});

// Socket.IO Setup
const socketSetup = require("./socket/socket");
socketSetup(server); 
