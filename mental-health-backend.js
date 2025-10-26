// ============================================
// FILE STRUCTURE FOR BACKEND:
// ============================================
// mental-health-backend/
// ├── server.js
// ├── package.json
// ├── .env.sample
// ├── .gitignore
// ├── models/
// │   ├── User.js
// │   ├── CounselorRequest.js
// │   └── Resource.js
// ├── routes/
// │   ├── auth.js
// │   ├── counselor.js
// │   └── resources.js
// ├── middleware/
// │   ├── auth.js
// │   └── errorHandler.js
// ├── config/
// │   └── db.js
// └── utils/
//     └── email.js

// ============================================
// FILE: package.json
// ============================================
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

// ============================================
// FILE: .env.sample
// ============================================
// Server Configuration
PORT=5000
NODE_ENV=development

// MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/mental-health-db
// For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/mental-health-db

// JWT Secret (Generate a secure random string)
JWT_SECRET=your_super_secure_jwt_secret_key_here_change_this

// JWT Expiration
JWT_EXPIRE=30d

// Email Configuration (for nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=noreply@mindcare.com

// Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

// Admin Configuration
ADMIN_EMAIL=admin@mindcare.com

// ============================================
// FILE: .gitignore
// ============================================
node_modules/
.env
.DS_Store
*.log
npm-debug.log*
.vscode/
.idea/
dist/
build/

// ============================================
// FILE: server.js
// ============================================
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Initialize express app
const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/counselor', require('./routes/counselor'));
app.use('/api/resources', require('./routes/resources'));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Mental Health Platform API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handler middleware (should be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

// ============================================
// FILE: config/db.js
// ============================================
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

// ============================================
// FILE: models/User.js
// ============================================
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'counselor', 'admin'],
    default: 'user'
  },
  phone: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);

// ============================================
// FILE: models/CounselorRequest.js
// ============================================
const mongoose = require('mongoose');

const CounselorRequestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    default: null
  },
  concern: {
    type: String,
    required: [true, 'Please select a concern'],
    enum: ['anxiety', 'depression', 'stress', 'relationships', 'trauma', 'grief', 'other']
  },
  message: {
    type: String,
    maxlength: [1000, 'Message cannot be more than 1000 characters']
  },
  availability: {
    type: String,
    required: [true, 'Please select availability'],
    enum: ['morning', 'afternoon', 'evening', 'flexible']
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'scheduled', 'completed', 'cancelled'],
    default: 'pending'
  },
  assignedCounselor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
CounselorRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('CounselorRequest', CounselorRequestSchema);

// ============================================
// FILE: models/Resource.js
// ============================================
const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['anxiety', 'depression', 'stress', 'mindfulness', 'sleep', 'relationships', 'other']
  },
  content: {
    type: String,
    required: [true, 'Please add content']
  },
  author: {
    type: String,
    default: 'MindCare Team'
  },
  tags: [{
    type: String
  }],
  isPublished: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Resource', ResourceSchema);

// ============================================
// FILE: middleware/auth.js
// ============================================
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// ============================================
// FILE: middleware/errorHandler.js
// ============================================
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.log(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

module.exports = errorHandler;

// ============================================
// FILE: routes/auth.js
// ============================================
const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', [
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, email, password, phone } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user
    user = await User.create({
      name,
      email,
      password,
      phone
    });

    // Create token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

// ============================================
// FILE: routes/counselor.js
// ============================================
const express = require('express');
const { body, validationResult } = require('express-validator');
const CounselorRequest = require('../models/CounselorRequest');
const { protect, authorize } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');

const router = express.Router();

// @route   POST /api/counselor/request
// @desc    Submit counselor request
// @access  Public
router.post('/request', [
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('concern').notEmpty(),
  body('availability').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, email, phone, concern, message, availability } = req.body;

    const request = await CounselorRequest.create({
      name,
      email,
      phone,
      concern,
      message,
      availability,
      userId: req.user ? req.user.id : null
    });

    // Send confirmation email
    await sendEmail({
      to: email,
      subject: 'MindCare - Counselor Request Received',
      text: `Dear ${name},\n\nThank you for reaching out to MindCare. We have received your request and a licensed counselor will contact you within 24 hours.\n\nYour request ID: ${request._id}\n\nBest regards,\nMindCare Team`
    });

    // Notify admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: 'New Counselor Request',
      text: `New counselor request from ${name} (${email})\nConcern: ${concern}\nAvailability: ${availability}`
    });

    res.status(201).json({
      success: true,
      message: 'Request submitted successfully',
      data: request
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error submitting request'
    });
  }
});

// @route   GET /api/counselor/requests
// @desc    Get all counselor requests (admin/counselor only)
// @access  Private/Admin/Counselor
router.get('/requests', protect, authorize('admin', 'counselor'), async (req, res) => {
  try {
    const requests = await CounselorRequest.find()
      .sort({ createdAt: -1 })
      .populate('assignedCounselor', 'name email');

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/counselor/requests/:id
// @desc    Get single counselor request
// @access  Private/Admin/Counselor
router.get('/requests/:id', protect, authorize('admin', 'counselor'), async (req, res) => {
  try {
    const request = await CounselorRequest.findById(req.params.id)
      .populate('assignedCounselor', 'name email');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/counselor/requests/:id
// @desc    Update counselor request status
// @access  Private/Admin/Counselor
router.put('/requests/:id', protect, authorize('admin', 'counselor'), async (req, res) => {
  try {
    let request = await CounselorRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    request = await CounselorRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

// ============================================
// FILE: routes/resources.js
// ============================================
const express = require('express');
const { body, validationResult } = require('express-validator');
const Resource = require('../models/Resource');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/resources
// @desc    Get all resources
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { isPublished: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const resources = await Resource.find(query)
      .sort({ createdAt: -1 })
      .select('-createdBy');

    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/resources/:id
// @desc    Get single resource
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Increment views
    resource.views += 1;
    await resource.save();

    res.status(200).json({
      success: true,
      data: resource
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/resources
// @desc    Create resource (admin/counselor only)
// @access  Private/Admin/Counselor
router.post('/', protect, authorize('admin', 'counselor'), [
  body('title').notEmpty().trim(),
  body('category').notEmpty(),
  body('content').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const resource = await Resource.create({
      ...req.body,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: resource
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/resources/:id
// @desc    Update resource (admin/counselor only)
// @access  Private/Admin/Counselor
router.put('/:id', protect, authorize('admin', 'counselor'), async (req, res) => {
  try {
    let resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    resource = await Resource.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: resource
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/resources/:id
// @desc    Delete resource (admin only)
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    await resource.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Resource deleted'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

// ============================================
// FILE: utils/email.js
// ============================================
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Define email options
  const mailOptions = {
    from: `${process.env.EMAIL_FROM || 'MindCare'} <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  // Send email
  const info = await transporter.sendMail(mailOptions);

  console.log('Message sent: %s', info.messageId);
};

module.exports = { sendEmail };

// ============================================
// SETUP INSTRUCTIONS
// ============================================
/*
1. Create a new folder called 'mental-health-backend'
2. Copy all the files above into their respective locations
3. Open terminal in the folder and run:
   npm install

4. Create a .env file and copy contents from .env.sample
5. Update the .env file with your actual values:
   - MongoDB URI (local or Atlas)
   - JWT Secret (generate a random string)
   - Email credentials (Gmail or other SMTP)

6. Make sure MongoDB is running (local or cloud)

7. Start the server:
   npm run dev (for development with nodemon)
   or
   npm start (for production)

8. The API will be available at http://localhost:5000

9. Update your frontend HTML file to connect to this API:
   - Change form submissions to POST to http://localhost:5000/api/counselor/request
   - Add fetch() calls to interact with the API

EXAMPLE FRONTEND FETCH:
```javascript
// In your HTML form submission
const response = await fetch('http://localhost:5000/api/counselor/request', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    concern: formData.concern,
    message: formData.message,
    availability: formData.availability
  })
});

const data = await response.json();
if (data.success) {
  // Show success message
}
```

API ENDPOINTS:
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user (protected)
- POST /api/counselor/request - Submit counselor request
- GET /api/counselor/requests - Get all requests (admin/counselor)
- GET /api/counselor/requests/:id - Get single request
- PUT /api/counselor/requests/:id - Update request status
- GET /api/resources - Get all resources
- GET /api/resources/:id - Get single resource
- POST /api/resources - Create resource (admin/counselor)
- PUT /api/resources/:id - Update resource
- DELETE /api/resources/:id - Delete resource
*/