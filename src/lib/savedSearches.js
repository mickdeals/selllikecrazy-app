/**
 * Saved Searches — Sell Like Crazy
 * Users save search queries and get notified when matching listings appear
 */

import { supabase } from './supabase'

/**
 * Save a search query for a user
 */
export async function saveSearch(userId, query, filters = {}) {
  const { data, error } = await supabase
    .from('saved_searches')
    .upsert({
      user_id: userId,
      query: query.trim(),
      filters: JSON.stringify(filters), // { category, maxPrice, location }
      notifications_enabled: true,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get all saved searches for a user
 */
export async function getSavedSearches(userId) {
  const { data, error } = await supabase
    .from('saved_searches')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Delete a saved search
 */
export async function deleteSavedSearch(searchId, userId) {
  const { error } = await supabase
    .from('saved_searches')
    .delete()
    .eq('id', searchId)
    .eq('user_id', userId)

  if (error) throw error
}

/**
 * Toggle notifications for a saved search
 */
export async function toggleSearchNotifications(searchId, userId, enabled) {
  const { error } = await supabase
    .from('saved_searches')
    .update({ notifications_enabled: enabled })
    .eq('id', searchId)
    .eq('user_id', userId)

  if (error) throw error
}

/**
 * Check if a new listing matches any saved searches
 * Called server-side when a listing is published (Supabase trigger)
 * Included here for reference
 */
export function listingMatchesSearch(listing, savedSearch) {
  const { query, filters } = savedSearch
  const parsedFilters = typeof filters === 'string' ? JSON.parse(filters) : filters

  // Text match
  const searchText = query.toLowerCase()
  const listingText = `${listing.title} ${listing.description} ${listing.category}`.toLowerCase()
  if (!listingText.includes(searchText)) return false

  // Category filter
  if (parsedFilters.category && listing.category !== parsedFilters.category) return false

  // Price filter
  if (parsedFilters.maxPrice && listing.price > parsedFilters.maxPrice) return false

  // Location filter (simple substring match)
  if (parsedFilters.location && !listing.location?.toLowerCase().includes(parsedFilters.location.toLowerCase())) return false

  return true
}
