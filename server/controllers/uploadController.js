import cloudinary from '../config/cloudinary.js';
import fs from 'fs';
import path from 'path';

/**
 * @desc    Upload media / image file (Cloudinary or local static fallback)
 * @route   POST /api/upload/image
 * @access  Private
 */
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file was provided for upload.',
      });
    }

    const filePath = req.file.path;
    const isCloudinaryConfigured =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_CLOUD_NAME !== 'demo_cloud' &&
      process.env.CLOUDINARY_API_KEY !== 'demo_key';

    if (isCloudinaryConfigured) {
      // 1. Upload to Cloudinary
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'pulsechat/media',
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      });

      // Clean up local temp file after cloud upload
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return res.status(200).json({
        success: true,
        message: 'Image uploaded to Cloudinary successfully.',
        url: result.secure_url,
        publicId: result.public_id,
      });
    } else {
      // 2. Hybrid Local Static Fallback
      // Construct accessible server URL for the uploaded file
      const serverUrl = `${req.protocol}://${req.get('host')}`;
      const localFileUrl = `${serverUrl}/uploads/${path.basename(filePath)}`;

      return res.status(200).json({
        success: true,
        message: 'Image uploaded locally to server storage.',
        url: localFileUrl,
        filename: path.basename(filePath),
      });
    }
  } catch (error) {
    console.error('Upload Error:', error);

    // Clean up temporary local file if error occurred
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload image: ' + error.message,
    });
  }
};
