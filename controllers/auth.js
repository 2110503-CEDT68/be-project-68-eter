const User = require('../models/User');
const jwt = require('jsonwebtoken'); // เพิ่มการนำเข้า jwt เพื่อใช้ตรวจสอบ Token

const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();
    res.status(statusCode).cookie('token', token, {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    }).json({ success: true, token });
};

// @desc    Register user
// @route   POST /api/v1/auth/register
exports.register = async (req, res, next) => {
    try {
        // --- ดักการทำงาน: ห้าม Register ถ้าล็อกอินอยู่แล้ว ---
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies.token) {
            token = req.cookies.token;
        }

        if (token && token !== 'none') {
            try {
                jwt.verify(token, process.env.JWT_SECRET);
                return res.status(400).json({ success: false, message: 'You are already logged in. Please log out first before registering a new account.' });
            } catch (err) {}
        }
        // ---------------------------------------------

        const { name, telephone, email, password, role } = req.body;
        const user = await User.create({ name, telephone, email, password, role });
        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
exports.login = async (req, res, next) => {
    try {
        // --- ดักการทำงาน: ห้าม Login ซ้อนถ้ามี Token ที่ยังใช้งานได้อยู่ ---
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies.token) {
            token = req.cookies.token;
        }

        if (token && token !== 'none') {
            try {
                jwt.verify(token, process.env.JWT_SECRET);
                return res.status(400).json({ success: false, message: 'You are already logged in. Please log out first before switching accounts.' });
            } catch (err) {
                // ถ้า Token หมดอายุหรือไม่ถูกต้อง ก็ปล่อยผ่านให้เข้าสู่กระบวนการ Login ปกติ
            }
        }
        // ---------------------------------------------

        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide an email and password' });

        const user = await User.findOne({ email }).select('+password');
        if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });

        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Log user out / clear cookie
// @route   GET /api/v1/auth/logout
exports.logout = async (req, res, next) => {
    // สั่งเซิร์ฟเวอร์ลบ Cookie (แทนที่ด้วยค่า none และให้หมดอายุทันที)
    res.cookie('token', 'none', { 
        expires: new Date(Date.now() + 10 * 1000), 
        httpOnly: true 
    });

    // ส่ง Response กลับไปให้ Client เพื่อให้ฝั่ง Client เคลียร์ Token ทิ้งด้วย
    res.status(200).json({ 
        success: true, 
        message: 'Logged out successfully. Token is cleared.',
        data: {} 
    });
};