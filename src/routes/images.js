// Image routes
const express = require('express');
const router = express.Router();
const multer = require('multer');
const supabase = require('../config/database');
const { gamblingShitifyImage } = require('../utils/imageProcessing');
const { getHashedIP } = require('../utils/security');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Upload endpoint
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No image uploaded');
        }
        
        const file = req.file;
        const originalSize = file.size;
        
        console.log(`Received upload: ${file.originalname}, ${file.mimetype}, ${file.size} bytes`);
        
        // Process the image with gambling shitification
        const processedImage = await gamblingShitifyImage(file.buffer, file.mimetype);
        const processedSize = processedImage.buffer.length;
        
        // Generate a unique ID for the image
        const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
        
        // Store image in Supabase
        const { error: uploadError } = await supabase
            .from('images')
            .insert([
                {
                    id,
                    originalname: file.originalname,
                    mimetype: processedImage.mimetype,
                    data: processedImage.buffer,
                    originalSize,
                    processedSize,
                    gamblingResult: processedImage.gamblingResult,
                    rollPercentage: processedImage.rollPercentage,
                    resultMessage: processedImage.resultMessage
                }
            ]);
        
        if (uploadError) throw uploadError;
        
        // Track IP for moderation purposes
        const ipHash = getHashedIP(req.ip);
        
        const { error: ipError } = await supabase
            .from('post_ips')
            .insert([
                {
                    post_id: id,
                    ip_hash: ipHash
                }
            ]);
        
        if (ipError) {
            console.error('Error storing IP hash:', ipError);
            // Continue anyway, this is not critical
        }
        
        // If this is an API request (ShareX), return JSON
        if (req.headers['accept'] && req.headers['accept'].includes('application/json')) {
            return res.json({
                success: true,
                url: `/image/${id}`,
                gamblingResult: processedImage.gamblingResult,
                rollPercentage: processedImage.rollPercentage,
                resultMessage: processedImage.resultMessage
            });
        }
        
        // Otherwise redirect to the image page
        res.redirect(`/image/${id}`);
    } catch (error) {
        console.error('Upload error:', error);
        
        // If this is an API request (ShareX), return JSON error
        if (req.headers['accept'] && req.headers['accept'].includes('application/json')) {
            return res.status(500).json({
                success: false,
                error: 'Upload failed'
            });
        }
        
        res.status(500).send('Upload failed: ' + error.message);
    }
});

// Image view endpoint
router.get('/image/:id', async (req, res) => {
    try {
        const id = req.params.id;
        
        // Get image data from Supabase
        const { data, error } = await supabase
            .from('images')
            .select('id, originalname, mimetype, gamblingResult, rollPercentage, resultMessage, created_at')
            .eq('id', id)
            .single();
        
        if (error || !data) {
            return res.status(404).send('Image not found');
        }
        
        // Check if image is hidden
        const isHidden = data.mimetype.includes('hidden');
        
        // Format date
        const date = new Date(data.created_at).toLocaleString();
        
        // Determine result class for styling
        let resultClass = '';
        if (data.gamblingResult === 'LUCKY_SURVIVOR') {
            resultClass = 'lucky';
        } else if (data.gamblingResult === 'NORMAL_SHIT') {
            resultClass = 'normal';
        } else if (data.gamblingResult === 'EXTREME_NUCLEAR') {
            resultClass = 'extreme';
        }
        
        // Generate HTML for the image page
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${data.originalname} - Piss and Shit Images</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta property="og:title" content="${data.originalname} - Piss and Shit Images">
                <meta property="og:description" content="Roll: ${data.rollPercentage}% - ${data.resultMessage || data.gamblingResult}">
                <meta property="og:image" content="${req.protocol}://${req.get('host')}/raw/${id}">
                <meta property="og:url" content="${req.protocol}://${req.get('host')}/image/${id}">
                <meta property="og:type" content="website">
                <meta name="twitter:card" content="summary_large_image">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f5f5f5;
                        color: #333;
                    }
                    h1 {
                        color: #ff6600;
                        text-align: center;
                        word-break: break-word;
                    }
                    .image-container {
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        margin-bottom: 20px;
                        text-align: center;
                    }
                    .image-container img {
                        max-width: 100%;
                        max-height: 600px;
                        border-radius: 4px;
                    }
                    .image-info {
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        margin-bottom: 20px;
                    }
                    .info-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 10px;
                        padding-bottom: 10px;
                        border-bottom: 1px solid #eee;
                    }
                    .info-row:last-child {
                        border-bottom: none;
                        margin-bottom: 0;
                        padding-bottom: 0;
                    }
                    .info-label {
                        font-weight: bold;
                    }
                    .result {
                        font-weight: bold;
                    }
                    .lucky {
                        color: #28a745;
                    }
                    .normal {
                        color: #ffc107;
                    }
                    .extreme {
                        color: #dc3545;
                    }
                    .hidden-notice {
                        background-color: #f8d7da;
                        color: #721c24;
                        padding: 10px;
                        border-radius: 4px;
                        margin-bottom: 20px;
                        text-align: center;
                        font-weight: bold;
                    }
                    .links {
                        text-align: center;
                        margin-top: 20px;
                    }
                    .links a {
                        margin: 0 10px;
                        color: #0066cc;
                        text-decoration: none;
                    }
                    .links a:hover {
                        text-decoration: underline;
                    }
                    .direct-link {
                        word-break: break-all;
                    }
                </style>
            </head>
            <body>
                <h1>${data.originalname}</h1>
                
                ${isHidden ? `
                <div class="hidden-notice">
                    This image has been hidden by an administrator.
                </div>
                ` : ''}
                
                <div class="image-container">
                    <img src="/raw/${id}" alt="${data.originalname}">
                </div>
                
                <div class="image-info">
                    <div class="info-row">
                        <div class="info-label">Roll Result:</div>
                        <div class="result ${resultClass}">${data.rollPercentage}% - ${data.resultMessage || data.gamblingResult}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Uploaded:</div>
                        <div>${date}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Direct Link:</div>
                        <div class="direct-link">
                            <a href="/raw/${id}" target="_blank">${req.protocol}://${req.get('host')}/raw/${id}</a>
                        </div>
                    </div>
                </div>
                
                <div class="links">
                    <a href="/">Upload New Image</a>
                    <a href="/gallery">View Gallery</a>
                    <a href="/leaderboard">View Leaderboard</a>
                </div>
            </body>
            </html>
        `;
        
        res.send(html);
    } catch (error) {
        console.error('Error serving image page:', error);
        res.status(500).send('Error serving image page');
    }
});

// Raw image data endpoint
router.get('/raw/:id', async (req, res) => {
    try {
        const id = req.params.id;
        
        // Get image data from Supabase
        const { data, error } = await supabase
            .from('images')
            .select('mimetype, data')
            .eq('id', id)
            .single();
        
        if (error || !data) {
            return res.status(404).send('Image not found');
        }
        
        // Clean up mimetype (remove 'hidden' if present)
        const mimetype = data.mimetype.replace('-hidden', '');
        
        // Set content type and send image data
        res.setHeader('Content-Type', mimetype);
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        res.send(data.data);
    } catch (error) {
        console.error('Error serving raw image:', error);
        res.status(500).send('Error serving raw image');
    }
});

// Gallery endpoint
router.get('/gallery', async (req, res) => {
    try {
        // Get page from query params
        const page = parseInt(req.query.page) || 1;
        const perPage = 20;
        const offset = (page - 1) * perPage;
        
        // Get images that are not hidden
        const { data: images, error, count } = await supabase
            .from('images')
            .select('*', { count: 'exact' })
            .not('mimetype', 'ilike', '%hidden%')
            .order('created_at', { ascending: false })
            .range(offset, offset + perPage - 1);
        
        if (error) throw error;
        
        // Get image stats
        const stats = await getImageStats();
        
        // Calculate pagination
        const totalPages = Math.ceil(count / perPage);
        let pagination = '';
        
        if (totalPages > 1) {
            pagination = '<div class="pagination">';
            
            // Previous page
            if (page > 1) {
                pagination += `<a href="/gallery?page=${page - 1}">Previous</a>`;
            }
            
            // Page numbers
            const startPage = Math.max(1, page - 2);
            const endPage = Math.min(totalPages, page + 2);
            
            for (let i = startPage; i <= endPage; i++) {
                if (i === page) {
                    pagination += `<a href="/gallery?page=${i}" class="active">${i}</a>`;
                } else {
                    pagination += `<a href="/gallery?page=${i}">${i}</a>`;
                }
            }
            
            // Next page
            if (page < totalPages) {
                pagination += `<a href="/gallery?page=${page + 1}">Next</a>`;
            }
            
            pagination += '</div>';
        }
        
        // Generate HTML for the gallery
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Gallery - Piss and Shit Images</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f5f5f5;
                        color: #333;
                    }
                    h1, h2 {
                        color: #ff6600;
                        text-align: center;
                    }
                    .stats {
                        display: flex;
                        justify-content: space-around;
                        flex-wrap: wrap;
                        margin-bottom: 20px;
                    }
                    .stat-box {
                        background-color: #fff;
                        padding: 15px;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        margin: 10px;
                        min-width: 200px;
                        text-align: center;
                    }
                    .stat-value {
                        font-size: 24px;
                        font-weight: bold;
                        color: #ff6600;
                    }
                    .gallery {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                        gap: 20px;
                        margin-bottom: 20px;
                    }
                    .image-card {
                        background-color: #fff;
                        border-radius: 8px;
                        overflow: hidden;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        transition: transform 0.2s;
                    }
                    .image-card:hover {
                        transform: translateY(-5px);
                    }
                    .image-container {
                        height: 200px;
                        overflow: hidden;
                    }
                    .image-container img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                    .image-info {
                        padding: 15px;
                    }
                    .image-title {
                        font-weight: bold;
                        margin-bottom: 5px;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    .image-date {
                        color: #666;
                        font-size: 14px;
                        margin-bottom: 5px;
                    }
                    .image-roll {
                        font-weight: bold;
                    }
                    .lucky {
                        color: #28a745;
                    }
                    .normal {
                        color: #ffc107;
                    }
                    .extreme {
                        color: #dc3545;
                    }
                    .links {
                        text-align: center;
                        margin-top: 20px;
                    }
                    .links a {
                        margin: 0 10px;
                        color: #0066cc;
                        text-decoration: none;
                    }
                    .links a:hover {
                        text-decoration: underline;
                    }
                    .pagination {
                        display: flex;
                        justify-content: center;
                        margin-top: 20px;
                    }
                    .pagination a {
                        margin: 0 5px;
                        padding: 8px 12px;
                        background-color: #fff;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        color: #333;
                        text-decoration: none;
                    }
                    .pagination a:hover {
                        background-color: #f5f5f5;
                    }
                    .pagination .active {
                        background-color: #ff6600;
                        color: white;
                        border-color: #ff6600;
                    }
                    .no-images {
                        text-align: center;
                        padding: 20px;
                        font-size: 18px;
                        color: #666;
                        grid-column: 1 / -1;
                    }
                </style>
            </head>
            <body>
                <h1>Image Gallery</h1>
                
                <div class="stats">
                    <div class="stat-box">
                        <div>Total Images</div>
                        <div class="stat-value">${stats.totalCount}</div>
                    </div>
                    <div class="stat-box">
                        <div>Visible Images</div>
                        <div class="stat-value">${stats.visibleCount}</div>
                    </div>
                    <div class="stat-box">
                        <div>Hidden Images</div>
                        <div class="stat-value">${stats.hiddenCount}</div>
                    </div>
                </div>
                
                <div class="stats">
                    <div class="stat-box">
                        <div>Roll Stats</div>
                        <div class="stat-value">${stats.averageRoll}%</div>
                        <div>Average Roll</div>
                    </div>
                    <div class="stat-box">
                        <div>Storage</div>
                        <div class="stat-value">${stats.storage.savedPercentage}%</div>
                        <div>Space Saved</div>
                    </div>
                </div>
                
                <div class="gallery">
        `;
        
        if (images.length === 0) {
            html += `<div class="no-images">No images found</div>`;
        } else {
            images.forEach(image => {
                const date = new Date(image.created_at).toLocaleDateString();
                let resultClass = '';
                
                if (image.gamblingResult === 'LUCKY_SURVIVOR') {
                    resultClass = 'lucky';
                } else if (image.gamblingResult === 'NORMAL_SHIT') {
                    resultClass = 'normal';
                } else if (image.gamblingResult === 'EXTREME_NUCLEAR') {
                    resultClass = 'extreme';
                }
                
                html += `
                    <div class="image-card">
                        <a href="/image/${image.id}">
                            <div class="image-container">
                                <img src="/raw/${image.id}" alt="${image.originalname}">
                            </div>
                            <div class="image-info">
                                <div class="image-title">${image.originalname}</div>
                                <div class="image-date">${date}</div>
                                <div class="image-roll ${resultClass}">
                                    Roll: ${image.rollPercentage}%
                                </div>
                            </div>
                        </a>
                    </div>
                `;
            });
        }
        
        html += `
                </div>
                
                ${pagination}
                
                <div class="links">
                    <a href="/">Upload New Image</a>
                    <a href="/leaderboard">View Leaderboard</a>
                </div>
            </body>
            </html>
        `;
        
        res.send(html);
    } catch (error) {
        console.error('Error generating gallery:', error);
        res.status(500).send('Error generating gallery');
    }
});

module.exports = router;