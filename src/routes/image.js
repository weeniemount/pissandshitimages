import express from 'express'
import { supabase, base64ToBytes } from '../config/database.js'
import { renderTemplate } from '../utils/templateRenderer.js'

const router = express.Router()

// Individual image display route
router.get('/image/:id', async (req, res) => {
    try {
        const imageId = req.params.id
        console.log(`🖼️ Requesting image: ${imageId}`)
        
        // Fetch image from database
        const { data: images, error } = await supabase
            .from('images')
            .select('*')
            .eq('id', imageId)
            .limit(1)
        
        if (error) {
            console.error('💀 Image fetch error:', error)
            return res.status(500).send('Database error while fetching image!')
        }
        
        if (!images || images.length === 0) {
            return res.status(404).send('Image not found in the casino! 😭')
        }
        
        const image = images[0]
        console.log(`✅ Found image: ${imageId}`)
        
        // Check if this is a direct image request (for <img> tags) or page request
        const isDirectImageRequest = req.headers.accept && req.headers.accept.includes('image/')
        
        if (isDirectImageRequest || req.query.raw === 'true') {
            // Return raw image data
            const imageBuffer = base64ToBytes(image.data)
            
            // Extract the actual mimetype (before the metadata)
            const actualMimetype = image.mimetype.split('|')[0] || 'image/jpeg'
            
            res.set('Content-Type', actualMimetype)
            res.set('Cache-Control', 'public, max-age=86400') // Cache for 1 day
            res.send(imageBuffer)
        } else {
            // Return HTML page with image details
            
            // Parse metadata from mimetype field
            let rollPercentage = 'Unknown'
            let gamblingResult = 'UNKNOWN'
            let resultMessage = ''
            
            if (image.mimetype.includes('roll:')) {
                rollPercentage = image.mimetype.split('roll:')[1]?.split('|')[0] || 'Unknown'
            }
            
            if (image.mimetype.includes('result:')) {
                gamblingResult = image.mimetype.split('result:')[1]?.split('|')[0] || 'UNKNOWN'
            }
            
            if (image.mimetype.includes('msg:')) {
                const encodedMsg = image.mimetype.split('msg:')[1]?.split('|')[0] || ''
                resultMessage = decodeURIComponent(encodedMsg)
            }
            
            // Get result emoji and color
            const resultEmoji = {
                'LUCKY_SURVIVOR': '🍀',
                'NORMAL_SHIT': '💩',
                'EXTREME_NUCLEAR': '💀'
            }
            
            const resultColor = {
                'LUCKY_SURVIVOR': '#4caf50',
                'NORMAL_SHIT': '#ff9800', 
                'EXTREME_NUCLEAR': '#f44336'
            }
            
            // Prepare URL data for metadata
            const baseUrl = `${req.protocol}://${req.get('host')}`
            const currentUrl = `${baseUrl}${req.originalUrl}`
            
            res.send(renderTemplate('image', {
                id: imageId,
                mimetype: image.mimetype.split('|')[0] || 'image/jpeg',
                createdAt: 'Some time in the casino multiverse 🎰✨',
                rollPercentage,
                gamblingResult,
                resultMessage,
                emoji: resultEmoji[gamblingResult] || '❓',
                color: resultColor[gamblingResult] || '#666',
                baseUrl,
                currentUrl
            }))
        }
        
    } catch (error) {
        console.error('💀 Image route error:', error)
        res.status(500).send(`Failed to load image! Error: ${error.message}`)
    }
})

export default router
