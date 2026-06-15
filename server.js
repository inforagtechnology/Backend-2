require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Route imports
const authRouter = require("./routes/authRouter");
const adminRoute = require("./routes/adminRoute");
const admissionRouter = require("./routes/admissionRouter");
const enquiryRouter = require("./routes/enquiryRouter");
const registrationRouter = require("./routes/registrationRouter");
const dashboardRoute = require("./routes/dashboardRoute");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => {
  res.json({ msg: "Enquiry System API is running 🚀" });
});

// Routes
app.use("/auth", authRouter);
app.use("/admin", adminRoute);
app.use("/admission", admissionRouter);
app.use("/enquiry", enquiryRouter);
app.use("/registration", registrationRouter);
app.use("/dashboard", dashboardRoute);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ msg: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ msg: "Internal server error", error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
