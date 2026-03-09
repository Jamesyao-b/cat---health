import express from 'express';
import multer from 'multer';
import { parseFile } from '../services/fileParser.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.post('/resume', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const content = await parseFile(req.file);
    res.json({ content, filename: req.file.originalname });
  } catch (error) {
    console.error('Resume parse error:', error);
    res.status(500).json({ error: 'Failed to parse resume' });
  }
});

router.post('/jd', upload.single('file'), async (req, res) => {
  try {
    if (!req.file && !req.body.text) {
      return res.status(400).json({ error: 'No file or text provided' });
    }
    
    let content = '';
    if (req.file) {
      content = await parseFile(req.file);
    } else {
      content = req.body.text;
    }
    res.json({ content });
  } catch (error) {
    console.error('JD parse error:', error);
    res.status(500).json({ error: 'Failed to parse JD' });
  }
});

export default router;
