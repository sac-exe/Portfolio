// app.js
require("dotenv").config();
const express = require("express");
const path = require("path");
const mainRoutes = require("./routes/main");

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", mainRoutes);

// Start server
connectDB().then(() => {
  app.listen(process.env.PORT || 5000, () => {
    console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
  });
});
