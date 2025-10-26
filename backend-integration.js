// ============================================
// FRONTEND INTEGRATION - Updated HTML with API Integration
// Add this script section to your existing HTML file
// ============================================

// API Configuration
const API_URL = 'http://localhost:5000/api';

// API Helper Functions
const api = {
    // Submit counselor request
    async submitCounselorRequest(formData) {
        try {
            const response = await fetch(`${API_URL}/counselor/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error submitting request:', error);
            throw error;
        }
    },

    // Get resources by category
    async getResources(category = null) {
        try {
            const url = category 
                ? `${API_URL}/resources?category=${category}`
                : `${API_URL}/resources`;
            
            const response = await fetch(url);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching resources:', error);
            throw error;
        }
    },

    // Register user
    async register(userData) {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            if (data.success && data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
            }
            return data;
        } catch (error) {
            console.error('Error registering:', error);
            throw error;
        }
    },

    // Login user
    async login(credentials) {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });
            
            const data = await response.json();
            if (data.success && data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
            }
            return data;
        } catch (error) {
            console.error('Error logging in:', error);
            throw error;
        }
    },

    // Get current user
    async getCurrentUser() {
        const token = localStorage.getItem('token');
        if (!token) return null;

        try {
            const response = await fetch(`${API_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error getting user:', error);
            return null;
        }
    },

    // Logout
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};

// ============================================
// UPDATE FORM SUBMISSION IN YOUR HTML
// Replace the existing form submission with this:
// ============================================

document.getElementById('counselorForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value || null,
        concern: document.getElementById('concern').value,
        message: document.getElementById('message').value || '',
        availability: document.getElementById('availability').value
    };

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    try {
        // Submit to API
        const result = await api.submitCounselorRequest(formData);
        
        if (result.success) {
            // Show success message
            const successMsg = document.getElementById('successMessage');
            successMsg.classList.add('show');
            
            // Reset form
            e.target.reset();
            
            // Scroll to success message
            successMsg.scrollIntoView({ behavior: 'smooth' });
            
            // Hide success message after 5 seconds
            setTimeout(() => {
                successMsg.classList.remove('show');
            }, 5000);
        } else {
            alert('Error: ' + (result.message || 'Failed to submit request'));
        }
    } catch (error) {
        alert('Error submitting request. Please try again.');
        console.error(error);
    } finally {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// ============================================
// LOAD RESOURCES FROM API (Optional Enhancement)
// Add this to dynamically load resources
// ============================================

async function loadResourcesFromAPI() {
    try {
        const result = await api.getResources();
        
        if (result.success && result.data.length > 0) {
            // You can use this data to dynamically populate resources
            console.log('Loaded resources:', result.data);
            
            // Example: Update resource categories with real data
            // This is optional - you can keep your static content
            // or replace it with dynamic content from the API
        }
    } catch (error) {
        console.error('Error loading resources:', error);
    }
}

// Call this when page loads (optional)
// window.addEventListener('DOMContentLoaded', loadResourcesFromAPI);

// ============================================
// QUICK SETUP GUIDE TO CREATE THE ZIP FILE
// ============================================

/*
STEP 1: Create Backend Folder Structure
----------------------------------------
Create a folder called "mental-health-backend" with this structure:

mental-health-backend/
├── server.js
├── package.json
├── .env.sample
├── .gitignore
├── config/
│   └── db.js
├── models/
│   ├── User.js
│   ├── CounselorRequest.js
│   └── Resource.js
├── routes/
│   ├── auth.js
│   ├── counselor.js
│   └── resources.js
├── middleware/
│   ├── auth.js
│   └── errorHandler.js
└── utils/
    └── email.js

STEP 2: Copy Files
------------------
Copy all the code from the previous artifact into their respective files.
Each file's content is clearly marked with comments like:
// ============================================
// FILE: server.js
// ============================================

STEP 3: Install Dependencies
-----------------------------
Open terminal in the mental-health-backend folder and run:

npm install

This will install all required packages:
- express
- mongoose
- dotenv
- cors
- bcryptjs
- jsonwebtoken
- express-validator
- nodemailer
- helmet
- express-rate-limit
- morgan

STEP 4: Configure Environment
------------------------------
1. Copy .env.sample to .env
2. Update the values:

PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mental-health-db
JWT_SECRET=your_random_secret_key_here_generate_one
JWT_EXPIRE=30d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@mindcare.com
FRONTEND_URL=http://localhost:3000
ADMIN_EMAIL=admin@mindcare.com

For Gmail:
- Enable 2-factor authentication
- Generate an App Password: https://myaccount.google.com/apppasswords
- Use the App Password in EMAIL_PASS

STEP 5: Setup MongoDB
----------------------
Option A - Local MongoDB:
1. Install MongoDB: https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. Use: MONGODB_URI=mongodb://localhost:27017/mental-health-db

Option B - MongoDB Atlas (Cloud):
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string and replace in MONGODB_URI
4. Example: mongodb+srv://username:password@cluster.mongodb.net/mental-health-db

STEP 6: Start the Server
-------------------------
Development mode (with auto-reload):
npm run dev

Production mode:
npm start

Server will run at: http://localhost:5000

STEP 7: Test the API
--------------------
Test health endpoint:
curl http://localhost:5000/api/health

Expected response:
{
  "success": true,
  "message": "Mental Health Platform API is running",
  "timestamp": "2024-xx-xx..."
}

STEP 8: Update Frontend
------------------------
In your HTML file, add the API integration code from this file.
Make sure to update API_URL if your backend runs on a different port.

STEP 9: Enable CORS
--------------------
If you get CORS errors:
1. Update FRONTEND_URL in .env to match your frontend URL
2. Or use a browser extension like "CORS Unblock" during development

STEP 10: Deploy (Optional)
---------------------------
Backend deployment options:
- Heroku: heroku.com
- Railway: railway.app
- Render: render.com
- DigitalOcean App Platform
- AWS EC2

Frontend deployment options:
- Vercel: vercel.com
- Netlify: netlify.com
- GitHub Pages
- Firebase Hosting

STEP 11: Create ZIP File
-------------------------
To create a downloadable zip:

Mac/Linux:
cd path/to/parent-folder
zip -r mental-health-backend.zip mental-health-backend/ -x "*/node_modules/*" "*/.git/*"

Windows:
1. Right-click the mental-health-backend folder
2. Select "Send to" > "Compressed (zipped) folder"
3. Exclude node_modules folder (it will be reinstalled via npm install)

Or use this terminal command:
7z a -tzip mental-health-backend.zip mental-health-backend -xr!node_modules

STEP 12: Testing Checklist
---------------------------
✓ Health check works: GET /api/health
✓ Submit counselor request: POST /api/counselor/request
✓ Email notifications sent successfully
✓ MongoDB connected and data saved
✓ Frontend form submission works
✓ CORS configured properly
✓ Environment variables loaded

*/

// ============================================
// COMPLETE EXAMPLE: Updated HTML Form Submission
// Copy this entire script block to your HTML
// ============================================

const API_CONFIG = {
    BASE_URL: 'http://localhost:5000/api',
    TIMEOUT: 10000
};

// Enhanced API utility with error handling
class APIClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Add auth token if available
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
            
            const response = await fetch(url, {
                ...config,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }
            
            return data;
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }

    // Counselor requests
    async submitCounselorRequest(formData) {
        return this.request('/counselor/request', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
    }

    // Resources
    async getResources(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/resources?${queryString}` : '/resources';
        return this.request(endpoint);
    }

    async getResource(id) {
        return this.request(`/resources/${id}`);
    }

    // Authentication
    async register(userData) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        if (data.success && data.token) {
            this.saveAuth(data.token, data.user);
        }
        
        return data;
    }

    async login(credentials) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        
        if (data.success && data.token) {
            this.saveAuth(data.token, data.user);
        }
        
        return data;
    }

    async getCurrentUser() {
        return this.request('/auth/me');
    }

    saveAuth(token, user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    isAuthenticated() {
        return !!localStorage.getItem('token');
    }

    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
}

// Initialize API client
const apiClient = new APIClient(API_CONFIG.BASE_URL);

// Form submission with full error handling
document.getElementById('counselorForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const successMsg = document.getElementById('successMessage');
    const originalBtnText = submitBtn.textContent;
    
    // Collect form data
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim() || null,
        concern: document.getElementById('concern').value,
        message: document.getElementById('message').value.trim() || '',
        availability: document.getElementById('availability').value
    };

    // Basic validation
    if (!formData.name || !formData.email || !formData.concern || !formData.availability) {
        alert('Please fill in all required fields');
        return;
    }

    // Show loading state
    submitBtn.innerHTML = '<span>⏳</span> Submitting...';
    submitBtn.disabled = true;

    try {
        const result = await apiClient.submitCounselorRequest(formData);
        
        if (result.success) {
            // Show success message
            successMsg.textContent = '✓ Thank you for reaching out! A counselor will contact you within 24 hours. Check your email for confirmation.';
            successMsg.classList.add('show');
            
            // Reset form
            e.target.reset();
            
            // Scroll to success message
            successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Hide success message after 7 seconds
            setTimeout(() => {
                successMsg.classList.remove('show');
            }, 7000);
        } else {
            throw new Error(result.message || 'Failed to submit request');
        }
    } catch (error) {
        console.error('Submission error:', error);
        
        // Show error message
        const errorMsg = error.message || 'Unable to submit request. Please try again or call us directly.';
        alert(`Error: ${errorMsg}\n\nFor immediate assistance, please call: 988`);
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
    }
});

// Optional: Check API connectivity on page load
async function checkAPIConnection() {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/health`);
        const data = await response.json();
        
        if (data.success) {
            console.log('✓ Connected to backend API');
        }
    } catch (error) {
        console.warn('⚠️ Backend API not reachable. Form submissions will not work.');
        console.warn('Make sure the backend server is running on port 5000');
    }
}

// Run connection check when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAPIConnection);
} else {
    checkAPIConnection();
}

// ============================================
// PRODUCTION DEPLOYMENT CHECKLIST
// ============================================

/*
BEFORE DEPLOYING TO PRODUCTION:

1. Environment Variables:
   ✓ Set NODE_ENV=production
   ✓ Use strong JWT_SECRET (32+ random characters)
   ✓ Configure production MongoDB URI
   ✓ Set up production email service
   ✓ Update FRONTEND_URL to production domain

2. Security:
   ✓ Enable HTTPS (SSL certificate)
   ✓ Set secure cookie options
   ✓ Configure helmet.js properly
   ✓ Set up rate limiting
   ✓ Enable CORS for specific domains only
   ✓ Remove console.logs containing sensitive data

3. Database:
   ✓ Use MongoDB Atlas or managed database
   ✓ Set up database backups
   ✓ Configure database indexes
   ✓ Set up monitoring

4. Monitoring:
   ✓ Set up error logging (e.g., Sentry)
   ✓ Configure uptime monitoring
   ✓ Set up application logs
   ✓ Monitor API performance

5. Email:
   ✓ Use transactional email service (SendGrid, Mailgun)
   ✓ Set up email templates
   ✓ Configure SPF/DKIM records
   ✓ Test email deliverability

6. Testing:
   ✓ Test all API endpoints
   ✓ Test form submissions
   ✓ Test email notifications
   ✓ Test error scenarios
   ✓ Load testing
   ✓ Security testing

7. Documentation:
   ✓ API documentation
   ✓ Setup instructions
   ✓ Deployment guide
   ✓ Troubleshooting guide
*/