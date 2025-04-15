const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
dotenv.config();
const dbConnect = require("./config/dbConnect");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const authRouter = require("./routes/authRoutes");
const productRouter = require("./routes/productRoutes");
const brandRouter = require("./routes/brandRoutes");
const couponRouter = require("./routes/couponRoutes");
const uploadRouter = require("./routes/uploadRoutes");
const chatRouter = require("./routes/chatRoutes");
const heroBannerRouter = require("./routes/heroBannerRoutes");
const recommendationRouter = require("./routes/recommendationRoutes");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    credentials: true,
  },
});

const PORT = process.env.PORT || 5001;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
  socket.on("error", (err) => {
    console.error("Socket.IO error:", err);
  });
});

app.set("io", io);

app.use(morgan("dev"));
app.use(
  cors({
    origin: [
      FRONTEND_ORIGIN,
      "https://rc-epay.esewa.com.np",
      "https://epay.esewa.com.np",
      "https://uat.esewa.com.np",
      "https://esewa.com.np",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use("/uploads", express.static(path.join(__dirname, "Uploads")));

app.use("/api/user", authRouter);
app.use("/api/products", productRouter);
app.use("/api/brand", brandRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/chat", chatRouter);
app.use("/api/hero-banners", heroBannerRouter);
app.use("/api/recommendations", recommendationRouter);

app.use(notFound);
app.use(errorHandler);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

const startServer = async () => {
  try {
    await dbConnect();
    console.log("Database connected successfully");
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`CORS enabled for origin: ${FRONTEND_ORIGIN}`);
    });
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
};

startServer();