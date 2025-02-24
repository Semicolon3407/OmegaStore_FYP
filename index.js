require('dotenv').config();
const express = require('express');
const dbConnect = require('./config/dbconnect');
const authRouter = require('./routes/authRoutes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());

// Connect Database
dbConnect().then(() => {
    console.log("Database connected successfully");
}).catch(err => {
    console.error("Database connection failed:", err);
    process.exit(1);  // Exit the process if DB connection fails
});

// Routes
app.use("/api/user", authRouter);  // This is where auth routes are registered

// Error Handling Middlewares
app.use(notFound);  // Not Found Error
app.use(errorHandler);  // Custom error handler

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
