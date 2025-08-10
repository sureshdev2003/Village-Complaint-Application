import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import { promises as fs } from 'fs';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = join(__dirname, '..', 'uploads');

// Initialize uploads directory
async function initUploadsDir() {
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }
}

// Initialize on module load
initUploadsDir().catch(console.error);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = extname(file.originalname);
    cb(null, `complaint-${uniqueSuffix}${ext}`);
  }
});

// File filter for allowed file types
const fileFilter = (req, file, cb) => {
  // Allow images and documents
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and documents are allowed.'), false);
  }
};

// Configure multer with size limits
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 5 // Maximum 5 files per request
  }
});

// Upload single file
router.post('/single', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl,
        uploadedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during file upload'
    });
  }
});

// Upload multiple files
router.post('/multiple', upload.array('files', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`
    }));

    res.json({
      success: true,
      message: `${req.files.length} file(s) uploaded successfully`,
      data: {
        files: uploadedFiles,
        count: req.files.length,
        uploadedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Multiple file upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during file upload'
    });
  }
});

// Delete file
router.delete('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Validate filename to prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename'
      });
    }

    const filePath = join(uploadsDir, filename);

    try {
      await fs.access(filePath);
      await fs.unlink(filePath);

      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during file deletion'
    });
  }
});

// Get file info
router.get('/info/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Validate filename
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename'
      });
    }

    const filePath = join(uploadsDir, filename);

    try {
      const stats = await fs.stat(filePath);
      
      res.json({
        success: true,
        data: {
          filename: filename,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          url: `/uploads/${filename}`
        }
      });
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('File info error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// List all uploaded files (admin only - would need auth middleware in real app)
router.get('/list', async (req, res) => {
  try {
    const files = await fs.readdir(uploadsDir);
    
    const fileInfos = await Promise.all(
      files.map(async (filename) => {
        try {
          const filePath = join(uploadsDir, filename);
          const stats = await fs.stat(filePath);
          
          return {
            filename: filename,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            url: `/uploads/${filename}`
          };
        } catch (error) {
          return null;
        }
      })
    );

    // Filter out null values (files that couldn't be read)
    const validFiles = fileInfos.filter(file => file !== null);

    res.json({
      success: true,
      data: {
        files: validFiles,
        count: validFiles.length
      }
    });
  } catch (error) {
    console.error('File list error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 5 files allowed.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.'
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  res.status(500).json({
    success: false,
    message: 'File upload error'
  });
});

export default router; 