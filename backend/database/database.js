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
            }
        );
    }
});

module.exports = db;
