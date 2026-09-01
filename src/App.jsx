import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import BottomNav        from './components/layout/BottomNav'
import Landing          from './pages/Landing'
import Onboarding       from './pages/Onboarding'
import Home             from './pages/Home'
import Browse           from './pages/Browse'
import SellTypeSelector from './pages/SellTypeSelector'
import Sell             from './pages/Sell'
import ServiceListing   from './pages/ServiceListing'
import Dashboard        from './pages/Dashboard'
import Profile          from './pages/Profile'
import Login            from './pages/Login'
import ListingDetail    from './pages/ListingDetail'
import ListingPaid      from './pages/ListingPaid'
import BundleCreator    from './pages/BundleCreator'
import StripeConnect    from './pages/StripeConnect'
import StripeReturn     from './pages/StripeReturn'
import SellerStorefront from './pages/SellerStorefront'
import SavedSearches    from './pages/SavedSearches'
import Messages         from './pages/Messages'
import AdminDashboard   from './pages/AdminDashboard'
import SavedItems       from './pages/SavedItems'
import HelpCentre       from './pages/HelpCentre'
import ProhibitedItems  from './pages/ProhibitedItems'
import BlockedUsers     from './pages/BlockedUsers'
import ProfileEdit      from './pages/ProfileEdit'
import { SellerChecklist } from './components/seller/SellerChecklist'
import Legal            from './pages/Legal'
import TwoFactorSetup   from './pages/TwoFactorSetup'
import RecentlyViewed   from './pages/RecentlyViewed'
import './styles/global.css'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="bottom-center"
        containerStyle={{ bottom: 80 }}
        toastOptions={{
          style: { background: '#0A0A0F', color: 'white', borderRadius: 13, fontSize: 13, fontWeight: 500 },
          duration: 2500,
        }}
      />
      <Routes>
        <Route path="/welcome"         element={<Landing />} />
        <Route path="/onboarding"      element={<Onboarding />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/stripe/return"   element={<StripeReturn />} />
        <Route path="/stripe/refresh"  element={<StripeReturn />} />
        <Route path="/listing/paid"    element={<ListingPaid />} />
        <Route path="/legal/:type"     element={<Legal />} />
        <Route path="/*" element={
          <>
            <Routes>
              <Route path="/"                element={<Home />} />
              <Route path="/browse"          element={<Browse />} />
              <Route path="/sell"            element={<SellTypeSelector />} />
              <Route path="/sell/item"       element={<Sell />} />
              <Route path="/sell/service"    element={<ServiceListing />} />
              <Route path="/dashboard"       element={<Dashboard />} />
              <Route path="/profile"         element={<Profile />} />
              <Route path="/messages"        element={<Messages />} />
              <Route path="/admin"           element={<AdminDashboard />} />
              <Route path="/listing/:id"     element={<ListingDetail />} />
              <Route path="/store/:username" element={<SellerStorefront />} />
              <Route path="/bundle/create"   element={<BundleCreator />} />
              <Route path="/stripe/connect"  element={<StripeConnect />} />
              <Route path="/saved"                element={<SavedItems />} />
              <Route path="/help"                 element={<HelpCentre />} />
              <Route path="/prohibited"          element={<ProhibitedItems />} />
              <Route path="/blocked"             element={<BlockedUsers />} />
              <Route path="/recently-viewed"     element={<RecentlyViewed />} />
              <Route path="/profile/edit"         element={<ProfileEdit />} />
              <Route path="/onboarding-checklist" element={<SellerChecklist />} />
              <Route path="/security/2fa"         element={<TwoFactorSetup />} />
            </Routes>
            <BottomNav />
          </>
        } />
      </Routes>
    </BrowserRouter>
  )
}
