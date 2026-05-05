const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * POST /api/auth/register
 * Register a new user with bcryptjs password hashing.
 */
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required." });
        }

        if (username.length < 4) {
            return res.status(400).json({ message: "Username must be at least 4 characters." });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters." });
        }

        // Check for existing username or email independently
        // Note: MongoDB standard index is case-sensitive. If you want case-insensitive, we use collation.
        const existingUsername = await User.findOne({ username }).collation({ locale: 'en', strength: 2 });
        const existingEmail = await User.findOne({ email: email.toLowerCase() });

        if (existingUsername && existingEmail) {
            return res.status(400).json({ message: "Username and email already exist." });
        }
        if (existingUsername) {
            return res.status(400).json({ message: "Username already exists." });
        }
        if (existingEmail) {
            return res.status(400).json({ message: "Email already exists." });
        }

        // Hash with bcryptjs
        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();
        return res.status(201).json({ message: "Registration successful." });
    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({ message: "Internal Server Error." });
    }
});

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token.
 */
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                username: user.username,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal Server Error." });
    }
});

module.exports = router;