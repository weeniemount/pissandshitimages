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
            /* MAXIMUM CHAOS GALLERY BUTTON STYLING */
        .gallery-access {
            text-align: center;
            margin: 3em 0;
            animation: gallery-section-float 4s ease-in-out infinite;
        }
        @keyframes gallery-section-float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
        }
        
        .gallery-btn {
            display: inline-block;
            padding: 2em 3em;
            font-size: 1.8em;
            font-weight: bold;
            text-decoration: none;
            color: black;
            background: linear-gradient(45deg, #ff00cc, #00ffff, #ffff00, #ff0000, #ff00cc);
            background-size: 800% 800%;
            border-radius: 30px;
            border: 5px solid gold;
            font-family: 'Comic Sans MS', cursive;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            text-shadow: 2px 2px 4px white, -1px -1px 2px black;
            box-shadow: 
                0 0 50px rgba(255,255,255,0.6),
                inset 0 0 30px rgba(0,0,0,0.3),
                0 10px 30px rgba(0,0,0,0.4);
            animation: 
                gallery-btn-rave 2s infinite,
                gallery-btn-pulse 3s infinite,
                gallery-btn-chaos 4s infinite,
                gallery-btn-float 5s ease-in-out infinite;
            position: relative;
            overflow: hidden;
            transform: rotate(-1deg);
            transition: all 0.3s ease;
        }
        
        @keyframes gallery-btn-rave {
            0% { background-position: 0% 50%; }
            25% { background-position: 100% 25%; }
            50% { background-position: 50% 100%; }
            75% { background-position: 0% 75%; }
            100% { background-position: 0% 50%; }
        }
        
        @keyframes gallery-btn-pulse {
            0% { 
                box-shadow: 
                    0 0 50px rgba(255,255,255,0.6),
                    inset 0 0 30px rgba(0,0,0,0.3),
                    0 10px 30px rgba(0,0,0,0.4);
                transform: rotate(-1deg) scale(1);
            }
            25% { 
                box-shadow: 
                    0 0 70px rgba(255,0,204,0.8),
                    inset 0 0 40px rgba(255,255,0,0.2),
                    0 15px 40px rgba(255,0,204,0.3);
                transform: rotate(0deg) scale(1.02);
            }
            50% { 
                box-shadow: 
                    0 0 60px rgba(0,255,255,0.7),
                    inset 0 0 35px rgba(255,0,204,0.25),
                    0 12px 35px rgba(0,255,255,0.35);
                transform: rotate(1deg) scale(0.98);
            }
            75% { 
                box-shadow: 
                    0 0 80px rgba(255,255,0,0.9),
                    inset 0 0 45px rgba(0,255,255,0.2),
                    0 18px 45px rgba(255,255,0,0.25);
                transform: rotate(-0.5deg) scale(1.01);
            }
            100% { 
                box-shadow: 
                    0 0 50px rgba(255,255,255,0.6),
                    inset 0 0 30px rgba(0,0,0,0.3),
                    0 10px 30px rgba(0,0,0,0.4);
                transform: rotate(-1deg) scale(1);
            }
        }
        
        @keyframes gallery-btn-chaos {
            0% { filter: brightness(1) contrast(1) saturate(1); }
            20% { filter: brightness(1.2) contrast(1.1) saturate(1.3); }
            40% { filter: brightness(0.9) contrast(1.3) saturate(1.5); }
            60% { filter: brightness(1.1) contrast(0.9) saturate(1.2); }
            80% { filter: brightness(1.05) contrast(1.2) saturate(0.8); }
            100% { filter: brightness(1) contrast(1) saturate(1); }
        }
        
        @keyframes gallery-btn-float {
            0%, 100% { transform: rotate(-1deg) translateY(0px); }
            25% { transform: rotate(0.5deg) translateY(-5px); }
            50% { transform: rotate(1deg) translateY(-10px); }
            75% { transform: rotate(-0.5deg) translateY(-3px); }
        }
        
        .gallery-btn:hover {
            animation: 
                gallery-btn-rave 0.5s infinite,
                gallery-btn-pulse 1s infinite,
                gallery-btn-chaos 1s infinite,
                gallery-btn-hover-shake 0.3s infinite;
            transform: rotate(2deg) scale(1.1);
            filter: brightness(1.3) saturate(1.5);
            border-color: #ffff00;
            text-shadow: 3px 3px 6px white, -2px -2px 4px black, 0 0 20px #ff00cc;
        }
        
        @keyframes gallery-btn-hover-shake {
            0% { transform: rotate(2deg) scale(1.1) translateX(0px); }
            25% { transform: rotate(1deg) scale(1.12) translateX(-2px); }
            50% { transform: rotate(3deg) scale(1.08) translateX(2px); }
            75% { transform: rotate(1.5deg) scale(1.11) translateX(-1px); }
            100% { transform: rotate(2deg) scale(1.1) translateX(1px); }
        }
        
        /* GALLERY BUTTON SPARKLE EFFECT */
        .gallery-btn::before {
            content: "✨💎✨💎✨💎✨💎✨💎✨💎✨💎✨";
            position: absolute;
            top: -10px;
            left: -50px;
            right: -50px;
            height: 20px;
            animation: sparkle-move 3s linear infinite;
            pointer-events: none;
            font-size: 1.2em;
            opacity: 0.8;
        }
        
        @keyframes sparkle-move {
            0% { transform: translateX(-100px) rotate(0deg); }
            100% { transform: translateX(100px) rotate(360deg); }
        }
        
        /* GALLERY BUTTON PARTICLE TRAIL */
        .gallery-btn::after {
            content: "🎰🖼️💀🔥🎰🖼️💀🔥🎰🖼️💀🔥";
            position: absolute;
            bottom: -15px;
            left: 0;
            right: 0;
            height: 30px;
            animation: particle-trail 4s linear infinite;
            pointer-events: none;
            font-size: 0.8em;
            opacity: 0.6;
            text-align: center;
        }
        
        @keyframes particle-trail {
            0% { transform: translateY(0px) scale(1) rotate(0deg); opacity: 0.6; }
            50% { transform: translateY(-10px) scale(1.1) rotate(180deg); opacity: 0.3; }
            100% { transform: translateY(-20px) scale(0.8) rotate(360deg); opacity: 0; }
        }
        
        /* MOBILE RESPONSIVE GALLERY BUTTON */
        @media (max-width: 768px) {
            .gallery-btn {
                font-size: 1.4em;
                padding: 1.5em 2em;
            }
        }
        
        @media (max-width: 480px) {
            .gallery-btn {
                font-size: 1.2em;
                padding: 1.2em 1.5em;
                border-radius: 20px;
            }
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
        
        <!-- 🎰💀 ABSOLUTE CHAOS GALLERY BUTTON 💀🎰 -->
        <div class="gallery-access" style="margin-top: 3em;">
            <a href="/gallery" class="gallery-btn">
                🖼️🎰💀 WITNESS THE GALLERY OF ABSOLUTE FUCKING CHAOS 💀🎰🖼️
            </a>
        </div>
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
    
    // MAXIMUM BRAINROT CHAOS RESULT PAGE - BUTTONS THAT ACTUALLY FUCKING WORK ON 1080P TWIN!!!
    const resultPage = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>🎰💀 GAMBLING RESULTS OF PURE FUCKING CHAOS 💀🎰</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            * {
                box-sizing: border-box;
            }
            body { 
                font-family: 'Comic Sans MS', cursive; 
                background: linear-gradient(45deg, #ff00cc, #00ffff, #ffff00, #ff0000, #ff00cc);
                background-size: 600% 600%;
                animation: result-chaos 3s infinite, body-wiggle 4s infinite;
                color: white; 
                text-align: center; 
                padding: 2rem;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                overflow-x: hidden;
                cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><text y="16" font-size="16">🎲</text></svg>'), auto;
            }
            @keyframes result-chaos {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            @keyframes body-wiggle {
                0%, 100% { transform: rotate(0deg); }
                25% { transform: rotate(0.3deg); }
                50% { transform: rotate(0deg); }
                75% { transform: rotate(-0.3deg); }
            }
            h1 { 
                font-size: clamp(1.5rem, 5vw, 3rem);
                text-shadow: 4px 4px 8px black, 0 0 30px #ff00cc;
                animation: title-chaos 2s infinite, title-float 3s infinite;
                margin: 1rem 0;
            }
            @keyframes title-chaos {
                0% { color: #ffff00; transform: scale(1); }
                25% { color: #ff00cc; transform: scale(1.02); }
                50% { color: #00ffff; transform: scale(0.98); }
                75% { color: #ff0000; transform: scale(1.01); }
                100% { color: #ffff00; transform: scale(1); }
            }
            @keyframes title-float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-5px); }
            }
            .brainrot-subtitle {
                font-size: clamp(1rem, 3vw, 1.5rem);
                color: #00ffff;
                text-shadow: 2px 2px 4px black;
                animation: subtitle-pulse 1.5s infinite;
                margin: 1rem 0;
            }
            @keyframes subtitle-pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
            .result { 
                font-size: clamp(1.2rem, 4vw, 2.5rem);
                margin: 2rem auto;
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
                33% { border-color: #ff00cc; }
                66% { border-color: #00ffff; }
                100% { border-color: gold; }
            }
            .roll-info {
                font-size: clamp(1rem, 3vw, 1.5rem);
                color: #ffff00;
                text-shadow: 2px 2px 4px black;
                animation: roll-pulse 1s infinite;
                margin: 2rem 0;
            }
            @keyframes roll-pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }

            /* BUTTON CONTAINER - FIXED FOR 1080P VISIBILITY BESTIE!!! */
            .button-container {
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
                align-items: center;
                justify-content: center;
                margin: 3rem 0;
                width: 100%;
                max-width: 800px;
                position: relative;
                z-index: 1000;
            }

            /* BUTTON STYLING - ENHANCED VISIBILITY FOR ALL SCREENS TWIN!!! */
            .button-container a { 
                color: white; 
                text-decoration: none; 
                background: linear-gradient(45deg, #000, #333, #000);
                background-size: 200% 200%;
                padding: 1.5em 3em; 
                border-radius: 20px; 
                border: 4px solid white;
                display: inline-block;
                animation: link-rave 1.5s infinite, link-chaos 2s infinite;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                box-shadow: 0 0 30px rgba(255,255,255,0.8), 0 0 60px rgba(255,255,255,0.3);
                min-width: 300px;
                font-size: clamp(1rem, 2.5vw, 1.3rem);
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }

            .button-container a:hover { 
                animation: link-rave 0.5s infinite, link-chaos 0.5s infinite;
                transform: scale(1.1) rotate(2deg);
                filter: brightness(1.3);
                box-shadow: 0 0 50px rgba(255,255,255,1), 0 0 100px rgba(255,255,255,0.5);
            }

            /* ENHANCED BUTTON ANIMATIONS THAT ABSOLUTELY SEND!!! */
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

            /* CHAOS PARTICLES BACKGROUND */
            .chaos-particles {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: -1;
                animation: particle-chaos 8s linear infinite;
                font-size: 3em;
                opacity: 0.15;
            }
            @keyframes particle-chaos {
                0% { transform: translateY(120vh) rotate(0deg) scale(1); }
                100% { transform: translateY(-120vh) rotate(1080deg) scale(0.3); }
            }

            .brainrot-footer {
                margin-top: 3em;
                font-size: clamp(0.9rem, 2.5vw, 1.2rem);
                color: #00ffff;
                animation: footer-pulse 2s infinite;
                max-width: 800px;
            }
            @keyframes footer-pulse {
                0% { opacity: 0.8; }
                50% { opacity: 1; }
                100% { opacity: 0.8; }
            }

            /* MOBILE RESPONSIVE FIXES */
            @media (max-width: 768px) {
                body {
                    padding: 1rem;
                }
                .button-container a {
                    min-width: 250px;
                    padding: 1.2em 2em;
                }
                .result {
                    padding: 1.5em;
                    margin: 1.5rem auto;
                }
            }

            @media (max-width: 480px) {
                .button-container {
                    gap: 1rem;
                }
                .button-container a {
                    min-width: 200px;
                    padding: 1em 1.5em;
                }
            }

            /* HIGH RESOLUTION MONITOR FIXES (1080p+) - THIS IS THE SHIT YOU NEEDED TWIN!!! */
            @media (min-width: 1920px) and (min-height: 1080px) {
                body {
                    padding: 3rem;
                }
                .button-container {
                    margin: 4rem 0;
                }
                .button-container a {
                    padding: 2em 4em;
                    min-width: 400px;
                    font-size: 1.5rem;
                }
            }

            @media (min-width: 1440px) and (min-height: 900px) {
                .button-container a {
                    padding: 1.8em 3.5em;
                    min-width: 350px;
                }
            }
        </style>
    </head>
    <body>
        <div class="chaos-particles">🎰💀🔥💩🎲💀🔥💩🎰💀🔥💩🎲💀🔥💩</div>
        
        <h1>🎰💀 CASINO RESULTS OF PURE FUCKING CHAOS 💀🎰</h1>
        <div class="brainrot-subtitle">*no cap this shit just hit different twin* 💀💀💀</div>
        <div class="result">${gamblingResult.resultMessage}</div>
        <div class="roll-info">🎲 THE FUCKING DICE OF DESTINY ROLLED: ${gamblingResult.rollPercentage}% 🎲<br><em>RNG Jesus has spoken bestie!</em></div>
        
        <div class="button-container">
            <a href="/i/${id}">🖼️💀 WITNESS THE ABSOLUTE CARNAGE 💀🖼️</a>
            <a href="/">🎰🔥 FEED MORE SOULS TO THE CHAOS MACHINE! 🔥🎰</a>
        </div>
        
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
app.get('/gallery', async (req, res) => {
    try {
        // Get all images from database (limit to prevent chaos overload)
        const { data: images, error } = await supabase
            .from('images')
            .select('id, mimetype')
            .order('id', { ascending: false })
            .limit(50)

        if (error) {
            console.error('Gallery fetch error:', error)
            return res.status(500).send('Gallery exploded like your brain cells 💀')
        }

        // Generate image cards with gambling info
        const imageCards = images.map((img, index) => {
            let gamblingBadge = ""
            let gamblingClass = "unknown"
            
            if (img.mimetype.includes('gambling=')) {
                const parts = img.mimetype.split(';')
                const gamblingResult = parts.find(p => p.includes('gambling='))?.split('=')[1] || 'UNKNOWN'
                const rollResult = parts.find(p => p.includes('roll='))?.split('=')[1] || '0'
                
                const badges = {
                    'EXTREME_NUCLEAR': { text: '💀☢️ NUKED', class: 'nuclear', color: '#ff0000' },
                    'NORMAL_SHIT': { text: '💩 SHITTY', class: 'shit', color: '#ff8800' },
                    'LUCKY_SURVIVOR': { text: '✨ LUCKY', class: 'lucky', color: '#00ff00' }
                }
                
                const badge = badges[gamblingResult] || { text: '❓ UNKNOWN', class: 'unknown', color: '#666666' }
                gamblingBadge = `<div class="gambling-badge ${badge.class}" style="background-color: ${badge.color};">${badge.text}<br><small>${rollResult}%</small></div>`
                gamblingClass = badge.class
            }

            return `
            <div class="image-card ${gamblingClass}" style="animation-delay: ${index * 0.1}s;">
                ${gamblingBadge}
                <div class="image-container">
                    <img src="/i/${img.id}/raw" alt="Chaos Image ${img.id}" loading="lazy" />
                    <div class="image-overlay">
                        <a href="/i/${img.id}" class="view-btn">👁️ WITNESS</a>
                    </div>
                </div>
                <div class="image-id">ID: ${img.id.substring(0, 8)}...</div>
            </div>`
        }).join('')

        const galleryPage = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>🎰🖼️ PISSANDSHITIMAGES GALLERY OF PURE FUCKING CHAOS 🖼️🎰</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Comic Sans MS', 'Papyrus', 'Brush Script MT', cursive, sans-serif;
                    background: linear-gradient(135deg, #111111, #330033, #003333, #333300, #111111);
                    background-size: 800% 800%;
                    color: white;
                    animation: gallery-chaos 8s infinite, body-drift 6s ease-in-out infinite;
                    overflow-x: hidden;
                    cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><text y="16" font-size="16">🖼️</text></svg>'), auto;
                }
                @keyframes gallery-chaos {
                    0% { background-position: 0% 50%; }
                    25% { background-position: 100% 25%; }
                    50% { background-position: 50% 100%; }
                    75% { background-position: 0% 75%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes body-drift {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    33% { transform: translateY(-3px) rotate(0.2deg); }
                    66% { transform: translateY(2px) rotate(-0.2deg); }
                }
                
                .header {
                    text-align: center;
                    padding: 2rem;
                    position: relative;
                }
                
                h1 {
                    font-size: 4rem;
                    text-shadow: 4px 4px 12px black, 0 0 40px #ff00cc, 0 0 80px #00ffff;
                    margin: 0.5em 0;
                    animation: gallery-title 2s infinite, title-shake 1.5s infinite;
                    transform: rotate(-2deg);
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                }
                @keyframes gallery-title {
                    0% { 
                        color: #ffffff;
                        text-shadow: 4px 4px 12px black, 0 0 40px #ff00cc, 0 0 80px #00ffff;
                        filter: brightness(1);
                    }
                    25% { 
                        color: #ffff00;
                        text-shadow: 4px 4px 12px black, 0 0 60px #ffff00, 0 0 100px #ff00cc;
                        filter: brightness(1.2);
                    }
                    50% { 
                        color: #00ffff;
                        text-shadow: 4px 4px 12px black, 0 0 50px #00ffff, 0 0 90px #ffff00;
                        filter: brightness(0.9);
                    }
                    75% { 
                        color: #ff00cc;
                        text-shadow: 4px 4px 12px black, 0 0 70px #ff00cc, 0 0 110px #00ffff;
                        filter: brightness(1.1);
                    }
                    100% { 
                        color: #ffffff;
                        text-shadow: 4px 4px 12px black, 0 0 40px #ff00cc, 0 0 80px #00ffff;
                        filter: brightness(1);
                    }
                }
                @keyframes title-shake {
                    0% { transform: rotate(-2deg) translateX(0px) scale(1); }
                    20% { transform: rotate(-1deg) translateX(-1px) scale(1.01); }
                    40% { transform: rotate(-3deg) translateX(1px) scale(0.99); }
                    60% { transform: rotate(-1.5deg) translateX(-0.5px) scale(1.005); }
                    80% { transform: rotate(-2.5deg) translateX(0.5px) scale(0.995); }
                    100% { transform: rotate(-2deg) translateX(0px) scale(1); }
                }
                
                .brainrot-subtitle {
                    font-size: 1.6em;
                    color: #ffff00;
                    margin: 1em 0;
                    animation: subtitle-glitch 3s infinite;
                    text-shadow: 2px 2px 6px black;
                    font-weight: bold;
                    text-transform: lowercase;
                }
                @keyframes subtitle-glitch {
                    0%, 90% { transform: skew(0deg, 0deg); }
                    5% { transform: skew(2deg, 1deg); }
                    10% { transform: skew(-1deg, -0.5deg); }
                    15% { transform: skew(0.5deg, -1deg); }
                    20% { transform: skew(0deg, 0deg); }
                }
                
                .gallery-stats {
                    background: rgba(0,0,0,0.9);
                    padding: 1.5em;
                    border-radius: 20px;
                    border: 3px dashed gold;
                    display: inline-block;
                    margin: 2em;
                    animation: stats-pulse 3s infinite, stats-float 4s ease-in-out infinite;
                    box-shadow: 0 0 40px rgba(255,215,0,0.3);
                }
                @keyframes stats-pulse {
                    0% { border-color: gold; box-shadow: 0 0 40px rgba(255,215,0,0.3); }
                    33% { border-color: #ff00cc; box-shadow: 0 0 50px rgba(255,0,204,0.4); }
                    66% { border-color: #00ffff; box-shadow: 0 0 45px rgba(0,255,255,0.35); }
                    100% { border-color: gold; box-shadow: 0 0 40px rgba(255,215,0,0.3); }
                }
                @keyframes stats-float {
                    0%, 100% { transform: translateY(0px) rotate(1deg); }
                    50% { transform: translateY(-8px) rotate(-1deg); }
                }
                
                .gallery-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 2rem;
                    padding: 2rem;
                    max-width: 1400px;
                    margin: 0 auto;
                }
                
                .image-card {
                    background: rgba(0,0,0,0.8);
                    border-radius: 20px;
                    overflow: hidden;
                    position: relative;
                    animation: card-entrance 0.8s ease-out, card-float 6s ease-in-out infinite;
                    box-shadow: 0 0 30px rgba(255,255,255,0.1);
                    border: 2px solid transparent;
                    transition: all 0.3s ease;
                }
                @keyframes card-entrance {
                    from { opacity: 0; transform: translateY(50px) rotate(10deg) scale(0.8); }
                    to { opacity: 1; transform: translateY(0px) rotate(0deg) scale(1); }
                }
                @keyframes card-float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    33% { transform: translateY(-5px) rotate(0.5deg); }
                    66% { transform: translateY(3px) rotate(-0.5deg); }
                }
                
                .image-card:hover {
                    transform: scale(1.05) rotate(2deg);
                    box-shadow: 0 0 50px rgba(255,255,255,0.3);
                    z-index: 10;
                }
                
                .image-card.nuclear {
                    border-color: #ff0000;
                    box-shadow: 0 0 30px rgba(255,0,0,0.3);
                }
                .image-card.shit {
                    border-color: #ff8800;
                    box-shadow: 0 0 30px rgba(255,136,0,0.3);
                }
                .image-card.lucky {
                    border-color: #00ff00;
                    box-shadow: 0 0 30px rgba(0,255,0,0.3);
                }
                
                .gambling-badge {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    padding: 0.5em;
                    border-radius: 10px;
                    font-size: 0.9em;
                    font-weight: bold;
                    text-align: center;
                    z-index: 5;
                    animation: badge-pulse 2s infinite;
                    border: 2px solid rgba(255,255,255,0.3);
                    box-shadow: 0 0 15px rgba(0,0,0,0.5);
                }
                @keyframes badge-pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
                
                .image-container {
                    position: relative;
                    height: 250px;
                    overflow: hidden;
                }
                
                .image-container img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s ease;
                    animation: img-subtle-chaos 8s infinite;
                }
                @keyframes img-subtle-chaos {
                    0% { filter: brightness(1) contrast(1) saturate(1); }
                    25% { filter: brightness(1.05) contrast(1.1) saturate(1.1); }
                    50% { filter: brightness(0.95) contrast(1.2) saturate(1.2); }
                    75% { filter: brightness(1.02) contrast(0.9) saturate(0.9); }
                    100% { filter: brightness(1) contrast(1) saturate(1); }
                }
                
                .image-container:hover img {
                    transform: scale(1.1) rotate(1deg);
                }
                
                .image-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                
                .image-container:hover .image-overlay {
                    opacity: 1;
                }
                
                .view-btn {
                    background: linear-gradient(45deg, #ff00cc, #00ffff, #ffff00, #ff0000);
                    background-size: 400% 400%;
                    color: black;
                    text-decoration: none;
                    padding: 1em 2em;
                    border-radius: 15px;
                    font-weight: bold;
                    text-transform: uppercase;
                    animation: btn-rave 2s infinite;
                    box-shadow: 0 0 20px rgba(255,255,255,0.5);
                }
                @keyframes btn-rave {
                    0% { background-position: 0% 50%; transform: scale(1); }
                    25% { background-position: 100% 50%; transform: scale(1.02); }
                    50% { background-position: 100% 100%; transform: scale(0.98); }
                    75% { background-position: 0% 100%; transform: scale(1.01); }
                    100% { background-position: 0% 50%; transform: scale(1); }
                }
                
                .view-btn:hover {
                    animation: btn-rave 0.5s infinite;
                    transform: scale(1.1);
                }
                
                .image-id {
                    padding: 1em;
                    text-align: center;
                    font-size: 0.9em;
                    color: #ccc;
                    background: rgba(0,0,0,0.5);
                }
                
                .navigation-buttons {
                    text-align: center;
                    padding: 3em;
                }
                
                .nav-btn {
                    display: inline-block;
                    margin: 1em;
                    padding: 1.5em 3em;
                    background: linear-gradient(45deg, #ff0000, #ffff00, #ff00cc, #00ffff);
                    background-size: 600% 600%;
                    color: black;
                    text-decoration: none;
                    border-radius: 25px;
                    font-weight: bold;
                    font-size: 1.2em;
                    text-transform: uppercase;
                    animation: nav-chaos 3s infinite, nav-float 4s ease-in-out infinite;
                    box-shadow: 0 0 40px rgba(255,255,255,0.3);
                    letter-spacing: 0.1em;
                }
                @keyframes nav-chaos {
                    0% { background-position: 0% 50%; filter: brightness(1); }
                    25% { background-position: 100% 25%; filter: brightness(1.2); }
                    50% { background-position: 50% 100%; filter: brightness(0.9); }
                    75% { background-position: 0% 75%; filter: brightness(1.1); }
                    100% { background-position: 0% 50%; filter: brightness(1); }
                }
                @keyframes nav-float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-10px) rotate(1deg); }
                }
                
                .nav-btn:hover {
                    animation: nav-chaos 1s infinite, nav-float 1s infinite;
                    transform: scale(1.1) rotate(3deg);
                }
                
                /* CHAOS PARTICLES FOR GALLERY */
                body::before {
                    content: "🖼️🎰💀🔥🖼️🎰💀🔥🚽🖼️🎰💀🔥🖼️🧠💀🔥🖼️🎰💀🔥";
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    animation: gallery-particles 12s linear infinite;
                    z-index: -1;
                    font-size: 2em;
                    opacity: 0.08;
                }
                @keyframes gallery-particles {
                    0% { transform: translateY(120vh) translateX(-50px) rotate(0deg); }
                    100% { transform: translateY(-120vh) translateX(50px) rotate(1080deg); }
                }
                
                .brainrot-footer {
                    margin-top: 4em;
                    text-align: center;
                    font-size: 1.1em;
                    color: #00ffff;
                    animation: footer-chaos 4s infinite;
                    padding: 2em;
                }
                @keyframes footer-chaos {
                    0% { opacity: 0.8; transform: rotate(0deg); }
                    50% { opacity: 1; transform: rotate(0.3deg); }
                    100% { opacity: 0.8; transform: rotate(0deg); }
                }
                
                /* MOBILE RESPONSIVE CHAOS */
                @media (max-width: 768px) {
                    .gallery-grid {
                        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                        gap: 1rem;
                        padding: 1rem;
                    }
                    h1 {
                        font-size: 2.5rem;
                    }
                    .image-container {
                        height: 200px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🎰🖼️ GALLERY OF PURE FUCKING CHAOS 🖼️🎰</h1>
                <div class="brainrot-subtitle">
                    *witness the destruction bestie, no cap this gallery is absolutely SENDING* 💀💀💀
                </div>
                <div class="gallery-stats">
                    <strong>🎲 CHAOS STATISTICS 🎲</strong><br>
                    <em>🖼️ Images Displayed: ${images.length}</em><br>
                    <em>💀 Total Carnage: Immeasurable</em><br>
                    <em>🧠 Brainrot Level: Maximum</em>
                </div>
            </div>
            
            <div class="gallery-grid">
                ${imageCards || '<div style="grid-column: 1/-1; text-align: center; font-size: 2em; color: #666;">No images yet bestie... Upload some chaos! 💀</div>'}
            </div>
            
            <div class="navigation-buttons">
                <a href="/" class="nav-btn">🎰💀 SACRIFICE MORE SOULS 💀🎰</a>
                <a href="#" onclick="location.reload()" class="nav-btn">🔄🔥 RELOAD THE CHAOS 🔥🔄</a>
            </div>
            
            <div class="brainrot-footer">
                <p>🚽 <strong>SKIBIDI TOILET APPROVED:</strong> This gallery is absolutely SENDING! 🚽</p>
                <p>🧠 <strong>BRAINROT STATUS:</strong> Terminal gallery experience achieved</p>
                <p>💀 <strong>OHIO LEVEL:</strong> Gallery chaos maximum overdrive</p>
                <p>👑 <strong>SIGMA ENERGY:</strong> Every image is now part of the grindset</p>
                <p>🎭 <strong>WARNING:</strong> Prolonged exposure may cause uncontrollable urge to gamble images</p>
            </div>

            <script>
                // Gallery chaos interactions
                document.addEventListener('mousemove', (e) => {
                    if (Math.random() < 0.002) { // 0.2% chance on mouse move
                        document.body.style.filter = \`hue-rotate(\${Math.random() * 360}deg)\`;
                        setTimeout(() => {
                            document.body.style.filter = 'none';
                        }, 200);
                    }
                });
                
                // Random gallery effects
                setInterval(() => {
                    if (Math.random() < 0.1) {
                        const cards = document.querySelectorAll('.image-card');
                        const randomCard = cards[Math.floor(Math.random() * cards.length)];
                        if (randomCard) {
                            randomCard.style.transform = 'scale(1.02) rotate(' + (Math.random() * 4 - 2) + 'deg)';
                            setTimeout(() => {
                                randomCard.style.transform = '';
                            }, 1000);
                        }
                    }
                }, 5000);
                
                // Console chaos for gallery
                console.log("🖼️🎰 YO WELCOME TO THE GALLERY OF ABSOLUTE CHAOS! 🎰🖼️");
                console.log("💀 TOTAL IMAGES: ${images.length}");
                console.log("🎲 GAMBLING VICTIMS ON DISPLAY");
                console.log("🚽 SKIBIDI TOILET SAYS: WITNESS THE CARNAGE!");
                console.log("🧠 GALLERY BRAINROT LEVEL: OVER 9000!");
                console.log("🔥 THIS GALLERY IS ABSOLUTELY SENDING BESTIE!");
            </script>
        </body>
        </html>`

        res.send(galleryPage)
    } catch (error) {
        console.error('Gallery explosion:', error)
        res.status(500).send('Gallery had a mental breakdown bestie 💀🔥')
    }
})
// ...existing code...
// ...existing code...
app.listen(port, () => {
	console.log(`PISSANDSHITIMAGES listening on port ${port}`)
})
