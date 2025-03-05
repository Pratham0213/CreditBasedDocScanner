require('dotenv').config();

const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database("./backend/database/users.db", (err) => {
    if(err) {
        console.error("Error opening database " + err.message);
    } 
    else {
        console.log("Connected to the SQLite database.");
        // Create users table if it doesn't exist.
        db.run(
            `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'user',
                credits INTEGER DEFAULT 20
            )`,
            err => {
                if (err) {
                    console.error("Table creation error: " + err.message);
                } else {
                    console.log("Users table is ready.");
                }


                //Create credit_requests table if it doesn't exist
                db.run(
                    `CREATE TABLE IF NOT EXISTS credit_requests(
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        userId INTEGER NOT NULL,
                        amount INTEGER NOT NULL,
                        status TEXT DEFAULT 'pending',
                        requestedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (userId) REFERENCES users(id)
                    )`,
                    (err) => {
                        if (err) {
                            console.error("Table creation error: " + err.message);
                        } else {
                            console.log("Credit_requests table is ready.");
                        }
                    }
                )

                //Create documents table if it doesn't exist
                db.run(
                    `CREATE TABLE IF NOT EXISTS documents(
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        userId INTEGER NOT NULL,
                        filePath TEXT NOT NULL,
                        uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (userId) REFERENCES users(id)
                    )`,
                    (err) => {
                        if (err) {
                            console.error("Table creation error: " + err.message);
                        } else {
                            console.log("Documents table is ready.");
                        }
                    }
                )

                //Check for admin role
                db.get(`SELECT * FROM users WHERE role = 'admin'`, (err, admin) => {
                    if(err) {
                        console.error("Admin Error:", err);
                    }
                    else if(!admin){
                        const bcrypt = require('bcrypt');
                        const adminPassword = process.env.ADMIN_PASSWORD;

                        bcrypt.hash(adminPassword, 10, (err, hashedPassword) => {
                            if(err){
                                console.error("Error hashing password:", err);
                            }
                            else{
                                db.run(
                                    `INSERT INTO users (username, email, password, role, credits)
                                    VALUES ('admin', 'adarshshivam@gmail.com', ?, 'admin', 9999)`,
                                    [hashedPassword],
                                    err => {
                                        if(err){
                                            console.error("Error creating admin:", err);
                                        }
                                        else{
                                            console.log("Admin created successfully!");
                                        }
                                    }
                                );
                            }
                        });
                    }
                });
            }
        );
    }
});

module.exports = db;
