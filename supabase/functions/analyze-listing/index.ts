/**
 * Supabase Edge Function: analyze-listing
 * Proxies Claude API calls from the browser to avoid CORS
 * 
 * Deploy: supabase functions deploy analyze-listing
 * Set secret: supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxx
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    })
  }

  try {
    const { imageBase64, mediaType, title, categories } = await req.json()

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set')

    const titleContext = title
      ? `The seller has described this item as: "${title}". Use this to write a specific, accurate description.`
      : 'Identify the item from the photo and write a good listing description.'

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: imageBase64 },
            },
            {
              type: 'text',
              text: `You are an expert marketplace listing writer for Sell Like Crazy, an Australian marketplace.
${titleContext}

Return ONLY valid JSON — no markdown, no explanation:
{
  "title": "${title || 'concise listing title max 80 chars'}",
  "description": "2-3 sentences covering condition, key features, what is included. Be specific about the item.",
  "category": "best match from: ${(categories || []).slice(0, 15).join(', ') || 'Electronics, Clothing, Furniture, Vehicles, Tools, Sport, Gaming, Books, Toys, Garden'}",
  "suggestedPrice": realistic AUD number based on current market value,
  "condition": "New" or "Like new" or "Good" or "Fair" or "For parts",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}`,
            },
          ],
        }],
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.error?.message || `Claude API error ${response.status}`)
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || ''
    const clean = text.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)

    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })

  } catch (err) {
    console.error('analyze-listing error:', err)
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})
