const { supabase } = require('../../utils/db.js');
const { authenticateAdmin } = require('../../middleware/adminCheck.js');
const express = require('express');
const adminDeleteRouter = express.Router();

// Helper function to delay execution
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Batch delete helper function
async function batchDelete(postIds, batchSize = 10) {
  const batches = [];
  for (let i = 0; i < postIds.length; i += batchSize) {
    batches.push(postIds.slice(i, i + batchSize));
  }

  let deletedCount = 0;
  for (const batch of batches) {
    try {
      const { error } = await supabase
        .from('images')
        .delete()
        .in('id', batch);
      
      if (error) {
        console.error(`Error deleting batch: ${error.message}`);
        continue; // Continue with next batch even if this one failed
      }
      
      deletedCount += batch.length;
      
      // Add a small delay between batches to prevent overloading
      await delay(500);
    } catch (error) {
      console.error(`Failed to delete batch: ${error.message}`);
      // Continue with next batch even if this one failed
    }
  }
  return deletedCount;
}

adminDeleteRouter.post('/admin/delete/:id', authenticateAdmin, async (req, res) => {
  const { error } = await supabase
    .from('images')
    .delete()
    .eq('id', req.params.id);
  
  if (error) {
    return res.status(500).render('admin/error', {
      title: 'Error Deleting Image',
      message: `Error deleting image: ${error.message}`,
      backUrl: '/admin'
    });
  } else {
    res.redirect('/admin');
  }
});

// Delete image by ID (from form input)
adminDeleteRouter.post('/admin/delete-by-id', authenticateAdmin, async (req, res) => {
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
    const { data, error: checkError } = await supabase
      .from('images')
      .select('id')
      .eq('id', imageId)
      .single();
    
    if (checkError || !data) {
      return res.status(404).render('admin/error', {
        title: 'Image Not Found',
        message: `The image with ID <strong>${imageId}</strong> was not found in the database. Please check the ID and try again.`,
        backUrl: '/admin',
        icon: '❌'
      });
    }
    
    // Delete the image
    const { error: deleteError } = await supabase
      .from('images')
      .delete()
      .eq('id', imageId);
    
    if (deleteError) {
      throw new Error(deleteError.message);
    }
    
    // Redirect back to admin panel with success message
    res.redirect('/admin?deleted=success');
    
  } catch (error) {
    console.error('Error deleting image by ID:', error);
    res.status(500).render('admin/error', {
      title: 'Delete Failed',
      message: `Failed to delete image with ID <strong>${imageId}</strong>. Error: ${error.message}`,
      backUrl: '/admin',
      icon: '❌'
    });
  }
});

// Delete all images by IP from image ID (convenience function)
adminDeleteRouter.post('/admin/delete-all-by-image-ip/:imageId', authenticateAdmin, async (req, res) => {
  const { imageId } = req.params;
  
  try {
    // Get the IP hash for this image
    const { data: postIP, error: getIPError } = await supabase
      .from('post_ips')
      .select('ip_hash')
      .eq('post_id', imageId)
      .single();
      
    if (getIPError || !postIP) {
      return res.status(404).render('admin/error', {
        title: 'IP Not Found',
        message: `No IP address was found for the image with ID <strong>${imageId}</strong>. This image may not have IP tracking information.`,
        backUrl: '/admin',
        icon: '❌'
      });
    }
    
    // Get all post IDs for this IP
    const { data: postIPs, error: getPostsError } = await supabase
      .from('post_ips')
      .select('post_id')
      .eq('ip_hash', postIP.ip_hash);
    
    if (getPostsError) {
      throw new Error(getPostsError.message);
    }
    
    if (!postIPs || postIPs.length === 0) {
      return res.status(404).render('admin/error', {
        title: 'No Images Found',
        message: `No images were found for this IP address.`,
        backUrl: '/admin',
        icon: '❌'
      });
    }
    
    const postIds = postIPs.map(p => p.post_id);
    
    // Delete all images with these IDs in batches
    const deletedCount = await batchDelete(postIds);
    
    // Try to ban the IP if not already banned (ignore if already exists)
    try {
      await supabase
        .from('banned_ips')
        .insert([{ ip_hash: postIP.ip_hash }]);
    } catch (banError) {
      // Ignore unique constraint violations (IP already banned)
      if (banError.code !== '23505') {
        console.warn('Failed to ban IP (non-critical):', banError.message);
      }
    }
    
    // Redirect back with success message
    res.redirect(`/admin?bulk_deleted=${deletedCount}&banned=success`);
    
  } catch (error) {
    console.error('Error deleting all images by image IP:', error);
    res.status(500).render('admin/error', {
      title: 'Bulk Delete Failed',
      message: `Failed to delete all images from the same IP as image <strong>${imageId}</strong>. Error: ${error.message}`,
      backUrl: '/admin',
      icon: '❌'
    });
  }
});

// Bulk delete all images by IP from form input (can accept image ID or IP hash)
adminDeleteRouter.post('/admin/delete-all-by-ip-input', authenticateAdmin, async (req, res) => {
  const { ipHash: input } = req.body;
  
  if (!input || input.trim().length === 0) {
    return res.status(400).render('admin/error', {
      title: 'Missing Input',
      message: 'Image ID or IP hash is required. Please enter a valid image ID or IP hash.',
      backUrl: '/admin',
      icon: '❌'
    });
  }
  
  const cleanInput = input.trim();
  let actualIpHash = null;
  
  try {
    // First, try to determine if input is an image ID or IP hash
    // If it looks like a UUID (contains hyphens), treat as image ID
    // Otherwise, treat as IP hash
    
    if (cleanInput.includes('-') && cleanInput.length >= 32) {
      // Looks like a UUID - treat as image ID
      console.log('Treating input as image ID:', cleanInput);
      
      // Look up the image to get its IP hash
      const { data: imageData, error: imageError } = await supabase
        .from('images')
        .select(`
          id,
          post_ips(ip_hash)
        `)
        .eq('id', cleanInput)
        .single();
      
      if (imageError) {
        throw new Error(`Failed to find image: ${imageError.message}`);
      }
      
      if (!imageData || !imageData.post_ips || imageData.post_ips.length === 0) {
        return res.status(404).render('admin/error', {
          title: 'No IP Found',
          message: `No IP hash found for image ID <strong>${cleanInput}</strong>. The image may not exist or may not have IP data.`,
          backUrl: '/admin',
          icon: '❌'
        });
      }
      
      actualIpHash = imageData.post_ips[0].ip_hash;
      console.log('Found IP hash for image:', actualIpHash);
      
    } else {
      // Treat as IP hash directly
      console.log('Treating input as IP hash:', cleanInput);
      actualIpHash = cleanInput;
    }
    
    // Now proceed with the IP hash we found
    // Get all post IDs for this IP
    const { data: postIPs, error: getPostsError } = await supabase
      .from('post_ips')
      .select('post_id')
      .eq('ip_hash', actualIpHash);
    
    if (getPostsError) {
      throw new Error(getPostsError.message);
    }
    
    if (!postIPs || postIPs.length === 0) {
      return res.status(404).render('admin/error', {
        title: 'No Images Found',
        message: `No images were found for the IP hash <strong>${actualIpHash.substring(0, 8)}...</strong>. Please verify the input is correct.`,
        backUrl: '/admin',
        icon: '❌'
      });
    }
    
    const postIds = postIPs.map(p => p.post_id);
    
    // Delete all images with these IDs in batches
    const deletedCount = await batchDelete(postIds);
    
    // Try to ban the IP if not already banned (ignore if already exists)
    try {
      await supabase
        .from('banned_ips')
        .insert([{ ip_hash: actualIpHash }]);
    } catch (banError) {
      // Ignore unique constraint violations (IP already banned)
      if (banError.code !== '23505') {
        console.warn('Failed to ban IP (non-critical):', banError.message);
      }
    }
    
    // Redirect back with success message
    res.redirect(`/admin?bulk_deleted=${deletedCount}&banned=success&ip_hash=${actualIpHash.substring(0, 8)}`);
    
  } catch (error) {
    console.error('Error bulk deleting images by IP input:', error);
    res.status(500).render('admin/error', {
      title: 'Bulk Delete Failed',
      message: `Failed to delete all images for input <strong>${cleanInput}</strong>. Error: ${error.message}`,
      backUrl: '/admin',
      icon: '❌'
    });
  }
});

// Delete all images by IP hash  
adminDeleteRouter.post('/admin/delete-all-by-ip/:ipHash', authenticateAdmin, async (req, res) => {
  const { ipHash } = req.params;
  
  if (!ipHash) {
    return res.status(400).render('admin/error', {
      title: 'Missing IP Hash',
      message: 'IP hash is required',
      backUrl: '/admin/banned-ips'
    });
  }
  
  try {
    // First, get all post IDs for this IP
    const { data: postIPs, error: getPostsError } = await supabase
      .from('post_ips')
      .select('post_id')
      .eq('ip_hash', ipHash);
    
    if (getPostsError) {
      throw new Error(getPostsError.message);
    }
    
    if (!postIPs || postIPs.length === 0) {
      return res.status(404).render('admin/error', {
        title: 'No Images Found',
        message: `No images were found for the IP hash <strong>${ipHash.substring(0, 8)}...</strong>`,
        backUrl: '/admin/banned-ips',
        icon: '❌'
      });
    }
    
    const postIds = postIPs.map(p => p.post_id);
    
    // Delete all images with these IDs in batches
    const deletedCount = await batchDelete(postIds);
    
    // Redirect back with success message
    res.redirect(`/admin/banned-ips?deleted_count=${deletedCount}&deleted_ip=${ipHash.substring(0, 8)}`);
    
  } catch (error) {
    console.error('Error deleting all images by IP:', error);
    res.status(500).render('admin/error', {
      title: 'Bulk Delete Failed',
      message: `Failed to delete all images for IP hash <strong>${ipHash.substring(0, 8)}...</strong>. Error: ${error.message}`,
      backUrl: '/admin/banned-ips',
      icon: '❌'
    });
  }
});

module.exports = adminDeleteRouter;