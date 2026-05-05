const jwt = require("jsonwebtoken");

/**
 * JWT Authentication Middleware
 * Extracts the Bearer token from the Authorization header,
 * verifies it, and attaches the decoded user payload to req.user.
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ message: "Access Denied. No token provided." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token." });
        }
        req.user = decoded;
        next();
    });
};

module.exports = { authenticateToken };
