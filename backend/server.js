require('dotenv').config();

const express = require('express')
const bcrypt = require('bcrypt')
const db = require('./database/database') //databse connection establisted in database 

const app = express()

app.use(express.json());
// app.use(bodyParser.json());

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
                        return res.status(500).json({ message: "Failed to register user" });
                    }
                    res.status(201).json({ message: "User registered successfully!" });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});



//Login....User Login
app.post('/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required!" });
    }

    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err) {
            return res.status(500).json({ message: "Database error" });
        }
        if (!user) {
            return res.status(400).json({ message: "User not found!" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials!" });
        }

        res.status(200).json({ message: "Login successful!", userId: user.id });
    });
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})