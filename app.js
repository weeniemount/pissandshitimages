import express from 'express'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

// Import route modules
import uploadRoutes from './src/routes/upload.js'
import galleryRoutes from './src/routes/gallery.js' 
import imageRoutes from './src/routes/image.js'

const app = express()
const PORT = process.env.PORT || 8080

// Middleware
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`)
    next()
})

// Routes
app.use('/', uploadRoutes)      // Home page and upload
app.use('/', galleryRoutes)     // Gallery page
app.use('/', imageRoutes)       // Individual image display

// 404 handler with brainrot styling
app.use((req, res) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>404 - Not Found 💀</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: 'Comic Sans MS', cursive, sans-serif;
                    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
                    color: white;
                    text-align: center;
                    padding: 50px;
                    margin: 0;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }
                h1 {
                    font-size: clamp(2rem, 8vw, 6rem);
                    margin-bottom: 20px;
                    text-shadow: 3px 3px 0px #333;
                    animation: bounce 2s ease-in-out infinite;
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                p {
                    font-size: clamp(1rem, 3vw, 2rem);
                    margin: 20px 0;
                }
                a {
                    color: #ffeb3b;
                    text-decoration: none;
                    font-weight: bold;
                    font-size: clamp(1.2rem, 3vw, 2rem);
                    background: rgba(255,255,255,0.2);
                    padding: 15px 30px;
                    border-radius: 50px;
                    display: inline-block;
                    margin-top: 30px;
                    transition: all 0.3s ease;
                }
                a:hover {
                    background: rgba(255,255,255,0.4);
                    transform: scale(1.1);
                }
            </style>
        </head>
        <body>
            <h1>404 💀</h1>
            <p>This page got obliterated by the casino!</p>
            <p>Even our 404 pages aren't safe from destruction!</p>
            <a href="/">Return to Casino 🎰</a>
        </body>
        </html>
    `)
})

// Error handler
app.use((error, req, res, next) => {
    console.error('💀 Server error:', error)
    
    // Multer file size error
    if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).send(`
            <h1 style="font-family: Comic Sans MS; color: #ff6b6b;">FILE TOO THICC! 🍰</h1>
            <p style="font-family: Comic Sans MS;">Your image is too large! Keep it under 10MB, bestie!</p>
            <a href="/" style="font-family: Comic Sans MS; color: #4ecdc4;">Go back and try again 🔙</a>
        `)
    }
    
    // General error
    res.status(500).send(`
        <h1 style="font-family: Comic Sans MS; color: #ff6b6b;">CASINO MACHINE BROKE! 💀</h1>
        <p style="font-family: Comic Sans MS;">Something went wrong: ${error.message}</p>
        <a href="/" style="font-family: Comic Sans MS; color: #4ecdc4;">Try again 🔄</a>
    `)
})

// Start server
app.listen(PORT, () => {
    console.log('🎰💩🔥 PISSANDSHITIMAGES CASINO IS OPEN FOR BUSINESS! 🔥💩🎰')
    console.log(`💸 The house always wins at http://localhost:${PORT}`)
    console.log(`🎲 Current odds: 50% survival, 25% shit, 25% nuclear obliteration`)
    console.log('🎪 LET THE GAMBLING BEGIN!')
})

export default app
