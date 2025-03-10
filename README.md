Credit-Based Document Scanning System (CBDSS) Documentation
1. Project Overview
The Credit-Based Document Scanning System (CBDSS) is a web application that allows users to upload and compare text documents for similarity. Users are given a limited number of credits to upload and scan documents. Admins can manage user credit requests and view system analytics.

2. Features
User Features
User Registration and Login:

Users can register with a unique username and email.

Users can log in to access their dashboard.

Document Upload and Scanning:

Users can upload plain text documents.

Each upload deducts 1 credit from the user's account.

The system compares the uploaded document with existing documents and displays matches with a similarity score.

Credit Management:

Users start with 20 credits.

Users can request additional credits, which require admin approval.

User Profile:

Users can view their profile, including their username, email, role, and remaining credits.

Logout:

Users can log out, which clears their session.

Admin Features
Admin Login:

A single admin account is created automatically when the application starts.

Admins can log in to access the admin dashboard.

Admin Dashboard:

Admins can view all uploaded documents.

Admins can approve or reject user credit requests.

System Analytics:

Admins can view total scans, top users, and most common topics in uploaded documents.

3. Frontend Implementation
1. Pages
Login/Signup Page:

Users can register or log in.

Dashboard:

Users can upload documents, view their uploaded documents, and request credits.

Admin Dashboard:

Admins can view all uploaded documents, approve/reject credit requests, and view system analytics.

About Page:

Provides information about the project.

Contact Page:

Displays contact information.

2. Dynamic Navigation
If the user is logged in:

Regular users see Dashboard.

Admins see Admin Dashboard.

If the user is not logged in, they see Home.

4. Backend Implementation
1. Setup
Initialize Project:

Create a project folder:

bash
Copy
mkdir creditBasedDocScanner
cd creditBasedDocScanner
Initialize a Node.js project:

bash
Copy
npm init -y
Install Dependencies:

Install required packages:

bash
Copy
npm install express bcrypt sqlite3 express-session uuid dotenv fast-levenshtein
Folder Structure:

Copy
creditBasedDocScanner/
├── backend/
│   ├── database/
│   │   └── database.js
│   ├── uploads/ (for storing uploaded documents)
│   └── server.js
├── frontend/
│   ├── css/
│   │   ├── styles.css
│   │   ├── loginSignup.css
│   │   ├── dashboard.css
│   │   ├── admin-dashboard.css
│   │   ├── about.css
│   │   └── contact.css
│   ├── images/
│   │   └── logo.jpg
│   ├── js/
│   │   └── scripts.js
│   ├── about.html
│   ├── contact.html
│   ├── dashboard.html
│   ├── admin-dashboard.html
│   └── loginSignup.html
├── package.json
├── .env
└── README.md
Environment Variables:

Create a .env file:

env
Copy
SESSION_SECRET=supersecretkey
ADMIN_PASSWORD=admin123
2. Backend API Endpoints
User Registration:

Endpoint: POST /auth/register

Body:

json
Copy
{
  "username": "user1",
  "email": "user1@example.com",
  "password": "password123"
}
User Login:

Endpoint: POST /auth/login

Body:

json
Copy
{
  "email": "user1@example.com",
  "password": "password123"
}
User Logout:

Endpoint: POST /auth/logout

User Profile:

Endpoint: GET /user/profile

Document Upload:

Endpoint: POST /scan

Body:

json
Copy
{
  "text": "This is a sample document text.",
  "fileName": "sample.txt"
}
Get Matching Documents:

Endpoint: GET /matches/:docId

Example: GET /matches/1741409931040

Credit Request:

Endpoint: POST /credits/request

Body:

json
Copy
{
  "amount": 20
}
Admin Analytics:

Endpoint: GET /admin/analytics

Admin Dashboard:

Endpoint: GET /admin/dashboard

3. Database Schema
Users Table:

sql
Copy
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    credits INTEGER DEFAULT 20
);
Documents Table:

sql
Copy
CREATE TABLE documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    filePath TEXT NOT NULL,
    fileName TEXT NOT NULL,
    uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
);
Credit Requests Table:

sql
Copy
CREATE TABLE credit_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    requestedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
);
5. How to Run the Project
1. Backend
Install Dependencies:

bash
Copy
npm install
Start the Server:

bash
Copy
nodemon backend/server.js
Test APIs:

Use Postman to test the backend APIs.

2. Frontend
Open the Frontend:

Open the frontend/ folder in a browser or use a local server (e.g., live-server).

Test the Application:

Register, log in, upload documents, and test other features.

6. Deployment
1. Backend (Using Render)
Push your backend code to GitHub.

Deploy to Render:

Create a new web service on Render and connect your GitHub repository.

Add environment variables (SESSION_SECRET, ADMIN_PASSWORD).

Deploy the backend.

2. Frontend (Using Netlify)
Push your frontend code to GitHub.

Deploy to Netlify:

Create a new site on Netlify and connect your GitHub repository.

Deploy the frontend.

7. Future Enhancements
File Type Support:

Allow users to upload PDFs and Word documents.

Email Notifications:

Notify users when their credit requests are approved or rejected.

Advanced Analytics:

Add more detailed analytics for admins.

User Roles:

Add more roles (e.g., moderator) with specific permissions.

Mobile App:

Develop a mobile app for easier access.

