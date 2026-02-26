const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    date: { 
        type: Date, 
        required: [true, 'Please add a booking date'] 
    },
    user: { 
        type: mongoose.Schema.ObjectId, 
        ref: 'User', 
        required: true 
    },
    provider: { 
        type: mongoose.Schema.ObjectId, 
        ref: 'Provider', 
        required: true 
    },
    car: { // เพิ่มฟิลด์รถเข้ามา
        type: mongoose.Schema.ObjectId, 
        ref: 'Car', 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Booking', BookingSchema);