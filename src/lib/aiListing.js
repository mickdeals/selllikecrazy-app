/**
 * AI Listing Analyzer
 * Calls Claude via Supabase Edge Function (server-side) to avoid CORS
 * Flow: photo + title → Edge Function → Claude API → description, price, condition
 */

export async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function analyzeListingImage(imageFile, existingCategories = [], title = '') {
  try {
    const base64 = await fileToBase64(imageFile)
    const mediaType = imageFile.type || 'image/jpeg'

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    // Call via Supabase Edge Function to avoid CORS
    const response = await fetch(`${supabaseUrl}/functions/v1/analyze-listing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        imageBase64: base64,
        mediaType,
        title,
        categories: existingCategories.slice(0, 15),
      }),
    })

    if (response.ok) {
      const result = await response.json()
      if (result.error) throw new Error(result.error)
      return result
    }

    throw new Error(`Edge function error ${response.status}`)

  } catch (err) {
    console.warn('AI fallback:', err.message)
    // Fallback uses the title for a better generic description
    return {
      title: title || 'Item for sale',
      description: title
        ? `${title} in good condition. Well maintained and ready to use. All accessories included where applicable. Feel free to ask any questions before purchasing.`
        : 'Good condition item. Please see photos for details. Feel free to ask any questions.',
      category: existingCategories[0] || 'General',
      suggestedPrice: 50,
      condition: 'Good',
      keywords: ['forsale', 'bargain'],
    }
  }
}

export async function removeBackground(imageFile) {
  const apiKey = import.meta.env.VITE_PHOTOROOM_API_KEY
  if (!apiKey) throw new Error('PhotoRoom API key not configured')
  const formData = new FormData()
  formData.append('image_file', imageFile)
  formData.append('format', 'png')
  const response = await fetch('https://sdk.photoroom.com/v1/segment', {
    method: 'POST',
    headers: { 'x-api-key': apiKey },
    body: formData,
  })
  if (!response.ok) throw new Error('Background removal failed')
  const blob = await response.blob()
  return URL.createObjectURL(blob)
}
