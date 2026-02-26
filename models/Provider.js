const mongoose = require('mongoose');

const ProviderSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Please add a provider name'], unique: true },
    address: { type: String, required: [true, 'Please add an address'] },
    telephone: { type: String, required: [true, 'Please add a telephone number'] }
});

module.exports = mongoose.model('Provider', ProviderSchema);