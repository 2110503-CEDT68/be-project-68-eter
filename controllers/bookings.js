const Booking = require('../models/Booking');
const Provider = require('../models/Provider');
const Car = require('../models/Car'); // <--- อย่าลืม Import Model Car

// @desc    Get all bookings
// @route   GET /api/v1/bookings
exports.getBookings = async (req, res, next) => {
    try {
        let query;
        // หากเป็น Admin ดูได้ทั้งหมด, User ธรรมดา ดูได้แค่ของตัวเอง
        if (req.user.role !== 'admin') {
            query = Booking.find({ user: req.user.id })
                .populate({ path: 'provider', select: 'name address telephone' })
                .populate({ path: 'car', select: 'make model year licensePlate dailyRate' }); // <--- ดึงข้อมูลรถมาแสดงด้วย
        } else {
            query = Booking.find()
                .populate({ path: 'provider', select: 'name address telephone' })
                .populate({ path: 'car', select: 'make model year licensePlate dailyRate' });
        }
        
        const bookings = await query;
        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Cannot find Booking' });
    }
};

// @desc    Get single booking by ID
// @route   GET /api/v1/bookings/:id
exports.getBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate({ path: 'provider', select: 'name address telephone' })
            .populate({ path: 'car', select: 'make model year licensePlate dailyRate' });

        // เช็คว่ามี Booking นี้ในระบบหรือไม่
        if (!booking) {
            return res.status(404).json({ success: false, message: `No booking with the id of ${req.params.id}` });
        }

        // เช็คสิทธิ์: ถ้าไม่ใช่เจ้าของ Booking และไม่ใช่ Admin จะไม่มีสิทธิ์ดู
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: `User ${req.user.id} is not authorized to view this booking` });
        }

        res.status(200).json({ success: true, data: booking });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Cannot find Booking' });
    }
};


// @desc    Add booking
// @route   POST /api/v1/providers/:providerId/bookings
exports.addBooking = async (req, res, next) => {
    try {
        req.body.provider = req.params.providerId;
        req.body.user = req.user.id; // ดึง ID จากคนที่ Log-in อยู่

        // เช็คว่า Provider มีอยู่จริงไหม (โค้ดเดิมของคุณ)
        const provider = await Provider.findById(req.params.providerId);
        if (!provider) {
            return res.status(404).json({ success: false, message: `No provider with the id of ${req.params.providerId}` });
        }

        // --- 1. เพิ่มบล็อกนี้ ป้องกันการจองซ้ำซ้อน (รถคันเดียวกัน ในวันเดียวกัน) ---
        const existingBooking = await Booking.findOne({
            car: req.body.car,
            date: req.body.date
        });

        if (existingBooking) {
            return res.status(400).json({ 
                success: false, 
                message: 'This car is already booked on this date. Please choose another car or date to avoid duplicate bookings.' 
            });
        }
        // ----------------------------------------------------------------

        // --- 2. โค้ดเดิม: เช็คสิทธิ์โควต้าจองได้แค่ 3 ครั้ง ---
        const existedBookings = await Booking.find({ user: req.user.id });
        if (existedBookings.length >= 3 && req.user.role !== 'admin') {
            return res.status(400).json({ success: false, message: `The user with ID ${req.user.id} has already made 3 bookings` });
        }

        // โค้ดส่วนที่เหลือ สร้าง Booking ลง Database...
        const booking = await Booking.create(req.body);
        res.status(201).json({ success: true, data: booking });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Cannot create Booking' });
    }
};

// @desc    Update booking
// @route   PUT /api/v1/bookings/:id
exports.updateBooking = async (req, res, next) => {
    try {
        let booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ success: false, message: `No booking with the id of ${req.params.id}` });
        }

        // Make sure user is booking owner or admin
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: `User ${req.user.id} is not authorized to update this booking` });
        }

        booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: booking });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Cannot update Booking' });
    }
};

// @desc    Delete booking
// @route   DELETE /api/v1/bookings/:id
exports.deleteBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ success: false, message: `No booking with the id of ${req.params.id}` });
        }

        // Make sure user is booking owner or admin
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: `User ${req.user.id} is not authorized to delete this booking` });
        }

        await booking.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Cannot delete Booking' });
    }
};