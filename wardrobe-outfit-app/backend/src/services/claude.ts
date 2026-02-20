import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ClothingAnalysis {
  type: string;        // e.g. "shirt", "trousers", "jacket"
  category: string;    // e.g. "top", "bottom", "outerwear", "footwear", "accessory"
  color: string[];     // primary colors
  pattern: string;     // e.g. "solid", "striped", "plaid", "floral"
  style: string;       // e.g. "casual", "formal", "smart-casual", "athletic"
  material: string;    // e.g. "cotton", "denim", "wool", "polyester"
  season: string[];    // e.g. ["spring", "summer"] or ["fall", "winter"]
  description: string; // brief human-readable description
}

export interface WardrobeItem {
  id: string;
  imageBase64: string;
  analysis: ClothingAnalysis;
  addedAt: string;
}

export interface OutfitRecommendation {
  occasion: string;
  outfits: Array<{
    name: string;
    items: string[];  // item IDs
    description: string;
    tips: string;
  }>;
  generalAdvice: string;
}

/**
 * Analyzes a clothing photo using Claude's vision and returns structured metadata.
 */
export async function analyzeClothing(imageBase64: string, mediaType: string): Promise<ClothingAnalysis> {
  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    thinking: { type: 'adaptive' },
    system: `You are a men's fashion expert and stylist. Analyze clothing items from photos with precision.
Always respond with valid JSON matching the exact schema provided.`,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/webp',
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: `Analyze this clothing item and return ONLY a JSON object with this exact structure:
{
  "type": "specific clothing item name (e.g. crew-neck t-shirt, slim-fit chinos, oxford shirt)",
  "category": "one of: top | bottom | outerwear | footwear | accessory | suit | underwear",
  "color": ["primary color", "secondary color if present"],
  "pattern": "solid | striped | plaid | checked | floral | geometric | graphic | camo | other",
  "style": "casual | smart-casual | business | formal | athletic | streetwear",
  "material": "best guess at fabric (e.g. cotton, denim, wool, linen, polyester, leather)",
  "season": ["suitable seasons from: spring | summer | fall | winter"],
  "description": "one clear sentence describing this item for outfit planning"
}

Return ONLY the JSON object, no markdown, no extra text.`,
          },
        ],
      },
    ],
  });

  const response = await stream.getFinalMessage();

  // Extract text content (skip thinking blocks)
  const textBlock = response.content.find(b => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  try {
    const raw = textBlock.text.trim().replace(/^```json?\s*/i, '').replace(/```\s*$/i, '');
    return JSON.parse(raw) as ClothingAnalysis;
  } catch {
    throw new Error(`Failed to parse clothing analysis: ${textBlock.text}`);
  }
}

/**
 * Recommends outfit combinations for a given occasion from the user's wardrobe.
 */
export async function recommendOutfits(
  wardrobeItems: WardrobeItem[],
  occasion: string,
  additionalContext?: string,
): Promise<OutfitRecommendation> {
  if (wardrobeItems.length === 0) {
    return {
      occasion,
      outfits: [],
      generalAdvice: "Your wardrobe is empty. Start by adding some clothing items using the camera!",
    };
  }

  // Build a text summary of the wardrobe for Claude
  const wardrobeSummary = wardrobeItems
    .map((item, i) => {
      const a = item.analysis;
      return `Item ${i + 1} [ID: ${item.id}]: ${a.type} — ${a.color.join('/')} ${a.pattern !== 'solid' ? a.pattern : ''} ${a.material}, ${a.style} style, suitable for ${a.season.join('/')}.`;
    })
    .join('\n');

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 2048,
    thinking: { type: 'adaptive' },
    system: `You are a professional men's stylist with 20 years of experience.
You create practical, stylish outfit combinations from real wardrobe items.
Always respond with valid JSON matching the exact schema provided.`,
    messages: [
      {
        role: 'user',
        content: `Here is the user's wardrobe:

${wardrobeSummary}

Occasion: ${occasion}
${additionalContext ? `Additional context: ${additionalContext}` : ''}

Suggest up to 3 outfit combinations from the items above. Return ONLY a JSON object:
{
  "occasion": "${occasion}",
  "outfits": [
    {
      "name": "outfit name (e.g. 'Sharp Business Look')",
      "items": ["Item 1 ID", "Item 2 ID"],
      "description": "Why these items work together",
      "tips": "One practical styling tip (tucking, layering, accessories)"
    }
  ],
  "generalAdvice": "1-2 sentences of overall advice for this occasion"
}

Only reference items that exist in the wardrobe above. If the wardrobe lacks items for the occasion, say so honestly in generalAdvice.
Return ONLY the JSON, no markdown.`,
      },
    ],
  });

  const response = await stream.getFinalMessage();
  const textBlock = response.content.find(b => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  try {
    const raw = textBlock.text.trim().replace(/^```json?\s*/i, '').replace(/```\s*$/i, '');
    return JSON.parse(raw) as OutfitRecommendation;
  } catch {
    throw new Error(`Failed to parse outfit recommendation: ${textBlock.text}`);
  }
}
