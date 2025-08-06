// Main application file
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');

// Import middleware
const checkBannedIP = require('./middleware/checkBannedIP');
const securityChecks = require('./middleware/securityChecks');
const { scheduleSessionCleanup } = require('./utils/sessionCleanup');

// Import routes
const mainRoutes = require('./routes/main');
const imageRoutes = require('./routes/images');
const adminRoutes = require('./routes/admin');

// Import config
const { PORT } = require('./config/server');

// Initialize express app
const app = express();

// Configure multer for file uploads
const upload = multer({
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Apply security middleware
app.use(securityChecks.forbidSensitiveParams);
app.use(checkBannedIP);

// Make upload middleware available to routes
app.locals.upload = upload;

// Register routes
app.use('/', mainRoutes);
app.use('/', imageRoutes);
app.use('/admin', adminRoutes);

// Schedule cleanup of expired sessions
scheduleSessionCleanup();

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;