const express = require('express');
const { registerUser, verifyEmail, userLogin, deleteAccount } = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');


const router = express.Router();

router.post('/register', registerUser);

router.get('/verify-email', verifyEmail)

router.post('/login', userLogin);

// router.post('/change-password', changePass);

router.delete('/delete', verifyToken, deleteAccount);

module.exports = router;