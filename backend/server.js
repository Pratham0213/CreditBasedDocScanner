require('dotenv').config();

const express = require('express')
const bcrypt = require('bcrypt')
const db = require('./database/database') //databse connection establisted in database 
const session = require('express-session');

const fs = require('fs');
const path = require('path');
const levenshtein = require('fast-levenshtein'); 

const cron = require('node-cron');

const app = express()

// const SQLiteStore = require('connect-sqlite3')(session); //No need (temporary)

//middleware
app.use(express.json());
app.use(session({
    // store: new SQLiteStore(), //No need (Temporary)
    secret: 'supersecretkey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true }
}));

//file upload directory(Only plain text files)
const uploadDir = path.join(__dirname, 'uploads');
if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

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

            try {
                const hashedPassword = await bcrypt.hash(password, 10);
                db.run(
                    `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, 'user')`,
                    [username, email, hashedPassword],
                    function (err) {
                        if (err) {
                            console.error("Failed to register user:", err);
                            return res.status(500).json({ message: "Failed to register user..Try again" });
                        }
                        res.status(201).json({ message: "User registered successfully!" });
                    }
                );
            } 
            catch (error) {
                console.error("Hashing Error:", error);
                return res.status(500).json({ message: "Error hashing password." });
            }
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
            res.status(200).json({ 
                message: "Login successful!",
                user: { id: user.id, username: user.username, role: user.role, credits: user.credits }
            });
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

app.get('/admin/dashboard', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ message: "Access Denied! Admin only." });
    }
    try {
        db.all(`SELECT id, username, email, role, credits FROM users`, (err, users) => {
            if (err) {
                console.error("Database Error:", err);
                return res.status(500).json({ message: "Database error" });
            }
            res.status(200).json({ users });
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

//document upload (deducts 1 credit)
app.post('/scan', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Not Authorized! Please Login" });
    }
    // if(req.session.user.role !== 'user') {
    //     return res.status(403).json({ message: "Access Denied! Only User can upload documents." });
    // }
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ message: "Text Content to scan is required!" });
    }
    //check user credits
    db.get(`SELECT credits FROM users WHERE id = ?`,[req.session.user.id], (err, user) => {
        if(err){
            console.error("Database Error:", err);
            return res.status(500).json({ message: "Database error" });
        }
        if(user.credits < 1){
            return res.status(403).json({ message: "Insufficient credits! Please request." });
        }

        if (!user || user.credits === undefined) {
            return res.status(400).json({ message: "Invalid user or no credits found." });
        }

        //deduct 1 credit
        db.run(`UPDATE users SET credits = credits - 1 WHERE id = ?`, [req.session.user.id], (err) => {
            if(err){
                console.error("Database Error:", err);
                return res.status(500).json({ message: "Database error" });
            }


            // Save the document locally 
            const docId = Date.now();
            const filePath = path.join(uploadDir, `${docId}.txt`);
            try {
                fs.writeFileSync(filePath, text);
                console.log(`Document saved at: ${filePath}`);
            } 
            catch (err) {
                console.error("File Writing Error:", err);
                return res.status(500).json({ message: "Failed to save document" });
            }

            // Save document metadata in the database
            db.run(
                `INSERT INTO documents (userId, filePath) VALUES (?, ?)`,
                [req.session.user.id, filePath],
                function (err) {
                    if(err){
                        console.error("Database Error:", err);
                        return res.status(500).json({ message: "Failed to save document metadata." });
                    }
                    res.status(200).json({
                        message: "Document uploaded successfully!",
                        docId,
                        creditsLeft: user.credits - 1
                    });
                }
            );
        });
    });
});

// Get matched documents
app.get('/matched/:docId', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Not Authorized! Please Login" });
    }
    const { docId } = req.params;
    const filePath = path.join(uploadDir, `${docId}.txt`);

    //Read the already uploaded doc
    fs.readFile(filePath, 'utf8', (err, uploadedText) => {
        if (err) {
            console.error("File Read Error:", err);
            return res.status(404).json({ message: "Document not found!" });
        }

        //get all documents from the database
        db.all(`SELECT filePath FROM documents WHERE userId = ?`, [req.session.user.id], (err, docs) => {
            if (err) {
                console.error("Database Error:", err);
                return res.status(500).json({ message: "Database error" });
            }

            //compare the uploaded documents with existing documents
            const matches = [];
            docs.forEach(doc => {
                if(doc.filePath !== filePath){ //exclude the uploaded document itself
                    const existingText = fs.readFileSync(doc.filePath, 'utf8');
                    const similarity = calculateSimilarity(uploadedText, existingText);
                    if(similarity > 0.5){ //consider a match if similarity is above 50%
                        matches.push({ filePath: doc.filePath, similarity });
                    }
                }
            });
            res.status(200).json({ matches });
        });
    });
});

// Helper function to calculate similarity between two strings
function calculateSimilarity(text1, text2){
    if (!text1.length || !text2.length) return 0;
    const maxLength = Math.max(text1.length, text2.length);
    const distance = levenshtein.get(text1, text2);
    return 1 - (distance / maxLength);
}

//Request credits
app.post('/credits/request', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Not Authorized! Please Login" });
    }
    const { amount } = req.body;
    if (!amount || amount < 1) {
        return res.status(400).json({ message: "Invalid credit request amount!" });
    } 

    // Log the credit request (for now, just log it)
    console.log(`User ${req.session.user.username} requested ${amount} additional credits.`);
    res.status(200).json({ message: "Credit request submitted successfully for admin Approval" });
});

// Admin Approve Credit Request
app.post('/admin/approve-credits', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ message: "Access Denied! Admin only." });
    }

    const { userId, amount } = req.body;
    if (!userId || !amount || amount < 1) {
        return res.status(400).json({ message: "Invalid credit approval request!" });
    }

    //Add credit to the user 
    db.run(`UPDATE users SET credits = credits + ? WHERE id = ?`, [amount, userId], function(err){
        if(err){
            console.error("Database Error:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.status(200).json({ message: `Added ${amount} credits to the ${userId} successfully.` });
    });
});

// Admin Analytics Dashboard
app.get('/admin/analytics', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ message: "Access Denied! Admin only." });
    }

    try{
        //Get total number of scans
        db.get(`SELECT COUNT(*) AS totalScans FROM documents`, (err, totalScans) => {
            if(err){
                console.error("Database Error:", err);
                return res.status(500).json({ message: "Database error" });
            }
            //Get most active users
            db.all(
                `SELECT users.username, COUNT(documents.id) AS scanCount
                FROM documents
                JOIN users ON documents.userId = users.id
                GROUP BY users.username
                ORDER BY scanCount DESC`,
                (err, topUsers) => {
                    if(err){
                        console.error("Database Error:", err);
                        return res.status(500).json({ message: "Database error" });
                    }
                    // res.status(200).json({ totalScans, topUsers });

                    // Get most common document topics (basic implementation)
                    db.all(
                        `SELECT filePath from documents`,
                        (err, docs) => {
                            if (err) {
                                console.error("Database Error:", err);
                                return res.status(500).json({ message: "Database error" });
                            }

                            const wordFrequency = {};
                            docs.forEach(doc => {
                                const text = fs.readFileSync(doc.filePath, 'utf8');
                                const words = text.split(/\s+/);
                                words.forEach(word => {
                                    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
                                });
                            });

                            const sortedWords = Object.entries(wordFrequency)
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 10)
                                .map(([word, count]) => ({ word, count}));

                            res.status(200).json({
                                totalScans: totalScans.totalScans,
                                topUsers,
                                mostCommonTopics: sortedWords
                            });
                        }
                    );
                }
            );
        });
    }
    catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Schedule job to reset credits at midnight
cron.schedule('0 0 * * *', () => {
    console.log("Running credit reset cron job...");

    try {
        db.run(`UPDATE users SET credits = 20 WHERE role = 'user'`, function (err) {
            if (err) {
                console.error("Error resetting credits:", err.message);
            } else {
                console.log(`Credits reset for all users. Rows affected: ${this.changes}`);
            }
        });
    } catch (error) {
        console.error("Unexpected error in cron job:", error);
    }
}, {
    timezone: "UTC" // Ensure the job runs at UTC midnight
});
console.log("Cron job scheduled to reset credits at midnight.");



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});