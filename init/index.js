require('dotenv').config();
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listning.js");

// ✅ Mongo URL from .env
const MONGO_URL = process.env.MONGO_URL;

main() 
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
  })
  .catch((err) => {
    console.log("❌ MongoDB connection error:", err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

// 🌱 Insert sample data
const initDB = async () => {
  try {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({
      ...obj,
      owner: "68ef5e4429f164debd5d3397"
    }));
    await Listing.insertMany(initData.data);
    console.log("🌱 Sample data initialized successfully!");
  } catch (err) {
    console.log("❌ Error initializing data:", err);
  } finally {
    mongoose.connection.close();
  }
};

initDB();
