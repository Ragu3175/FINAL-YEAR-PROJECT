require('dotenv').config();
const mongoose = require('mongoose');

console.log("Testing connection to:", process.env.MONGO_URI.substring(0, 30) + "...");

mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000 // 5 seconds instead of 30
})
    .then(() => {
        console.log("✅ SUCCESS! Your computer can reach MongoDB Atlas.");
        process.exit(0);
    })
    .catch(err => {
        console.log("❌ FAILED!");
        console.log("Error Name:", err.name);
        console.log("Error Message:", err.message);
        console.log("\nPossible reasons:");
        console.log("1. Your IP is not whitelisted in Atlas (check Network Access -> 0.0.0.0/0)");
        console.log("2. Your local Firewall or Antivirus is blocking port 27017");
        console.log("3. Your Password in .env is incorrect");
        process.exit(1);
    });
