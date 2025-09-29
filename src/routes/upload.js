const express = require('express');
const uploadRouter = express.Router();
const multer = require('multer');
const upload = multer();
const sharp = require('sharp');
const { getHashedIP, checkBannedIP } = require('../middleware/ipCheck.js');
const { uploadRateLimit, strictUploadRateLimit } = require('../middleware/rateLimit.js');
const { gamblingShitifyImage, bruhToPng } = require('../utils/image.js');
const { supabase } = require('../utils/db.js');
const { isAuthenticated, checkBannedDiscordUser } = require('../middleware/discordAuth.js');

uploadRouter.post('/upload', 
  // Apply rate limiting before other middleware
  (req, res, next) => {
    // Check for session cookie
    if (!req.cookies['connect.sid']) {
      return res.status(401).send('No session cookie found. Please enable cookies and login.');
    }
    next();
  },
  uploadRateLimit,
  strictUploadRateLimit,
  checkBannedIP,
  isAuthenticated,
  checkBannedDiscordUser, 
  upload.single('image'), 
  async (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');
   
    let { buffer, mimetype } = req.file;
   
    // Check if this is a .bruh file
    if (req.file.originalname && req.file.originalname.toLowerCase().endsWith('.bruh')) {
      try {
        // Convert .bruh to PNG
        buffer = await bruhToPng(buffer);
        mimetype = 'image/png';
        console.log('Converted .bruh file to PNG');
      } catch (error) {
        console.error('Failed to convert .bruh file:', error);
        return res.status(400).send('Invalid .bruh file format.');
      }
    }
   
    // Strip EXIF metadata by re-encoding in the same format
    let cleanBuffer;
    try {
      let processor = sharp(buffer);
     
      // Only process formats that can contain EXIF data
      if (mimetype === 'image/png') {
        processor = processor.png();
      } else if (mimetype === 'image/jpeg') {
        processor = processor.jpeg({ quality: 100 });
      } else if (mimetype === 'image/webp') {
        processor = processor.webp({ quality: 100 });
      } else if (mimetype === 'image/avif') {
        processor = processor.avif({ quality: 100 });
      } else {
        // SVG and other formats don't have EXIF, so leave buffer unchanged
        cleanBuffer = buffer;
      }
     
      if (cleanBuffer === undefined) {
        cleanBuffer = await processor.toBuffer();
      }
    } catch (error) {
      console.error('Failed to strip EXIF data:', error);
      // Fallback to original buffer if processing fails
      cleanBuffer = buffer;
    }
   
    const result = await gamblingShitifyImage(cleanBuffer, mimetype);
    const base64 = result.buffer.toString('base64');
    const now = new Date().toISOString();
    const isHidden = req.body.hide === 'on';
    const customMimetype = `${result.mimetype};shitlevel=${result.gamblingResult};roll=${result.rollPercentage};date=${now};hidden=${isHidden}${isHidden ? ';message=🙈 THIS USER IS A COWARD WHO TRIED TO HIDE THEIR SHAME! 🙈' : ''}`;
   
    // Insert the image
    const { data, error } = await supabase
      .from('images')
      .insert([{ data: base64, mimetype: customMimetype }])
      .select('id')
      .single();
     
    if (error) return res.status(500).send('DB error: ' + error.message);
   
    // Track the IP, country and Discord user that uploaded this image
    const ipHash = getHashedIP(req);
    const { error: ipError } = await supabase
      .from('post_ips')
      .insert([{
        post_id: data.id,
        ip_hash: ipHash,
        country: req.countryInfo.country,
        discord_user_id: req.user.id,
        discord_username: req.user.username,
        discord_discriminator: req.user.discriminator,
        discord_avatar: req.user.avatar
      }]);
     
    if (ipError) {
      console.error('Failed to track IP:', ipError);
      // Don't fail the upload if IP tracking fails
    }
   
    res.redirect(`/image/${data.id}`);
  }
);

module.exports = uploadRouter;