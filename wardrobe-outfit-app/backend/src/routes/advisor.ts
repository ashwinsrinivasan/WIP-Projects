import { Router, Request, Response } from 'express';
import { recommendOutfits, WardrobeItem } from '../services/claude';

const router = Router();

// POST /api/advisor/recommend
// Body: { wardrobe: WardrobeItem[], occasion: string, context?: string }
// Returns outfit recommendations from Claude
router.post('/recommend', async (req: Request, res: Response) => {
  try {
    const { wardrobe, occasion, context } = req.body;

    if (!occasion || typeof occasion !== 'string' || occasion.trim().length === 0) {
      res.status(400).json({ error: 'occasion is required' });
      return;
    }

    if (!Array.isArray(wardrobe)) {
      res.status(400).json({ error: 'wardrobe must be an array' });
      return;
    }

    const recommendation = await recommendOutfits(
      wardrobe as WardrobeItem[],
      occasion.trim(),
      context,
    );

    res.json({ success: true, recommendation });
  } catch (err) {
    console.error('Error generating outfit recommendation:', err);
    res.status(500).json({ error: 'Failed to generate outfit recommendation' });
  }
});

export default router;
