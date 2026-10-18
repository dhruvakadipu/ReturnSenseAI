import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '20mb' }));

// Server-side Gemini initialization
// user-agent header is required by AI Studio guidelines
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!apiKey,
    model: 'gemini-2.5-flash',
  });
});

// Endpoint: Multilingual Batch Extraction
app.post('/api/analyze-batch', async (req, res) => {
  try {
    const { records, productContext } = req.body;
    if (!records || !Array.isArray(records)) {
      return res.status(400).json({ error: 'records array is required' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please toggle "Use cached demo results" for instant demonstration.',
      });
    }

    const prompt = `You are ReturnSense AI, an expert retail returns intelligence engine for Indian fashion e-commerce.
Analyze the following customer feedback records for product "${productContext?.name || 'Fashion Product'}" (${productContext?.category || 'Ethnic Wear'}).
The customer feedback contains text in English, Hindi (Devanagari), Gujarati script, Hinglish (Roman Hindi), and Roman-script Gujarati.

Product details:
${productContext?.listing_description || ''}

Records to analyze:
${JSON.stringify(
  records.map((r: any) => ({
    id: r.id,
    source: r.source,
    text: r.text,
    rating: r.rating,
    return_reason_code: r.return_reason_code,
  })),
  null,
  2
)}

For each record, extract:
1. language: Identify the true language/script ('English', 'Hindi', 'Gujarati', 'Hinglish', 'Roman Gujarati')
2. issue_category: One of ['sizing', 'colour/photo mismatch', 'fabric/description mismatch', 'defect/quality', 'delivery damage', 'wrong item', 'non-product']
   (Note: non-product includes COD refusal, customer unavailable, change of mind, delayed courier)
3. sub_issue: Concise summary of the specific issue
4. severity: 1 to 5 (1 = minor feedback, 5 = severe flaw / anger / return driver)
5. is_product_caused: boolean (true if issue is due to product, sizing, photo, fabric, or defect; false if COD refusal, delivery boy issue, or change of mind)
6. english_gloss: Clear, faithful English translation/explanation preserving seller context
7. key_phrase: The exact key phrase in the customer text indicating the problem

Return JSON array adhering strictly to schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              record_id: { type: Type.STRING },
              language: { type: Type.STRING },
              issue_category: { type: Type.STRING },
              sub_issue: { type: Type.STRING },
              severity: { type: Type.INTEGER },
              is_product_caused: { type: Type.BOOLEAN },
              english_gloss: { type: Type.STRING },
              key_phrase: { type: Type.STRING },
            },
            required: [
              'record_id',
              'language',
              'issue_category',
              'sub_issue',
              'severity',
              'is_product_caused',
              'english_gloss',
              'key_phrase',
            ],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    res.json({ results: parsed });
  } catch (error: any) {
    console.error('Batch analysis error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to analyze feedback batch with Gemini',
    });
  }
});

// Endpoint: Cluster Root Causes
app.post('/api/cluster-root-causes', async (req, res) => {
  try {
    const { productId, productName, productDescription, extractedItems, validRecordIds } = req.body;

    if (!extractedItems || !Array.isArray(extractedItems)) {
      return res.status(400).json({ error: 'extractedItems array required' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please toggle "Use cached demo results".',
      });
    }

    const prompt = `You are ReturnSense AI. Given extracted feedback items for product "${productName}" (${productId}):
Description: ${productDescription}

Items:
${JSON.stringify(extractedItems, null, 2)}

Task:
Cluster these feedback items into distinct, high-impact root causes.
Rules:
1. Every root cause MUST be supported by specific record IDs from the input items.
2. ONLY include record IDs that actually exist in the input items.
3. Group identical complaints expressed in different languages (e.g. Hindi "चेस्ट में बहुत टाइट", Gujarati "છાતીમાં ટાઈટ પડે છે", Hinglish "chest tight hai", English "runs tight at chest") into the SAME root cause.
4. Classify non-product issues (e.g. COD refusal, doorstep cancellation) into a dedicated non-product root cause.
5. Provide a crisp title, category ('sizing', 'colour/photo mismatch', 'fabric/description mismatch', 'defect/quality', 'delivery damage', 'wrong item', 'non-product'), summary, and an array of record_ids.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              category: { type: Type.STRING },
              summary: { type: Type.STRING },
              record_ids: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['title', 'category', 'summary', 'record_ids'],
          },
        },
      },
    });

    const clusters = JSON.parse(response.text || '[]');
    const validIdSet = new Set(validRecordIds || extractedItems.map((i: any) => i.record_id));

    // Strict validation: discard findings without evidence or with zero valid IDs
    const validatedClusters = clusters
      .map((c: any) => ({
        ...c,
        record_ids: (c.record_ids || []).filter((id: string) => validIdSet.has(id)),
      }))
      .filter((c: any) => c.record_ids.length > 0);

    res.json({ clusters: validatedClusters });
  } catch (error: any) {
    console.error('Clustering error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to cluster root causes with Gemini',
    });
  }
});

// Endpoint: Generate Fixes grounded in evidence and product data
app.post('/api/generate-fixes', async (req, res) => {
  try {
    const { product, rootCause, evidenceQuotes } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please toggle "Use cached demo results".',
      });
    }

    const prompt = `You are ReturnSense AI, an Indian retail returns prevention consultant.
Generate an actionable, concrete seller fix for root cause:
Root Cause Title: "${rootCause.title}" (${rootCause.category})
Summary: "${rootCause.summary}"
Product: "${product.name}" (${product.category})
Current Price: ₹${product.price}
Current Description: "${product.listing_description}"
Current Size Chart: ${JSON.stringify(product.size_chart || {})}

Customer Evidence Quotes (from English, Hindi, Gujarati, Hinglish):
${JSON.stringify(evidenceQuotes || [], null, 2)}

STRICT RULES:
- Ground all recommendations ONLY on the provided evidence and product data.
- DO NOT invent facts or hallucinate non-existent garment features.
- If category is 'sizing': provide revised size chart table with corrected chest/shoulder measurements, fit note, and manufacturer ease allowance.
- If category is 'fabric/description mismatch': provide rewritten listing title, bullet points, and description in English, Hindi (हिन्दी), and Gujarati (ગુજરાતી) that accurately sets expectations.
- If category is 'colour/photo mismatch': provide concrete photo reshoot instructions (lighting kelvin, color correction, white balance, daylight comparison shot).
- If category is 'defect/quality': provide supplier QC checklist (inspection points, batch containment).
- Explain "why" this fix works with direct quotes from customer feedback.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fix_type: { type: Type.STRING },
            title: { type: Type.STRING },
            why: { type: Type.STRING },
            size_chart_table: {
              type: Type.OBJECT,
              properties: {
                headers: { type: Type.ARRAY, items: { type: Type.STRING } },
                rows: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      size: { type: Type.STRING },
                      bust: { type: Type.STRING },
                      waist: { type: Type.STRING },
                      shoulder: { type: Type.STRING },
                      length: { type: Type.STRING },
                    },
                  },
                },
                fit_guidance: { type: Type.STRING },
              },
            },
            rewritten_copy: {
              type: Type.OBJECT,
              properties: {
                english: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                    description: { type: Type.STRING },
                  },
                },
                hindi: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                    description: { type: Type.STRING },
                  },
                },
                gujarati: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                    description: { type: Type.STRING },
                  },
                },
              },
            },
            photo_instructions: {
              type: Type.OBJECT,
              properties: {
                lighting_spec: { type: Type.STRING },
                color_accuracy_tips: { type: Type.ARRAY, items: { type: Type.STRING } },
                required_angles: { type: Type.ARRAY, items: { type: Type.STRING } },
                customer_expectation_note: { type: Type.STRING },
              },
            },
            qc_checklist: {
              type: Type.OBJECT,
              properties: {
                critical_checkpoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                batch_containment_action: { type: Type.STRING },
                factory_audit_spec: { type: Type.STRING },
              },
            },
          },
          required: ['fix_type', 'title', 'why'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ fix: parsed });
  } catch (error: any) {
    console.error('Fix generation error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate fix with Gemini',
    });
  }
});

// Endpoint: Multimodal Image Comparison
app.post('/api/compare-images', async (req, res) => {
  try {
    const { listingImageBase64, customerImageBase64, listingMimeType = 'image/jpeg', customerMimeType = 'image/jpeg', productContext } = req.body;

    if (!listingImageBase64 || !customerImageBase64) {
      return res.status(400).json({ error: 'Both listingImageBase64 and customerImageBase64 are required' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please toggle "Use cached demo results".',
      });
    }

    const cleanListing = listingImageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
    const cleanCustomer = customerImageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

    const promptText = `You are ReturnSense AI, an expert retail returns inspector for Indian fashion marketplaces (Myntra, Flipkart, Ajio, Meesho).
Compare Image 1 (Official Seller Catalog Listing Photo) and Image 2 (Customer Return Photo taken in real-life home lighting).

Product Context:
${productContext ? JSON.stringify(productContext) : 'Ethnic wear garment'}

Evaluate with photographic precision:
1. Colour & Shade Shift:
   - Does the customer photo exhibit a significant hue, chroma, or luminance deviation?
   - Is studio over-saturation causing false buyer expectations?
2. Fabric Texture & Surface Sheen:
   - Does the catalog image look richer, silkier, or more woven than the customer photo?
   - Any evidence of fabric thinness or polyester sheen?
3. Fit, Silhouette & Workmanship:
   - Any noticeable gathering, tightness, or crooked seams?
4. Seller Verdict & Plain-Language Explanation:
   - Why did the buyer return this?
   - Practical steps for the seller to prevent future returns.

Format your response in JSON:
{
  "color_verdict": "Major mismatch | Minor variation | Match",
  "color_analysis": "Detailed explanation of color difference...",
  "texture_verdict": "Mismatch | Match | Acceptable variation",
  "texture_analysis": "Explanation of texture / fabric difference...",
  "workmanship_analysis": "Seam, border, or silhouette observations...",
  "plain_language_verdict": "Clear, direct takeaway for the online seller...",
  "recommended_action": "Exact photographic or listing adjustments to make...",
  "confidence_score": 92
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: listingMimeType, data: cleanListing } },
            { inlineData: { mimeType: customerMimeType, data: cleanCustomer } },
            { text: promptText },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ analysis: parsed });
  } catch (error: any) {
    console.error('Image comparison error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to compare images with Gemini',
    });
  }
});

// Vite middleware integration for full-stack dev and production static serve
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ReturnSense AI server listening on port ${PORT} (NODE_ENV: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer();
