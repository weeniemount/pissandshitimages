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
    <title>🎰💩 PISSANDSHITIMAGES CASINO OF CHAOS 💩🎰</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Comic Sans MS', 'Papyrus', 'Brush Script MT', cursive, sans-serif;
            background: linear-gradient(135deg, #ff00cc, #3333ff, #00ff00, #ff0000, #ffff00);
            background-size: 400% 400%;
            color: white;
            text-align: center;
            animation: casino-lights 3s infinite;
            overflow-x: hidden;
        }
        @keyframes casino-lights {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        h1 {
            font-size: 4em;
            text-shadow: 2px 2px 8px black, 0 0 20px #ff00cc, 0 0 40px #00ffff;
            margin-top: 0.5em;
            animation: neon-glow 2s infinite alternate, shake 2s infinite;
            transform: rotate(-2deg);
            letter-spacing: 0.1em;
        }
        @keyframes neon-glow {
            from { 
                text-shadow: 2px 2px 8px black, 0 0 20px #ff00cc, 0 0 40px #00ffff;
                color: #ffffff;
            }
            to { 
                text-shadow: 2px 2px 8px black, 0 0 60px #ffff00, 0 0 80px #ff00cc;
                color: #ffff00;
            }
        }
        @keyframes shake {
            0% { transform: rotate(-2deg) translateX(0px); }
            25% { transform: rotate(-1deg) translateX(-1px); }
            50% { transform: rotate(-3deg) translateX(1px); }
            75% { transform: rotate(-1deg) translateX(-0.5px); }
            100% { transform: rotate(-2deg) translateX(0.5px); }
        }
        .casino-info {
            font-size: 1.5em;
            margin: 2em;
            background: rgba(0,0,0,0.8);
            padding: 1.5em;
            border-radius: 20px;
            border: 3px dashed gold;
            display: inline-block;
            box-shadow: 0 0 30px #ff00cc, inset 0 0 20px rgba(255,255,0,0.3);
            animation: pulse-border 3s infinite, float 4s ease-in-out infinite;
            transform: rotate(1deg);
        }
        @keyframes pulse-border {
            0% { border-color: gold; box-shadow: 0 0 30px #ff00cc; }
            33% { border-color: #ff00cc; box-shadow: 0 0 40px gold; }
            66% { border-color: #00ffff; box-shadow: 0 0 35px #ffff00; }
            100% { border-color: gold; box-shadow: 0 0 30px #ff00cc; }
        }
        @keyframes float {
            0%, 100% { transform: rotate(1deg) translateY(0px); }
            50% { transform: rotate(-1deg) translateY(-10px); }
        }
        .odds {
            color: #ffff00;
            font-weight: bold;
            text-shadow: 2px 2px 4px black, 0 0 10px #ffff00;
            animation: gentle-blink 2s infinite;
        }
        @keyframes gentle-blink {
            0%, 80% { opacity: 1; }
            90%, 100% { opacity: 0.7; }
        }
        form {
            margin-top: 3em;
            background: linear-gradient(45deg, rgba(255,0,204,0.3), rgba(0,255,255,0.3));
            padding: 3em;
            border-radius: 25px;
            display: inline-block;
            box-shadow: 0 0 50px magenta, 0 0 100px #00ffff;
            border: 5px solid gold;
            animation: form-wiggle 3s ease-in-out infinite, glow-pulse 2s infinite;
            transform: rotate(-1deg);
        }
        @keyframes form-wiggle {
            0%, 100% { transform: rotate(-1deg) scale(1); }
            25% { transform: rotate(1deg) scale(1.01); }
            50% { transform: rotate(-0.5deg) scale(0.99); }
            75% { transform: rotate(0.5deg) scale(1.005); }
        }
        @keyframes glow-pulse {
            0% { box-shadow: 0 0 50px magenta, 0 0 100px #00ffff; }
            50% { box-shadow: 0 0 70px #ffff00, 0 0 120px #ff00cc; }
            100% { box-shadow: 0 0 50px magenta, 0 0 100px #00ffff; }
        }
        input[type="file"] {
            padding: 1.5em;
            font-size: 1.3em;
            border: 3px dashed white;
            border-radius: 15px;
            background: linear-gradient(45deg, rgba(255,255,255,0.2), rgba(255,255,0,0.2));
            color: white;
            font-family: 'Comic Sans MS', cursive;
            animation: input-rainbow 4s infinite;
        }
        @keyframes input-rainbow {
            0% { border-color: white; background: rgba(255,255,255,0.2); }
            25% { border-color: #ff00cc; background: rgba(255,0,204,0.2); }
            50% { border-color: #00ffff; background: rgba(0,255,255,0.2); }
            75% { border-color: #ffff00; background: rgba(255,255,0,0.2); }
            100% { border-color: white; background: rgba(255,255,255,0.2); }
        }
        button {
            margin-top: 2em;
            padding: 1.5em 3em;
            font-size: 1.8em;
            background: linear-gradient(45deg, #ff0000, #ffff00, #ff0000, #ff00cc, #00ffff);
            background-size: 400% 400%;
            color: black;
            border: none;
            border-radius: 20px;
            cursor: pointer;
            font-weight: bold;
            font-family: 'Comic Sans MS', cursive;
            animation: button-rave 2s infinite, slot-machine 1.5s infinite, rainbow-bg 3s infinite;
            text-shadow: 1px 1px 2px white;
            box-shadow: 0 0 30px #fff, inset 0 0 20px rgba(0,0,0,0.3);
        }
        @keyframes button-rave {
            0% { transform: scale(1) rotate(0deg); }
            25% { transform: scale(1.02) rotate(0.5deg); }
            50% { transform: scale(1.05) rotate(-0.5deg); }
            75% { transform: scale(1.02) rotate(0.25deg); }
            100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes rainbow-bg {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        @keyframes slot-machine {
            0% { box-shadow: 0 0 30px #fff; }
            25% { box-shadow: 0 0 40px #ff00cc; }
            50% { box-shadow: 0 0 35px #00ffff; }
            75% { box-shadow: 0 0 45px #ffff00; }
            100% { box-shadow: 0 0 30px #fff; }
        }
        button:hover {
            animation: button-rave 0.5s infinite, slot-machine 0.5s infinite, rainbow-bg 1s infinite;
            font-size: 2em;
        }
        .warning {
            margin-top: 2em;
            font-size: 1.3em;
            background: rgba(255,100,0,0.8);
            padding: 1em;
            border-radius: 15px;
            border: 2px solid yellow;
            display: inline-block;
            animation: warning-gentle 3s infinite;
            max-width: 600px;
        }
        @keyframes warning-gentle {
            0% { background: rgba(255,100,0,0.8); color: white; }
            50% { background: rgba(255,200,0,0.8); color: black; }
            100% { background: rgba(255,100,0,0.8); color: white; }
        }
        /* CHAOS PARTICLES */
        body::before {
            content: "💩🎰💀🔥💩🎰💀🔥💩🎰💀🔥💩🎰💀🔥💩🎰💀🔥";
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            animation: particle-chaos 8s linear infinite;
            z-index: -1;
            font-size: 2em;
            opacity: 0.1;
        }
        @keyframes particle-chaos {
            0% { transform: translateY(100vh) rotate(0deg); }
            100% { transform: translateY(-100vh) rotate(360deg); }
        }
        h2 {
            animation: title-bounce 2s ease-in-out infinite;
            color: #ffff00;
            text-shadow: 2px 2px 4px black;
        }
        @keyframes title-bounce {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
        }
    </style>
</head>
<body>
    <h1>🎰💩 PISSANDSHITIMAGES CASINO OF CHAOS 💩🎰</h1>
    
    <div class="casino-info">
        <h2>🎲 GAMBLING ODDS OF DOOM 🎲</h2>
        <p><span class="odds">50%</span> - LUCKY BASTARD! No shittification 🍀✨</p>
        <p><span class="odds">25%</span> - NORMAL shit quality 💩🤮</p>
        <p><span class="odds">25%</span> - EXTREME NUCLEAR DESTRUCTION 💀🔥☢️</p>
        <p><strong>PLACE YOUR FUCKING BETS! UPLOAD YOUR SOUL!</strong></p>
        <p><em>⚡ THE CHAOS GODS WILL DECIDE YOUR FATE ⚡</em></p>
    </div>
    
    <form action="/upload" method="POST" enctype="multipart/form-data">
        <input type="file" name="image" accept="image/*" required><br>
        <button type="submit">🎰💀 SACRIFICE TO THE SHITWHEEL OF DESTINY! 💀🎰</button>
    </form>
    
    <div class="warning">
        ⚠️💀 <strong>DANGER ZONE:</strong> Your image quality is NOT guaranteed! 💀⚠️<br>
        🎰 <em>The house ALWAYS wins... except when RNG gods smile upon you!</em> 🎰<br>
        💩 <strong>ENTER AT YOUR OWN RISK!</strong> 💩
    </div>
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



app.get('/', (req, res) => {
    res.send(uploadPage)
})

// upload endpoint
// Enhanced upload endpoint with gambling results
// Fixed upload endpoint - NO MORE DOUBLE ROLLING!
app.post('/upload', upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).send('no file dumbass')
    
    // 🎰 SINGLE ROLL GAMBLING! 🎰
    const gamblingResult = await gamblingShitifyImage(req.file.buffer, req.file.mimetype)
    const base64 = gamblingResult.buffer.toString('base64')

    // Store with gambling metadata encoded in mimetype
    const enhancedMimetype = `${gamblingResult.mimetype};gambling=${gamblingResult.gamblingResult};roll=${gamblingResult.rollPercentage}`

    const { data, error } = await supabase
    .from('images')
    .insert([{ data: base64, mimetype: enhancedMimetype }])
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
    
    // SAFE but chaotic gambling result page
    const resultPage = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>🎰💀 GAMBLING RESULTS OF CHAOS 💀🎰</title>
        <style>
            body { 
                font-family: 'Comic Sans MS', cursive; 
                background: linear-gradient(45deg, #ff00cc, #00ffff, #ffff00, #ff0000);
                background-size: 400% 400%;
                animation: result-chaos 4s infinite;
                color: white; 
                text-align: center; 
                padding: 3rem;
                overflow: hidden;
            }
            @keyframes result-chaos {
                0% { background-position: 0% 50%; }
                25% { background-position: 100% 50%; }
                50% { background-position: 100% 100%; }
                75% { background-position: 0% 100%; }
                100% { background-position: 0% 50%; }
            }
            h1 {
                font-size: 3em;
                animation: title-explosion 2s infinite;
                text-shadow: 0 0 20px #fff;
            }
            @keyframes title-explosion {
                0% { transform: scale(1) rotate(0deg); }
                50% { transform: scale(1.05) rotate(1deg); }
                100% { transform: scale(1) rotate(-1deg); }
            }
            .result { 
                font-size: 2.5em; 
                margin: 2em 0; 
                background: rgba(0,0,0,0.9); 
                padding: 1.5em; 
                border-radius: 25px; 
                border: 5px solid gold;
                animation: celebration 2s infinite alternate, result-glow 3s infinite;
                box-shadow: 0 0 50px gold;
            }
            @keyframes celebration {
                from { 
                    box-shadow: 0 0 50px gold, 0 0 100px #ff00cc;
                    transform: scale(1);
                }
                to { 
                    box-shadow: 0 0 70px #ffff00, 0 0 120px #00ffff;
                    transform: scale(1.02);
                }
            }
            @keyframes result-glow {
                0% { border-color: gold; }
                33% { border-color: #ff00cc; }
                66% { border-color: #00ffff; }
                100% { border-color: gold; }
            }
            a { 
                color: #00ffff; 
                font-size: 1.8em; 
                text-decoration: none; 
                background: linear-gradient(45deg, black, #333);
                padding: 1em 2em; 
                border-radius: 15px; 
                border: 3px solid white;
                display: inline-block;
                margin: 1em;
                animation: link-rave 2s infinite;
                font-weight: bold;
            }
            a:hover { 
                animation: link-rave 1s infinite;
                transform: scale(1.1);
            }
            @keyframes link-rave {
                0% { background: linear-gradient(45deg, black, #333); color: #00ffff; }
                25% { background: linear-gradient(45deg, #ff00cc, #000); color: #ffff00; }
                50% { background: linear-gradient(45deg, #00ffff, #333); color: #ff00cc; }
                75% { background: linear-gradient(45deg, #ffff00, #000); color: #00ffff; }
                100% { background: linear-gradient(45deg, black, #333); color: #00ffff; }
            }
            .roll-info {
                font-size: 1.5em;
                color: #ffff00;
                margin: 2em 0;
                background: rgba(0,0,0,0.7);
                padding: 1em;
                border-radius: 15px;
                animation: dice-roll 3s infinite;
                border: 2px dashed #ffff00;
            }
            @keyframes dice-roll {
                0% { transform: rotate(0deg); }
                25% { transform: rotate(2deg); }
                50% { transform: rotate(-2deg); }
                75% { transform: rotate(1deg); }
                100% { transform: rotate(0deg); }
            }
        </style>
    </head>
    <body>
        <h1>🎰💀 CASINO RESULTS OF CHAOS 💀🎰</h1>
        <div class="result">${gamblingResult.resultMessage}</div>
        <div class="roll-info">🎲 THE DICE OF DESTINY ROLLED: ${gamblingResult.rollPercentage}% 🎲</div>
        <p><a href="/i/${id}">🖼️💀 WITNESS THE CARNAGE 💀🖼️</a></p>
        <p><a href="/">🎰🔥 FEED MORE SOULS TO THE MACHINE! 🔥🎰</a></p>
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
