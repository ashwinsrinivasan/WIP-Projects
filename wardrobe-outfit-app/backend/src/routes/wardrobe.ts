import { Router, Request, Response } from 'express';
import { analyzeClothing } from '../services/claude';

const router = Router();

// POST /api/wardrobe/analyze
// Body: { imageBase64: string, mediaType: string }
// Returns clothing analysis from Claude Vision
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mediaType } = req.body;

    if (!imageBase64 || !mediaType) {
      res.status(400).json({ error: 'imageBase64 and mediaType are required' });
      return;
    }

    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!supportedTypes.includes(mediaType)) {
      res.status(400).json({ error: `Unsupported media type. Use: ${supportedTypes.join(', ')}` });
      return;
    }

    const analysis = await analyzeClothing(imageBase64, mediaType);
    res.json({ success: true, analysis });
  } catch (err) {
    console.error('Error analyzing clothing:', err);
    res.status(500).json({ error: 'Failed to analyze clothing item' });
  }
});

export default router;
