const express = require('express');
const uploadRouter = express.Router();
const multer = require('multer');
const upload = multer();
const { getHashedIP, checkBannedIP } = require('../middleware/ipCheck.js');
const { gamblingShitifyImage } = require('../utils/image.js');
const { supabase } = require('../db.js');

uploadRouter.post('/upload', checkBannedIP, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');
 
  const { buffer, mimetype } = req.file;
  
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
 
  // Track the IP that uploaded this image
  const ipHash = getHashedIP(req);
  const { error: ipError } = await supabase
    .from('post_ips')
    .insert([{
      post_id: data.id,
      ip_hash: ipHash
    }]);
   
  if (ipError) {
    console.error('Failed to track IP:', ipError);
    // Don't fail the upload if IP tracking fails
  }
 
  res.redirect(`/image/${data.id}`);
});

module.exports = uploadRouter;