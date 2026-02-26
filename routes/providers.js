const express = require('express');
const { getProviders, createProvider } = require('../controllers/providers');

// Router ของ Booking และ Car
const bookingRouter = require('./bookings');
const carRouter = require('./cars'); 

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use('/:providerId/bookings', bookingRouter);
router.use('/:providerId/cars', carRouter); 

router.route('/')
    .get(protect, getProviders)
    .post(protect, authorize('admin'), createProvider);

module.exports = router;