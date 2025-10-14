// connection.js
const { MongoClient } = require("mongodb");
require("dotenv").config();

let db;

async function connectDB() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  db = client.db("portfolioDB");
  console.log("✅ Connected to MongoDB Atlas");
}

function getDB() {
  return db;
}

module.exports = { connectDB, getDB };
