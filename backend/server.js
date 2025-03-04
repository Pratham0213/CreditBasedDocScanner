require('dotenv').config();

const express = require('express')
const bcrypt = require('bcrypt')
const db = require('./database/database') //databse connection establisted in database 
const session = require('express-session');

const app = express()


//middleware
app.use(express.json());
app.use(session({
    secret: 'supersecretkey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true }
}));

app.get('/', (req, res) => {
    res.send('Welcome to the Express API!')
})

//SignUp....User Registration
app.post('/auth/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    try {
        db.get(`SELECT * FROM users WHERE email = ? OR username = ?`, [email, username], async (err, user) => {
            if (err) {
                console.error("Database Error:", err);
                return res.status(500).json({ message: "Database error" });
            }
            if (user) {
                return res.status(400).json({ message: "Email or Username already exists!" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            db.run(
                `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
                [username, email, hashedPassword],
                function (err) {
                    if (err) {
                        console.error("Failed to register user:", err);
                        return res.status(500).json({ message: "Failed to register user..Try again" });
                    }
                    res.status(201).json({ message: "User registered successfully!" });
                }
            );
        });
    } 
    catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

//Login....User Login
app.post('/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required!" });
    }
    try{
        db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
            if (err) {
                console.error("Database Error:", err);
                return res.status(500).json({ message: "Database error" });
            }
            if (!user) {
                return res.status(400).json({ message: "User not found!" });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: "Invalid credentials!" });
            }
            //store user session
            req.session.user = { id: user.id, username: user.username, role: user.role, credits: user.credits };
            res.status(200).json({ message: "Login successful!", userId: user.id });
        });
    } 
    catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

//logout handling
app.post('/auth/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: "Logout failed!" });
        }
        res.clearCookie('connect.sid'); // Clear session cookie
        res.status(200).json({ message: "Logged out successfully!" });
    });
});

//Check User Profile (Includes Credit Balance)
app.get('/user/profile', (req, res) => {
    if (!req.session.user){
        return res.status(401).json({ message: "Not Authorized! Please Login"})
    }
    try{
        db.get(`SELECT id, username, email, role, credits FROM users WHERE id = ?`, [req.session.user.id], (err, user) => {
            if(err){
                console.error("Database Error:", err);
                return res.status(500).json({ message: "Database error"});
            }
            if(!user){
                return res.status(400).json({ message: "User not found!"});
            }
            res.status(200).json({ user});
        });
    } 
    catch (error) {
        res.status(500).json({ message: "Internal Server Error"});
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})