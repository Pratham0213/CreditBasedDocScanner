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
    const { username, email ,password } = req.body;
    if (!username || !email || !password)
        return res.status(400).json({ message: "Uername, email and Password are required" });

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Hash password
        db.run(
            `INSERT INTO users (username, email ,password) VALUES (?, ?, ?)`,
            [username, email, hashedPassword],
            (err) => {
                if(err){
                    return res.status(400).json({ message: "User already exists!" });
                }
                res.status(201).json({ message: "User registered successfully!" });
            }
        );
    }
    catch(err){
        res.status(404).json({ message: "Server Error" });
    }
});

//Login....User Login


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})