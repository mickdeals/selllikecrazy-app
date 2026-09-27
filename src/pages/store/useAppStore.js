import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAppStore = create(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      session: null,
      isAdmin: false,
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setIsAdmin: (isAdmin) => set({ isAdmin }),
      logout: () => set({ user: null, session: null, isAdmin: false }),

      // Geo / Language / Currency
      geo: {
        country: 'Australia',
        countryCode: 'AU',
        currency: 'AUD',
        symbol: '$',
        lang: 'en',
      },
      setGeo: (geo) => set({ geo }),

      // Seller plan
      plan: null,
      freeListingsRemaining: 10,
      freeServicesRemaining: 1,
      setPlan: (plan) => set({ plan }),
      useFreeListings: () => {
        const rem = get().freeListingsRemaining
        if (rem > 0) set({ freeListingsRemaining: rem - 1 })
        return rem > 0
      },
      useFreeService: () => {
        const rem = get().freeServicesRemaining
        if (rem > 0) set({ freeServicesRemaining: rem - 1 })
        return rem > 0
      },

      // UI
      activeTab: 'home',
      setActiveTab: (tab) => set({ activeTab: tab }),

      // Categories (auto-created)
      categories: [
        'Electronics', 'Clothing', 'Furniture', 'Vehicles',
        'Tools', 'Sport', 'Gaming', 'Books', 'Toys', 'Garden',
        'Jewellery', 'Art', 'Music', 'Health & Beauty',
        'Scalp Micropigmentation', 'Hair & Beauty', 'Tattoo & Body Art',
        'Personal Training', 'Photography', 'Music Lessons',
        'Trades & Handyman', 'Tutoring & Education', 'Pet Services',
      ],
      addCategory: (cat) => {
        const trimmed = cat.trim()
        if (!trimmed) return
        const cats = get().categories
        if (!cats.find(c => c.toLowerCase() === trimmed.toLowerCase())) {
          set({ categories: [...cats, trimmed] })
        }
      },

      // Search / filter
      searchQuery: '',
      priceFilter: null, // null | 10 | 20 | 50 | 100
      selectedCategory: null,
      setSearchQuery: (q) => set({ searchQuery: q }),
      setPriceFilter: (p) => set({ priceFilter: p }),
      setSelectedCategory: (c) => set({ selectedCategory: c }),
    }),
    {
      name: 'slc-store',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAdmin: state.isAdmin,
        geo: state.geo,
        plan: state.plan,
        freeListingsRemaining: state.freeListingsRemaining,
        freeServicesRemaining: state.freeServicesRemaining,
        categories: state.categories,
      }),
    }
  )
)
