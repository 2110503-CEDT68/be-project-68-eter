const Provider = require('../models/Provider');

// @desc    Get all providers
// @route   GET /api/v1/providers
exports.getProviders = async (req, res, next) => {
    try {
        const providers = await Provider.find();
        res.status(200).json({ success: true, count: providers.length, data: providers });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

// เพิ่ม createProvider เพื่อให้มีข้อมูลเริ่มต้น (Admin)
exports.createProvider = async (req, res, next) => {
    try {
        const provider = await Provider.create(req.body);
        res.status(201).json({ success: true, data: provider });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};