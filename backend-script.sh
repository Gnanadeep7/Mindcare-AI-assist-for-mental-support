#!/bin/bash

# ============================================
# Mental Health Backend Setup Script
# This script creates all necessary files and folders
# Run with: bash create-backend.sh
# ============================================

echo "🏥 Creating Mental Health Support Platform Backend..."
echo ""

# Create main directory
mkdir -p mental-health-backend
cd mental-health-backend

# Create subdirectories
mkdir -p config models routes middleware utils

echo "📁 Created directory structure"

# ============================================
# Create package.json
# ============================================
cat > package.json << 'EOF'
{
  "name": "mental-health-backend",
  "version": "1.0.0",
  "description": "Backend API for Mental Health Support Platform",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["mental-health", "api", "express", "mongodb"],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.3",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "express-validator": "^7.0.1",
    "nodemailer": "^6.9.7",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
EOF

# ============================================
# Create .env.sample
# ============================================
cat > .env.sample << 'EOF'
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/mental-health-db
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/mental-health-db

# JWT Secret (Generate a secure random string)
JWT_SECRET=your_super_secure_jwt_secret_key_here_change_this

# JWT Expiration
JWT_EXPIRE=30d

# Email Configuration (for nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=noreply@mindcare.com

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Admin Configuration
ADMIN_EMAIL=admin@mindcare.com
EOF

# ============================================
# Create .gitignore
# ============================================
cat > .gitignore << 'EOF'
node_modules/
.env
.DS_Store
*.log
npm-debug.log*
.vscode/
.idea/
dist/
build/
EOF

# ============================================
# Create README.md
# ============================================
cat > README.md << 'EOF'
# Mental Health Support Platform - Backend API

## Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.sample .env
# Edit .env with your actual values
```

### 3. Start MongoDB
Make sure MongoDB is running locally or configure MongoDB Atlas connection.

### 4. Run the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server will run at: http://localhost:5000

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user (protected)

### Counselor Requests
- POST `/api/counselor/request` - Submit counselor request
- GET `/api/counselor/requests` - Get all requests (admin/counselor)
- GET `/api/counselor/requests/:id` - Get single request
- PUT `/api/counselor/requests/:id` - Update request status

### Resources
- GET `/api/resources` - Get all resources
- GET `/api/resources/:id` - Get single resource
- POST `/api/resources` - Create resource (admin/counselor)
- PUT `/api/resources/:id` - Update resource
- DELETE `/api/resources/:id` - Delete resource

## Testing

Test health endpoint:
```bash
curl http://localhost:5000/api/health
```

## MongoDB Setup

### Local MongoDB
1. Install MongoDB: https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. Use: `MONGODB_URI=mongodb://localhost:27017/mental-health-db`

### MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Update MONGODB_URI in .env

## Email Setup (Gmail)

1. Enable 2-factor authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use App Password in EMAIL_PASS

## Deployment

Compatible with:
- Heroku
- Railway
- Render
- DigitalOcean
- AWS EC2

## Security Notes

- Change JWT_SECRET to a strong random string
- Never commit .env file
- Use HTTPS in production
- Configure CORS for specific domains
- Enable rate limiting
EOF

# Now copy all the actual code files from the previous artifact
# I'll provide a download link for the complete package

echo "✅ package.json created"
echo "✅ .env.sample created"
echo "✅ .gitignore created"
echo "✅ README.md created"
echo ""
echo "⚠️  IMPORTANT: You still need to copy the code files:"
echo "   - server.js"
echo "   - config/db.js"
echo "   - models/*.js (3 files)"
echo "   - routes/*.js (3 files)"
echo "   - middleware/*.js (2 files)"
echo "   - utils/email.js"
echo ""
echo "📋 All code is provided in the previous artifact."
echo "   Copy each file into the appropriate location."
echo ""
echo "🎯 Next Steps:"
echo "   1. Copy all code files from the artifact"
echo "   2. cd mental-health-backend"
echo "   3. npm install"
echo "   4. cp .env.sample .env"
echo "   5. Edit .env with your values"
echo "   6. npm run dev"
echo ""
echo "✨ Setup complete! Happy coding! 🚀"

# ============================================
# MANUAL FILE CREATION GUIDE
# ============================================

# Since we can't create a downloadable zip directly,
# here's what you need to do:

# 1. Run this script to create the folder structure
# 2. Copy the code from the first artifact for each file
# 3. Create a ZIP using:

# Mac/Linux:
# cd parent-folder
# zip -r mental-health-backend.zip mental-health-backend/ -x "*/node_modules/*"

# Windows PowerShell:
# Compress-Archive -Path mental-health-backend -DestinationPath mental-health-backend.zip

# Windows (right-click):
# Right-click folder > Send to > Compressed (zipped) folder