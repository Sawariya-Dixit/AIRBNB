if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listning.js");

const MONGO_URL = process.env.MONGO_URL;

async function main() {
  try {
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(" Connected to MongoDB Atlas");

    // Connection ready → now initialize DB
    await initDB();

  } catch (err) {
    console.log("MongoDB connection error:", err);
  } finally {
    mongoose.connection.close();
  }
}

// Insert sample data
const initDB = async () => {
  try {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({
      ...obj,
      owner: "690c2c9add0be0233378d916"  // valid user id
    }));
    await Listing.insertMany(initData.data);
    console.log(" Sample data initialized successfully!");
  } catch (err) {
    console.log(" Error initializing data:", err);
  }
};

main();
