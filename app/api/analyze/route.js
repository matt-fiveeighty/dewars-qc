// app/api/analyze/route.js
// Server-side API route - keeps your API key secure

export async function POST(request) {
  try {
    const { image, width, height, format, visualType, reanalyzeRegion } = await request.json();

    if (!image) {
      return Response.json({ error: 'No image provided' }, { status: 400 });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const mediaType = image.match(/^data:(image\/\w+);/)?.[1] || 'image/jpeg';

    const uploadYear = new Date().getFullYear();
    const isLandscape = width > height;

    const BRAND_GUIDELINES_PROMPT = `You are a brand compliance QC analyst for Dewar's Scotch Whisky. Analyze this marketing creative image against official Brand Visual Identity (BVI) guidelines.

## IMAGE INFO
- Dimensions: ${width}x${height}px
- Format: ${format} (${isLandscape ? 'LANDSCAPE' : 'PORTRAIT'})
- Visual type: ${visualType === 'withSmile' ? 'WITH smile device' : 'WITHOUT smile device'}

## BRAND COLORS (Official BBI Palette)
- Whiskey Brown: #AD3826
- Warm White: #FFF9F4
- Blue Black: #101921

## CRITICAL: LAYOUT LOGO vs BOTTLE LOGO
There are TWO Dewar's logos in most creatives:
1. BOTTLE LOGO - printed on the physical bottle product (IGNORE THIS)
2. LAYOUT LOGO - the standalone Dewar's wordmark/lockup placed in the ad layout (ANALYZE THIS)

The LAYOUT LOGO is typically:
- ${isLandscape ? 'In the RIGHT 50% of the image for landscape layouts' : 'In the BOTTOM 50% of the image for portrait layouts'}
- Larger and more prominent than the bottle label
- Often accompanied by "ESTD 1846" or tagline
- NOT on the bottle itself

## REQUIREMENTS TO CHECK:
1. PRODUCT: New bottle design (post-2023), no Royal Warrant, bottle scale 50-55% (portrait) or 50-90% (landscape), shadow present and grounded
2. LEGAL: ABV displayed (40%), "ENJOY RESPONSIBLY" disclaimer, copyright year ${uploadYear}, legal text readable (~6pt), sufficient contrast
3. TYPOGRAPHY: TT Fors for headlines (Bold) and subheads (Medium), Futura PT Book for body/legal
4. LAYOUT: 
   - Safe zone: ≥5% padding from all edges to nearest element
   - LAYOUT LOGO position: Should be in ${isLandscape ? 'right 50%' : 'bottom 50%'} of canvas
   - LAYOUT LOGO size: Measure the standalone logo (NOT bottle label), must be ≥150px wide
   - LAYOUT LOGO bounding box: Provide x, y, width, height as percentages of canvas
5. LIGHTING: Warm white (2700-4000K), no cool/blue cast, photorealistic (no AI artifacts)
6. SMILE DEVICE (if present): 3:4 bottle ratio, min 150px, no distortion, not filled, not cropped

Return ONLY valid JSON (no markdown, no code blocks) with this structure:
{
  "productPackaging": {
    "newBottle": { "detected": true/false, "confidence": 0-100, "notes": "string" },
    "noWarrant": { "detected": true/false, "confidence": 0-100, "notes": "string" },
    "bottleScale": { "percentage": number, "status": "pass"/"fail", "notes": "string" },
    "shadowPresent": { "detected": true/false, "grounded": true/false, "notes": "string" }
  },
  "legalCompliance": {
    "abvPresent": { "detected": true/false, "value": "40%" or null, "notes": "string" },
    "disclaimerPresent": { "detected": true/false, "fullText": true/false, "notes": "string" },
    "copyrightYear": { "detected": "${uploadYear}" or null, "correct": true/false, "notes": "string" },
    "legalContrast": { "sufficient": true/false, "notes": "string" }
  },
  "typography": {
    "headlineFont": { "detected": "font name" or null, "confidence": 0-100, "isTTFors": true/false, "notes": "string" },
    "bodyFont": { "detected": "font name" or null, "confidence": 0-100, "isFuturaPT": true/false, "notes": "string" },
    "alignmentConsistent": { "detected": "CENTER"/"LEFT"/"RIGHT", "consistent": true/false, "notes": "string" }
  },
  "layout": {
    "safeZone": { 
      "top": number, 
      "right": number, 
      "bottom": number, 
      "left": number, 
      "allPass": true/false, 
      "nearestElement": "description of element closest to edge",
      "notes": "string" 
    },
    "layoutLogo": {
      "found": true/false,
      "boundingBox": { "x": number, "y": number, "width": number, "height": number },
      "estimatedWidthPx": number,
      "meetsMinSize": true/false,
      "inCorrectZone": true/false,
      "zoneDescription": "${isLandscape ? 'right 50%' : 'bottom 50%'}",
      "notes": "string"
    },
    "logoUnmodified": { "detected": true/false, "notes": "string" }
  },
  "lightingColor": {
    "warmWhiteLighting": { "detected": true/false, "estimatedKelvin": number or null, "notes": "string" },
    "noCoolCast": { "detected": true/false, "notes": "string" },
    "photorealistic": { "detected": true/false, "aiArtifacts": true/false, "notes": "string" },
    "brandColorAccuracy": { 
      "colors": [
        { "name": "Whiskey Brown", "detected": "#hex" or null, "reference": "#AD3826", "passes": true/false },
        { "name": "Warm White", "detected": "#hex" or null, "reference": "#FFF9F4", "passes": true/false }
      ],
      "notes": "string"
    }
  },
  "smileDevice": {
    "present": true/false,
    "ratio": { "correct": true/false, "notes": "string" },
    "noDistortion": { "detected": true/false, "notes": "string" },
    "notCropped": { "detected": true/false, "notes": "string" }
  },
  "criticalIssues": ["list of major problems found"],
  "recommendations": ["list of suggestions for improvement"]
}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [{
          role: "user",
          content: [
            { 
              type: "image", 
              source: { 
                type: "base64", 
                media_type: mediaType, 
                data: base64Data 
              } 
            },
            { 
              type: "text", 
              text: `Image: ${width}x${height}px (${format})\nVisual type: ${visualType === 'withSmile' ? 'WITH smile device' : 'WITHOUT smile device'}\n\n${BRAND_GUIDELINES_PROMPT}` 
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Claude API error:', errorData);
      return Response.json({ 
        error: errorData.error?.message || `API error: ${response.status}` 
      }, { status: response.status });
    }

    const data = await response.json();
    const responseText = data.content[0]?.text || '';

    // Parse JSON from response
    let analysis;
    try {
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : responseText.trim();
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      return Response.json({ 
        error: 'Failed to parse AI analysis',
        rawResponse: responseText.substring(0, 500)
      }, { status: 500 });
    }

    return Response.json({ 
      success: true, 
      analysis,
      usage: data.usage 
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return Response.json({ 
      error: error.message || 'Analysis failed' 
    }, { status: 500 });
  }
}
