require('dotenv').config();
const express = require('express');
const dbConnect = require('./config/dbconnect');
const authRouter = require('./routes/authRoutes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const cookieParser = require('cookie-parser');
const cors = require('cors'); // Added CORS for handling cross-origin requests

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // Adjust this to your frontend URL
    credentials: true, // Allow cookies to be sent
}));
app.use(cookieParser()); // Moved cookie parser before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect Database
dbConnect().then(() => {
    console.log("Database connected successfully");
}).catch(err => {
    console.error("Database connection failed:", err);
    process.exit(1);  // Exit the process if DB connection fails
});

// Routes
app.use("/api/user", authRouter);  // Registering auth routes

// Error Handling Middlewares
app.use(notFound);  // Not Found Error
app.use(errorHandler);  // Custom error handler

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
