const jwt = require('jsonwebtoken');

exports.verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader.startsWith('Bearer '))
        return res.status(401).json({ status: 'Failed', err: 'Token not found.' });

    const token = authHeader.split(' ')[1];

    try {

        const decoded = await jwt.verify(token, process.env.JWT_SECRET);

        req.body = req.body || {};
        req.body.userId = decoded.id;
        
        next();

    } catch (err) {
        res.status(401).json({ status: 'failed', err: err?.message || "Invalid token" })
    }

}