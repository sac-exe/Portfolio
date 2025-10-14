// routes/main.js
const express = require("express");
const router = express.Router();
const { getDB } = require("../connection");

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

router.get("/work", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/work.html"));
});

module.exports = router;
