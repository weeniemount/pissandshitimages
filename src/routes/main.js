// Main routes
const express = require('express');
const router = express.Router();
const supabase = require('../config/database');
const { getImageStats } = require('../utils/stats');

// Home page
router.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Piss and Shit Images</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
                }
                .upload-form {
                    background-color: #fff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    margin-bottom: 20px;
                }
                .form-group {
                    margin-bottom: 15px;
                }
                label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: bold;
                }
                input[type="file"] {
                    width: 100%;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    background-color: #f9f9f9;
                }
                button {
                    background-color: #ff6600;
                    color: white;
                    border: none;
                    padding: 10px 15px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px;
                }
                button:hover {
                    background-color: #e55c00;
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
                .warning {
                    background-color: #fff3cd;
                    color: #856404;
                    padding: 10px;
                    border-radius: 4px;
                    margin-bottom: 20px;
                    border-left: 4px solid #ffeeba;
                }
            </style>
        </head>
        <body>
            <h1>Piss and Shit Images</h1>
            
            <div class="warning">
                <strong>Warning:</strong> This service will randomly destroy your images. There's a 50% chance your image will be preserved, and a 50% chance it will be shittified to varying degrees. Upload at your own risk!
            </div>
            
            <div class="upload-form">
                <form action="/upload" method="post" enctype="multipart/form-data">
                    <div class="form-group">
                        <label for="image">Select an image to upload:</label>
                        <input type="file" id="image" name="image" accept="image/*" required>
                    </div>
                    <button type="submit">Upload & Roll the Dice!</button>
                </form>
            </div>
            
            <div class="links">
                <a href="/gallery">View Gallery</a>
                <a href="/leaderboard">View Leaderboard</a>
                <a href="/sharexconfig">Download ShareX Config</a>
            </div>
        </body>
        </html>
    `);
});

// ShareX config download
router.get('/sharexconfig', (req, res) => {
    // Get the host from the request
    const host = req.get('host');
    const protocol = req.protocol;
    
    // Create ShareX configuration
    const config = {
        "Version": "13.7.0",
        "Name": "Piss and Shit Images",
        "DestinationType": "ImageUploader",
        "RequestMethod": "POST",
        "RequestURL": `${protocol}://${host}/upload`,
        "Body": "MultipartFormData",
        "FileFormName": "image",
        "URL": "$json:url$",
        "ThumbnailURL": "$json:url$"
    };
    
    // Set headers for file download
    res.setHeader('Content-Disposition', 'attachment; filename="PissAndShitImages.sxcu"');
    res.setHeader('Content-Type', 'application/json');
    
    // Send the config as JSON
    res.send(JSON.stringify(config, null, 2));
});

// Leaderboard page
router.get('/leaderboard', async (req, res) => {
    try {
        // Get all images that are not hidden
        const { data: images, error } = await supabase
            .from('images')
            .select('*')
            .not('mimetype', 'ilike', '%hidden%')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Filter images with roll percentage and sort by roll percentage
        const sortedImages = images
            .filter(img => img.rollPercentage)
            .sort((a, b) => parseFloat(a.rollPercentage) - parseFloat(b.rollPercentage));
        
        // Get image stats
        const stats = await getImageStats();
        
        // Generate HTML for the leaderboard
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Leaderboard - Piss and Shit Images</title>
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
                    .leaderboard {
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .image-row {
                        display: flex;
                        align-items: center;
                        padding: 10px 0;
                        border-bottom: 1px solid #eee;
                    }
                    .rank {
                        font-size: 24px;
                        font-weight: bold;
                        width: 50px;
                        text-align: center;
                    }
                    .image-container {
                        width: 100px;
                        height: 75px;
                        margin-right: 15px;
                        overflow: hidden;
                        border-radius: 4px;
                    }
                    .image-container img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                    .image-details {
                        flex-grow: 1;
                    }
                    .roll {
                        font-size: 18px;
                        font-weight: bold;
                    }
                    .result {
                        margin-top: 5px;
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
                    .date {
                        color: #666;
                        font-size: 14px;
                    }
                    .no-images {
                        text-align: center;
                        padding: 20px;
                        font-size: 18px;
                        color: #666;
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
                </style>
            </head>
            <body>
                <h1>Leaderboard</h1>
                
                <div class="stats">
                    <div class="stat-box">
                        <div>Total Images</div>
                        <div class="stat-value">${stats.visibleCount}</div>
                    </div>
                    <div class="stat-box">
                        <div>Average Roll</div>
                        <div class="stat-value">${stats.averageRoll}%</div>
                    </div>
                    <div class="stat-box">
                        <div>Lucky Survivors</div>
                        <div class="stat-value">${stats.rollStats.lucky}</div>
                    </div>
                    <div class="stat-box">
                        <div>Normal Shittification</div>
                        <div class="stat-value">${stats.rollStats.normal}</div>
                    </div>
                    <div class="stat-box">
                        <div>Extreme Nuclear</div>
                        <div class="stat-value">${stats.rollStats.extreme}</div>
                    </div>
                </div>
                
                <div class="leaderboard">
                    <h2>Lowest Rolls (Most Unlucky)</h2>
        `;
        
        if (sortedImages.length === 0) {
            html += `<div class="no-images">No images found</div>`;
        } else {
            // Display top 50 lowest rolls
            const topImages = sortedImages.slice(0, 50);
            
            topImages.forEach((image, index) => {
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
                    <div class="image-row">
                        <div class="rank">#${index + 1}</div>
                        <div class="image-container">
                            <a href="/image/${image.id}" target="_blank">
                                <img src="/raw/${image.id}" alt="Image ${image.id}">
                            </a>
                        </div>
                        <div class="image-details">
                            <div class="roll">Roll: ${image.rollPercentage}%</div>
                            <div class="result ${resultClass}">${image.resultMessage || image.gamblingResult}</div>
                            <div class="date">Uploaded on ${date}</div>
                        </div>
                    </div>
                `;
            });
        }
        
        html += `
                </div>
                
                <div class="links">
                    <a href="/">Upload New Image</a>
                    <a href="/gallery">View Gallery</a>
                </div>
            </body>
            </html>
        `;
        
        res.send(html);
    } catch (error) {
        console.error('Error generating leaderboard:', error);
        res.status(500).send('Error generating leaderboard');
    }
});

module.exports = router;