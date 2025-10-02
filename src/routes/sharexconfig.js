const express = require('express');
const sharexConfigRouter = express.Router();
const { isAuthenticated } = require('../middleware/discordAuth.js');

// ShareX Config download - requires authentication
sharexConfigRouter.get('/sharexconfig', isAuthenticated, (req, res) => {
  // Get the session cookie value
  const sessionCookie = req.cookies['piss.sid'];
  
  if (!sessionCookie) {
    return res.status(401).send('No session cookie found. Please log in first.');
  }

  const config = {
    "Version": "14.1.0",
    "Name": "pissandshitimages",
    "DestinationType": "ImageUploader",
    "RequestMethod": "POST",
    "RequestURL": `https://${req.get('host')}/upload`,
    "Body": "MultipartFormData",
    "FileFormName": "image",
    "Arguments": {
      "hide": "on"
    },
    "Headers": {
      "Cookie": `piss.sid=${sessionCookie}`
    },
    "ResponseType": "RedirectionURL",
    "URL": "{responseurl}"
  };
  
  res.setHeader('Content-Disposition', 'attachment; filename="pissandshitimages.sxcu"');
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(config, null, 2));
});

module.exports = sharexConfigRouter;