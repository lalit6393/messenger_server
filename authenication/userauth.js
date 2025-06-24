const express = require('express');
const { registerUser, verifyEmail } = require('../controllers/userController');


const router = express.Router();

router.post('/register', registerUser);

router.get('/verify-email', verifyEmail)

router.post('/login', (req, res) => {

    const { email, password } = req.body;

});

module.exports = router;