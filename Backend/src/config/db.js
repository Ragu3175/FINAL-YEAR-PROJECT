const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        console.log("Attempting to connect with URI starting with:", process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 20) : "UNDEFINED");
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;