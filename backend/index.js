const express = require("express");
const dbConnect = require("./config/dbConnect");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const dotenv = require("dotenv").config();
const app = express();
const PORT = 5001;
const authRouter = require("./routes/authRoutes");
const productRouter = require("./routes/productRoutes");
const categoryRouter = require("./routes/prodcategoryRoutes");
const brandRouter = require("./routes/brandRoutes");
const colorRouter = require("./routes/colorRoutes");
const enqRouter = require("./routes/enqRoutes");
const couponRouter = require("./routes/couponRoutes");
const uploadRouter = require("./routes/uploadRoutes");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");

// Middleware
app.use(morgan('dev'));  // Use Morgan with 'dev' format for logging HTTP requests
app.use(cors());
app.use(cookieParser());
app.use(express.json());  // Replaced bodyParser.json() with express.json()
app.use(express.urlencoded({ extended: false }));  // Replaced bodyParser.urlencoded() with express.urlencoded()

// Connect Database
dbConnect().then(() => {
    console.log("Database connected successfully");
}).catch(err => {
    console.error("Database connection failed:", err);
    process.exit(1);  // Exit the process if DB connection fails
});

// Routes
app.use("/api/user", authRouter); 
app.use("/api/product", productRouter);
app.use("/api/category", categoryRouter);
app.use("/api/brand", brandRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/color", colorRouter);
app.use("/api/enquiry", enqRouter);
app.use("/api/upload", uploadRouter);

// Error Handling Middlewares
app.use(notFound);  // Not Found Error
app.use(errorHandler);  // Custom error handler

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
