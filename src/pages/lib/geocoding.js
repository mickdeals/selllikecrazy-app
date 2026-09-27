/**
 * Geocoding — Sell Like Crazy
 * Uses Nominatim (OpenStreetMap) — completely free, no API key needed
 * Rate limit: 1 request per second (fine for listing saves)
 *
 * For production at scale, consider:
 * - Google Maps Geocoding API ($5/1000 after 40k free/month)
 * - Mapbox Geocoding (100k free/month)
 * - Photon (self-hosted Nominatim alternative)
 */

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

/**
 * Convert a suburb/city/address string to lat/lng
 * @param {string} address - e.g. "Ballajura, Perth WA" or "New York, NY"
 * @returns {{ lat: number, lng: number, displayName: string } | null}
 */
export async function geocodeAddress(address) {
  if (!address?.trim()) return null

  try {
    const params = new URLSearchParams({
      q: address,
      format: 'json',
      limit: 1,
      addressdetails: 1,
    })

    const res = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: {
        // Nominatim requires a User-Agent
        'User-Agent': 'SellLikeCrazy/1.0 (selllikecrazy.app)',
        'Accept-Language': 'en',
      },
    })

    if (!res.ok) throw new Error('Geocoding request failed')
    const data = await res.json()

    if (!data || data.length === 0) return null

    const result = data[0]
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      displayName: result.display_name,
      country: result.address?.country,
      countryCode: result.address?.country_code?.toUpperCase(),
      state: result.address?.state,
      city: result.address?.city || result.address?.town || result.address?.village,
    }
  } catch (err) {
    console.error('Geocoding error:', err)
    return null
  }
}

/**
 * Calculate distance between two lat/lng points in km
 * Haversine formula
 */
export function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371 // Earth radius in km
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg) { return deg * (Math.PI / 180) }

/**
 * Format distance for display
 */
export function formatDistance(km) {
  if (km < 1) return 'Less than 1km away'
  if (km < 10) return `${Math.round(km)}km away`
  if (km < 100) return `${Math.round(km)}km away`
  return `${Math.round(km / 10) * 10}km away`
}

/**
 * Filter services by distance from user location
 * @param {Array} services - listings with lat/lng
 * @param {number} userLat
 * @param {number} userLng
 * @param {number} radiusKm - max distance
 * @param {boolean} includeOnline - always include online/remote services
 */
export function filterByDistance(services, userLat, userLng, radiusKm, includeOnline = true) {
  return services
    .map(s => {
      // Online services show everywhere
      if (includeOnline && s.delivery_method?.toLowerCase().includes('online')) {
        return { ...s, distance: null, isOnline: true }
      }

      // No coordinates — fall back to showing it
      if (!s.lat || !s.lng) return { ...s, distance: null }

      const dist = distanceKm(userLat, userLng, s.lat, s.lng)
      return { ...s, distance: dist }
    })
    .filter(s => {
      if (s.isOnline) return true
      if (s.distance === null) return true // no coords, show by default
      return s.distance <= radiusKm
    })
    .sort((a, b) => {
      // Online first, then by distance
      if (a.isOnline && !b.isOnline) return -1
      if (!a.isOnline && b.isOnline) return 1
      if (a.distance === null) return 1
      if (b.distance === null) return -1
      return a.distance - b.distance
    })
}

/**
 * Get user's approximate location from IP (already built in geo.js)
 * Returns { lat, lng } for distance filtering
 */
export async function getUserLocation() {
  try {
    const res = await fetch('https://ipapi.co/json/')
    const data = await res.json()
    if (data.latitude && data.longitude) {
      return { lat: data.latitude, lng: data.longitude, city: data.city, country: data.country_name }
    }
  } catch {}

  // Fallback — Perth, Australia
  return { lat: -31.9505, lng: 115.8605, city: 'Perth', country: 'Australia' }
}

export const RADIUS_OPTIONS = [
  { label: '25km',        km: 25 },
  { label: '50km',        km: 50 },
  { label: '100km',       km: 100 },
  { label: '200km',       km: 200 },
  { label: 'Nationwide',  km: 99999 },
  { label: 'Online only', km: 0, onlineOnly: true },
]
