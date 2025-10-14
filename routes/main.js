// routes/main.js
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

router.get("/work", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/work.html"));
});

module.exports = router;
