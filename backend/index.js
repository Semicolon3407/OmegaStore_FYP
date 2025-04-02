const express = require("express");
const dotenv = require("dotenv");
dotenv.config(); // Load environment variables first
const dbConnect = require("./config/dbConnect");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
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

const app = express();
const PORT = process.env.PORT || 5001; // Use env variable with fallback
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

// Middleware
app.use(morgan("dev")); // Log HTTP requests
app.use(
  cors({
    origin: FRONTEND_ORIGIN, // Configurable frontend origin
    credentials: true, // Allow cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use("/api/user", authRouter);
app.use("/api/products", productRouter);
app.use("/api/category", categoryRouter);
app.use("/api/brand", brandRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/color", colorRouter);
app.use("/api/enquiry", enqRouter);
app.use("/api/upload", uploadRouter);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// Connect Database and Start Server
const startServer = async () => {
  try {
    await dbConnect();
    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`CORS enabled for origin: ${FRONTEND_ORIGIN}`);
    });
  } catch (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1); // Exit process on failure
  }
};

startServer();