const express = require('express');
const sharexConfigRouter = express.Router();

// ShareX Config download
sharexConfigRouter.get('/sharexconfig', (req, res) => {
  const protocol = req.protocol;
  const host = req.get('host');
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
    "ResponseType": "RedirectionURL",
    "URL": "{responseurl}"
  };
  
  res.setHeader('Content-Disposition', 'attachment; filename="pissandshitimages.sxcu"');
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(config, null, 2));
});

module.exports = sharexConfigRouter;