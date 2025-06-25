const jwt = require('jsonwebtoken');
const JWT_SECRET = '1ds21cg001';

module.exports = (req, res, next)=>{
    const token = req.headers.authorization?.split(' ')[1];
    if(!token) return res.status(401).json({error: 'Unauthorized access'});

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    } catch (error) {
        res.status(403).json({error: 'Invalid token'});
    }
};