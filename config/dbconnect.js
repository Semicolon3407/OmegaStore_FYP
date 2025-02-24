// config/dbConnect.js
const mongoose = require("mongoose");

const dbConnect = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL);
        console.log(`Database connected successfully: ${conn.connection.host}`);
    } catch (error) {
        console.log("Database Error:", error);
        process.exit(1); // Exit the process with failure
    }
};

module.exports = dbConnect;
