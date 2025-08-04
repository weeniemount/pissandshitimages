import express from 'express'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import { gamblingShitifyImage } from '../utils/imageProcessor.js'
import { supabase, base64ToBytes } from '../config/database.js'
import { renderTemplate } from '../utils/templateRenderer.js'

const router = express.Router()

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true)
        } else {
            cb(new Error('Only image files are allowed!'), false)
        }
    }
})

// Upload page route
router.get('/', (req, res) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`
    const currentUrl = `${baseUrl}${req.originalUrl}`
    
    res.send(renderTemplate('upload', {
        baseUrl,
        currentUrl
    }))
})

// Upload endpoint
router.post('/upload', upload.single('image'), async (req, res) => {
    console.log('🎰 NEW VICTIM ENTERING THE CASINO!')
    
    try {
        if (!req.file) {
            return res.status(400).send('No image file uploaded!')
        }
        
        console.log(`📸 Processing ${req.file.mimetype} file, size: ${req.file.size} bytes`)
        
        // GAMBLING TIME! 🎰🎲
        const gamblingResult = await gamblingShitifyImage(req.file.buffer, req.file.mimetype)
        
        // Generate unique ID for this image
        const imageId = uuidv4()
        
        // Convert buffer to base64 for storage
        const base64Data = gamblingResult.buffer.toString('base64')
        
        // Store gambling metadata in the mimetype field (because we're chaotic)
        const metadataMimetype = `${gamblingResult.mimetype}|roll:${gamblingResult.rollPercentage}|result:${gamblingResult.gamblingResult}|msg:${encodeURIComponent(gamblingResult.resultMessage)}`
        
        // Save to database
        const { error } = await supabase
            .from('images')
            .insert([
                {
                    id: imageId,
                    data: base64Data,
                    mimetype: metadataMimetype
                }
            ])
        
        if (error) {
            console.error('💀 Database error:', error)
            return res.status(500).send('Failed to save image to casino database!')
        }
        
        console.log(`✅ Image saved with ID: ${imageId}`)
        console.log(`🎲 Gambling result: ${gamblingResult.gamblingResult} (${gamblingResult.rollPercentage}%)`)
        
        // Prepare result data for template
        const resultStyles = {
            'LUCKY_SURVIVOR': {
                resultClass: 'lucky-survivor',
                emoji: '🍀✨',
                resultEmoji1: '🍀',
                resultEmoji2: '✨',
                resultType: 'UNTOUCHED'
            },
            'NORMAL_SHIT': {
                resultClass: 'normal-shit',
                emoji: '💩📸',
                resultEmoji1: '💩',
                resultEmoji2: '📸',
                resultType: 'DESTROYED'
            },
            'EXTREME_NUCLEAR': {
                resultClass: 'extreme-nuclear',
                emoji: '💀🔥',
                resultEmoji1: '💀',
                resultEmoji2: '🔥',
                resultType: 'OBLITERATED'
            }
        }
        
        const style = resultStyles[gamblingResult.gamblingResult] || resultStyles['NORMAL_SHIT']
        
        // Prepare URL data for metadata
        const baseUrl = `${req.protocol}://${req.get('host')}`
        const currentUrl = `${baseUrl}/result/${imageId}`
        
        // Show results page
        res.send(renderTemplate('result', {
            imageId: imageId,
            resultMessage: gamblingResult.resultMessage,
            rollPercentage: gamblingResult.rollPercentage,
            gamblingResult: gamblingResult.gamblingResult.replace('_', ' '),
            baseUrl,
            currentUrl,
            color: style.resultClass === 'lucky-survivor' ? '#4caf50' : 
                   style.resultClass === 'normal-shit' ? '#ff9800' : '#f44336',
            ...style
        }))
        
    } catch (error) {
        console.error('💀 Upload error:', error)
        res.status(500).send(`Casino machine broke! Error: ${error.message}`)
    }
})

export default router
