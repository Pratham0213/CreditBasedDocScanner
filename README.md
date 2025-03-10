Credit-Based Document Scanning System (CBDSS) Documentation

1. Project Overview
The Credit-Based Document Scanning System (CBDSS) is a web application that allows users to upload and compare text documents for similarity. Users are given a limited number of credits to upload and scan documents. Admins can manage user credit requests and view system analytics.

2. Features
I)User Features
  *User Registration and Login:
    Users can register with a unique username and email.
    Users can log in to access their dashboard.

II)Document Upload and Scanning:
  Users can upload plain text documents.
  Each upload deducts 1 credit from the user's account.
  The system compares the uploaded document with existing documents and displays matches with a similarity score.

III)Credit Management:
  Users start with 20 credits.
  Users can request additional credits, which require admin approval.

IV)User Profile:
  Users can view their profile, including their username, email, role, and remaining credits.

V)Logout:
  Users can log out, which clears their session.

VI)Admin Features
  Admin Login: A single admin account is created automatically when the application starts.
  Admins can log in to access the admin dashboard.

VII)Admin Dashboard:
  Admins can view all uploaded documents.
  Admins can approve or reject user credit requests.
  System Analytics: Admins can view total scans, top users, and most common topics in uploaded documents.

3. Frontend Implementation
I)Login/Signup Page:
  Users can register or log in.

II)Dashboard:
  Users can upload documents, view their uploaded documents, and request credits.

III)Admin Dashboard:
  Admins can view all uploaded documents, approve/reject credit requests, and view system analytics.

IV)About Page:
  Provides information about the project.

V)Contact Page:
  Displays contact information.

VI)Dynamic Navigation:
  *If the user is logged in:
    Regular users see Dashboard.
    Admins see Admin Dashboard.
    If the user is not logged in, they see Home.

4. Backend Implementation
I)Setup
  *Initialize Project:
  *Create a project folder:
    mkdir creditBasedDocScanner
    cd creditBasedDocScanner

II)Initialize a Node.js project:
  npm init -y

III)Install Dependencies:
  npm install express bcrypt sqlite3 express-session uuid dotenv fast-levenshtein
  
5. Backend API Endpoints
I)User Registration:
  Endpoint: POST /auth/register
  Body:
  {
    "username": "user1",
    "email": "user1@example.com",
    "password": "password123"
  }

II)User Login:
  Endpoint: POST /auth/login
  Body:
  {
    "email": "user1@example.com",
    "password": "password123"
  }

III)User Logout:
  Endpoint: POST /auth/logout

IV)User Profile:
  Endpoint: GET /user/profile

V)Document Upload:
  Endpoint: POST /scan
  Body:
  {
    "text": "This is a sample document text.",
    "fileName": "sample.txt"
  }

VI)Get Matching Documents:
  Endpoint: POST /scan

VII)Credit Request:
  Endpoint: POST /credits/request
  Body:
  {
    "amount": 20
  }

VIII)Admin Analytics:
  Endpoint: GET /admin/analytics

IX)Admin Dashboard:
  Endpoint: GET /admin/dashboard

6. Database Schema
I)Users Table:
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    credits INTEGER DEFAULT 20
);

II)Documents Table:
CREATE TABLE documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    filePath TEXT NOT NULL,
    fileName TEXT NOT NULL,
    uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
);

III)Credit Requests Table:
CREATE TABLE credit_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    requestedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
);

7. How to Run the Project
I)Backend
*Install Dependencies:
  npm install
  Start the Server: nodemon backend/server.js
  Test APIs: Use Postman to test the backend APIs.

II)Frontend
  Open the Frontend:
  Open the frontend/ folder in a browser or use a local server (e.g., live-server).
  Test the Application: Register, log in, upload documents, and test other features.

8. Deployment: Deploy On the Railway.com (Both Frontend and Backend)
   Working LINK: https://creditbaseddocscanner-production.up.railway.app/

9. Future Enhancements
I)File Type Support:
  Allow users to upload PDFs and Word documents.

II)Email Notifications: 
  Notify users when their credit requests are approved or rejected.

III)Advanced Analytics:
  Add more detailed analytics for admins.

IV)User Roles:
  Add more roles (e.g., moderator) with specific permissions.

V)Mobile App:
  Develop a mobile app for easier access.

VI)Multiuser support:
  Support Multiple user at the same time.

