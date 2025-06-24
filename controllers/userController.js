const bcrypt = require('bcryptjs');
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.registerUser = async (req, res) => {
    const { email, password, fullname, dob } = req.body;


    if (!email || !password) {
        return res.status(404).json({ status: 'failed', err: 'email or password is missing' });
    }

    try {

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            email,
            password: hashedPassword,
            username: email,
            fullname: fullname || '',
            dob: dob ? new Date(dob) : undefined
        });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

        const link = `http://localhost:3000/verify-email?token=${token}`;

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "lalitverma7511@gmail.com",
                pass: process.env.GOOGLE_APP_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: '"App Support" <lalitverma7511@gmail.com>',
            to: email,
            subject: 'Verify your email',
            html: `<p>Click <a href="${link}">here</a> to verify your email.</p>`
        });

        res.status(200).json({ status: 'success', info: 'Verification email sent' });
    }
    catch (err) {
        res.status(500).json({ status: 'failed', error: err.message || 'Something went wrong' });
    }
}

exports.verifyEmail = async(req, res) => {

    const { token } = req.query;

    try{

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if(!user){
            return res.status(404).json({status:'failed', err:'User not found.'});
        }

        user.isVerified = true;
        await user.save();

        res.status(200).json({status:'success', info:'Email verified! You can now log in.'});

    }catch(err){
        res.status(500).json({ status: 'failed', error: err.message || 'Invalid or Expired token' });
    }
};