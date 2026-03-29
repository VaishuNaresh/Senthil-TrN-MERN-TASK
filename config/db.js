const mongoose = require("mongoose");
const user = require("../models/User");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");
        // ✅ RUN ONLY ONCE (then remove this block)
        // await user.updateMany(
        //     { isActive: { $exists: false } }, // only missing field
        //     { $set: { isActive: true } }
        // );

        // console.log("isActive updated for old users");
    } catch (error) {
        console.error("DB connection error:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;