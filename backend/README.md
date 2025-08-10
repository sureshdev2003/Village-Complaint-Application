# Village Complaint Management System - Backend API

A comprehensive backend API built with Node.js, Express.js, and MySQL for managing village/city complaints and administrative workflows.

## 🚀 Features

- **User Authentication**: Registration, login, and profile management
- **Admin Authentication**: Role-based access control (Union Office, Collector Office, CM Office, Super Admin)
- **Complaint Management**: Submit, track, and manage complaints with status updates
- **File Upload**: Support for complaint images and documents
- **Feedback System**: User feedback collection and management
- **Real-time Notifications**: Admin and user notifications
- **Dashboard Analytics**: Statistics and reporting for admin panels
- **Search & Filter**: Advanced complaint search and filtering
- **Status Tracking**: Complete complaint lifecycle tracking

## 🛠️ Technology Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MySQL 8.0+
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator
- **Password Hashing**: bcryptjs

## 📦 Installation

### Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Step 1: Clone and Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install
```

### Step 2: Environment Configuration

Create a `.env` file in the backend directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=village_complaint_db
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=5000
NODE_ENV=development

# File Upload Configuration
MAX_FILE_SIZE=5000000
UPLOAD_PATH=./uploads/

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 3: Database Setup

1. **Create MySQL Database**:
```sql
CREATE DATABASE village_complaint_db;
```

2. **Run Database Schema**:
```bash
# Import the database schema
mysql -u root -p village_complaint_db < config/init-db.sql
```

Or manually execute the SQL file in your MySQL client.

### Step 4: Start the Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 🔧 Default Admin Accounts

The system comes with pre-configured admin accounts:

| Username | Password | Role | Access Level |
|----------|----------|------|-------------|
| `union_admin` | `password` | Union Office | Village/Block Level |
| `collector_admin` | `password` | Collector Office | District Level |
| `cm_admin` | `password` | CM Office | State Level |
| `super_admin` | `password` | Super Admin | System Level |

**⚠️ IMPORTANT**: Change all default passwords in production!

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Public User Authentication
```http
POST /auth/register          # User registration
POST /auth/login             # User login
GET  /auth/profile           # Get user profile (requires token)
PUT  /auth/profile           # Update user profile (requires token)
PUT  /auth/change-password   # Change password (requires token)
GET  /auth/verify            # Verify token
```

#### Admin Authentication
```http
POST /admin/auth/login           # Admin login
GET  /admin/auth/profile         # Get admin profile (requires admin token)
PUT  /admin/auth/profile         # Update admin profile (requires admin token)
PUT  /admin/auth/change-password # Change admin password (requires admin token)
GET  /admin/auth/dashboard-stats # Get dashboard statistics (requires admin token)
GET  /admin/auth/verify          # Verify admin token
```

### Complaint Management

#### Public Complaint Endpoints
```http
POST /complaints/submit                    # Submit new complaint
GET  /complaints/status/:complaintId       # Get complaint status (public)
GET  /complaints/my-complaints             # Get user's complaints (requires token)
GET  /complaints/categories                # Get all complaint categories
GET  /complaints/statistics                # Get public statistics
GET  /complaints/search                    # Search complaints (public, limited info)
```

#### Admin Complaint Management
```http
GET  /admin/complaints                     # Get all complaints (filtered by admin role)
GET  /admin/complaints/:id                 # Get complaint details
PUT  /admin/complaints/:id/status          # Update complaint status
PUT  /admin/complaints/:id/assign          # Assign complaint to admin
PUT  /admin/complaints/:id/forward         # Forward complaint to higher office
GET  /admin/users                          # Get admin users for assignment
GET  /admin/notifications                  # Get admin notifications
PUT  /admin/notifications/:id/read         # Mark notification as read
PUT  /admin/notifications/mark-all-read    # Mark all notifications as read
```

### Feedback System
```http
POST /feedback/submit                 # Submit feedback
GET  /feedback/all                    # Get all feedback (admin only)
GET  /feedback/:id                    # Get feedback details (admin only)
PUT  /feedback/:id/read               # Mark feedback as read (admin only)
DELETE /feedback/:id                  # Delete feedback (admin only)
GET  /feedback/stats/summary          # Get feedback statistics (admin only)
```

### File Upload
```http
POST /upload/single                   # Upload single file
POST /upload/multiple                 # Upload multiple files (max 5)
DELETE /upload/:filename              # Delete file
GET  /upload/info/:filename           # Get file information
GET  /upload/list                     # List all uploaded files
```

## 🔐 Authentication

### JWT Token Usage

Include the JWT token in the Authorization header:

```http
Authorization: Bearer your_jwt_token_here
```

### Token Payload Structure

**User Token**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "isAdmin": false
}
```

**Admin Token**:
```json
{
  "id": 1,
  "username": "union_admin",
  "email": "union@village.gov.in",
  "role": "union_office",
  "name": "Union Office Admin",
  "isAdmin": true
}
```

## 📊 Admin Role Hierarchy

1. **Union Office** (`union_office`)
   - Handles village/block level complaints
   - Can forward to Collector Office
   - Cannot access higher office complaints

2. **Collector Office** (`collector_office`)
   - Handles district level complaints
   - Can forward to CM Office
   - Can see forwarded complaints from Union Office

3. **CM Office** (`cm_office`)
   - Handles state level complaints
   - Can see all forwarded complaints
   - Highest escalation level

4. **Super Admin** (`super_admin`)
   - Full system access
   - Can see all complaints regardless of office
   - System administration privileges

## 🗄️ Database Schema

### Key Tables

- **users**: Public user accounts
- **admin_users**: Admin accounts with roles
- **complaints**: Main complaint records
- **complaint_categories**: Predefined complaint categories
- **complaint_status_history**: Status change tracking
- **feedback**: User feedback records
- **notifications**: System notifications

## 🛡️ Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevent API abuse
- **CORS Protection**: Cross-origin resource sharing control
- **Input Validation**: Express Validator for request validation
- **File Upload Security**: File type and size restrictions
- **SQL Injection Prevention**: Parameterized queries

## 📁 Project Structure

```
backend/
├── config/
│   ├── database.js          # Database connection
│   └── init-db.sql          # Database schema
├── middleware/
│   └── auth.js              # Authentication middleware
├── routes/
│   ├── auth.js              # User authentication routes
│   ├── adminAuth.js         # Admin authentication routes
│   ├── complaints.js        # Complaint management routes
│   ├── admin.js             # Admin panel routes
│   ├── feedback.js          # Feedback routes
│   └── upload.js            # File upload routes
├── utils/
│   └── validation.js        # Input validation schemas
├── uploads/                 # File upload directory
├── package.json
├── server.js                # Main server file
└── README.md
```

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
DB_HOST=your_production_db_host
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password
JWT_SECRET=your_production_jwt_secret_min_32_chars
PORT=5000
```

### Production Deployment Steps

1. **Set up MySQL Database** on your production server
2. **Run Database Schema** using the `init-db.sql` file
3. **Install Dependencies**: `npm install --production`
4. **Set Environment Variables** for production
5. **Start Server**: `npm start`
6. **Setup Reverse Proxy** (nginx recommended)
7. **SSL Certificate** for HTTPS
8. **Monitor Logs** and set up error tracking

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🔍 API Testing

### Health Check
```http
GET /api/health
```

### Test with cURL

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "9876543210"
  }'

# Admin login
curl -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "union_admin",
    "password": "password"
  }'
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MySQL server is running
   - Verify database credentials in `.env`
   - Ensure database exists

2. **JWT Token Invalid**
   - Check JWT_SECRET is set
   - Verify token format in Authorization header

3. **File Upload Fails**
   - Check uploads directory permissions
   - Verify file size limits
   - Ensure allowed file types

4. **CORS Errors**
   - Add frontend URL to CORS origins
   - Check preflight request handling

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Validation errors (if any)
  ]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Made with ❤️ for transparent governance and citizen engagement** 