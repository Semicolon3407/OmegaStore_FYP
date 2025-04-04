const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
dotenv.config();
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
const chatRouter = require("./routes/chatRoutes");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");

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

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Make io available to routes
app.set("io", io);

app.use(morgan("dev"));
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/user", authRouter);
app.use("/api/products", productRouter);
app.use("/api/category", categoryRouter);
app.use("/api/brand", brandRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/color", colorRouter);
app.use("/api/enquiry", enqRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/chat", chatRouter);

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