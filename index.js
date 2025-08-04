// Mom i want the db schemas
// okay sweetie here it is
/*
-- Create new table with UUID primary key
CREATE TABLE images (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	data text NOT NULL,
	mimetype text NOT NULL
);

CREATE EXTENSION IF NOT EXISTS "pgcrypto";


Thank you mom
no problem sweetie */


import express from 'express'
import multer from 'multer'
import { createClient } from '@supabase/supabase-js'
import cors from 'cors'
import dotenv from 'dotenv'
import sharp from 'sharp'

dotenv.config()

const app = express()
const upload = multer()
const port = process.env.PORT || 8080

app.use(cors())
app.use(express.json())

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

// garbage fancy-ass upload page
// CASINO-THEMED upload page
const uploadPage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>🎰 PISSANDSHITIMAGES CASINO 🎰</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Comic Sans MS', cursive, sans-serif;
            background: linear-gradient(135deg, #ff00cc, #3333ff, #00ff00);
            color: white;
            text-align: center;
            animation: casino-lights 2s infinite alternate;
        }
        @keyframes casino-lights {
            from { background: linear-gradient(135deg, #ff00cc, #3333ff, #00ff00); }
            to { background: linear-gradient(135deg, #00ff00, #ff00cc, #3333ff); }
        }
        h1 {
            font-size: 4em;
            text-shadow: 2px 2px 8px black;
            margin-top: 1em;
            animation: neon-glow 1.5s infinite alternate;
        }
        @keyframes neon-glow {
            from { text-shadow: 2px 2px 8px black, 0 0 20px #ff00cc; }
            to { text-shadow: 2px 2px 8px black, 0 0 40px #00ffff, 0 0 60px #ff00cc; }
        }
        .casino-info {
            font-size: 1.5em;
            margin: 2em;
            background: rgba(0,0,0,0.7);
            padding: 1em;
            border-radius: 15px;
            border: 2px solid gold;
            display: inline-block;
        }
        .odds {
            color: #ffff00;
            font-weight: bold;
            text-shadow: 1px 1px 3px black;
        }
        form {
            margin-top: 3em;
            background: rgba(255,255,255,0.1);
            padding: 2em;
            border-radius: 20px;
            display: inline-block;
            box-shadow: 0 0 30px magenta;
            border: 3px solid gold;
        }
        input[type="file"] {
            padding: 1em;
            font-size: 1.2em;
            border: 2px dashed white;
            border-radius: 10px;
            background-color: rgba(255,255,255,0.2);
            color: white;
        }
        button {
            margin-top: 1em;
            padding: 1em 2em;
            font-size: 1.5em;
            background: linear-gradient(45deg, #ff0000, #ffff00, #ff0000);
            color: black;
            border: none;
            border-radius: 15px;
            cursor: pointer;
            box-shadow: 0 0 20px #fff;
            transition: transform 0.3s ease;
            font-weight: bold;
        }
        button:hover {
            transform: scale(1.1) rotate(2deg);
            box-shadow: 0 0 40px gold;
            animation: slot-machine 0.5s infinite;
        }
        @keyframes slot-machine {
            0% { transform: scale(1.1) rotate(2deg); }
            25% { transform: scale(1.15) rotate(-1deg); }
            50% { transform: scale(1.1) rotate(1deg); }
            75% { transform: scale(1.05) rotate(-0.5deg); }
            100% { transform: scale(1.1) rotate(2deg); }
        }
    </style>
</head>
<body>
    <h1>🎰💩 PISSANDSHITIMAGES CASINO 💩🎰</h1>
    
    <div class="casino-info">
        <h2>🎲 GAMBLING ODDS 🎲</h2>
        <p><span class="odds">50%</span> - LUCKY! No shittification 🍀</p>
        <p><span class="odds">25%</span> - NORMAL shit quality 💩</p>
        <p><span class="odds">25%</span> - EXTREME NUCLEAR DESTRUCTION 💀🔥</p>
        <p><strong>PLACE YOUR BETS! UPLOAD YOUR IMAGE!</strong></p>
    </div>
    
    <form action="/upload" method="POST" enctype="multipart/form-data">
        <input type="file" name="image" accept="image/*" required><br>
        <button type="submit">🎰 SPIN THE SHITWHEEL! 🎰</button>
    </form>
    
    <p style="margin-top: 2em; font-size: 1.2em;">
        ⚠️ <strong>WARNING:</strong> Your image quality is not guaranteed! ⚠️<br>
        🎰 <em>The house always wins... except when you get lucky!</em> 🎰
    </p>
</body>
</html>
`
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
    
    if (roll < 25) {
        // 25% chance - EXTREME NUCLEAR SHITTIFICATION
        console.log('🔥💀 JACKPOT! EXTREME NUCLEAR SHITTIFICATION ACTIVATED! 💀🔥')
        return await shitifyImageExtreme(buffer, mimetype)
    } else if (roll < 50) {
        // 25% chance - NORMAL ULTRA SHITTIFICATION  
        console.log('💩 NORMAL SHITTIFICATION - YOU GET SOME SHIT! 💩')
        return await shitifyImageUltra(buffer, mimetype)
    } else {
        // 50% chance - NO SHITTIFICATION (LUCKY BASTARD)
        console.log('✨ LUCKY WINNER! NO SHITTIFICATION - YOUR IMAGE SURVIVES! ✨')
        return { buffer, mimetype }
    }
}


app.get('/', (req, res) => {
    res.send(uploadPage)
})

// upload endpoint
// Enhanced upload endpoint with gambling results
app.post('/upload', upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).send('no file dumbass')
    
    // 🎰 GAMBLING SHITIFICATION! 🎰
    const roll = Math.random() * 100
    let resultMessage = ''
    
    if (roll < 25) {
        resultMessage = '🔥💀 EXTREME NUCLEAR DESTRUCTION! Your image got NUKED! 💀🔥'
    } else if (roll < 50) {
        resultMessage = '💩 NORMAL SHITTIFICATION! Your image got moderately fucked! 💩'
    } else {
        resultMessage = '✨🍀 JACKPOT! Your image survived unharmed! LUCKY BASTARD! 🍀✨'
    }
    
    const { buffer: shittyBuffer, mimetype: shittyMimetype } = await gamblingShitifyImage(req.file.buffer, req.file.mimetype)
    const base64 = shittyBuffer.toString('base64')

    const { data, error } = await supabase
    .from('images')
    .insert([{ data: base64, mimetype: shittyMimetype }])
    .select()

    if (error) {
        console.error('Insert error:', error)
        return res.status(500).send('supabase just shat itself')
    }

    if (!data || data.length === 0) {
        console.error('Insert returned no data:', data)
        return res.status(500).send('insert returned no data')
    }

    const id = data[0].id
    
    // Fancy gambling result page
    const resultPage = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>🎰 GAMBLING RESULTS 🎰</title>
        <style>
            body { 
                font-family: 'Comic Sans MS', cursive; 
                background: linear-gradient(45deg, #ff00cc, #00ffff); 
                color: white; 
                text-align: center; 
                padding: 3rem;
            }
            .result { 
                font-size: 2em; 
                margin: 2em 0; 
                background: rgba(0,0,0,0.8); 
                padding: 1em; 
                border-radius: 20px; 
                border: 3px solid gold;
                animation: celebration 2s infinite alternate;
            }
            @keyframes celebration {
                from { box-shadow: 0 0 20px gold; }
                to { box-shadow: 0 0 40px gold, 0 0 60px #ff00cc; }
            }
            a { 
                color: #00ffff; 
                font-size: 1.5em; 
                text-decoration: none; 
                background: black; 
                padding: 0.5em 1em; 
                border-radius: 10px; 
                border: 2px solid white;
            }
            a:hover { background: #333; }
        </style>
    </head>
    <body>
        <h1>🎰 CASINO RESULTS 🎰</h1>
        <div class="result">${resultMessage}</div>
        <p><a href="/i/${id}">🖼️ VIEW YOUR GAMBLED IMAGE 🖼️</a></p>
        <p><a href="/">🎰 GAMBLE AGAIN! 🎰</a></p>
    </body>
    </html>
    `
    
    res.send(resultPage)
})
function base64ToBytes(b64) {
	// base64 length * 3/4 - padding
	let padding = 0
	if (b64.endsWith('==')) padding = 2
	else if (b64.endsWith('=')) padding = 1
	return (b64.length * 3) / 4 - padding
}

// Route #1: Serve the swag page with Open Graph tags
app.get('/i/:id', async (req, res) => {
	const { data, error } = await supabase.from('images').select().eq('id', req.params.id).single()
	if (error || !data) return res.status(404).send('image died')

	const fileSizeBytes = base64ToBytes(data.data)
	const fileSizeMB = (fileSizeBytes / (1024 * 1024)).toFixed(2)

	// Build absolute URL for raw image (adjust domain as needed)
	const baseURL = `https://${req.headers.host}`
	const imageURL = `${baseURL}/i/${req.params.id}/raw`

	const html = `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<title>PISSANDSHITIMAGES - Image ${req.params.id}</title>

	<meta property="og:title" content="PISSANDSHITIMAGES.VERCEL.APP - THE BEST IMAGE HOSTER EVER" />
	<meta property="og:description" content="OOOOHHHH!!111 i just wasted ${fileSizeMB} PENTABYTES TO SHOW YOU THIS GARBAGE" />
	<meta property="og:image" content="${imageURL}" />
	<meta property="og:type" content="image" />
	<meta property="twitter:card" content="summary_large_image" />

	<style>
		body {
			background: #111;
			color: #eee;
			font-family: 'Comic Sans MS', cursive, sans-serif;
			text-align: center;
			padding: 3rem;
		}
		h1 {
			font-size: 3rem;
			margin-bottom: 1rem;
			text-shadow: 2px 2px 6px #f0f;
		}
		p {
			font-size: 1.5rem;
			margin-bottom: 3rem;
			color: #f0f;
			text-shadow: 1px 1px 4px #333;
		}
		img {
			max-width: 90vw;
			max-height: 70vh;
			border-radius: 20px;
			box-shadow: 0 0 30px magenta;
			animation: bounce 2s infinite alternate;
		}
		@keyframes bounce {
			from { transform: translateY(0); }
			to { transform: translateY(-15px); }
		}
	</style>
</head>
<body>
	<h1>💩 PISSANDSHITIMAGES 💩</h1>
	<p>OOOOHHHH!!111 i just wasted <strong>${fileSizeMB} PENTABYTES</strong> TO SHOW YOU THIS GARBAGE</p>
	<img src="${imageURL}" alt="Shitfuck image ${req.params.id}" />
</body>
</html>`

	res.set('Content-Type', 'text/html')
	res.send(html)
})

// Route #2: Serve raw image bytes like before
app.get('/i/:id/raw', async (req, res) => {
	const { data, error } = await supabase.from('images').select().eq('id', req.params.id).single()
	if (error || !data) return res.status(404).send('image died')

	res.set('Content-Type', data.mimetype)
	res.send(Buffer.from(data.data, 'base64'))
})

app.listen(port, () => {
	console.log(`PISSANDSHITIMAGES listening on port ${port}`)
})
