# CreditBasedDocScanner


10-Day Take-Home Assignment: Credit-Based Document Scanning System

The Credit-Based Document Scanning System (CBDSS) is a web application that allows users to upload and match text/plain documents for similarity. Users are given a limited number of credits to upload and scan documents. Admins can manage user credit requests and view system analytics.

I) Features:
User Features
1.	User Registration and Login:
o	Users can register with a unique username and email.
o	Users can log in to access their dashboard.
2.	Document Upload and Scanning:
o	Users can upload plain text documents.
o	Each upload deducts 1 credit from the user's account.
o	The system compares the uploaded document with existing documents and displays matches with a similarity score.
3.	Credit Management:
o	Users start with 20 credits.
o	Users can request additional credits, which require admin approval.
4.	Logout:
o	Users can log out, which clears their session.
Admin Features
1.	Admin Login:
o	A single admin account is created automatically when the application starts.
o	Admins can log in to access the admin dashboard.
2.	Admin Dashboard:
o	Admins can view all uploaded documents.
o	Admins can approve or reject user credit requests.
3.	System Analytics:
o	Admins can view total scans, top users, and most common topics in uploaded documents.

II) Backend Implementation: 
1. Setup
1.	Initialize Project:
o	Create a project folder:
mkdir creditBasedDocScanner
cd creditBasedDocScanner
o	Initialize a Node.js project:
npm init -y
2.	Install Dependencies:
o	Install required packages:
npm install express bcrypt sqlite3 express-session uuid dotenv fast-levenshtein
3.	Folder Structure:
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
│   ├── about.html
│   ├── contact.html
│   ├── dashboard.html
│   ├── admin-dashboard.html
│   └── loginSignup.html
├── package.json
├── .env
└── README.md
4.	Environment Variables:
o	Create a .env file:
SESSION_SECRET=supersecretkey
ADMIN_PASSWORD=admin123
 
2. Backend API Endpoints
1.	User Registration:
o	Endpoint: POST /auth/register
o	Body:
{
  "username": "user1",
  "email": "user1@example.com",
  "password": "password123"
}
2.	User Login:
o	Endpoint: POST /auth/login
o	Body:
{
  "email": "user1@example.com",
  "password": "password123"
}
3.	User Logout:
o	Endpoint: POST /auth/logout
4.	User Profile:
o	Endpoint: GET /user/profile
5.	Document Upload:
o	Endpoint: POST /scan
o	Body:
{
  "text": "This is a sample document text.",
  "fileName": "sample.txt"
}
6.	Credit Request:
o	Endpoint: POST /credits/request
o	Body:
{
  "amount": 20
}
7.	Admin Analytics:
o	Endpoint: GET /admin/analytics
8.	Admin Dashboard:
o	Endpoint: GET /admin/dashboard
9.	Matching Document
o	Endpoint: POST /scan

III) Database Schema
1.	Users Table:
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    credits INTEGER DEFAULT 20
);
2.	Documents Table:
CREATE TABLE documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    filePath TEXT NOT NULL,
    fileName TEXT NOT NULL,
    uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
);
3.	Credit Requests Table:
CREATE TABLE credit_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    requestedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
);

IV) Frontend Implementation
1. Pages
1.	Login/Signup Page:
o	Users can register or log in.
2.	Dashboard:
o	Users can upload documents, view their uploaded documents, and request credits.
3.	Admin Dashboard:
o	Admins can view all uploaded documents, approve/reject credit requests, and view system analytics.
4.	About Page:
o	Provides information about the project.
5.	Contact Page:
o	Displays contact information.

2. Dynamic Navigation
•	If the user is logged in:
o	Regular users see Dashboard.
o	Admins see Admin Dashboard.
•	If the user is not logged in, they see Home.

V) Testing
1. Backend Testing
Use Postman to test the backend APIs:
1.	User Registration: POST /auth/register
2.	User Login: POST /auth/login
3.	Document Upload: POST /scan
4.	Get Matches: POST /scan
5.	Credit Request: POST /credits/request
6.	Admin Analytics: GET /admin/analytics
2. Frontend Testing
•	Test the frontend by navigating through the pages and verifying dynamic behavior based on user roles.
VI) Deployment
1.	Backend:
o	Deploy the backend using a platform like Heroku or Render.
o	Set environment variables (SESSION_SECRET, ADMIN_PASSWORD) in the deployment environment.
2.	Frontend:
o	Deploy the frontend using a platform like Netlify or Vercel.
VII) Future Enhancements
1.	File Type Support:
o	Allow users to upload PDFs and Word documents.
2.	Email Notifications:
o	Notify users when their credit requests are approved or rejected.
3.	Advanced Analytics:
o	Add more detailed analytics for admins.











