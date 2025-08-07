const sharp = require('sharp');
const { supabase } = require('./db.js');

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

module.exports = {
    getImageStats,
    gamblingShitifyImage
}