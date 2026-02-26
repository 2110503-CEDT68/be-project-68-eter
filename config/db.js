const mongoose = require('mongoose');

const connectDB = async () => {
    // ลบ options ออก เหลือแค่ตัวแปร process.env.MONGO_URI
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
};

module.exports = connectDB;