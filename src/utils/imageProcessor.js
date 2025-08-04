import sharp from 'sharp'

// GAMBLING SHITIFICATION FUNCTION - ROLL THE DICE ON YOUR IMAGE QUALITY!
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

// Function to absolutely destroy image quality (ULTRA)
async function shitifyImageUltra(buffer, mimetype) {
    try {
        console.log(`Processing image: ${mimetype}, size: ${buffer.length} bytes`)
        
        // Convert to JPEG with terrible quality and resize to make it even worse
        const shittyBuffer = await sharp(buffer)
            .resize(400, 300, { 
                fit: 'inside', 
                withoutEnlargement: false,
                background: { r: 255, g: 255, b: 255, alpha: 1 } // white background for transparency
            })
            .blur(1.5)
            .median(3) // Reduce colors to make it look like a 90s GIF
            .jpeg({ 
                quality: 3, // LOWEST POSSIBLE QUALITY
                progressive: false,
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

// EXTREME NUCLEAR DESTRUCTION ALGORITHM
async function shitifyImageExtreme(buffer, mimetype) {
    try {
        console.log(`Nuclear processing: ${mimetype}, size: ${buffer.length} bytes`)
        
        let victim = buffer
        
        // TRIPLE-PASS DESTRUCTION PROTOCOL
        for (let destructionCycle = 0; destructionCycle < 3; destructionCycle++) {
            console.log(`💀 Destruction Cycle ${destructionCycle + 1}: Commencing digital genocide...`)
            
            victim = await sharp(victim)
                // Progressive size decimation
                .resize(
                    Math.max(50, 300 - (destructionCycle * 50)),
                    Math.max(50, 225 - (destructionCycle * 37)),
                    { 
                        fit: 'inside',
                        kernel: 'nearest'     // Pixelated nightmare scaling
                    }
                )
                // Escalating blur torture
                .blur(0.5 + (destructionCycle * 0.3))
                // Color and brightness psychological warfare
                .modulate({
                    brightness: 0.9 - (destructionCycle * 0.1),  // Descending into darkness
                    saturation: 1.2 + (destructionCycle * 0.2),  // Hyper-reality saturation
                    hue: destructionCycle * 5                    // Reality drift
                })
                // Over-sharpening to create digital artifacts
                .sharpen({ sigma: 1, m1: 0.5, m2: 0.2 })
                // Progressive quality annihilation
                .jpeg({ 
                    quality: Math.max(1, 5 - destructionCycle),  // 5→4→3→2→1 (The countdown to oblivion)
                    progressive: false
                })
                .toBuffer()
                
            console.log(`💀 Cycle ${destructionCycle + 1} complete. Victim size: ${victim.length} bytes`)
        }
        
        console.log('💀 NUCLEAR OBLITERATION COMPLETE. IMAGE SOUL SUCCESSFULLY EXTRACTED.')
        return {
            buffer: victim,
            mimetype: 'image/jpeg'
        }
    } catch (error) {
        console.error('Nuclear processing failed:', error)
        // Fall back to ultra shittification
        return await shitifyImageUltra(buffer, mimetype)
    }
}

export {
    gamblingShitifyImage,
    shitifyImageUltra,
    shitifyImageExtreme
}
