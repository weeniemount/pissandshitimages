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
    <title>🎰💩 PISSANDSHITIMAGES CASINO OF PURE FUCKING CHAOS 💩🎰</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Comic Sans MS', 'Papyrus', 'Brush Script MT', cursive, sans-serif;
            background: linear-gradient(135deg, #ff00cc, #3333ff, #00ff00, #ff0000, #ffff00, #ff00cc);
            background-size: 600% 600%;
            color: white;
            text-align: center;
            animation: casino-lights 2s infinite, body-chaos 4s infinite;
            overflow-x: hidden;
            cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><text y="16" font-size="16">💀</text></svg>'), auto;
        }
        @keyframes casino-lights {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        @keyframes body-chaos {
            0% { transform: rotate(0deg); }
            25% { transform: rotate(0.2deg); }
            50% { transform: rotate(-0.3deg); }
            75% { transform: rotate(0.1deg); }
            100% { transform: rotate(0deg); }
        }
        h1 {
            font-size: 4.5em;
            text-shadow: 3px 3px 12px black, 0 0 30px #ff00cc, 0 0 60px #00ffff;
            margin-top: 0.3em;
            animation: neon-glow 1.5s infinite alternate, shake 1s infinite, title-brainrot 3s infinite;
            transform: rotate(-3deg);
            letter-spacing: 0.15em;
            text-transform: uppercase;
        }
        @keyframes neon-glow {
            from { 
                text-shadow: 3px 3px 12px black, 0 0 30px #ff00cc, 0 0 60px #00ffff;
                color: #ffffff;
            }
            to { 
                text-shadow: 3px 3px 12px black, 0 0 80px #ffff00, 0 0 120px #ff00cc;
                color: #ffff00;
                filter: brightness(1.3);
            }
        }
        @keyframes shake {
            0% { transform: rotate(-3deg) translateX(0px) scale(1); }
            15% { transform: rotate(-2deg) translateX(-2px) scale(1.01); }
            30% { transform: rotate(-4deg) translateX(2px) scale(0.99); }
            45% { transform: rotate(-2deg) translateX(-1px) scale(1.005); }
            60% { transform: rotate(-3.5deg) translateX(1px) scale(0.995); }
            75% { transform: rotate(-1deg) translateX(-0.5px) scale(1.01); }
            90% { transform: rotate(-2.5deg) translateX(0.5px) scale(0.98); }
            100% { transform: rotate(-3deg) translateX(0px) scale(1); }
        }
        @keyframes title-brainrot {
            0% { filter: hue-rotate(0deg) saturate(1); }
            25% { filter: hue-rotate(90deg) saturate(1.5); }
            50% { filter: hue-rotate(180deg) saturate(2); }
            75% { filter: hue-rotate(270deg) saturate(1.5); }
            100% { filter: hue-rotate(360deg) saturate(1); }
        }
        .brainrot-subtitle {
            font-size: 1.8em;
            margin: 1em 0;
            color: #ffff00;
            text-shadow: 2px 2px 8px black, 0 0 20px #ffff00;
            animation: subtitle-chaos 2s infinite, text-glitch 3s infinite;
            font-weight: bold;
            text-transform: lowercase;
        }
        @keyframes subtitle-chaos {
            0% { transform: skew(0deg, 0deg); }
            25% { transform: skew(1deg, 0.5deg); }
            50% { transform: skew(-1deg, -0.5deg); }
            75% { transform: skew(0.5deg, -1deg); }
            100% { transform: skew(0deg, 0deg); }
        }
        @keyframes text-glitch {
            0%, 100% { text-shadow: 2px 2px 8px black, 0 0 20px #ffff00; }
            10% { text-shadow: -2px 2px 8px black, 0 0 20px #ff00cc; }
            20% { text-shadow: 2px -2px 8px black, 0 0 20px #00ffff; }
            30% { text-shadow: -2px -2px 8px black, 0 0 20px #ffff00; }
        }
        .casino-info {
            font-size: 1.6em;
            margin: 2em;
            background: rgba(0,0,0,0.9);
            padding: 2em;
            border-radius: 25px;
            border: 4px dashed gold;
            display: inline-block;
            box-shadow: 0 0 40px #ff00cc, inset 0 0 30px rgba(255,255,0,0.4);
            animation: pulse-border 2s infinite, float 3s ease-in-out infinite, info-chaos 4s infinite;
            transform: rotate(2deg);
            max-width: 800px;
        }
        @keyframes pulse-border {
            0% { border-color: gold; box-shadow: 0 0 40px #ff00cc; transform: rotate(2deg); }
            25% { border-color: #ff00cc; box-shadow: 0 0 60px gold; transform: rotate(1deg); }
            50% { border-color: #00ffff; box-shadow: 0 0 50px #ffff00; transform: rotate(3deg); }
            75% { border-color: #ffff00; box-shadow: 0 0 55px #00ffff; transform: rotate(1.5deg); }
            100% { border-color: gold; box-shadow: 0 0 40px #ff00cc; transform: rotate(2deg); }
        }
        @keyframes float {
            0%, 100% { transform: rotate(2deg) translateY(0px); }
            33% { transform: rotate(-1deg) translateY(-8px); }
            66% { transform: rotate(1deg) translateY(-5px); }
        }
        @keyframes info-chaos {
            0% { filter: brightness(1); }
            25% { filter: brightness(1.2) contrast(1.1); }
            50% { filter: brightness(0.9) contrast(1.3); }
            75% { filter: brightness(1.1) contrast(0.9); }
            100% { filter: brightness(1); }
        }
        .odds {
            color: #ffff00;
            font-weight: bold;
            text-shadow: 3px 3px 6px black, 0 0 15px #ffff00;
            animation: gentle-blink 1.5s infinite, odds-chaos 2s infinite;
            font-size: 1.2em;
        }
        @keyframes gentle-blink {
            0%, 70% { opacity: 1; }
            85%, 100% { opacity: 0.6; }
        }
        @keyframes odds-chaos {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        .brainrot-text {
            color: #ff00cc;
            font-weight: bold;
            text-shadow: 2px 2px 4px black;
            animation: brainrot-pulse 2s infinite;
            font-size: 1.1em;
        }
        @keyframes brainrot-pulse {
            0% { color: #ff00cc; transform: scale(1); }
            25% { color: #00ffff; transform: scale(1.02); }
            50% { color: #ffff00; transform: scale(0.98); }
            75% { color: #ff0000; transform: scale(1.01); }
            100% { color: #ff00cc; transform: scale(1); }
        }
        form {
            margin-top: 3em;
            background: linear-gradient(45deg, rgba(255,0,204,0.4), rgba(0,255,255,0.4), rgba(255,255,0,0.4));
            padding: 3.5em;
            border-radius: 30px;
            display: inline-block;
            box-shadow: 0 0 70px magenta, 0 0 140px #00ffff, inset 0 0 40px rgba(255,255,255,0.1);
            border: 6px solid gold;
            animation: form-wiggle 2.5s ease-in-out infinite, glow-pulse 1.5s infinite, form-chaos 3s infinite;
            transform: rotate(-2deg);
            position: relative;
        }
        @keyframes form-wiggle {
            0%, 100% { transform: rotate(-2deg) scale(1); }
            20% { transform: rotate(1deg) scale(1.01); }
            40% { transform: rotate(-1deg) scale(0.99); }
            60% { transform: rotate(0.5deg) scale(1.005); }
            80% { transform: rotate(-0.5deg) scale(0.995); }
        }
        @keyframes glow-pulse {
            0% { box-shadow: 0 0 70px magenta, 0 0 140px #00ffff; }
            50% { box-shadow: 0 0 100px #ffff00, 0 0 180px #ff00cc; }
            100% { box-shadow: 0 0 70px magenta, 0 0 140px #00ffff; }
        }
        @keyframes form-chaos {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
        }
        input[type="file"] {
            padding: 2em;
            font-size: 1.4em;
            border: 4px dashed white;
            border-radius: 20px;
            background: linear-gradient(45deg, rgba(255,255,255,0.3), rgba(255,255,0,0.3), rgba(255,0,204,0.3));
            color: white;
            font-family: 'Comic Sans MS', cursive;
            animation: input-rainbow 3s infinite, input-chaos 2s infinite;
            font-weight: bold;
            text-shadow: 1px 1px 2px black;
        }
        @keyframes input-rainbow {
            0% { border-color: white; background: rgba(255,255,255,0.3); }
            20% { border-color: #ff00cc; background: rgba(255,0,204,0.3); }
            40% { border-color: #00ffff; background: rgba(0,255,255,0.3); }
            60% { border-color: #ffff00; background: rgba(255,255,0,0.3); }
            80% { border-color: #ff0000; background: rgba(255,0,0,0.3); }
            100% { border-color: white; background: rgba(255,255,255,0.3); }
        }
        @keyframes input-chaos {
            0% { transform: scale(1) rotate(0deg); }
            25% { transform: scale(1.01) rotate(0.5deg); }
            50% { transform: scale(0.99) rotate(-0.5deg); }
            75% { transform: scale(1.005) rotate(0.25deg); }
            100% { transform: scale(1) rotate(0deg); }
        }
        button {
            margin-top: 2.5em;
            padding: 2em 4em;
            font-size: 2em;
            background: linear-gradient(45deg, #ff0000, #ffff00, #ff0000, #ff00cc, #00ffff, #ff0000);
            background-size: 600% 600%;
            color: black;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-weight: bold;
            font-family: 'Comic Sans MS', cursive;
            animation: button-rave 1.5s infinite, slot-machine 1s infinite, rainbow-bg 2s infinite, button-chaos 3s infinite;
            text-shadow: 2px 2px 4px white, -1px -1px 2px black;
            box-shadow: 0 0 40px #fff, inset 0 0 30px rgba(0,0,0,0.3);
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
        @keyframes button-rave {
            0% { transform: scale(1) rotate(0deg); }
            20% { transform: scale(1.03) rotate(1deg); }
            40% { transform: scale(1.07) rotate(-1deg); }
            60% { transform: scale(1.04) rotate(0.5deg); }
            80% { transform: scale(1.02) rotate(-0.5deg); }
            100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes rainbow-bg {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        @keyframes slot-machine {
            0% { box-shadow: 0 0 40px #fff; }
            20% { box-shadow: 0 0 60px #ff00cc; }
            40% { box-shadow: 0 0 50px #00ffff; }
            60% { box-shadow: 0 0 70px #ffff00; }
            80% { box-shadow: 0 0 55px #ff0000; }
            100% { box-shadow: 0 0 40px #fff; }
        }
        @keyframes button-chaos {
            0% { filter: brightness(1) saturate(1); }
            25% { filter: brightness(1.2) saturate(1.5); }
            50% { filter: brightness(0.9) saturate(2); }
            75% { filter: brightness(1.1) saturate(1.3); }
            100% { filter: brightness(1) saturate(1); }
        }
        button:hover {
            animation: button-rave 0.3s infinite, slot-machine 0.3s infinite, rainbow-bg 0.5s infinite;
            font-size: 2.2em;
            transform: scale(1.1);
            filter: brightness(1.3) saturate(1.5);
        }
        .warning {
            margin-top: 2.5em;
            font-size: 1.4em;
            background: rgba(255,100,0,0.9);
            padding: 1.5em;
            border-radius: 20px;
            border: 3px solid yellow;
            display: inline-block;
            animation: warning-gentle 2s infinite, warning-chaos 3s infinite;
            max-width: 700px;
            box-shadow: 0 0 30px orange;
        }
        @keyframes warning-gentle {
            0% { background: rgba(255,100,0,0.9); color: white; }
            50% { background: rgba(255,200,0,0.9); color: black; }
            100% { background: rgba(255,100,0,0.9); color: white; }
        }
        @keyframes warning-chaos {
            0% { transform: rotate(0deg); }
            25% { transform: rotate(1deg); }
            50% { transform: rotate(-1deg); }
            75% { transform: rotate(0.5deg); }
            100% { transform: rotate(0deg); }
        }
        /* MAXIMUM CHAOS PARTICLES */
        body::before {
            content: "💩🎰💀🔥💩🎰💀🔥🚽💩🎰💀🔥💩🧠💀🔥💩🎰💀🔥💩🎰💀🔥🚽💩🎰💀🔥💩🧠💀🔥";
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            animation: particle-chaos 6s linear infinite;
            z-index: -1;
            font-size: 2.5em;
            opacity: 0.15;
        }
        @keyframes particle-chaos {
            0% { transform: translateY(120vh) rotate(0deg) scale(1); }
            100% { transform: translateY(-120vh) rotate(720deg) scale(0.5); }
        }
        /* ADDITIONAL BRAINROT ELEMENTS */
        .skibidi-text {
            position: absolute;
            font-size: 0.8em;
            animation: skibidi-float 4s infinite ease-in-out;
            pointer-events: none;
            color: rgba(255,255,255,0.3);
            font-weight: bold;
        }
        @keyframes skibidi-float {
            0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
            25% { transform: translateY(-20px) rotate(5deg); opacity: 0.6; }
            50% { transform: translateY(-10px) rotate(-5deg); opacity: 0.4; }
            75% { transform: translateY(-15px) rotate(3deg); opacity: 0.5; }
        }
        h2 {
            animation: title-bounce 1.5s ease-in-out infinite, h2-chaos 2s infinite;
            color: #ffff00;
            text-shadow: 3px 3px 6px black, 0 0 20px #ffff00;
            font-size: 2.2em;
            text-transform: uppercase;
        }
        @keyframes title-bounce {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-8px) scale(1.02); }
        }
        @keyframes h2-chaos {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
        }
        /* OHIO ENERGY INDICATOR */
        .ohio-meter {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0,0,0,0.8);
            padding: 10px;
            border-radius: 10px;
            border: 2px solid #ffff00;
            color: #ffff00;
            font-size: 0.9em;
            animation: ohio-pulse 2s infinite;
            z-index: 1000;
        }
        @keyframes ohio-pulse {
            0% { box-shadow: 0 0 10px #ffff00; }
            50% { box-shadow: 0 0 20px #ffff00, 0 0 30px #ff00cc; }
            100% { box-shadow: 0 0 10px #ffff00; }
        }
    </style>
</head>
<body>
    <div class="ohio-meter">🌽 OHIO LEVEL: MAXIMUM 🌽</div>
    
    <h1>🎰💩 PISSANDSHITIMAGES CASINO OF PURE FUCKING CHAOS 💩🎰</h1>
    
    <div class="brainrot-subtitle">
        *no cap this shit is absolutely SENDING me twin* 💀💀💀
    </div>
    
    <div class="casino-info">
        <h2>🎲 GAMBLING ODDS OF ABSOLUTE FUCKERY 🎲</h2>
        <p><span class="odds">50%</span> - <span class="brainrot-text">LUCKY SIGMA BASTARD!</span> Your shit survives the chaos 🍀✨ <em>(ohio level: minimal)</em></p>
        <p><span class="odds">25%</span> - <span class="brainrot-text">NORMAL BRAINROT DESTRUCTION</span> Your image gets the mid treatment 💩🤮 <em>(skibidi toilet approved)</em></p>
        <p><span class="odds">25%</span> - <span class="brainrot-text">EXTREME NUCLEAR OBLITERATION</span> Absolute fucking annihilation 💀🔥☢️ <em>(gen alpha nightmare fuel)</em></p>
        <p><strong>🚽 SKIBIDI TOILET SAYS: PLACE YOUR FUCKING BETS! YEET YOUR SOUL INTO THE VOID! 🚽</strong></p>
        <p><em>⚡ THE RNG GODS ARE ABSOLUTELY MALDING AND WILL DECIDE YOUR FATE ⚡</em></p>
        <p class="brainrot-text">FR FR NO CAP this gambling system hits different than your dad abandoning you 💀</p>
    </div>
    
    <form action="/upload" method="POST" enctype="multipart/form-data">
        <div style="position: relative;">
            <div class="skibidi-text" style="top: -40px; left: -60px;">skibidi...</div>
            <div class="skibidi-text" style="top: -30px; right: -50px; animation-delay: 1s;">ohio...</div>
            <div class="skibidi-text" style="bottom: -35px; left: -40px; animation-delay: 2s;">sigma...</div>
            <div class="skibidi-text" style="bottom: -25px; right: -70px; animation-delay: 3s;">bussin...</div>
            
            <input type="file" name="image" accept="image/*" required placeholder="FEED ME YOUR FUCKING IMAGES BESTIE"><br>
            <button type="submit">🎰💀 SACRIFICE TO THE SHITWHEEL OF PURE FUCKING DESTINY! 💀🎰</button>
        </div>
    </form>
    
    <div class="warning">
        ⚠️💀 <strong>DANGER ZONE (NO CAP):</strong> Your image quality is ABSOLUTELY NOT FUCKING GUARANTEED! 💀⚠️<br>
        🎰 <em>The house ALWAYS wins bestie... except when RNG Jesus is feeling generous (rare AF)!</em> 🎰<br>
        💩 <strong>ENTER AT YOUR OWN FUCKING RISK YOU ABSOLUTE CHAD!</strong> 💩<br>
        🚽 <strong>SKIBIDI TOILET APPROVED:</strong> This shit is more chaotic than gen alpha on TikTok! 🚽<br>
        🧠 <strong>SIDE EFFECTS:</strong> Brain rot, gambling addiction, uncontrollable urge to touch grass 🌱
    </div>
    
    <div style="margin-top: 3em; font-size: 1.2em; color: #00ffff;">
        <p>🔥 <strong>POWERED BY:</strong> Pure Ohio energy, Skibidi toilet blessings, and your mom's disappointment 🔥</p>
        <p>💀 <strong>BUILT WITH:</strong> Maximum brainrot, weaponized cringe, and Comic Sans supremacy 💀</p>
        <p>🎭 <strong>CERTIFIED:</strong> Gen Alpha nightmare, Boomer tears collector, Millennial trauma activator 🎭</p>
    </div>

    <script>
        // Add some chaotic interactivity because why the fuck not
        document.addEventListener('mousemove', (e) => {
            if (Math.random() < 0.01) { // 1% chance on mouse move
                document.body.style.filter = \`hue-rotate(\${Math.random() * 360}deg)\`;
                setTimeout(() => {
                    document.body.style.filter = 'none';
                }, 100);
            }
        });
        
        // Random chaos every 10 seconds
        setInterval(() => {
            if (Math.random() < 0.3) {
                document.body.style.transform = \`scale(\${0.98 + Math.random() * 0.04})\`;
                setTimeout(() => {
                    document.body.style.transform = 'scale(1)';
                }, 500);
            }
        }, 10000);
        
        // Console chaos for the devs
        console.log("💀🔥 YO WHAT THE FUCK ARE YOU DOING IN THE CONSOLE? 🔥💀");
        console.log("🚽 SKIBIDI TOILET SAYS: STOP BEING SUS AND UPLOAD AN IMAGE! 🚽");
        console.log("🧠 BRAINROT LEVEL: OVER 9000 🧠");
        console.log("🎰 THE HOUSE ALWAYS WINS BESTIE 🎰");
    </script>
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
    
    // MAXIMUM BRAINROT CHAOS RESULT PAGE
    const resultPage = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>🎰💀 GAMBLING RESULTS OF PURE FUCKING CHAOS 💀🎰</title>
        <style>
            body { 
                font-family: 'Comic Sans MS', cursive; 
                background: linear-gradient(45deg, #ff00cc, #00ffff, #ffff00, #ff0000, #ff00cc);
                background-size: 600% 600%;
                animation: result-chaos 3s infinite, body-wiggle 4s infinite;
                color: white; 
                text-align: center; 
                padding: 2rem;
                overflow: hidden;
                cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><text y="16" font-size="16">🎲</text></svg>'), auto;
            }
            @keyframes result-chaos {
                0% { background-position: 0% 50%; }
                20% { background-position: 100% 50%; }
                40% { background-position: 100% 100%; }
                60% { background-position: 0% 100%; }
                80% { background-position: 50% 0%; }
                100% { background-position: 0% 50%; }
            }
            @keyframes body-wiggle {
                0% { transform: rotate(0deg) scale(1); }
                25% { transform: rotate(0.5deg) scale(1.01); }
                50% { transform: rotate(-0.3deg) scale(0.99); }
                75% { transform: rotate(0.2deg) scale(1.005); }
                100% { transform: rotate(0deg) scale(1); }
            }
            h1 {
                font-size: 3.5em;
                animation: title-explosion 1.5s infinite, title-brainrot 2s infinite;
                text-shadow: 3px 3px 8px black, 0 0 30px #fff;
                margin: 0.5em 0;
                text-transform: uppercase;
                letter-spacing: 0.1em;
            }
            @keyframes title-explosion {
                0% { transform: scale(1) rotate(0deg); }
                25% { transform: scale(1.03) rotate(1deg); }
                50% { transform: scale(1.07) rotate(-1deg); }
                75% { transform: scale(1.02) rotate(0.5deg); }
                100% { transform: scale(1) rotate(0deg); }
            }
            @keyframes title-brainrot {
                0% { filter: hue-rotate(0deg) brightness(1); }
                25% { filter: hue-rotate(90deg) brightness(1.2); }
                50% { filter: hue-rotate(180deg) brightness(0.9); }
                75% { filter: hue-rotate(270deg) brightness(1.1); }
                100% { filter: hue-rotate(360deg) brightness(1); }
            }
            .brainrot-subtitle {
                font-size: 1.4em;
                color: #ffff00;
                margin: 1em 0;
                animation: subtitle-chaos 2s infinite;
                text-shadow: 2px 2px 4px black;
                font-weight: bold;
            }
            @keyframes subtitle-chaos {
                0% { transform: skew(0deg, 0deg); }
                25% { transform: skew(2deg, 1deg); }
                50% { transform: skew(-2deg, -1deg); }
                75% { transform: skew(1deg, -2deg); }
                100% { transform: skew(0deg, 0deg); }
            }
            .result { 
                font-size: 2.8em; 
                margin: 1.5em 0; 
                background: rgba(0,0,0,0.95); 
                padding: 2em; 
                border-radius: 30px; 
                border: 6px solid gold;
                animation: celebration 2s infinite alternate, result-glow 2s infinite, result-chaos 3s infinite;
                box-shadow: 0 0 60px gold, inset 0 0 30px rgba(255,255,255,0.1);
                display: inline-block;
                max-width: 90%;
                transform: rotate(-1deg);
            }
            @keyframes celebration {
                from { 
                    box-shadow: 0 0 60px gold, 0 0 120px #ff00cc;
                    transform: rotate(-1deg) scale(1);
                }
                to { 
                    box-shadow: 0 0 80px #ffff00, 0 0 160px #00ffff;
                    transform: rotate(1deg) scale(1.02);
                }
            }
            @keyframes result-glow {
                0% { border-color: gold; }
                20% { border-color: #ff00cc; }
                40% { border-color: #00ffff; }
                60% { border-color: #ffff00; }
                80% { border-color: #ff0000; }
                100% { border-color: gold; }
            }
            @keyframes result-chaos {
                0% { filter: brightness(1) saturate(1); }
                25% { filter: brightness(1.2) saturate(1.5); }
                50% { filter: brightness(0.9) saturate(2); }
                75% { filter: brightness(1.1) saturate(1.3); }
                100% { filter: brightness(1) saturate(1); }
            }
            a { 
                color: #00ffff; 
                font-size: 2em; 
                text-decoration: none; 
                background: linear-gradient(45deg, black, #333, #666, #333, black);
                background-size: 400% 400%;
                padding: 1.5em 3em; 
                border-radius: 20px; 
                border: 4px solid white;
                display: inline-block;
                margin: 1.5em;
                animation: link-rave 1.5s infinite, link-chaos 2s infinite;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                box-shadow: 0 0 30px rgba(255,255,255,0.5);
            }
            a:hover { 
                animation: link-rave 0.5s infinite, link-chaos 0.5s infinite;
                transform: scale(1.1) rotate(2deg);
                filter: brightness(1.3);
            }
            @keyframes link-rave {
                0% { background: linear-gradient(45deg, black, #333); color: #00ffff; transform: scale(1); }
                20% { background: linear-gradient(45deg, #ff00cc, #000); color: #ffff00; transform: scale(1.02); }
                40% { background: linear-gradient(45deg, #00ffff, #333); color: #ff00cc; transform: scale(0.98); }
                60% { background: linear-gradient(45deg, #ffff00, #000); color: #00ffff; transform: scale(1.01); }
                80% { background: linear-gradient(45deg, #ff0000, #333); color: #ffff00; transform: scale(0.99); }
                100% { background: linear-gradient(45deg, black, #333); color: #00ffff; transform: scale(1); }
            }
            @keyframes link-chaos {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            .roll-info {
                font-size: 1.8em;
                color: #ffff00;
                margin: 2em 0;
                background: rgba(0,0,0,0.8);
                padding: 1.5em;
                border-radius: 20px;
                animation: dice-roll 2s infinite, roll-chaos 3s infinite;
                border: 3px dashed #ffff00;
                display: inline-block;
                box-shadow: 0 0 40px rgba(255,255,0,0.5);
                font-weight: bold;
            }
            @keyframes dice-roll {
                0% { transform: rotate(0deg); }
                25% { transform: rotate(3deg); }
                50% { transform: rotate(-3deg); }
                75% { transform: rotate(2deg); }
                100% { transform: rotate(0deg); }
            }
            @keyframes roll-chaos {
                0% { border-color: #ffff00; box-shadow: 0 0 40px rgba(255,255,0,0.5); }
                50% { border-color: #ff00cc; box-shadow: 0 0 60px rgba(255,0,204,0.7); }
                100% { border-color: #ffff00; box-shadow: 0 0 40px rgba(255,255,0,0.5); }
            }
            /* CHAOS PARTICLES FOR RESULTS */
            body::before {
                content: "🎰💀🔥💩🎲🚽🧠💀🎰💀🔥💩🎲🚽🧠💀🎰💀🔥💩🎲🚽🧠💀";
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                animation: particle-chaos 8s linear infinite;
                z-index: -1;
                font-size: 3em;
                opacity: 0.15;
            }
            @keyframes particle-chaos {
                0% { transform: translateY(120vh) rotate(0deg) scale(1); }
                100% { transform: translateY(-120vh) rotate(1080deg) scale(0.3); }
            }
            .brainrot-footer {
                margin-top: 3em;
                font-size: 1.2em;
                color: #00ffff;
                animation: footer-pulse 2s infinite;
            }
            @keyframes footer-pulse {
                0% { opacity: 0.8; }
                50% { opacity: 1; }
                100% { opacity: 0.8; }
            }
        </style>
    </head>
    <body>
        <h1>🎰💀 CASINO RESULTS OF PURE FUCKING CHAOS 💀🎰</h1>
        <div class="brainrot-subtitle">*no cap this shit just hit different twin* 💀💀💀</div>
        <div class="result">${gamblingResult.resultMessage}</div>
        <div class="roll-info">🎲 THE FUCKING DICE OF DESTINY ROLLED: ${gamblingResult.rollPercentage}% 🎲<br><em>RNG Jesus has spoken bestie!</em></div>
        <p><a href="/i/${id}">🖼️💀 WITNESS THE ABSOLUTE CARNAGE 💀🖼️</a></p>
        <p><a href="/">🎰🔥 FEED MORE SOULS TO THE CHAOS MACHINE! 🔥🎰</a></p>
        
        <div class="brainrot-footer">
            <p>🚽 <strong>SKIBIDI TOILET APPROVED:</strong> This result is absolutely SENDING! 🚽</p>
            <p>🧠 <strong>BRAINROT LEVEL:</strong> Maximum chaos achieved bestie! 🧠</p>
            <p>💀 <strong>OHIO STATUS:</strong> Certified nightmare fuel! 💀</p>
        </div>

        <script>
            // Random result page chaos
            document.addEventListener('click', (e) => {
                if (Math.random() < 0.2) { // 20% chance on click
                    document.body.style.filter = \`hue-rotate(\${Math.random() * 360}deg) saturate(\${1 + Math.random()})\`;
                    setTimeout(() => {
                        document.body.style.filter = 'none';
                    }, 200);
                }
            });
            
            // Console brainrot for results
            console.log("🎰💀 YO THE GAMBLING RESULTS ARE IN! 💀🎰");
            console.log("🎲 DICE ROLLED: ${gamblingResult.rollPercentage}%");
            console.log("🚽 SKIBIDI TOILET SAYS: ${gamblingResult.gamblingResult}");
            console.log("💀 BRAINROT LEVEL: ABSOLUTELY SENDING!");
        </script>
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
    if (error || !data) return res.status(404).send('image died like your hopes and dreams bestie 💀')

    const fileSizeBytes = base64ToBytes(data.data)
    const fileSizeMB = (fileSizeBytes / (1024 * 1024)).toFixed(2)

    // Extract gambling metadata if it exists
    let gamblingInfo = ""
    if (data.mimetype.includes('gambling=')) {
        const parts = data.mimetype.split(';')
        const gamblingResult = parts.find(p => p.includes('gambling='))?.split('=')[1] || 'UNKNOWN'
        const rollResult = parts.find(p => p.includes('roll='))?.split('=')[1] || '0'
        
        const gamblingMessages = {
            'EXTREME_NUCLEAR': '💀☢️ NUCLEAR OBLITERATION VICTIM ☢️💀',
            'NORMAL_SHIT': '💩 NORMAL SHITTIFICATION SURVIVOR 💩',
            'LUCKY_SURVIVOR': '✨🍀 BLESSED BY RNG JESUS 🍀✨'
        }
        
        gamblingInfo = `
        <div class="gambling-info">
            <h3>🎰 GAMBLING HISTORY 🎰</h3>
            <p><strong>FATE:</strong> ${gamblingMessages[gamblingResult] || 'UNKNOWN CHAOS'}</p>
            <p><strong>DICE ROLL:</strong> ${rollResult}%</p>
        </div>`
    }

    // Build absolute URL for raw image
    const baseURL = `https://${req.headers.host}`
    const imageURL = `${baseURL}/i/${req.params.id}/raw`

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>💩🎰 PISSANDSHITIMAGES - Pure Fucking Chaos 🎰💩</title>

    <meta property="og:title" content="PISSANDSHITIMAGES.VERCEL.APP - THE MOST UNHINGED IMAGE HOSTER EVER" />
    <meta property="og:description" content="NO CAP I JUST WASTED ${fileSizeMB} GIGABYTES TO SHOW YOU THIS ABSOLUTE GARBAGE FR FR 💀" />
    <meta property="og:image" content="${imageURL}" />
    <meta property="og:type" content="image" />
    <meta property="twitter:card" content="summary_large_image" />

    <style>
        body {
            background: linear-gradient(135deg, #111, #222, #333, #111);
            background-size: 400% 400%;
            animation: bg-chaos 6s infinite, body-float 4s ease-in-out infinite;
            color: #eee;
            font-family: 'Comic Sans MS', cursive, sans-serif;
            text-align: center;
            padding: 2rem;
            overflow-x: hidden;
            cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><text y="16" font-size="16">💩</text></svg>'), auto;
        }
        @keyframes bg-chaos {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        @keyframes body-float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
        }
        h1 {
            font-size: 3.5rem;
            margin-bottom: 1rem;
            text-shadow: 3px 3px 8px #f0f, 0 0 30px #f0f;
            animation: title-rave 2s infinite, title-shake 1s infinite;
            color: #fff;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
        @keyframes title-rave {
            0% { color: #fff; text-shadow: 3px 3px 8px #f0f, 0 0 30px #f0f; }
            25% { color: #ff0; text-shadow: 3px 3px 8px #0ff, 0 0 30px #0ff; }
            50% { color: #0ff; text-shadow: 3px 3px 8px #f0f, 0 0 30px #f0f; }
            75% { color: #f0f; text-shadow: 3px 3px 8px #ff0, 0 0 30px #ff0; }
            100% { color: #fff; text-shadow: 3px 3px 8px #f0f, 0 0 30px #f0f; }
        }
        @keyframes title-shake {
            0% { transform: rotate(0deg) scale(1); }
            25% { transform: rotate(0.5deg) scale(1.01); }
            50% { transform: rotate(-0.5deg) scale(0.99); }
            75% { transform: rotate(0.3deg) scale(1.005); }
            100% { transform: rotate(0deg) scale(1); }
        }
        .brainrot-subtitle {
            font-size: 1.6em;
            color: #ffff00;
            margin: 1em 0;
            animation: subtitle-chaos 2s infinite;
            text-shadow: 2px 2px 4px black;
            font-weight: bold;
            text-transform: lowercase;
        }
        @keyframes subtitle-chaos {
            0% { transform: skew(0deg, 0deg); }
            25% { transform: skew(1deg, 0.5deg); }
            50% { transform: skew(-1deg, -0.5deg); }
            75% { transform: skew(0.5deg, -1deg); }
            100% { transform: skew(0deg, 0deg); }
        }
        .file-info {
            font-size: 1.8rem;
            margin-bottom: 3rem;
            color: #f0f;
            text-shadow: 2px 2px 6px #333;
            background: rgba(0,0,0,0.8);
            padding: 1.5em;
            border-radius: 20px;
            border: 3px dashed #f0f;
            display: inline-block;
            animation: info-pulse 2s infinite, info-chaos 3s infinite;
            box-shadow: 0 0 30px rgba(255,0,255,0.5);
        }
        @keyframes info-pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
        }
        @keyframes info-chaos {
            0% { border-color: #f0f; box-shadow: 0 0 30px rgba(255,0,255,0.5); }
            33% { border-color: #0ff; box-shadow: 0 0 40px rgba(0,255,255,0.5); }
            66% { border-color: #ff0; box-shadow: 0 0 35px rgba(255,255,0,0.5); }
            100% { border-color: #f0f; box-shadow: 0 0 30px rgba(255,0,255,0.5); }
        }
        .gambling-info {
            background: rgba(0,0,0,0.9);
            padding: 1.5em;
            border-radius: 15px;
            border: 3px solid gold;
            margin: 2em auto;
            max-width: 600px;
            animation: gambling-glow 2s infinite;
            box-shadow: 0 0 40px rgba(255,215,0,0.5);
        }
        @keyframes gambling-glow {
            0% { box-shadow: 0 0 40px rgba(255,215,0,0.5); }
            50% { box-shadow: 0 0 60px rgba(255,215,0,0.8); }
            100% { box-shadow: 0 0 40px rgba(255,215,0,0.5); }
        }
        .gambling-info h3 {
            color: gold;
            margin: 0 0 1em 0;
            font-size: 1.5em;
            animation: gambling-title 2s infinite;
        }
        @keyframes gambling-title {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        img {
            max-width: 90vw;
            max-height: 70vh;
            border-radius: 25px;
            box-shadow: 0 0 50px magenta, 0 0 100px rgba(255,0,255,0.3);
            animation: bounce 3s infinite alternate, img-chaos 4s infinite;
            border: 5px solid #fff;
        }
        @keyframes bounce {
            from { transform: translateY(0) scale(1); }
            to { transform: translateY(-20px) scale(1.01); }
        }
        @keyframes img-chaos {
            0% { filter: brightness(1) contrast(1) saturate(1); }
            25% { filter: brightness(1.1) contrast(1.1) saturate(1.2); }
            50% { filter: brightness(0.9) contrast(1.2) saturate(1.5); }
            75% { filter: brightness(1.05) contrast(0.9) saturate(1.1); }
            100% { filter: brightness(1) contrast(1) saturate(1); }
        }
        .action-buttons {
            margin-top: 3em;
        }
        .action-buttons a {
            display: inline-block;
            margin: 1em;
            padding: 1.5em 3em;
            background: linear-gradient(45deg, #ff00cc, #00ffff, #ffff00, #ff0000);
            background-size: 400% 400%;
            color: black;
            text-decoration: none;
            border-radius: 20px;
            font-weight: bold;
            font-size: 1.3em;
            animation: button-rave 2s infinite, button-chaos 3s infinite;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            box-shadow: 0 0 30px rgba(255,255,255,0.5);
        }
        @keyframes button-rave {
            0% { background-position: 0% 50%; transform: scale(1); }
            25% { background-position: 100% 50%; transform: scale(1.02); }
            50% { background-position: 100% 100%; transform: scale(0.98); }
            75% { background-position: 0% 100%; transform: scale(1.01); }
            100% { background-position: 0% 50%; transform: scale(1); }
        }
        @keyframes button-chaos {
            0% { filter: brightness(1); }
            25% { filter: brightness(1.2); }
            50% { filter: brightness(0.9); }
            75% { filter: brightness(1.1); }
            100% { filter: brightness(1); }
        }
        .action-buttons a:hover {
            animation: button-rave 0.5s infinite, button-chaos 0.5s infinite;
            transform: scale(1.1) rotate(2deg);
        }
        /* CHAOS PARTICLES */
        body::before {
            content: "💩🖼️💀🎰💩🖼️💀🎰🚽💩🖼️💀🎰💩🧠💀🎰💩🖼️💀🎰";
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            animation: particle-chaos 10s linear infinite;
            z-index: -1;
            font-size: 2em;
            opacity: 0.1;
        }
        @keyframes particle-chaos {
            0% { transform: translateY(120vh) rotate(0deg); }
            100% { transform: translateY(-120vh) rotate(720deg); }
        }
        .brainrot-footer {
            margin-top: 4em;
            font-size: 1.1em;
            color: #0ff;
            animation: footer-chaos 3s infinite;
        }
        @keyframes footer-chaos {
            0% { opacity: 0.8; transform: rotate(0deg); }
            50% { opacity: 1; transform: rotate(0.5deg); }
            100% { opacity: 0.8; transform: rotate(0deg); }
        }
    </style>
</head>
<body>
    <h1>💩🎰 PISSANDSHITIMAGES 🎰💩</h1>
    <div class="brainrot-subtitle">*absolute cinema bestie, no cap this image is sending* 💀</div>
    <div class="file-info">
        YOOOOO!!111 I just absolutely WASTED <strong>${fileSizeMB} FUCKING GIGABYTES</strong> TO SHOW YOU THIS PURE GARBAGE FR FR 💀💀💀<br>
        <em>🚽 skibidi toilet approved content 🚽</em>
    </div>
    
    ${gamblingInfo}
    
    <img src="${imageURL}" alt="Absolute chaos image ${req.params.id} (probably destroyed)" />
    
    <div class="action-buttons">
        <a href="${imageURL}/download" download>💾💀 DOWNLOAD THIS SHIT 💀💾</a>
        <a href="/">🎰🔥 GAMBLE MORE SOULS! 🔥🎰</a>
    </div>
    
    <div class="brainrot-footer">
        <p>🧠 <strong>BRAINROT STATUS:</strong> Terminal (no cure available)</p>
        <p>💀 <strong>OHIO LEVEL:</strong> Maximum chaos achieved</p>
        <p>🚽 <strong>SKIBIDI RATING:</strong> Absolutely SENDING bestie!</p>
        <p>👑 <strong>SIGMA ENERGY:</strong> This image is now part of the grindset</p>
    </div>

    <script>
        // Image page chaos interactions
        document.addEventListener('mousemove', (e) => {
            if (Math.random() < 0.005) { // 0.5% chance on mouse move
                document.body.style.filter = \`hue-rotate(\${Math.random() * 360}deg)\`;
                setTimeout(() => {
                    document.body.style.filter = 'none';
                }, 150);
            }
        });
        
        // Image click chaos
        document.querySelector('img').addEventListener('click', () => {
            if (Math.random() < 0.3) {
                document.querySelector('img').style.transform = \`scale(\${0.9 + Math.random() * 0.2}) rotate(\${-10 + Math.random() * 20}deg)\`;
                setTimeout(() => {
                    document.querySelector('img').style.transform = 'none';
                }, 1000);
            }
        });
        
        // Console chaos for image page
        console.log("💩🖼️ YO YOU'RE VIEWING SOME ABSOLUTE CHAOS! 🖼️💩");
        console.log("🎰 IMAGE ID: ${req.params.id}");
        console.log("💀 FILE SIZE: ${fileSizeMB}MB of pure garbage");
        console.log("🚽 SKIBIDI TOILET SAYS: THIS IMAGE IS ABSOLUTELY SENDING!");
        console.log("🧠 BRAINROT LEVEL: Over 9000 bestie!");
    </script>
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
// ...existing code...

app.get('/i/:id/raw/download', async (req, res) => {
    const { data, error } = await supabase.from('images').select().eq('id', req.params.id).single()
    if (error || !data) return res.status(404).send('image died like your dad\'s dreams bestie 💀')

    // Extract the base mimetype (remove gambling metadata)
    const baseMimetype = data.mimetype.split(';')[0]
    
    // Generate a filename with proper extension
    const extension = baseMimetype.includes('jpeg') ? 'jpg' : 
                     baseMimetype.includes('png') ? 'png' : 
                     baseMimetype.includes('gif') ? 'gif' : 
                     baseMimetype.includes('webp') ? 'webp' : 'jpg'
    
    const filename = `pissandshit_chaos_${req.params.id}.${extension}`
    
    // Set proper headers for download
    res.set({
        'Content-Type': baseMimetype,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Description': 'Absolute fucking chaos image (probably destroyed)'
    })
    
    // Send the buffer directly
    res.send(Buffer.from(data.data, 'base64'))
})

// ...existing code...
app.listen(port, () => {
	console.log(`PISSANDSHITIMAGES listening on port ${port}`)
})
