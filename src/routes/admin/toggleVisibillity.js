const { supabase } = require('../../utils/db.js');
const { authenticateAdmin } = require('../../middleware/adminCheck.js');
const express = require('express');
const adminVisibillityRouter = express.Router();

// Toggle image visibility
adminVisibillityRouter.post('/admin/toggle-visibility/:id', authenticateAdmin, async (req, res) => {
  const { data: image, error: getError } = await supabase
    .from('images')
    .select('mimetype')
    .eq('id', req.params.id)
    .single();

  if (getError) {
    return res.status(500).render('admin/error', {
      title: 'Error Getting Image',
      message: `Error getting image: ${getError.message}`,
      backUrl: '/admin'
    });
  }

  const [baseMimetype, ...meta] = image.mimetype.split(';');
  const metaObj = Object.fromEntries(meta.map(s => s.split('=')));
  const currentlyHidden = metaObj.hidden === 'true';
  
  // Toggle the hidden state
  metaObj.hidden = (!currentlyHidden).toString();
  
  // Update or add the message
  if (!currentlyHidden) {
    metaObj.message = '🙈 THIS USER IS A COWARD WHO TRIED TO HIDE THEIR SHAME! 🙈';
  } else {
    delete metaObj.message;
  }

  // Reconstruct mimetype string
  const newMimetype = [baseMimetype, ...Object.entries(metaObj).map(([k, v]) => `${k}=${v}`)].join(';');

  const { error: updateError } = await supabase
    .from('images')
    .update({ mimetype: newMimetype })
    .eq('id', req.params.id);

  if (updateError) {
    return res.status(500).render('admin/error', {
      title: 'Error Updating Image',
      message: `Error updating image: ${updateError.message}`,
      backUrl: '/admin'
    });
  } else {
    res.redirect('/admin');
  }
});

// Toggle image visibility by ID (from form input)
adminVisibillityRouter.post('/admin/toggle-visibility-by-id', authenticateAdmin, async (req, res) => {
  const { imageId } = req.body;
  
  if (!imageId) {
    return res.status(400).render('admin/error', {
      title: 'Missing Image ID',
      message: 'Image ID is required',
      backUrl: '/admin'
    });
  }
  
  try {
    // Check if the image exists first
    const { data: image, error: getError } = await supabase
      .from('images')
      .select('mimetype')
      .eq('id', imageId)
      .single();
    
    if (getError || !image) {
      return res.status(404).render('admin/error', {
        title: 'Image Not Found',
        message: `The image with ID <strong>${imageId}</strong> was not found in the database. Please check the ID and try again.`,
        backUrl: '/admin',
        icon: '❌'
      });
    }
    
    // Parse the mimetype to get metadata
    const [baseMimetype, ...meta] = image.mimetype.split(';');
    const metaObj = Object.fromEntries(meta.map(s => s.split('=')));
    const currentlyHidden = metaObj.hidden === 'true';
    
    // Toggle the hidden state
    metaObj.hidden = (!currentlyHidden).toString();
    
    // Update or add the message
    if (!currentlyHidden) {
      metaObj.message = '🙈 THIS USER IS A COWARD WHO TRIED TO HIDE THEIR SHAME! 🙈';
    } else {
      delete metaObj.message;
    }

    // Reconstruct mimetype string
    const newMimetype = [baseMimetype, ...Object.entries(metaObj).map(([k, v]) => `${k}=${v}`)].join(';');

    // Update the image
    const { error: updateError } = await supabase
      .from('images')
      .update({ mimetype: newMimetype })
      .eq('id', imageId);
    
    if (updateError) {
      throw new Error(updateError.message);
    }
    
    // Redirect back to admin panel with success message
    res.redirect('/admin?visibility=success');
    
  } catch (error) {
    console.error('Error toggling image visibility by ID:', error);
    res.status(500).render('admin/error', {
      title: 'Visibility Toggle Failed',
      message: `Failed to toggle visibility for image with ID <strong>${imageId}</strong>. Error: ${error.message}`,
      backUrl: '/admin',
      icon: '❌'
    });
  }
});

module.exports = adminVisibillityRouter;