import express from 'express'
import { supabase, base64ToBytes } from '../config/database.js'
import { renderTemplate } from '../utils/templateRenderer.js'

const router = express.Router()

// Gallery page route
router.get('/gallery', async (req, res) => {
    try {
        console.log('🖼️ Loading gallery of destruction...')
        
        // Fetch all images from database, ordered by creation date (newest first)
        const { data: images, error } = await supabase
            .from('images')
            .select('id, mimetype')
        
        if (error) {
            console.error('💀 Gallery fetch error:', error)
            return res.status(500).send('Failed to load gallery! The casino database is having issues.')
        }
        
        console.log(`📸 Found ${images.length} images in the gallery`)
        
        // Process images for template
        const processedImages = images.map(image => {
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
            
            const rollInfo = image.mimetype?.includes('roll:') 
                ? image.mimetype.split('roll:')[1]?.split('|')[0] 
                : 'Unknown'
            
            const resultType = image.mimetype?.includes('result:') 
                ? image.mimetype.split('result:')[1]?.split('|')[0] 
                : 'UNKNOWN'
            
            return {
                ...image,
                emoji: resultEmoji[resultType] || '❓',
                color: resultColor[resultType] || '#666',
                rollInfo,
                date: 'Casino Time 🎰' // No timestamp? NO PROBLEM BESTIE
            }
        })
        
        // Calculate statistics
        const survivorCount = images.filter(img => img.mimetype?.includes('LUCKY_SURVIVOR')).length
        const shittifiedCount = images.filter(img => img.mimetype?.includes('NORMAL_SHIT')).length
        const obliteratedCount = images.filter(img => img.mimetype?.includes('EXTREME_NUCLEAR')).length
        const unknownCount = images.filter(img => !img.mimetype?.includes('roll:')).length
        
        // Prepare URL data for metadata
        const baseUrl = `${req.protocol}://${req.get('host')}`
        const currentUrl = `${baseUrl}${req.originalUrl}`
        
        res.send(renderTemplate('gallery', {
            imageCount: images.length,
            hasImages: images.length > 0,
            images: processedImages,
            survivorCount,
            shittifiedCount,
            obliteratedCount,
            unknownCount,
            baseUrl,
            currentUrl
        }))
        
    } catch (error) {
        console.error('💀 Gallery error:', error)
        res.status(500).send(`Gallery exploded! Error: ${error.message}`)
    }
})

export default router
