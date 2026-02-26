const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema({
    make: { 
        type: String, 
        required: [true, 'Please add a car make (e.g., Toyota, Honda)'] 
    },
    model: { 
        type: String, 
        required: [true, 'Please add a car model (e.g., Camry, Civic)'] 
    },
    year: { 
        type: String, 
        required: [true, 'Please add a car year'] 
    },
    licensePlate: { 
        type: String, 
        required: [true, 'Please add a license plate'],
        unique: true
    },
    dailyRate: {
        type: Number,
        required: [true, 'Please add a daily rental rate']
    },
    provider: {
        type: mongoose.Schema.ObjectId,
        ref: 'Provider',
        required: [true, 'Please add a provider for this car']
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Car', CarSchema);