require('dotenv').config();
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');
const app = express();
const upload = multer();
const PORT = process.env.PORT || 3000;

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
        <h1>🚽 pissandshitimages - THE BEST IMAGE HOSTER EVER 💩</h1>
        <form action="/upload" method="post" enctype="multipart/form-data">
            <input type="file" name="image" required accept="image/*">
            <br>
            <button type="submit">📸 UPLOAD THIS SHIT! 🎲</button>
        </form>
        <br>
        <a href="/gallery">🖼️ View Gallery</a>
    </body>
    </html>
  `);
});

// Handle upload
app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');
  const { buffer, mimetype } = req.file;
  const result = await gamblingShitifyImage(buffer, mimetype);
  const base64 = result.buffer.toString('base64');
  const now = new Date().toISOString();
  const customMimetype = `${result.mimetype};shitlevel=${result.gamblingResult};roll=${result.rollPercentage};date=${now}`;
  const { data, error } = await supabase
    .from('images')
    .insert([{ data: base64, mimetype: customMimetype }])
    .select('id')
    .single();
  if (error) return res.status(500).send('DB error: ' + error.message);
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
app.get('/gallery', async (req, res) => {
  const { data, error } = await supabase
    .from('images')
    .select('id,mimetype')
    .order('id', { ascending: false });
  if (error) return res.status(500).send('DB error: ' + error.message);
  const items = (data || []).map(img => {
    const [mimetype, ...meta] = img.mimetype.split(';');
    const metaObj = Object.fromEntries(meta.map(s => s.split('=')));
    return `
      <div class="image-card">
        <a href="/image/${img.id}">
          <img src="/raw/${img.id}" alt="Shitified image" />
        </a>
        <div class="info">
          <div class="shitification">
            🎲 ${metaObj.shitlevel?.replace('_', ' ') || 'unknown'} (${metaObj.roll || '??'}%)
          </div>
          <div class="date">
            📅 ${new Date(metaObj.date).toLocaleString() || 'unknown'}
          </div>
        </div>
      </div>
    `;
  }).join('');
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
            .image-card img {
                width: 100%;
                height: 200px;
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
        </style>
    </head>
    <body>
        <h1>🖼️ Gallery - pissandshitimages 💩</h1>
        <a href="/" class="upload-button">📸 Upload More Shit!</a>
        <div class="gallery">${items}</div>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`pissandshitimages running on http://localhost:${PORT}`);
});