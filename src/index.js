// Mom i want the db schemas
// okay sweetie here it is
/*
-- Create new table with UUID primary key
CREATE TABLE images (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	data text NOT NULL,
	mimetype text NOT NULL
);

CREATE TABLE post_ips (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid NOT NULL REFERENCES images(id) ON DELETE CASCADE,
    ip_hash text NOT NULL,
    created_at timestamp DEFAULT NOW()
);

CREATE TABLE banned_ips (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_hash text NOT NULL UNIQUE,
    banned_at timestamp DEFAULT NOW(),
    banned_by text DEFAULT 'admin'
);


CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE INDEX idx_post_ips_post_id ON post_ips(post_id);
CREATE INDEX idx_post_ips_ip_hash ON post_ips(ip_hash);
CREATE INDEX idx_banned_ips_ip_hash ON banned_ips(ip_hash);

-- Create admin sessions table
CREATE TABLE admin_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_token text NOT NULL UNIQUE,
    created_at timestamp DEFAULT NOW(),
    expires_at timestamp NOT NULL,
    ip_hash text,
    user_agent text,
    is_active boolean DEFAULT true
);

-- Create index for fast session lookups
CREATE INDEX idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX idx_admin_sessions_expires ON admin_sessions(expires_at);

-- Create admin users table (in case you want multiple admins later)
CREATE TABLE admin_users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    username text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    created_at timestamp DEFAULT NOW(),
    is_active boolean DEFAULT true
);

-- Insert default admin user (you should change this password!)
-- Password is 'admin123' - CHANGE THIS IMMEDIATELY!
INSERT INTO admin_users (username, password_hash) 
VALUES ('admin', '$2b$10$Ym9yzES/c/HMvuGN93/Dzu/4ZwWg2RWFtX8CATIR3bcOQzN4Vr43C');

Thank you mom
no problem sweetie */


require('dotenv').config();
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');
const app = express();
const upload = multer();
const PORT = process.env.PORT || 3000;
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const path = require('path')

app.use(express.static(path.join(process.cwd(), 'src', 'public')));

if (process.env.LOCKED === 'true') {
	app.use((req, res) => {
		res.status(403).send('down, come back later');
	});
}


// Helper function to calculate stats from metadata only
async function getImageStats(images) {
  const stats = {
    total: images.length,
    hidden: 0,
    visible: 0,
    luckySurvivor: 0,
    extremeNuclear: 0,
    normalShit: 0,
    totalSize: 0,
    avgSize: 0
  };

  for (const img of images) {
    const [_, ...meta] = img.mimetype.split(';');
    const metaObj = Object.fromEntries(meta.map(s => s.split('=')));
    const roll = parseFloat(metaObj.roll || '0');

    if (metaObj.hidden === 'true') {
      stats.hidden++;
    } else {
      stats.visible++;
    }

    if (roll >= 50) {
      stats.luckySurvivor++;
    } else if (roll < 25) {
      stats.extremeNuclear++;
    } else {
      stats.normalShit++;
    }
  }

  // Get size stats from a sample of recent images
  const { data: sampleImages } = await supabase
    .from('images')
    .select('data')
    .order('id', { ascending: false })
    .limit(10);  // Sample size of 10 recent images

  if (sampleImages && sampleImages.length > 0) {
    const sampleSize = sampleImages.reduce((acc, img) => 
      acc + (img.data ? Buffer.from(img.data, 'base64').length : 0), 0);
    stats.avgSize = sampleSize / sampleImages.length;
    stats.totalSize = stats.avgSize * stats.total; // Estimate total size
  }

  return stats;
}

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(express.static('public'));

// Shittification functions
async function shitifyImageExtreme(buffer, mimetype) {
    try {
        console.log(`Processing image: ${mimetype}, size: ${buffer.length} bytes`)
        
        // NUCLEAR SHITTIFICATION - destroy this image completely
        let shittyBuffer = buffer
        
        // Apply shittification in MULTIPLE PASSES for maximum destruction
        for (let pass = 0; pass < 3; pass++) {
            shittyBuffer = await sharp(shittyBuffer)
                .resize(Math.max(50, 300 - (pass * 50)), Math.max(50, 225 - (pass * 37)), { 
                    fit: 'inside',
                    kernel: 'nearest' // pixelated scaling
                })
                .blur(0.5 + (pass * 0.3))
                .modulate({
                    brightness: 0.9 - (pass * 0.1),
                    saturation: 1.2 + (pass * 0.2),
                    hue: pass * 5
                })
                .sharpen({ sigma: 1, m1: 0.5, m2: 0.2 }) // over-sharpen for artifacts
                .jpeg({ 
                    quality: Math.max(1, 5 - pass), // gets shittier each pass
                    progressive: false
                })
                .toBuffer()
            
            console.log(`Pass ${pass + 1}: ${shittyBuffer.length} bytes`)
        }
        
        console.log(`TRIPLE NUCLEAR SHITIFIED: IT'S COMPLETELY FUCKED NOW`)
        
        return {
            buffer: shittyBuffer,
            mimetype: 'image/jpeg'
        }
    } catch (error) {
        console.error('Failed to nuke image:', error)
        // Even the fallback is shit
        try {
            const fallbackBuffer = await sharp(buffer)
                .resize(100, 75)
                .jpeg({ quality: 1 })
                .toBuffer()
            return { buffer: fallbackBuffer, mimetype: 'image/jpeg' }
        } catch (fallbackError) {
            return { buffer, mimetype }
        }
    }
}

async function shitifyImageUltra(buffer, mimetype) {
    try {
        console.log(`Processing image: ${mimetype}, size: ${buffer.length} bytes`)
        
        // MAXIMUM SHITTIFICATION - make it look like absolute garbage
        const shittyBuffer = await sharp(buffer)
            .resize(400, 300, { 
                fit: 'inside', 
                withoutEnlargement: false,
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            })
            // Add blur to make it even more shit
            .blur(1.5)
            // Reduce colors to make it look like a 90s GIF
            .median(3)
            // Convert to JPEG with absolutely dogshit quality
            .jpeg({ 
                quality: 3, // LOWEST POSSIBLE QUALITY (was 10, now 3)
                progressive: false,
                mozjpeg: false,
                chromaSubsampling: '4:2:0' // aggressive chroma subsampling for extra artifacts
            })
            .toBuffer()
        
        console.log(`Shitified image: original ${buffer.length} -> shitty ${shittyBuffer.length} bytes`)
        
        // DOUBLE SHITTIFICATION - compress the already shit image again!
        const doubleShitBuffer = await sharp(shittyBuffer)
            .resize(300, 225, { fit: 'inside' }) // make it even smaller
            .modulate({
                brightness: 0.8,    // make it darker
                saturation: 1.5,    // oversaturate colors
                hue: 10            // shift hue slightly for that "off" look
            })
            .gamma(1.2)            // adjust gamma for that washed out look
            .jpeg({ 
                quality: 2,        // EVEN LOWER QUALITY
                progressive: false 
            })
            .toBuffer()
        
        console.log(`DOUBLE SHITIFIED: ${doubleShitBuffer.length} bytes - IT'S FUCKING TERRIBLE NOW`)
        
        return {
            buffer: doubleShitBuffer,
            mimetype: 'image/jpeg'
        }
    } catch (error) {
        console.error('Failed to shitify image:', error)
        console.error('Error details:', error.message)
        
        // Fallback that's still pretty shit
        try {
            const fallbackBuffer = await sharp(buffer)
                .resize(200, 150, { fit: 'inside' })
                .jpeg({ quality: 5 })
                .toBuffer()
            
            return {
                buffer: fallbackBuffer,
                mimetype: 'image/jpeg'
            }
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError)
            return { buffer, mimetype }
        }
    }
}

async function gamblingShitifyImage(buffer, mimetype) {
    // ROLL THE DICE! 🎲🎰
    const roll = Math.random() * 100
    
    console.log(`🎰 GAMBLING TIME! Rolling dice... got ${roll.toFixed(2)}%`)
    
    let result = {}
    
    if (roll < 25) {
        // 25% chance - EXTREME NUCLEAR SHITTIFICATION
        console.log('🔥💀 JACKPOT! EXTREME NUCLEAR SHITTIFICATION ACTIVATED! 💀🔥')
        const shitResult = await shitifyImageExtreme(buffer, mimetype)
        result = {
            ...shitResult,
            gamblingResult: 'EXTREME_NUCLEAR',
            rollPercentage: roll.toFixed(2),
            resultMessage: '🔥💀 EXTREME NUCLEAR DESTRUCTION! Your image got NUKED! 💀🔥'
        }
    } else if (roll < 50) {
        // 25% chance - NORMAL ULTRA SHITTIFICATION  
        console.log('💩 NORMAL SHITTIFICATION - YOU GET SOME SHIT! 💩')
        const shitResult = await shitifyImageUltra(buffer, mimetype)
        result = {
            ...shitResult,
            gamblingResult: 'NORMAL_SHIT',
            rollPercentage: roll.toFixed(2),
            resultMessage: '💩 NORMAL SHITTIFICATION! Your image got moderately fucked! 💩'
        }
    } else {
        // 50% chance - NO SHITTIFICATION (LUCKY BASTARD)
        console.log('✨ LUCKY WINNER! NO SHITTIFICATION - YOUR IMAGE SURVIVES! ✨')
        result = {
            buffer,
            mimetype,
            gamblingResult: 'LUCKY_SURVIVOR',
            rollPercentage: roll.toFixed(2),
            resultMessage: '✨🍀 JACKPOT! Your image survived unharmed! LUCKY BASTARD! 🍀✨'
        }
    }
    
    return result
}

// Helper function to get client IP and hash it
function getHashedIP(req) {
  // Get the real IP address (handles proxies and load balancers)
  const ip = req.headers['x-forwarded-for'] || 
             req.headers['x-real-ip'] || 
             req.connection.remoteAddress || 
             req.socket.remoteAddress ||
             (req.connection.socket ? req.connection.socket.remoteAddress : null);
  
  // Hash the IP with SHA256
  return crypto.createHash('sha256').update(ip.toString()).digest('hex');
}

// Middleware to check if IP is banned
async function checkBannedIP(req, res, next) {
  try {
    const ipHash = getHashedIP(req);
    
    const { data: bannedIP, error } = await supabase
      .from('banned_ips')
      .select('banned_at')
      .eq('ip_hash', ipHash)
      .single();
    
    if (bannedIP) {
      return res.status(403).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Banned - pissandshitimages</title>
            <style>
                body {
                    font-family: 'Comic Sans MS', cursive, sans-serif;
                    background: #f0f0f0;
                    margin: 0;
                    padding: 20px;
                    text-align: center;
                }
                h1 { color: #ff6b6b; font-size: 3em; }
                .banned-message {
                    background: #ff4757;
                    color: white;
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px auto;
                    max-width: 600px;
                }
            </style>
        </head>
        <body>
        <script src="/oneko.js"></script>
            <h1>🚫 BANNED 🚫</h1>
            <div class="banned-message">
                <h2>Your IP has been banned!</h2>
                <p>You were banned on: ${new Date(bannedIP.banned_at).toLocaleString()}</p>
                <p>Reason: Inappropriate content upload</p>
                <p>If you believe this is an error, contact the admin.</p>
            </div>
        </body>
        </html>
      `);
    }
    
    next();
  } catch (error) {
    console.error('Error checking banned IP:', error);
    next(); // Allow request to continue if there's an error
  }
}

// ShareX Config download
app.get('/sharexconfig', (req, res) => {
  const protocol = req.protocol;
  const host = req.get('host');
  const config = {
    "Version": "14.1.0",
    "Name": "pissandshitimages",
    "DestinationType": "ImageUploader",
    "RequestMethod": "POST",
    "RequestURL": `https://${req.get('host')}/upload`,
    "Body": "MultipartFormData",
    "FileFormName": "image",
    "Arguments": {
      "hide": "on"
    },
    "ResponseType": "RedirectionURL",
    "URL": "{responseurl}"
  };
  
  res.setHeader('Content-Disposition', 'attachment; filename="pissandshitimages.sxcu"');
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(config, null, 2));
});

// Upload page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>pissandshitimages - THE BEST IMAGE HOSTER EVER</title>
        <style>
            body {
                font-family: 'Comic Sans MS', cursive, sans-serif;
                background: #f0f0f0;
                margin: 0;
                padding: 20px;
                text-align: center;
            }
            h1 {
                color: #ff6b6b;
                text-shadow: 2px 2px 0 #000;
                font-size: 2.5em;
                margin-bottom: 30px;
            }
            form {
                background: #fff;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                display: inline-block;
                margin-bottom: 20px;
            }
            input[type="file"] {
                margin: 10px;
                padding: 10px;
                border: 2px dashed #ff6b6b;
                border-radius: 5px;
            }
            button {
                background: #ff6b6b;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                font-size: 1.2em;
                cursor: pointer;
                transition: transform 0.1s;
            }
            button:hover {
                transform: scale(1.05);
            }
            a {
                display: inline-block;
                background: #4ecdc4;
                color: white;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 5px;
                font-size: 1.2em;
                margin-top: 10px;
            }
            a:hover {
                background: #45b7b0;
            }
        </style>
    </head>
    <body>
        <script src="/oneko.js"></script>
        <h1>🚽 pissandshitimages - THE BEST IMAGE HOSTER EVER 💩</h1>
        <form action="/upload" method="post" enctype="multipart/form-data">
            <input type="file" name="image" required accept="image/*">
            <br>
            <div class="checkbox-wrapper">
                <input type="checkbox" name="hide" id="hide">
                <label for="hide">🕶️ Hide image (YOU COWARD!)</label>
            </div>
            <br>
            <button type="submit">📸 UPLOAD THIS SHIT! 🎲</button>
        </form>
        <style>
            .checkbox-wrapper {
                margin: 10px 0;
                font-size: 1.1em;
            }
            .checkbox-wrapper input[type="checkbox"] {
                margin-right: 8px;
                transform: scale(1.2);
            }
            .checkbox-wrapper label {
                color: #ff6b6b;
                cursor: pointer;
            }
        </style>
        <div style="margin-top: 20px;">
            <a href="/gallery" style="margin-right: 15px;">🖼️ View Gallery</a>
            <a href="/leaderboard" style="margin-right: 15px;">🏆 Leaderboard</a>
            <a href="/sharexconfig" class="sharex-button">📥 Download ShareX Config</a>
        </div>
        <style>
            .sharex-button {
                display: inline-block;
                background: #ff6b6b;
                color: white;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 5px;
                font-size: 1.2em;
                transition: transform 0.1s;
            }
            .sharex-button:hover {
                transform: scale(1.05);
                background: #ff5252;
            }
        </style>
    </body>
    </html>
  `);
});



// Handle upload
app.post('/upload', checkBannedIP, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');
  
  const { buffer, mimetype } = req.file;
  const result = await gamblingShitifyImage(buffer, mimetype);
  const base64 = result.buffer.toString('base64');
  const now = new Date().toISOString();
  const isHidden = req.body.hide === 'on';
  const customMimetype = `${result.mimetype};shitlevel=${result.gamblingResult};roll=${result.rollPercentage};date=${now};hidden=${isHidden}${isHidden ? ';message=🙈 THIS USER IS A COWARD WHO TRIED TO HIDE THEIR SHAME! 🙈' : ''}`;
  
  // Insert the image
  const { data, error } = await supabase
    .from('images')
    .insert([{ data: base64, mimetype: customMimetype }])
    .select('id')
    .single();
    
  if (error) return res.status(500).send('DB error: ' + error.message);
  
  // Track the IP that uploaded this image
  const ipHash = getHashedIP(req);
  const { error: ipError } = await supabase
    .from('post_ips')
    .insert([{ 
      post_id: data.id, 
      ip_hash: ipHash 
    }]);
    
  if (ipError) {
    console.error('Failed to track IP:', ipError);
    // Don't fail the upload if IP tracking fails
  }
  
  res.redirect(`/image/${data.id}`);
});

// Serve image with OpenGraph tags
app.get('/image/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('images')
    .select('*')
    .eq('id', req.params.id)
    .single();
  if (error || !data) return res.status(404).send('Image not found');
  const imageUrl = `${req.protocol}://${req.get('host')}/raw/${data.id}`;
  const [mimetype, ...meta] = data.mimetype.split(';');
  const metaObj = Object.fromEntries(meta.map(s => s.split('=')));
  const fileSizeMB = (Buffer.from(data.data, 'base64').length / 1024 / 1024).toFixed(2);
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <meta property="og:title" content="PISSANDSHITIMAGES.VERCEL.APP - THE BEST IMAGE HOSTER EVER" />
        <meta property="og:description" content="OOOOHHHH!!111 i just wasted ${fileSizeMB} PENTABYTES TO SHOW YOU THIS GARBAGE" />
        <meta property="og:image" content="${imageUrl}" />
        <meta property="og:type" content="image" />
        <meta property="twitter:card" content="summary_large_image" />
        <title>pissandshitimages - view</title>
        <style>
            body {
                font-family: 'Comic Sans MS', cursive, sans-serif;
                background: #f0f0f0;
                margin: 0;
                padding: 20px;
                text-align: center;
            }
            h1 {
                color: #ff6b6b;
                text-shadow: 2px 2px 0 #000;
                font-size: 2.5em;
                margin-bottom: 30px;
            }
            .image-container {
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                display: inline-block;
                margin-bottom: 20px;
            }
            img {
                max-width: 90vw;
                max-height: 80vh;
                border-radius: 5px;
            }
            .info {
                margin: 20px 0;
                font-size: 1.2em;
            }
            .shitification {
                background: #ff6b6b;
                color: white;
                padding: 10px;
                border-radius: 5px;
                margin: 10px;
                display: inline-block;
            }
            .date {
                background: #4ecdc4;
                color: white;
                padding: 10px;
                border-radius: 5px;
                margin: 10px;
                display: inline-block;
            }
            a {
                display: inline-block;
                background: #4ecdc4;
                color: white;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 5px;
                font-size: 1.2em;
            }
            a:hover {
                background: #45b7b0;
            }
        </style>
    </head>
    <body>
        <script src="/oneko.js"></script>
        <h1>🚽 pissandshitimages 💩</h1>
        <div class="image-container">
            <img src="${imageUrl}" alt="Shitified image" />
            <div class="info">
                <div class="shitification">
                    🎲 Shitification: ${metaObj.shitlevel?.replace('_', ' ') || 'unknown'} (${metaObj.roll || '??'}%)
                </div>
                <div class="date">
                    📅 Date: ${new Date(metaObj.date).toLocaleString() || 'unknown'}
                </div>
                ${metaObj.hidden === 'true' ? `
                <div class="shame" style="background: #ff4757; color: white; padding: 10px; border-radius: 5px; margin: 10px; display: inline-block;">
                    ${metaObj.message || '🙈 THIS USER IS A COWARD WHO TRIED TO HIDE THEIR SHAME! 🙈'}
                </div>` : ''}
            </div>
            <a href="/gallery">🔙 Back to gallery</a>
        </div>
    </body>
    </html>
  `);
});

// Serve raw image
app.get('/raw/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('images')
    .select('*')
    .eq('id', req.params.id)
    .single();
  if (error || !data) return res.status(404).send('Image not found');
  const [mimetype] = data.mimetype.split(';');
  res.set('Content-Type', mimetype);
  res.send(Buffer.from(data.data, 'base64'));
});

// Gallery page
// Gallery page with fixed pagination
app.get('/gallery', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = 20;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  // First, get all images for stats (metadata only)
  const { data: allImages, error: statsError } = await supabase
    .from('images')
    .select('mimetype');
    
  if (statsError) return res.status(500).send('DB error: ' + statsError.message);
  
  // Get stats without loading full data
  const stats = await getImageStats(allImages);

  // Filter out hidden images from allImages for visible count
  const visibleImagesForCount = allImages.filter(img => {
    const [_, ...meta] = img.mimetype.split(';');
    const metaObj = Object.fromEntries(meta.map(s => s.split('=')));
    return metaObj.hidden !== 'true';
  });

  const totalVisibleImages = visibleImagesForCount.length;
  const totalPages = Math.ceil(totalVisibleImages / perPage);

  // Get more images than needed to account for hidden ones
  const bufferSize = Math.ceil(perPage * 1.5); // Get 50% more to account for hidden images
  const expandedTo = from + bufferSize - 1;

  // Get paginated images for display, without data column but with larger buffer
  const { data: rawImages, error } = await supabase
    .from('images')
    .select('id,mimetype')
    .order('id', { ascending: false })
    .range(from, expandedTo);
    
  if (error) return res.status(500).send('DB error: ' + error.message);
  
  // Filter out hidden images and take only what we need for this page
  const visibleImages = (rawImages || [])
    .filter(img => {
      const [_, ...meta] = img.mimetype.split(';');
      const metaObj = Object.fromEntries(meta.map(s => s.split('=')));
      return metaObj.hidden !== 'true';
    })
    .slice(0, perPage); // Take only the number we need for this page

  const items = visibleImages.map(img => {
    const [mimetype, ...meta] = img.mimetype.split(';');
    const metaObj = Object.fromEntries(meta.map(s => s.split('=')));
    const roll = parseFloat(metaObj.roll || '0');
    let shitLevel;
    if (roll >= 50) {
      shitLevel = 'LUCKY SURVIVOR';
    } else if (roll < 25) {
      shitLevel = 'EXTREME NUCLEAR';
    } else {
      shitLevel = 'NORMAL SHIT';
    }
    return `
      <div class="image-card">
        <div class="image-wrapper">
          <a href="/image/${img.id}">
            <img src="/raw/${img.id}" alt="Shitified image" />
          </a>
        </div>
        <div class="info">
          <div class="shitification ${roll >= 50 ? 'lucky-survivor' : ''}">
            ${roll >= 50 ? '✨' : '🎲'} ${shitLevel} (${roll.toFixed(2)}%)
          </div>
          <div class="date">
            📅 ${new Date(metaObj.date).toLocaleString() || 'unknown'}
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Generate pagination HTML
  const generatePagination = () => {
    let paginationHTML = '';
    
    // Previous button
    if (page > 1) {
      paginationHTML += `<a href="/gallery?page=${page - 1}" class="prev-next">⬅️ Previous</a>`;
    } else {
      paginationHTML += `<span class="prev-next disabled">⬅️ Previous</span>`;
    }

    // Page numbers
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, page + 2);

    // First page and ellipsis if needed
    if (startPage > 1) {
      paginationHTML += `<a href="/gallery?page=1">1</a>`;
      if (startPage > 2) {
        paginationHTML += `<span class="ellipsis">...</span>`;
      }
    }

    // Page range around current page
    for (let i = startPage; i <= endPage; i++) {
      if (i === page) {
        paginationHTML += `<span class="current">${i}</span>`;
      } else {
        paginationHTML += `<a href="/gallery?page=${i}">${i}</a>`;
      }
    }

    // Last page and ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        paginationHTML += `<span class="ellipsis">...</span>`;
      }
      paginationHTML += `<a href="/gallery?page=${totalPages}">${totalPages}</a>`;
    }

    // Next button
    if (page < totalPages) {
      paginationHTML += `<a href="/gallery?page=${page + 1}" class="prev-next">Next ➡️</a>`;
    } else {
      paginationHTML += `<span class="prev-next disabled">Next ➡️</span>`;
    }

    return paginationHTML;
  };

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Gallery - pissandshitimages</title>
        <style>
            body {
                font-family: 'Comic Sans MS', cursive, sans-serif;
                background: #f0f0f0;
                margin: 0;
                padding: 20px;
                text-align: center;
            }
            h1 {
                color: #ff6b6b;
                text-shadow: 2px 2px 0 #000;
                font-size: 2.5em;
                margin-bottom: 30px;
            }
            .gallery {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 20px;
                padding: 20px;
                max-width: 1200px;
                margin: 0 auto;
            }
            .image-card {
                background: white;
                padding: 10px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                transition: transform 0.2s;
            }
            .image-card:hover {
                transform: scale(1.02);
            }
            .image-wrapper {
                position: relative;
                width: 100%;
                padding-bottom: 75%; /* 4:3 aspect ratio */
                overflow: hidden;
                border-radius: 5px;
            }
            .image-wrapper a {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: none;
                padding: 0;
            }
            .image-wrapper a:hover {
                background: none;
            }
            .image-card img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 5px;
            }
            .info {
                margin-top: 10px;
                font-size: 0.9em;
            }
            .shitification {
                background: #ff6b6b;
                color: white;
                padding: 5px;
                border-radius: 5px;
                margin: 5px;
            }
            .shitification.lucky-survivor {
                background: #4CAF50;
                animation: sparkle 1.5s infinite;
            }
            @keyframes sparkle {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            .date {
                background: #4ecdc4;
                color: white;
                padding: 5px;
                border-radius: 5px;
                margin: 5px;
            }
            .upload-button {
                display: inline-block;
                background: #ff6b6b;
                color: white;
                text-decoration: none;
                padding: 15px 30px;
                border-radius: 5px;
                font-size: 1.2em;
                margin-bottom: 20px;
                transition: transform 0.1s;
            }
            .upload-button:hover {
                transform: scale(1.05);
                background: #ff5252;
            }
            .stats-container {
                max-width: 1200px;
                margin: 0 auto 20px auto;
            }
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin: 20px;
            }
            .stat-box {
                background: white;
                padding: 15px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .stat-box h3 {
                color: #ff6b6b;
                margin-top: 0;
                margin-bottom: 10px;
            }
            .nav-buttons {
                margin-bottom: 20px;
            }
            .pagination {
                margin: 30px 0;
                text-align: center;
            }
            .pagination a, .pagination span {
                display: inline-block;
                padding: 10px 15px;
                margin: 0 5px;
                text-decoration: none;
                border-radius: 5px;
                transition: all 0.2s;
            }
            .pagination a {
                background: #ff6b6b;
                color: white;
            }
            .pagination a:hover {
                background: #ff5252;
                transform: scale(1.05);
            }
            .pagination .current {
                background: #ff5252;
                color: white;
                font-weight: bold;
            }
            .pagination .disabled {
                background: #cccccc;
                color: #999;
                cursor: not-allowed;
            }
            .pagination .prev-next {
                background: #4ecdc4;
                font-weight: bold;
            }
            .pagination .prev-next:hover {
                background: #45b7b0;
            }
            .pagination .prev-next.disabled {
                background: #cccccc;
                color: #999;
            }
            .pagination .ellipsis {
                background: none;
                color: #666;
                cursor: default;
            }
            .page-info {
                background: white;
                padding: 15px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                margin-bottom: 20px;
                max-width: 1200px;
                margin-left: auto;
                margin-right: auto;
                margin-bottom: 20px;
            }
        </style>
    </head>
    <body>
        <script src="/oneko.js"></script>
        <h1>🖼️ Gallery - pissandshitimages 💩</h1>
        <div class="stats-container">
            <div class="stats-grid">
                <div class="stat-box">
                    <h3>🖼️ Image Counts</h3>
                    <p>Total Images: ${stats.total}</p>
                    <p>Visible Images: ${stats.visible}</p>
                    <p>Hidden Images: ${stats.hidden}</p>
                </div>
                <div class="stat-box">
                    <h3>🎲 Roll Stats</h3>
                    <p>✨ Lucky Survivors: ${stats.luckySurvivor}</p>
                    <p>💩 Normal Shit: ${stats.normalShit}</p>
                    <p>💀 Extreme Nuclear: ${stats.extremeNuclear}</p>
                </div>
                <div class="stat-box">
                    <h3>📦 Storage</h3>
                    <p>Total Size: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB</p>
                    <p>Avg Size: ${(stats.totalSize / stats.total / 1024).toFixed(2)} KB per image</p>
                </div>
            </div>
        </div>
        
        <div class="page-info">
            <strong>📄 Page ${page} of ${totalPages}</strong> - 
            Showing ${visibleImages.length} images 
            (${((page - 1) * perPage) + 1} - ${((page - 1) * perPage) + visibleImages.length} of ${totalVisibleImages} visible images)
        </div>

        <div class="nav-buttons">
            <a href="/" class="upload-button" style="margin-right: 10px;">📸 Upload More Shit!</a>
            <a href="/leaderboard" class="upload-button">🏆 View Leaderboard</a>
        </div>
        
        <div class="pagination">
            ${generatePagination()}
        </div>
        
        <div class="gallery">${items}</div>
        
        <div class="pagination">
            ${generatePagination()}
        </div>
    </body>
    </html>
  `);
});


// Helper function to generate secure session tokens
function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Helper function to get client IP and hash it (reused from before)
function getHashedIP(req) {
  const ip = req.headers['x-forwarded-for'] || 
             req.headers['x-real-ip'] || 
             req.connection.remoteAddress || 
             req.socket.remoteAddress ||
             (req.connection.socket ? req.connection.socket.remoteAddress : null);
  
  return crypto.createHash('sha256').update(ip.toString()).digest('hex');
}

// Clean up expired sessions (run periodically)
async function cleanupExpiredSessions() {
  const { error } = await supabase
    .from('admin_sessions')
    .delete()
    .lt('expires_at', new Date().toISOString());
    
  if (error) {
    console.error('Failed to cleanup expired sessions:', error);
  }
}

// Run cleanup every hour
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);

// Secure admin authentication middleware
const authenticateAdmin = async (req, res, next) => {
  try {
    const sessionToken = req.cookies.adminSession;
    
    if (!sessionToken) {
      return res.redirect('/admin/login');
    }

    // Verify session in database
    const { data: session, error } = await supabase
      .from('admin_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !session) {
      // Invalid or expired session, clear cookie
      res.clearCookie('adminSession');
      return res.redirect('/admin/login');
    }

    // Optional: Check if IP matches (for extra security)
    const currentIPHash = getHashedIP(req);
    if (session.ip_hash && session.ip_hash !== currentIPHash) {
      console.warn('Session IP mismatch detected');
      // You can choose to invalidate session here or just log it
      // For now, we'll allow it but log the warning
    }

    // Session is valid, attach session info to request
    req.adminSession = session;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.clearCookie('adminSession');
    res.redirect('/admin/login');
  }
};

// Admin login page
app.get('/admin/login', (req, res) => {
  const error = req.query.error;
  const rateLimited = req.query.rate_limited === 'true';
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Admin Login - pissandshitimages</title>
        <style>
            body {
                font-family: 'Comic Sans MS', cursive, sans-serif;
                background: #f0f0f0;
                margin: 0;
                padding: 20px;
                text-align: center;
            }
            h1 {
                color: #ff6b6b;
                text-shadow: 2px 2px 0 #000;
                font-size: 2.5em;
                margin-bottom: 30px;
            }
            .login-form {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                display: inline-block;
                margin-bottom: 20px;
                max-width: 400px;
            }
            input[type="text"], input[type="password"] {
                width: 100%;
                padding: 12px;
                margin: 10px 0;
                border: 2px solid #ff6b6b;
                border-radius: 5px;
                font-size: 1.1em;
                box-sizing: border-box;
            }
            button {
                background: #ff6b6b;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 5px;
                font-size: 1.2em;
                cursor: pointer;
                transition: transform 0.1s;
                width: 100%;
            }
            button:hover {
                transform: scale(1.05);
                background: #ff5252;
            }
            .error-message {
                background: #ff4757;
                color: white;
                padding: 10px;
                border-radius: 5px;
                margin-bottom: 15px;
            }
            .rate-limit-message {
                background: #ff9800;
                color: white;
                padding: 15px;
                border-radius: 5px;
                margin-bottom: 15px;
            }
            label {
                display: block;
                text-align: left;
                margin-top: 15px;
                margin-bottom: 5px;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <script src="/oneko.js"></script>
        <h1>🔒 Admin Login - pissandshitimages</h1>
        <form class="login-form" action="/admin/login" method="post">
            ${rateLimited ? '<div class="rate-limit-message">⚠️ Too many failed attempts. Please wait before trying again.</div>' : ''}
            ${error ? `<div class="error-message">❌ ${error}</div>` : ''}
            
            <label for="username">Username:</label>
            <input type="text" name="username" id="username" required autocomplete="username">
            
            <label for="password">Password:</label>
            <input type="password" name="password" id="password" required autocomplete="current-password">
            
            <button type="submit">🔑 Login</button>
        </form>
    </body>
    </html>
  `);
});

// Rate limiting for login attempts
const loginAttempts = new Map();

function isRateLimited(ip) {
  const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 };
  const now = Date.now();
  const timeWindow = 15 * 60 * 1000; // 15 minutes
  
  // Reset counter if time window has passed
  if (now - attempts.lastAttempt > timeWindow) {
    attempts.count = 0;
  }
  
  return attempts.count >= 5; // Max 5 attempts per 15 minutes
}

function recordLoginAttempt(ip, success = false) {
  const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 };
  
  if (success) {
    // Clear attempts on successful login
    loginAttempts.delete(ip);
  } else {
    attempts.count++;
    attempts.lastAttempt = Date.now();
    loginAttempts.set(ip, attempts);
  }
}

// Handle admin login
app.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const clientIP = getHashedIP(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';
    
    // Check rate limiting
    if (isRateLimited(clientIP)) {
      return res.redirect('/admin/login?rate_limited=true');
    }
    
    if (!username || !password) {
      recordLoginAttempt(clientIP, false);
      return res.redirect('/admin/login?error=Username and password are required');
    }
    
    // Get admin user from database
    const { data: adminUser, error: userError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single();
    
    if (userError || !adminUser) {
      recordLoginAttempt(clientIP, false);
      return res.redirect('/admin/login?error=Invalid username or password');
    }
    
    // Verify password
    const passwordValid = await bcrypt.compare(password, adminUser.password_hash);
    
    if (!passwordValid) {
      recordLoginAttempt(clientIP, false);
      return res.redirect('/admin/login?error=Invalid username or password');
    }
    
    // Create new session
    const sessionToken = generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour sessions
    
    const { error: sessionError } = await supabase
      .from('admin_sessions')
      .insert([{
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        ip_hash: clientIP,
        user_agent: userAgent
      }]);
    
    if (sessionError) {
      console.error('Failed to create session:', sessionError);
      return res.redirect('/admin/login?error=Login failed. Please try again.');
    }
    
    // Set secure session cookie
    res.cookie('adminSession', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    recordLoginAttempt(clientIP, true); // Clear rate limiting
    res.redirect('/admin');
    
  } catch (error) {
    console.error('Login error:', error);
    res.redirect('/admin/login?error=An error occurred. Please try again.');
  }
});

// Admin logout
app.get('/admin/logout', authenticateAdmin, async (req, res) => {
  try {
    const sessionToken = req.cookies.adminSession;
    
    if (sessionToken) {
      // Invalidate session in database
      await supabase
        .from('admin_sessions')
        .update({ is_active: false })
        .eq('session_token', sessionToken);
    }
    
    res.clearCookie('adminSession');
    res.redirect('/admin/login');
  } catch (error) {
    console.error('Logout error:', error);
    res.clearCookie('adminSession');
    res.redirect('/admin/login');
  }
});

// Add session management page
app.get('/admin/sessions', authenticateAdmin, async (req, res) => {
  const { data: sessions, error } = await supabase
    .from('admin_sessions')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
    
  if (error) return res.status(500).send('DB error: ' + error.message);
  
  const currentSessionToken = req.cookies.adminSession;
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Active Sessions - Admin Panel</title>
        <style>
            body {
                font-family: 'Comic Sans MS', cursive, sans-serif;
                background: #f0f0f0;
                margin: 0;
                padding: 20px;
            }
            h1 {
                color: #ff6b6b;
                text-shadow: 2px 2px 0 #000;
                font-size: 2.5em;
                margin-bottom: 30px;
                text-align: center;
            }
            .sessions-list {
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            table {
                width: 100%;
                border-collapse: collapse;
            }
            th, td {
                padding: 10px;
                border-bottom: 1px solid #ddd;
                text-align: left;
            }
            th {
                background: #ff6b6b;
                color: white;
            }
            tr:nth-child(even) {
                background: #f9f9f9;
            }
            .current-session {
                background: #e8f5e8 !important;
                font-weight: bold;
            }
            .revoke-btn {
                background: #ff4757;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 3px;
                cursor: pointer;
            }
            .revoke-btn:hover {
                background: #ff6b6b;
            }
            .revoke-btn:disabled {
                background: #ccc;
                cursor: not-allowed;
            }
            .nav-button {
                display: inline-block;
                background: #ff6b6b;
                color: white;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 5px;
                margin-bottom: 20px;
            }
        </style>
    </head>
    <body>
        <script src="/oneko.js"></script>
        <h1>🔐 Active Admin Sessions</h1>
        <a href="/admin" class="nav-button">⬅️ Back to Admin Panel</a>
        
        <div class="sessions-list">
            <h2>Active Sessions (${sessions.length} total)</h2>
            <table>
                <tr>
                    <th>Session ID</th>
                    <th>Created</th>
                    <th>Expires</th>
                    <th>IP Hash</th>
                    <th>User Agent</th>
                    <th>Actions</th>
                </tr>
                ${sessions.map(session => `
                    <tr class="${session.session_token === currentSessionToken ? 'current-session' : ''}">
                        <td><code>${session.session_token.substring(0, 16)}...</code></td>
                        <td>${new Date(session.created_at).toLocaleString()}</td>
                        <td>${new Date(session.expires_at).toLocaleString()}</td>
                        <td><code>${session.ip_hash ? session.ip_hash.substring(0, 8) + '...' : 'N/A'}</code></td>
                        <td>${session.user_agent ? session.user_agent.substring(0, 50) + (session.user_agent.length > 50 ? '...' : '') : 'N/A'}</td>
                        <td>
                            ${session.session_token === currentSessionToken 
                              ? '<span style="color: green;">Current Session</span>'
                              : `<form action="/admin/revoke-session/${session.session_token}" method="post" style="display:inline;">
                                   <button type="submit" class="revoke-btn" onclick="return confirm('Revoke this session?')">
                                     🗑️ Revoke
                                   </button>
                                 </form>`
                            }
                        </td>
                    </tr>
                `).join('')}
            </table>
            ${sessions.length === 0 ? '<p>No active sessions found.</p>' : ''}
        </div>
    </body>
    </html>
  `);
});

// Revoke session
app.post('/admin/revoke-session/:token', authenticateAdmin, async (req, res) => {
  const { error } = await supabase
    .from('admin_sessions')
    .update({ is_active: false })
    .eq('session_token', req.params.token);
    
  if (error) {
    res.status(500).send('Error revoking session: ' + error.message);
  } else {
    res.redirect('/admin/sessions');
  }
});

// Password change functionality
app.get('/admin/change-password', authenticateAdmin, (req, res) => {
  const error = req.query.error;
  const success = req.query.success === 'true';
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Change Password - Admin Panel</title>
        <style>
            body {
                font-family: 'Comic Sans MS', cursive, sans-serif;
                background: #f0f0f0;
                margin: 0;
                padding: 20px;
                text-align: center;
            }
            h1 {
                color: #ff6b6b;
                text-shadow: 2px 2px 0 #000;
                font-size: 2.5em;
                margin-bottom: 30px;
            }
            .form-container {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                display: inline-block;
                max-width: 400px;
            }
            input[type="password"] {
                width: 100%;
                padding: 12px;
                margin: 10px 0;
                border: 2px solid #ff6b6b;
                border-radius: 5px;
                font-size: 1.1em;
                box-sizing: border-box;
            }
            button {
                background: #ff6b6b;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 5px;
                font-size: 1.2em;
                cursor: pointer;
                width: 100%;
            }
            button:hover {
                background: #ff5252;
            }
            .error-message {
                background: #ff4757;
                color: white;
                padding: 10px;
                border-radius: 5px;
                margin-bottom: 15px;
            }
            .success-message {
                background: #4CAF50;
                color: white;
                padding: 10px;
                border-radius: 5px;
                margin-bottom: 15px;
            }
            label {
                display: block;
                text-align: left;
                margin-top: 15px;
                margin-bottom: 5px;
                font-weight: bold;
            }
            .nav-button {
                display: inline-block;
                background: #4ecdc4;
                color: white;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 5px;
                margin-bottom: 20px;
            }
        </style>
    </head>
    <body>
        <script src="/oneko.js"></script>
        <h1>🔐 Change Admin Password</h1>
        <a href="/admin" class="nav-button">⬅️ Back to Admin Panel</a>
        
        <form class="form-container" action="/admin/change-password" method="post">
            ${success ? '<div class="success-message">✅ Password changed successfully!</div>' : ''}
            ${error ? `<div class="error-message">❌ ${error}</div>` : ''}
            
            <label for="currentPassword">Current Password:</label>
            <input type="password" name="currentPassword" id="currentPassword" required>
            
            <label for="newPassword">New Password:</label>
            <input type="password" name="newPassword" id="newPassword" required minlength="8">
            
            <label for="confirmPassword">Confirm New Password:</label>
            <input type="password" name="confirmPassword" id="confirmPassword" required minlength="8">
            
            <button type="submit">🔐 Change Password</button>
        </form>
    </body>
    </html>
  `);
});

app.post('/admin/change-password', authenticateAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.redirect('/admin/change-password?error=All fields are required');
    }
    
    if (newPassword !== confirmPassword) {
      return res.redirect('/admin/change-password?error=New passwords do not match');
    }
    
    if (newPassword.length < 8) {
      return res.redirect('/admin/change-password?error=Password must be at least 8 characters long');
    }
    
    // Get current admin user (assuming username is 'admin' for now)
    const { data: adminUser, error: userError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', 'admin')
      .single();
    
    if (userError || !adminUser) {
      return res.redirect('/admin/change-password?error=User not found');
    }
    
    // Verify current password
    const currentPasswordValid = await bcrypt.compare(currentPassword, adminUser.password_hash);
    
    if (!currentPasswordValid) {
      return res.redirect('/admin/change-password?error=Current password is incorrect');
    }
    
    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    
    // Update password in database
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({ password_hash: newPasswordHash })
      .eq('id', adminUser.id);
    
    if (updateError) {
      console.error('Failed to update password:', updateError);
      return res.redirect('/admin/change-password?error=Failed to update password');
    }
    
    // Invalidate all other sessions except current one
    const currentSessionToken = req.cookies.adminSession;
    await supabase
      .from('admin_sessions')
      .update({ is_active: false })
      .neq('session_token', currentSessionToken);
    
    res.redirect('/admin/change-password?success=true');
    
  } catch (error) {
    console.error('Change password error:', error);
    res.redirect('/admin/change-password?error=An error occurred');
  }
});

// Admin panel
app.get('/admin', authenticateAdmin, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = 20;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  // Check for success messages
  const bannedSuccess = req.query.banned === 'success';
  const deletedSuccess = req.query.deleted === 'success';
  const visibilitySuccess = req.query.visibility === 'success';

  // Get all images for stats
  const { data: allImages, error: statsError } = await supabase
    .from('images')
    .select('mimetype');

  if (statsError) return res.status(500).send('DB error: ' + statsError.message);

  const stats = await getImageStats(allImages);

  // Get paginated images without data column, but also get IP tracking info
  const { data: images, count, error } = await supabase
    .from('images')
    .select(`
      id,
      mimetype,
      post_ips(ip_hash, created_at)
    `, { count: 'exact' })
    .order('id', { ascending: false })
    .range(from, to);

  if (error) return res.status(500).send('DB error: ' + error.message);

  // Get banned IPs count
  const { count: bannedIPsCount } = await supabase
    .from('banned_ips')
    .select('*', { count: 'exact', head: true });

  const totalPages = Math.ceil(count / perPage);

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Admin Panel - pissandshitimages</title>
        <style>
            body {
                font-family: 'Comic Sans MS', cursive, sans-serif;
                background: #f0f0f0;
                margin: 0;
                padding: 20px;
            }
            h1 {
                color: #ff6b6b;
                text-shadow: 2px 2px 0 #000;
                font-size: 2.5em;
                margin-bottom: 30px;
                text-align: center;
            }
            .stats {
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                margin-bottom: 20px;
            }
            .image-list {
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            table {
                width: 100%;
                border-collapse: collapse;
            }
            th, td {
                padding: 10px;
                border-bottom: 1px solid #ddd;
                text-align: left;
            }
            th {
                background: #ff6b6b;
                color: white;
            }
            tr:nth-child(even) {
                background: #f9f9f9;
            }
            .delete-btn {
                background: #ff4757;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 3px;
                cursor: pointer;
                margin-right: 5px;
            }
            .delete-btn:hover {
                background: #ff6b6b;
            }
            .ban-btn {
                background: #ff6b6b;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 3px;
                cursor: pointer;
                margin-right: 5px;
            }
            .ban-btn:hover {
                background: #ff4757;
            }
            .ban-btn:disabled {
                background: #ccc;
                cursor: not-allowed;
            }
            .thumbnail {
                max-width: 100px;
                max-height: 100px;
                object-fit: cover;
                border-radius: 3px;
            }
            .pagination {
                margin-top: 20px;
                text-align: center;
            }
            .pagination a {
                display: inline-block;
                padding: 8px 16px;
                text-decoration: none;
                background-color: #ff6b6b;
                color: white;
                border-radius: 5px;
                margin: 0 5px;
            }
            .pagination a:hover {
                background-color: #ff5252;
            }
            .pagination .current {
                background-color: #ff5252;
                font-weight: bold;
            }
            .pagination .disabled {
                background-color: #cccccc;
                pointer-events: none;
            }
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-top: 20px;
            }
            .stat-box {
                background: #fff;
                padding: 15px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .stat-box h3 {
                color: #ff6b6b;
                margin-top: 0;
                margin-bottom: 10px;
            }
            .shitlevel-badge {
                display: inline-block;
                padding: 5px 10px;
                border-radius: 15px;
                color: white;
                font-weight: bold;
            }
            .shitlevel-badge.lucky {
                background: #4CAF50;
            }
            .shitlevel-badge.extreme {
                background: #f44336;
            }
            .shitlevel-badge.normal {
                background: #ff9800;
            }
            .visibility-btn {
                padding: 5px 10px;
                border: none;
                border-radius: 3px;
                cursor: pointer;
                margin-right: 5px;
            }
            .visibility-btn.visible {
                background: #4CAF50;
                color: white;
            }
            .visibility-btn.hidden {
                background: #ff9800;
                color: white;
            }
            .visibility-btn:hover {
                opacity: 0.9;
            }
            .success-message {
                background: #4CAF50;
                color: white;
                padding: 15px;
                border-radius: 5px;
                margin-bottom: 20px;
                text-align: center;
            }
            .nav-links {
                text-align: center;
                margin-bottom: 20px;
            }
            .nav-links a {
                display: inline-block;
                background: #4ecdc4;
                color: white;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 5px;
                margin: 0 10px;
            }
            .nav-links a:hover {
                background: #45b7b0;
            }
            .ip-info {
                color: #666;
                font-size: 0.9em;
                font-family: monospace;
            }
        </style>
    </head>
    <body>
        <script src="/oneko.js"></script>
        <h1>🛠️ Admin Panel - pissandshitimages</h1>
        
        <div class="nav-links">
            <a href="/admin/banned-ips">🚫 View Banned IPs (${bannedIPsCount || 0})</a>
            <a href="/admin/sessions">🔐 Active Sessions</a>
            <a href="/admin/change-password">🔑 Change Password</a>
            <a href="/gallery">🖼️ Gallery</a>
            <a href="/admin/logout">🚪 Logout</a>
        </div>
        
        ${bannedSuccess ? '<div class="success-message">✅ IP has been successfully banned!</div>' : ''}
        ${deletedSuccess ? '<div class="success-message">✅ Image has been successfully deleted!</div>' : ''}
        ${visibilitySuccess ? '<div class="success-message">✅ Image visibility has been successfully updated!</div>' : ''}
        
        <div class="stats">
            <h2>📊 Stats</h2>
            <div class="stats-grid">
                <div class="stat-box">
                    <h3>🖼️ Image Counts</h3>
                    <p>Total Images: ${stats.total}</p>
                    <p>Visible Images: ${stats.visible}</p>
                    <p>Hidden Images: ${stats.hidden}</p>
                    <p>Showing ${from + 1} - ${Math.min(to + 1, count)} of ${count}</p>
                </div>
                <div class="stat-box">
                    <h3>🎲 Roll Stats</h3>
                    <p>✨ Lucky Survivors: ${stats.luckySurvivor}</p>
                    <p>💩 Normal Shit: ${stats.normalShit}</p>
                    <p>💀 Extreme Nuclear: ${stats.extremeNuclear}</p>
                </div>
                <div class="stat-box">
                    <h3>📦 Storage</h3>
                    <p>Total Size: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB</p>
                    <p>Avg Size: ${(stats.totalSize / stats.total / 1024).toFixed(2)} KB per image</p>
                </div>
                <div class="stat-box">
                    <h3>🚫 Banned IPs</h3>
                    <p>Total Banned: ${bannedIPsCount || 0}</p>
                    <p><a href="/admin/banned-ips" style="color: #ff6b6b;">Manage Banned IPs →</a></p>
                </div>
            </div>
            
            <div style="margin-top: 20px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h3 style="color: #ff6b6b; margin-top: 0;">🛠️ Image Management by ID</h3>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <input type="text" id="imageIdInput" placeholder="Paste image ID here" required 
                           style="flex: 1; padding: 10px; border: 2px solid #ff6b6b; border-radius: 5px;">
                    
                    <form action="/admin/delete-by-id" method="post" style="display: inline;">
                        <input type="hidden" name="imageId" id="deleteImageId">
                        <button type="submit" class="delete-btn" 
                                style="padding: 10px 15px; background: #ff4757; color: white; border: none; border-radius: 5px; cursor: pointer;"
                                onclick="document.getElementById('deleteImageId').value = document.getElementById('imageIdInput').value; return confirm('Are you sure you want to delete this image?')">
                            🗑️ Delete
                        </button>
                    </form>
                    
                    <form action="/admin/toggle-visibility-by-id" method="post" style="display: inline;">
                        <input type="hidden" name="imageId" id="toggleImageId">
                        <button type="submit" class="visibility-btn visible" 
                                style="padding: 10px 15px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;"
                                onclick="document.getElementById('toggleImageId').value = document.getElementById('imageIdInput').value; return confirm('Are you sure you want to toggle the visibility of this image?')">
                            👁️ Toggle Visibility
                        </button>
                    </form>
                    
                    <form action="/admin/ban-ip-by-id" method="post" style="display: inline;">
                        <input type="hidden" name="imageId" id="banImageId">
                        <button type="submit" class="ban-btn" 
                                style="padding: 10px 15px; background: #ff6b6b; color: white; border: none; border-radius: 5px; cursor: pointer;"
                                onclick="document.getElementById('banImageId').value = document.getElementById('imageIdInput').value; return confirm('Are you sure you want to ban the IP associated with this image? This will prevent them from uploading any more images.')">
                            🚫 Ban IP
                        </button>
                    </form>
                </div>
            </div>
        </div>

        <div class="image-list">
            <h2>🖼️ Images</h2>
            <table>
                <tr>
                    <th>Thumbnail</th>
                    <th>ID</th>
                    <th>Shitification</th>
                    <th>Date</th>
                    <th>IP Info</th>
                    <th>Actions</th>
                </tr>
                ${images.map(img => {
                  const [mimetype, ...meta] = img.mimetype.split(';');
                  const metaObj = Object.fromEntries(meta.map(s => s.split('=')));
                  const roll = parseFloat(metaObj.roll || '0');
                  let shitLevel;
                  if (roll >= 50) {
                    shitLevel = 'LUCKY SURVIVOR';
                  } else if (roll < 25) {
                    shitLevel = 'EXTREME NUCLEAR';
                  } else {
                    shitLevel = 'NORMAL SHIT';
                  }
                  
                  const hasIP = img.post_ips && img.post_ips.length > 0;
                  const ipHash = hasIP ? img.post_ips[0].ip_hash : null;
                  
                  return `
                    <tr>
                        <td><img src="/raw/${img.id}" class="thumbnail" loading="lazy" /></td>
                        <td><a href="/image/${img.id}" target="_blank">${img.id}</a></td>
                        <td>
                            <span class="shitlevel-badge ${roll >= 50 ? 'lucky' : roll < 25 ? 'extreme' : 'normal'}">
                                ${shitLevel} (${roll.toFixed(2)}%)
                            </span>
                        </td>
                        <td>${new Date(metaObj.date).toLocaleString()}</td>
                        <td class="ip-info">
                            ${hasIP ? `${ipHash.substring(0, 8)}...` : 'No IP tracked'}
                        </td>
                        <td>
                            <form action="/admin/toggle-visibility/${img.id}" method="post" style="display:inline;">
                                <input type="hidden" name="currentState" value="${metaObj.hidden === 'true'}">
                                <button type="submit" class="visibility-btn ${metaObj.hidden === 'true' ? 'hidden' : 'visible'}">
                                    ${metaObj.hidden === 'true' ? '👁️ Show' : '🕶️ Hide'}
                                </button>
                            </form>
                            ${hasIP ? `
                                <form action="/admin/ban-ip/${img.id}" method="post" style="display:inline;">
                                    <button type="submit" class="ban-btn" onclick="return confirm('Are you sure you want to ban this IP? This will prevent them from uploading any more images.')">
                                        🚫 Ban IP
                                    </button>
                                </form>
                            ` : '<button class="ban-btn" disabled>🚫 No IP</button>'}
                            <form action="/admin/delete/${img.id}" method="post" style="display:inline;">
                                <button type="submit" class="delete-btn" onclick="return confirm('Are you sure you want to delete this image?')">🗑️ Delete</button>
                            </form>
                        </td>
                    </tr>
                  `;
                }).join('')}
            </table>

            <div class="pagination">
                ${page > 1 ? `<a href="/admin?page=${page - 1}">⬅️ Previous</a>` : '<a class="disabled">⬅️ Previous</a>'}
                ${Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = page + i - 2;
                  if (pageNum > 0 && pageNum <= totalPages) {
                    return `<a href="/admin?page=${pageNum}" class="${pageNum === page ? 'current' : ''}">${pageNum}</a>`;
                  }
                  return '';
                }).join('')}
                ${page < totalPages ? `<a href="/admin?page=${page + 1}">Next ➡️</a>` : '<a class="disabled">Next ➡️</a>'}
            </div>
        </div>
    </body>
    </html>
  `);
});


// Add ban IP functionality to admin panel
app.post('/admin/ban-ip/:id', authenticateAdmin, async (req, res) => {
  try {
    // Get the IP hash for this post
    const { data: postIP, error: getIPError } = await supabase
      .from('post_ips')
      .select('ip_hash')
      .eq('post_id', req.params.id)
      .single();
      
    if (getIPError || !postIP) {
      return res.status(404).send('IP not found for this post');
    }
    
    // Add IP to banned list
    const { error: banError } = await supabase
      .from('banned_ips')
      .insert([{ ip_hash: postIP.ip_hash }]);
      
    if (banError) {
      // IP might already be banned
      if (banError.code === '23505') { // unique violation
        return res.status(400).send('IP is already banned');
      }
      return res.status(500).send('Error banning IP: ' + banError.message);
    }
    
    res.redirect('/admin?banned=success');
  } catch (error) {
    res.status(500).send('Error: ' + error.message);
  }
});

// Add unban IP functionality
app.post('/admin/unban-ip/:hash', authenticateAdmin, async (req, res) => {
  const { error } = await supabase
    .from('banned_ips')
    .delete()
    .eq('ip_hash', req.params.hash);
    
  if (error) {
    res.status(500).send('Error unbanning IP: ' + error.message);
  } else {
    res.redirect('/admin/banned-ips');
  }
});

// Add banned IPs management page
app.get('/admin/banned-ips', authenticateAdmin, async (req, res) => {
  const { data: bannedIPs, error } = await supabase
    .from('banned_ips')
    .select('*')
    .order('banned_at', { ascending: false });
    
  if (error) return res.status(500).send('DB error: ' + error.message);
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Banned IPs - Admin Panel</title>
        <style>
            body {
                font-family: 'Comic Sans MS', cursive, sans-serif;
                background: #f0f0f0;
                margin: 0;
                padding: 20px;
            }
            h1 {
                color: #ff6b6b;
                text-shadow: 2px 2px 0 #000;
                font-size: 2.5em;
                margin-bottom: 30px;
                text-align: center;
            }
            .banned-list {
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            table {
                width: 100%;
                border-collapse: collapse;
            }
            th, td {
                padding: 10px;
                border-bottom: 1px solid #ddd;
                text-align: left;
            }
            th {
                background: #ff6b6b;
                color: white;
            }
            tr:nth-child(even) {
                background: #f9f9f9;
            }
            .unban-btn {
                background: #4CAF50;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 3px;
                cursor: pointer;
            }
            .unban-btn:hover {
                background: #45a049;
            }
            .nav-button {
                display: inline-block;
                background: #ff6b6b;
                color: white;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 5px;
                margin-bottom: 20px;
            }
        </style>
    </head>
    <body>
        <script src="/oneko.js"></script>
        <h1>🚫 Banned IPs Management</h1>
        <a href="/admin" class="nav-button">⬅️ Back to Admin Panel</a>
        
        <div class="banned-list">
            <h2>Banned IP Addresses (${bannedIPs.length} total)</h2>
            <table>
                <tr>
                    <th>IP Hash</th>
                    <th>Banned Date</th>
                    <th>Banned By</th>
                    <th>Actions</th>
                </tr>
                ${bannedIPs.map(ban => `
                    <tr>
                        <td><code>${ban.ip_hash.substring(0, 16)}...</code></td>
                        <td>${new Date(ban.banned_at).toLocaleString()}</td>
                        <td>${ban.banned_by}</td>
                        <td>
                            <form action="/admin/unban-ip/${ban.ip_hash}" method="post" style="display:inline;">
                                <button type="submit" class="unban-btn" onclick="return confirm('Are you sure you want to unban this IP?')">
                                    🔓 Unban
                                </button>
                            </form>
                        </td>
                    </tr>
                `).join('')}
            </table>
            ${bannedIPs.length === 0 ? '<p>No banned IPs found.</p>' : ''}
        </div>
    </body>
    </html>
  `);
});

// Delete image
// Toggle image visibility
app.post('/admin/toggle-visibility/:id', authenticateAdmin, async (req, res) => {
  const { data: image, error: getError } = await supabase
    .from('images')
    .select('mimetype')
    .eq('id', req.params.id)
    .single();

  if (getError) {
    res.status(500).send('Error getting image: ' + getError.message);
    return;
  }

  const [baseMimetype, ...meta] = image.mimetype.split(';');
  const metaObj = Object.fromEntries(meta.map(s => s.split('=')));
  const currentlyHidden = metaObj.hidden === 'true';
  
  // Toggle the hidden state
  metaObj.hidden = (!currentlyHidden).toString();
  
  // Update or add the message
  if (!currentlyHidden) {
    metaObj.message = '🙈 THIS USER IS A COWARD WHO TRIED TO HIDE THEIR SHAME! 🙈';
  } else {
    delete metaObj.message;
  }

  // Reconstruct mimetype string
  const newMimetype = [baseMimetype, ...Object.entries(metaObj).map(([k, v]) => `${k}=${v}`)].join(';');

  const { error: updateError } = await supabase
    .from('images')
    .update({ mimetype: newMimetype })
    .eq('id', req.params.id);

  if (updateError) {
    res.status(500).send('Error updating image: ' + updateError.message);
  } else {
    res.redirect('/admin');
  }
});

app.post('/admin/delete/:id', authenticateAdmin, async (req, res) => {
  const { error } = await supabase
    .from('images')
    .delete()
    .eq('id', req.params.id);
  
  if (error) {
    res.status(500).send('Error deleting image: ' + error.message);
  } else {
    res.redirect('/admin');
  }
});

// Toggle image visibility by ID (from form input)
app.post('/admin/toggle-visibility-by-id', authenticateAdmin, async (req, res) => {
  const { imageId } = req.body;
  
  if (!imageId) {
    return res.status(400).send('Image ID is required');
  }
  
  try {
    // Check if the image exists first
    const { data: image, error: getError } = await supabase
      .from('images')
      .select('mimetype')
      .eq('id', imageId)
      .single();
    
    if (getError || !image) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Error - Image Not Found</title>
            <style>
                body {
                    font-family: 'Comic Sans MS', cursive, sans-serif;
                    background: #f0f0f0;
                    margin: 0;
                    padding: 20px;
                    text-align: center;
                }
                h1 { color: #ff6b6b; font-size: 2em; }
                .error-box {
                    background: #ff4757;
                    color: white;
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px auto;
                    max-width: 600px;
                }
                a {
                    display: inline-block;
                    background: #4ecdc4;
                    color: white;
                    text-decoration: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
        <script src="/oneko.js"></script>
            <h1>❌ Error: Image Not Found</h1>
            <div class="error-box">
                <p>The image with ID <strong>${imageId}</strong> was not found in the database.</p>
                <p>Please check the ID and try again.</p>
            </div>
            <a href="/admin">⬅️ Back to Admin Panel</a>
        </body>
        </html>
      `);
    }
    
    // Parse the mimetype to get metadata
    const [baseMimetype, ...meta] = image.mimetype.split(';');
    const metaObj = Object.fromEntries(meta.map(s => s.split('=')));
    const currentlyHidden = metaObj.hidden === 'true';
    
    // Toggle the hidden state
    metaObj.hidden = (!currentlyHidden).toString();
    
    // Update or add the message
    if (!currentlyHidden) {
      metaObj.message = '🙈 THIS USER IS A COWARD WHO TRIED TO HIDE THEIR SHAME! 🙈';
    } else {
      delete metaObj.message;
    }

    // Reconstruct mimetype string
    const newMimetype = [baseMimetype, ...Object.entries(metaObj).map(([k, v]) => `${k}=${v}`)].join(';');

    // Update the image
    const { error: updateError } = await supabase
      .from('images')
      .update({ mimetype: newMimetype })
      .eq('id', imageId);
    
    if (updateError) {
      throw new Error(updateError.message);
    }
    
    // Redirect back to admin panel with success message
    res.redirect('/admin?visibility=success');
    
  } catch (error) {
    console.error('Error toggling image visibility by ID:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
          <title>Error - Visibility Toggle Failed</title>
          <style>
              body {
                  font-family: 'Comic Sans MS', cursive, sans-serif;
                  background: #f0f0f0;
                  margin: 0;
                  padding: 20px;
                  text-align: center;
              }
              h1 { color: #ff6b6b; font-size: 2em; }
              .error-box {
                  background: #ff4757;
                  color: white;
                  padding: 20px;
                  border-radius: 10px;
                  margin: 20px auto;
                  max-width: 600px;
              }
              a {
                  display: inline-block;
                  background: #4ecdc4;
                  color: white;
                  text-decoration: none;
                  padding: 10px 20px;
                  border-radius: 5px;
                  margin-top: 20px;
              }
          </style>
      </head>
      <body>
        <script src="/oneko.js"></script>
          <h1>❌ Error: Visibility Toggle Failed</h1>
          <div class="error-box">
              <p>Failed to toggle visibility for image with ID <strong>${imageId}</strong>.</p>
              <p>Error: ${error.message}</p>
          </div>
          <a href="/admin">⬅️ Back to Admin Panel</a>
      </body>
      </html>
    `);
  }
});

// Delete image by ID (from form input)
app.post('/admin/delete-by-id', authenticateAdmin, async (req, res) => {
  const { imageId } = req.body;
  
  if (!imageId) {
    return res.status(400).send('Image ID is required');
  }
  
  try {
    // Check if the image exists first
    const { data, error: checkError } = await supabase
      .from('images')
      .select('id')
      .eq('id', imageId)
      .single();
    
    if (checkError || !data) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Error - Image Not Found</title>
            <style>
                body {
                    font-family: 'Comic Sans MS', cursive, sans-serif;
                    background: #f0f0f0;
                    margin: 0;
                    padding: 20px;
                    text-align: center;
                }
                h1 { color: #ff6b6b; font-size: 2em; }
                .error-box {
                    background: #ff4757;
                    color: white;
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px auto;
                    max-width: 600px;
                }
                a {
                    display: inline-block;
                    background: #4ecdc4;
                    color: white;
                    text-decoration: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
        <script src="/oneko.js"></script>
            <h1>❌ Error: Image Not Found</h1>
            <div class="error-box">
                <p>The image with ID <strong>${imageId}</strong> was not found in the database.</p>
                <p>Please check the ID and try again.</p>
            </div>
            <a href="/admin">⬅️ Back to Admin Panel</a>
        </body>
        </html>
      `);
    }
    
    // Delete the image
    const { error: deleteError } = await supabase
      .from('images')
      .delete()
      .eq('id', imageId);
    
    if (deleteError) {
      throw new Error(deleteError.message);
    }
    
    // Redirect back to admin panel with success message
    res.redirect('/admin?deleted=success');
    
  } catch (error) {
    console.error('Error deleting image by ID:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
          <title>Error - Delete Failed</title>
          <style>
              body {
                  font-family: 'Comic Sans MS', cursive, sans-serif;
                  background: #f0f0f0;
                  margin: 0;
                  padding: 20px;
                  text-align: center;
              }
              h1 { color: #ff6b6b; font-size: 2em; }
              .error-box {
                  background: #ff4757;
                  color: white;
                  padding: 20px;
                  border-radius: 10px;
                  margin: 20px auto;
                  max-width: 600px;
              }
              a {
                  display: inline-block;
                  background: #4ecdc4;
                  color: white;
                  text-decoration: none;
                  padding: 10px 20px;
                  border-radius: 5px;
                  margin-top: 20px;
              }
          </style>
      </head>
      <body>
        <script src="/oneko.js"></script>
          <h1>❌ Error: Delete Failed</h1>
          <div class="error-box">
              <p>Failed to delete image with ID <strong>${imageId}</strong>.</p>
              <p>Error: ${error.message}</p>
          </div>
          <a href="/admin">⬅️ Back to Admin Panel</a>
      </body>
      </html>
    `);
  }
});

// Ban IP by image ID (from form input)
app.post('/admin/ban-ip-by-id', authenticateAdmin, async (req, res) => {
  const { imageId } = req.body;
  
  if (!imageId) {
    return res.status(400).send('Image ID is required');
  }
  
  try {
    // Get the IP hash for this post
    const { data: postIP, error: getIPError } = await supabase
      .from('post_ips')
      .select('ip_hash')
      .eq('post_id', imageId)
      .single();
      
    if (getIPError || !postIP) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Error - IP Not Found</title>
            <style>
                body {
                    font-family: 'Comic Sans MS', cursive, sans-serif;
                    background: #f0f0f0;
                    margin: 0;
                    padding: 20px;
                    text-align: center;
                }
                h1 { color: #ff6b6b; font-size: 2em; }
                .error-box {
                    background: #ff4757;
                    color: white;
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px auto;
                    max-width: 600px;
                }
                a {
                    display: inline-block;
                    background: #4ecdc4;
                    color: white;
                    text-decoration: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
        <script src="/oneko.js"></script>
            <h1>❌ Error: IP Not Found</h1>
            <div class="error-box">
                <p>No IP address was found for the image with ID <strong>${imageId}</strong>.</p>
                <p>This image may not have IP tracking information.</p>
            </div>
            <a href="/admin">⬅️ Back to Admin Panel</a>
        </body>
        </html>
      `);
    }
    
    // Add IP to banned list
    const { error: banError } = await supabase
      .from('banned_ips')
      .insert([{ ip_hash: postIP.ip_hash }]);
      
    if (banError) {
      // IP might already be banned
      if (banError.code === '23505') { // unique violation
        return res.status(400).send(`
          <!DOCTYPE html>
          <html>
          <head>
              <title>Error - IP Already Banned</title>
              <style>
                  body {
                      font-family: 'Comic Sans MS', cursive, sans-serif;
                      background: #f0f0f0;
                      margin: 0;
                      padding: 20px;
                      text-align: center;
                  }
                  h1 { color: #ff6b6b; font-size: 2em; }
                  .error-box {
                      background: #ff9800;
                      color: white;
                      padding: 20px;
                      border-radius: 10px;
                      margin: 20px auto;
                      max-width: 600px;
                  }
                  a {
                      display: inline-block;
                      background: #4ecdc4;
                      color: white;
                      text-decoration: none;
                      padding: 10px 20px;
                      border-radius: 5px;
                      margin-top: 20px;
                  }
              </style>
          </head>
          <body>
          <script src="/oneko.js"></script>
              <h1>⚠️ IP Already Banned</h1>
              <div class="error-box">
                  <p>The IP address associated with image ID <strong>${imageId}</strong> is already banned.</p>
              </div>
              <a href="/admin">⬅️ Back to Admin Panel</a>
          </body>
          </html>
        `);
      }
      throw new Error(banError.message);
    }
    
    // Redirect back to admin panel with success message
    res.redirect('/admin?banned=success');
    
  } catch (error) {
    console.error('Error banning IP by image ID:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
          <title>Error - Ban Failed</title>
          <style>
              body {
                  font-family: 'Comic Sans MS', cursive, sans-serif;
                  background: #f0f0f0;
                  margin: 0;
                  padding: 20px;
                  text-align: center;
              }
              h1 { color: #ff6b6b; font-size: 2em; }
              .error-box {
                  background: #ff4757;
                  color: white;
                  padding: 20px;
                  border-radius: 10px;
                  margin: 20px auto;
                  max-width: 600px;
              }
              a {
                  display: inline-block;
                  background: #4ecdc4;
                  color: white;
                  text-decoration: none;
                  padding: 10px 20px;
                  border-radius: 5px;
                  margin-top: 20px;
              }
          </style>
      </head>
      <body>
        <script src="/oneko.js"></script>
          <h1>❌ Error: Ban Failed</h1>
          <div class="error-box">
              <p>Failed to ban IP for image with ID <strong>${imageId}</strong>.</p>
              <p>Error: ${error.message}</p>
          </div>
          <a href="/admin">⬅️ Back to Admin Panel</a>
      </body>
      </html>
    `);
  }
});

// Admin logout
app.get('/admin/logout', (req, res) => {
  res.clearCookie('adminAuth');
  res.redirect('/admin/login');
});

// Leaderboard page
app.get('/leaderboard', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = 20;
  
  // First, get all images for stats (metadata only)
  const { data, error } = await supabase
    .from('images')
    .select('id,mimetype')
    .order('id', { ascending: false });
    
  if (error) return res.status(500).send('DB error: ' + error.message);
  
  // Filter out hidden images and parse roll percentages
  const visibleImages = (data || [])
    .filter(img => {
      const [_, ...meta] = img.mimetype.split(';');
      const metaObj = Object.fromEntries(meta.map(s => s.split('=')));
      return metaObj.hidden !== 'true';
    })
    .map(img => {
      const [_, ...meta] = img.mimetype.split(';');
      const metaObj = Object.fromEntries(meta.map(s => s.split('=')));
      const roll = parseFloat(metaObj.roll || '0');
      let shitlevel;
      if (roll >= 50) {
        shitlevel = 'LUCKY SURVIVOR';
      } else if (roll < 25) {
        shitlevel = 'EXTREME NUCLEAR';
      } else {
        shitlevel = 'NORMAL SHIT';
      }
      return {
        id: img.id,
        roll: roll,
        shitlevel: shitlevel,
        date: new Date(metaObj.date || Date.now()).toLocaleString()
      };
    })
    .sort((a, b) => b.roll - a.roll); // Sort by roll percentage, highest first
    
  // Calculate pagination values
  const totalImages = visibleImages.length;
  const totalPages = Math.ceil(totalImages / perPage);
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  
  // Get the images for the current page
  const rankedImages = visibleImages.slice(startIndex, endIndex);
  
  // Generate pagination HTML
  const generatePagination = () => {
    let paginationHTML = '';
    
    // Previous button
    if (page > 1) {
      paginationHTML += `<a href="/leaderboard?page=${page - 1}" class="prev-next">⬅️ Previous</a>`;
    } else {
      paginationHTML += `<span class="prev-next disabled">⬅️ Previous</span>`;
    }

    // Page numbers
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, page + 2);

    // First page and ellipsis if needed
    if (startPage > 1) {
      paginationHTML += `<a href="/leaderboard?page=1">1</a>`;
      if (startPage > 2) {
        paginationHTML += `<span class="ellipsis">...</span>`;
      }
    }

    // Page range around current page
    for (let i = startPage; i <= endPage; i++) {
      if (i === page) {
        paginationHTML += `<span class="current">${i}</span>`;
      } else {
        paginationHTML += `<a href="/leaderboard?page=${i}">${i}</a>`;
      }
    }

    // Last page and ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        paginationHTML += `<span class="ellipsis">...</span>`;
      }
      paginationHTML += `<a href="/leaderboard?page=${totalPages}">${totalPages}</a>`;
    }

    // Next button
    if (page < totalPages) {
      paginationHTML += `<a href="/leaderboard?page=${page + 1}" class="prev-next">Next ➡️</a>`;
    } else {
      paginationHTML += `<span class="prev-next disabled">Next ➡️</span>`;
    }

    return paginationHTML;
  };
  
  // Calculate the global rank for each image on the current page
  const rankedImagesWithGlobalRank = rankedImages.map((img, index) => {
    const globalRank = startIndex + index + 1; // +1 because ranks start at 1, not 0
    return { ...img, globalRank };
  })

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Leaderboard - pissandshitimages</title>
        <style>
            body {
                font-family: 'Comic Sans MS', cursive, sans-serif;
                background: #f0f0f0;
                margin: 0;
                padding: 20px;
                text-align: center;
            }
            h1 {
                color: #ff6b6b;
                text-shadow: 2px 2px 0 #000;
                font-size: 2.5em;
                margin-bottom: 30px;
            }
            .leaderboard {
                max-width: 1000px;
                margin: 0 auto;
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .image-row {
                display: flex;
                align-items: center;
                padding: 15px;
                border-bottom: 1px solid #eee;
                transition: transform 0.2s;
            }
            .image-row:hover {
                transform: scale(1.02);
                background: #f9f9f9;
            }
            .rank {
                font-size: 2em;
                font-weight: bold;
                width: 60px;
                color: #ff6b6b;
            }
            .medal-1 { color: #ffd700; } /* Gold */
            .medal-2 { color: #c0c0c0; } /* Silver */
            .medal-3 { color: #cd7f32; } /* Bronze */
            .image-wrapper {
                width: 100px;
                height: 75px;
                margin: 0 15px;
            }
            .image-wrapper img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 5px;
            }
            .info {
                flex-grow: 1;
                text-align: left;
            }
            .roll {
                font-size: 1.2em;
                font-weight: bold;
                color: #ff6b6b;
            }
            .shitlevel {
                margin-top: 5px;
                color: #666;
            }
            .date {
                color: #999;
                font-size: 0.9em;
            }
            .nav-buttons {
                margin-bottom: 20px;
            }
            .nav-button {
                display: inline-block;
                background: #ff6b6b;
                color: white;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 5px;
                margin: 0 10px;
                transition: transform 0.1s;
            }
            .nav-button:hover {
                transform: scale(1.05);
                background: #ff5252;
            }
            .pagination {
                margin: 30px 0;
                text-align: center;
            }
            .pagination a, .pagination span {
                display: inline-block;
                padding: 10px 15px;
                margin: 0 5px;
                text-decoration: none;
                border-radius: 5px;
                transition: all 0.2s;
            }
            .pagination a {
                background: #ff6b6b;
                color: white;
            }
            .pagination a:hover {
                background: #ff5252;
                transform: scale(1.05);
            }
            .pagination .current {
                background: #ff5252;
                color: white;
                font-weight: bold;
            }
            .pagination .disabled {
                background: #cccccc;
                color: #999;
                cursor: not-allowed;
            }
            .pagination .prev-next {
                background: #4ecdc4;
                font-weight: bold;
            }
            .pagination .prev-next:hover {
                background: #45b7b0;
            }
            .pagination .prev-next.disabled {
                background: #cccccc;
                color: #999;
            }
            .pagination .ellipsis {
                background: none;
                color: #666;
                cursor: default;
            }
            .page-info {
                background: white;
                padding: 15px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                margin-bottom: 20px;
                max-width: 1000px;
                margin-left: auto;
                margin-right: auto;
            }
        </style>
    </head>
    <body>
        <script src="/oneko.js"></script>
        <h1>🏆 Shitification Leaderboard 💩</h1>
        <div class="nav-buttons">
            <a href="/" class="nav-button">🏠 Home</a>
            <a href="/gallery" class="nav-button">🖼️ Gallery</a>
        </div>
        
        <div class="page-info">
            <p>Showing ${startIndex + 1}-${Math.min(startIndex + rankedImages.length, totalImages)} of ${totalImages} images</p>
        </div>
        
        <div class="pagination">
            ${generatePagination()}
        </div>
        
        <div class="leaderboard">
            ${rankedImagesWithGlobalRank.map((img, index) => `
                <div class="image-row">
                    <div class="rank ${img.globalRank <= 3 ? 'medal-' + img.globalRank : ''}">${img.globalRank}</div>
                    <div class="image-wrapper">
                        <a href="/image/${img.id}">
                            <img src="/raw/${img.id}" alt="Rank ${img.globalRank}" />
                        </a>
                    </div>
                    <div class="info">
                        <div class="roll">Roll: ${img.roll.toFixed(2)}%</div>
                        <div class="shitlevel">Level: ${img.shitlevel}</div>
                        <div class="date">Date: ${img.date}</div>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="pagination">
            ${generatePagination()}
        </div>
    </body>
    </html>
  `);
});

app.use((req, res, next) => {
	const forbiddenParams = ['env', 'process', 'secret'];
	for (const param of forbiddenParams) {
		if (req.query[param] !== undefined) {
			return res.status(403).send('Forbidden');
		}
	}
	next();
});


app.listen(PORT, () => {
  console.log(`pissandshitimages running on http://localhost:${PORT}`);
});