-- ════════════════════════════════════════════
--  Sell Like Crazy — Supabase Database Schema
--  Run this in Supabase → SQL Editor
-- ════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Profiles (extends Supabase auth.users) ──
create table public.profiles (
  id            uuid references auth.users(id) on delete cascade primary key,
  email         text,
  display_name  text,
  avatar_url    text,
  phone         text,
  location      text,
  bio           text,
  rating        numeric(3,2) default 5.0,
  review_count  int default 0,
  -- Verification
  email_verified    boolean default false,
  phone_verified    boolean default false,
  id_verified       boolean default false,
  -- Plan
  plan              text check (plan in ('free', 'per_listing', 'annual')) default 'free',
  plan_expires_at   timestamptz,
  free_listings_remaining int default 10,
  -- Stripe
  stripe_customer_id text,
  -- Timestamps
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Categories (auto-created) ──
create table public.categories (
  id          uuid default uuid_generate_v4() primary key,
  name        text unique not null,
  slug        text unique not null,
  icon        text,
  listing_count int default 0,
  created_at  timestamptz default now()
);

-- Seed default categories
insert into public.categories (name, slug, icon) values
  ('Electronics', 'electronics', '💻'),
  ('Clothing',    'clothing',    '👗'),
  ('Furniture',   'furniture',   '🪑'),
  ('Vehicles',    'vehicles',    '🚗'),
  ('Tools',       'tools',       '🔧'),
  ('Sport',       'sport',       '⚽'),
  ('Gaming',      'gaming',      '🎮'),
  ('Books',       'books',       '📚'),
  ('Toys',        'toys',        '🧸'),
  ('Garden',      'garden',      '🌿'),
  ('Jewellery',   'jewellery',   '💍'),
  ('Art',         'art',         '🎨'),
  ('Music',       'music',       '🎵'),
  ('Health & Beauty', 'health-beauty', '💄');

-- ── Listings ──
create table public.listings (
  id            uuid default uuid_generate_v4() primary key,
  seller_id     uuid references public.profiles(id) on delete cascade not null,
  title         text not null,
  description   text,
  category      text not null,
  price         numeric(10,2) not null,
  bundle_price  numeric(10,2),
  emoji         text default '📦',
  location      text,
  shipping_option text not null default 'Free shipping',
  -- Flags
  is_international boolean default false,
  free_listing  boolean default false,
  status        text check (status in ('active','sold','paused','removed')) default 'active',
  -- Stats
  view_count    int default 0,
  save_count    int default 0,
  -- Timestamps
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- RLS Policies
alter table public.listings enable row level security;

-- Anyone can read active listings
create policy "Public listings are viewable by all"
  on public.listings for select
  using (status = 'active');

-- Only seller can insert their own listing
create policy "Sellers can create listings"
  on public.listings for insert
  with check (auth.uid() = seller_id);

-- Only seller can update their own listing
create policy "Sellers can update own listings"
  on public.listings for update
  using (auth.uid() = seller_id);

-- ── Saved / Favourites ──
create table public.saves (
  id         uuid default uuid_generate_v4() primary key,
  user_id    uuid references public.profiles(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, listing_id)
);

alter table public.saves enable row level security;
create policy "Users manage their own saves"
  on public.saves for all
  using (auth.uid() = user_id);

-- ── Messages ──
create table public.messages (
  id          uuid default uuid_generate_v4() primary key,
  listing_id  uuid references public.listings(id) on delete cascade,
  sender_id   uuid references public.profiles(id) on delete cascade,
  receiver_id uuid references public.profiles(id) on delete cascade,
  content     text not null,
  read        boolean default false,
  created_at  timestamptz default now()
);

alter table public.messages enable row level security;
create policy "Users can see their own messages"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Users can send messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);

-- ── Reviews ──
create table public.reviews (
  id          uuid default uuid_generate_v4() primary key,
  reviewer_id uuid references public.profiles(id) on delete cascade,
  seller_id   uuid references public.profiles(id) on delete cascade,
  listing_id  uuid references public.listings(id),
  rating      int check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz default now()
);

-- ════════════════════════════════════════════
--  SETUP NOTES
-- ════════════════════════════════════════════
-- 1. Go to app.supabase.com → New project
-- 2. Paste this SQL into SQL Editor and Run
-- 3. Go to Settings → API → copy URL and anon key
-- 4. Paste into your .env file
-- 5. Enable Email auth under Authentication → Providers
-- ════════════════════════════════════════════

-- ── Bundles (Power Seller — Annual plan only) ──
create table public.bundles (
  id            uuid default uuid_generate_v4() primary key,
  seller_id     uuid references public.profiles(id) on delete cascade,
  name          text not null,
  bundle_price  numeric(10,2) not null,
  status        text default 'active',
  view_count    int default 0,
  created_at    timestamptz default now()
);

-- Listings in a bundle
create table public.bundle_listings (
  bundle_id   uuid references public.bundles(id) on delete cascade,
  listing_id  uuid references public.listings(id) on delete cascade,
  primary key (bundle_id, listing_id)
);

alter table public.bundles enable row level security;
create policy "Public bundles viewable" on public.bundles for select using (status = 'active');
create policy "Sellers manage own bundles" on public.bundles for all using (auth.uid() = seller_id);

-- ── Reviews update (add tags column) ──
alter table public.reviews add column if not exists tags text[] default '{}';
alter table public.reviews add column if not exists listing_id uuid references public.listings(id);

-- Power seller view
create or replace view public.power_sellers as
  select 
    p.id,
    p.display_name,
    p.rating,
    p.review_count,
    p.plan,
    p.id_verified,
    p.phone_verified,
    count(l.id) as listing_count,
    case when 
      p.plan = 'annual' and 
      p.rating >= 4.5 and 
      p.review_count >= 10 and 
      p.id_verified = true
    then true else false end as is_power_seller
  from public.profiles p
  left join public.listings l on l.seller_id = p.id and l.status = 'active'
  group by p.id;

-- ── Stripe Connect fields on profiles ──
alter table public.profiles
  add column if not exists stripe_connect_id text,
  add column if not exists stripe_connect_ready boolean default false,
  add column if not exists stripe_customer_id text;

-- ════════════════════════════════════════════
--  STRIPE CONNECT SETUP NOTES
-- ════════════════════════════════════════════
-- 1. Go to dashboard.stripe.com → Connect → Settings
--    Enable Express accounts for Australia
-- 2. Go to Supabase → Edge Functions → Deploy:
--    supabase functions deploy stripe-connect-create
--    supabase functions deploy stripe-connect-status
--    supabase functions deploy stripe-checkout
--    supabase functions deploy stripe-webhook
-- 3. Set secrets in Supabase → Edge Functions → Secrets:
--    STRIPE_SECRET_KEY = sk_live_... 
--    STRIPE_WEBHOOK_SECRET = whsec_...
--    SUPABASE_SERVICE_ROLE_KEY = (from Supabase settings)
-- 4. In Stripe → Developers → Webhooks → Add endpoint:
--    URL: https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook
--    Events: checkout.session.completed, customer.subscription.updated,
--            customer.subscription.deleted, account.updated
-- ════════════════════════════════════════════

-- ── Listing payment tracking fields ──
alter table public.listings
  add column if not exists payment_status text default 'not_required',
  add column if not exists published_at timestamptz,
  add column if not exists condition text default 'Good',
  add column if not exists ai_assisted boolean default false;

-- payment_status values:
--   'not_required' — free listing or annual plan
--   'pending'      — awaiting $1 payment
--   'paid'         — $1 payment confirmed

-- ── Index for fast pending listing lookups (webhook uses this) ──
create index if not exists listings_payment_status_idx on public.listings(payment_status);
create index if not exists listings_seller_status_idx on public.listings(seller_id, status);

-- ════════════════════════════════════════════
--  $1 PER LISTING STRIPE SETUP
-- ════════════════════════════════════════════
-- 1. Stripe dashboard → Products → Create product
--    Name: "Single listing"
--    Price: $1.00 AUD, one-time
--    Copy the Price ID → paste into .env as VITE_STRIPE_PRICE_PER_LISTING
--
-- 2. Deploy the new Edge Function:
--    supabase functions deploy stripe-listing-checkout
--
-- 3. The webhook (stripe-webhook) already handles:
--    - checkout.session.completed with type=per_listing
--    - Flips listing status from 'pending' → 'active'
--    - Buyer can see it immediately after payment
-- ════════════════════════════════════════════

-- ── Offers ──
create table public.offers (
  id          uuid default uuid_generate_v4() primary key,
  listing_id  uuid references public.listings(id) on delete cascade,
  buyer_id    uuid references public.profiles(id) on delete cascade,
  amount      numeric(10,2) not null,
  counter_amount numeric(10,2),
  message     text,
  status      text default 'pending' check (status in ('pending','accepted','declined','countered','expired','paid')),
  expires_at  timestamptz,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.offers enable row level security;
create policy "Buyers see own offers" on public.offers for select using (auth.uid() = buyer_id);
create policy "Sellers see offers on their listings" on public.offers for select
  using (exists (select 1 from public.listings where id = listing_id and seller_id = auth.uid()));
create policy "Buyers create offers" on public.offers for insert with check (auth.uid() = buyer_id);
create policy "Sellers update offer status" on public.offers for update
  using (exists (select 1 from public.listings where id = listing_id and seller_id = auth.uid()));

-- Lock listing when offer accepted
alter table public.listings add column if not exists locked_until timestamptz;
alter table public.listings add column if not exists reserved_by uuid references public.profiles(id);

-- ── Push notification subscriptions ──
create table public.push_subscriptions (
  id           uuid default uuid_generate_v4() primary key,
  user_id      uuid references public.profiles(id) on delete cascade unique,
  subscription text not null,
  updated_at   timestamptz default now()
);

alter table public.push_subscriptions enable row level security;
create policy "Users manage own push subs" on public.push_subscriptions for all using (auth.uid() = user_id);

-- ── Saved searches ──
create table public.saved_searches (
  id                     uuid default uuid_generate_v4() primary key,
  user_id                uuid references public.profiles(id) on delete cascade,
  query                  text not null,
  filters                jsonb default '{}',
  notifications_enabled  boolean default true,
  match_count            int default 0,
  last_notified_at       timestamptz,
  updated_at             timestamptz default now(),
  unique(user_id, query)
);

alter table public.saved_searches enable row level security;
create policy "Users manage own searches" on public.saved_searches for all using (auth.uid() = user_id);

-- ── Messages ──
create table if not exists public.messages (
  id          uuid default uuid_generate_v4() primary key,
  listing_id  uuid references public.listings(id) on delete cascade,
  sender_id   uuid references public.profiles(id) on delete cascade,
  receiver_id uuid references public.profiles(id) on delete cascade,
  content     text not null,
  read        boolean default false,
  created_at  timestamptz default now()
);

alter table public.messages enable row level security;
create policy "Users see own messages" on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Users send messages" on public.messages for insert with check (auth.uid() = sender_id);

-- ── Seller username (for storefront URLs) ──
alter table public.profiles add column if not exists username text unique;
alter table public.profiles add column if not exists sales_count int default 0;
alter table public.profiles add column if not exists bio text;

-- ── Trigger: check saved searches when new listing published ──
-- (Server-side matching — notify users with matching saved searches)
create or replace function public.notify_saved_searches()
returns trigger as $$
begin
  -- In production: call a Supabase Edge Function here to send push notifications
  -- to users whose saved searches match the new listing
  -- For now this is a placeholder
  return new;
end;
$$ language plpgsql;

create trigger on_listing_published
  after insert or update of status on public.listings
  for each row
  when (new.status = 'active')
  execute procedure public.notify_saved_searches();

-- ── Service listing fields ──
alter table public.listings
  add column if not exists listing_type text default 'item' check (listing_type in ('item', 'service')),
  add column if not exists service_area text,
  add column if not exists travel_radius text,
  add column if not exists delivery_method text,
  add column if not exists experience_level text,
  add column if not exists qualifications text,
  add column if not exists availability text;

-- Service categories seed
insert into public.categories (name, slug, icon) values
  ('Scalp Micropigmentation', 'smp',             '💆'),
  ('Hair & Beauty',           'hair-beauty',      '💈'),
  ('Tattoo & Body Art',       'tattoo',           '🎨'),
  ('Personal Training',       'personal-training','💪'),
  ('Photography',             'photography',      '📸'),
  ('Music Lessons',           'music-lessons',    '🎸'),
  ('Trades & Handyman',       'trades',           '🔧'),
  ('Cleaning & Domestic',     'cleaning',         '🧹'),
  ('Tutoring & Education',    'tutoring',         '📚'),
  ('Pet Services',            'pets',             '🐾'),
  ('Event & Wedding',         'events',           '🎊'),
  ('IT & Tech Support',       'it-tech',          '💻'),
  ('Catering & Chef',         'catering',         '👨‍🍳'),
  ('Health & Wellness',       'health-wellness',  '🧘')
on conflict (slug) do nothing;

-- ── Index for service listings ──
create index if not exists listings_type_idx on public.listings(listing_type);

-- ── Admin user setup ──
alter table public.profiles
  add column if not exists is_admin boolean default false;

-- ════════════════════════════════════════════
--  GRANT YOURSELF ADMIN ACCESS
--  Run this in Supabase SQL Editor after signup
--  Replace YOUR_EMAIL with your actual email
-- ════════════════════════════════════════════
-- update public.profiles
--   set is_admin = true
--   where email = 'sales@aussietoys.au';
--
-- To verify:
--   select id, email, is_admin from public.profiles where is_admin = true;
-- ════════════════════════════════════════════

-- RLS: Admin can see and modify all listings
create policy "Admin can manage all listings"
  on public.listings for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- ── Reports table ──
create table public.reports (
  id          uuid default uuid_generate_v4() primary key,
  listing_id  uuid references public.listings(id) on delete cascade,
  reporter_id uuid references public.profiles(id) on delete set null,
  reason      text not null,
  detail      text,
  status      text default 'pending' check (status in ('pending', 'reviewed', 'removed', 'dismissed')),
  created_at  timestamptz default now()
);

alter table public.reports enable row level security;
create policy "Anyone can submit a report" on public.reports for insert with check (true);
create policy "Admins can see all reports" on public.reports for select
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));
create policy "Admins can update reports" on public.reports for update
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- ── Mark as sold ──
-- listing status already supports 'sold' — just update via dashboard
-- Add sold_at timestamp
alter table public.listings add column if not exists sold_at timestamptz;

-- ── SEO: Dynamic meta tags per listing ──
-- Each listing gets its own shareable URL: selllikecrazy.app/listing/:id
-- The Open Graph tags in index.html are static — for dynamic per-listing OG tags
-- you need a server-side renderer or edge function
-- Recommended: Cloudflare Workers to inject listing-specific meta tags
-- See: supabase/functions/og-meta/index.ts (create this when deploying)

-- ════════════════════════════════════════════
--  EMAIL NOTIFICATIONS SETUP
-- ════════════════════════════════════════════
-- 1. In Supabase → Auth → SMTP Settings:
--    Add your SMTP provider (Resend.com recommended — free 3000/month)
--    SMTP Host: smtp.resend.com
--    Port: 465
--    Username: resend
--    Password: YOUR_RESEND_API_KEY
-- 2. Deploy send-notification Edge Function:
--    supabase functions deploy send-notification
-- 3. Call it from webhook or client when events occur
-- ════════════════════════════════════════════

-- ── Free service listings (separate counter from item listings) ──
alter table public.profiles
  add column if not exists free_services_remaining int default 1;

-- ════════════════════════════════════════════
--  FREE LISTING POLICY
--  Items:    10 free listings per seller
--  Services: 1 free listing per seller
--  After free allowance: $1/listing or $50/year unlimited selling
--  Admin accounts: unlimited free always
-- ════════════════════════════════════════════

-- ── Listing expiry ──
alter table public.listings add column if not exists expires_at timestamptz;
alter table public.listings add column if not exists relisted_at timestamptz;

-- ── Expiry rules ──
-- $1 per listing → 30 days
-- Free item listing → 30 days  
-- Free service listing → 90 days
-- Annual plan → 365 days
-- Admin → null (never expires)

-- ── Scheduled expiry job (Supabase Cron) ──
-- Enable pg_cron in Supabase dashboard → Database → Extensions
-- Then add this cron job in Supabase → Database → Cron:
--
-- Name: expire-listings
-- Schedule: 0 * * * *  (every hour)
-- Command:
-- SELECT
--   net.http_post(
--     url := current_setting('app.supabase_url') || '/functions/v1/expire-listings',
--     headers := jsonb_build_object(
--       'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
--       'Content-Type', 'application/json'
--     ),
--     body := '{}'::jsonb
--   );

-- ── Mobile verification (Supabase Phone Auth) ──
-- Enable in Supabase dashboard → Auth → Providers → Phone
-- Provider: Twilio
-- Required: Twilio Account SID, Auth Token, Messaging Service SID
-- Cost: ~$0.05 per SMS (Twilio pricing)
-- Free_services_remaining only decrements after phone verified
-- One phone number = one free service listing across all accounts

-- ════════════════════════════════════════════
--  EXPIRY + MOBILE VERIFICATION SETUP
-- ════════════════════════════════════════════
-- 1. Enable pg_cron extension in Supabase
-- 2. Create cron job above to run expire-listings hourly
-- 3. Deploy expire-listings Edge Function:
--    supabase functions deploy expire-listings
-- 4. Enable Phone Auth in Supabase Auth settings
-- 5. Add Twilio credentials to Supabase Auth settings
-- ════════════════════════════════════════════

-- ════════════════════════════════════════════
--  GEO-LOCATION FOR SERVICES
-- ════════════════════════════════════════════

-- Enable PostGIS extension (in Supabase: Database → Extensions → postgis)
create extension if not exists postgis;

-- Add lat/lng columns to listings
alter table public.listings
  add column if not exists lat  double precision,
  add column if not exists lng  double precision,
  add column if not exists country_code text,
  add column if not exists state text;

-- Add PostGIS geography column for fast distance queries
alter table public.listings
  add column if not exists geo_point geography(Point, 4326);

-- Auto-update geo_point from lat/lng
create or replace function public.update_geo_point()
returns trigger as $$
begin
  if new.lat is not null and new.lng is not null then
    new.geo_point = ST_SetSRID(ST_MakePoint(new.lng, new.lat), 4326)::geography;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger on_listing_geo_update
  before insert or update of lat, lng on public.listings
  for each row execute procedure public.update_geo_point();

-- Index for fast geo queries
create index if not exists listings_geo_idx on public.listings using gist(geo_point);
create index if not exists listings_type_country_idx on public.listings(listing_type, country_code);

-- Example PostGIS query — find services within 50km of Perth:
-- select * from public.listings
--   where listing_type = 'service'
--   and status = 'active'
--   and ST_DWithin(
--     geo_point,
--     ST_SetSRID(ST_MakePoint(115.8605, -31.9505), 4326)::geography,
--     50000  -- 50km in metres
--   )
--   order by ST_Distance(geo_point, ST_SetSRID(ST_MakePoint(115.8605, -31.9505), 4326)::geography);

-- ════════════════════════════════════════════
--  GEOCODING SETUP
--  App uses Nominatim (OpenStreetMap) — free, no key needed
--  On service listing save: suburb → lat/lng via Nominatim API
--  Stored in listings.lat, listings.lng, listings.geo_point
--  PostGIS ST_DWithin filters by radius on Browse
--  Online/remote services bypass geo filter — show globally
-- ════════════════════════════════════════════

-- ── Pickup shipping options ──
alter table public.listings
  add column if not exists pickup_suburb text;

-- Updated shipping_option values:
-- 'free_shipping'   → seller covers postage
-- 'buyer_pays'      → buyer pays shipping cost
-- 'pickup_only'     → local pickup only, no posting
-- 'shipping_pickup' → buyer chooses post or pickup
-- 'international'   → ships worldwide

-- pickup_suburb: only suburb/state shown publicly
-- Full address shared via messages after sale agreed
-- Pickup listings also geocoded for distance display on browse

-- ── Age verification ──
alter table public.profiles
  add column if not exists age_confirmed     boolean default false,
  add column if not exists age_confirmed_at  timestamptz;

-- All new signups must tick the 18+ checkbox before account is created
-- age_confirmed = true saved to profile immediately on signup
-- Supabase does not enforce this server-side — the app enforces it on the signup form
-- For extra protection, you can add a Supabase Auth hook to check age_confirmed before allowing listing creation

-- ════════════════════════════════════════════
--  SOCIAL LOGIN + 2FA SETUP
-- ════════════════════════════════════════════

-- ── Social login (Supabase Auth) ──
-- Enable in Supabase → Auth → Providers:
--
-- Google:
--   1. Google Cloud Console → APIs & Services → Credentials
--   2. Create OAuth 2.0 Client ID
--   3. Authorised redirect URI: https://YOUR_PROJECT.supabase.co/auth/v1/callback
--   4. Copy Client ID + Secret → Supabase Auth → Google provider
--
-- Apple:
--   1. Apple Developer → Certificates → Sign in with Apple
--   2. Create Service ID, enable Sign In with Apple
--   3. Add redirect: https://YOUR_PROJECT.supabase.co/auth/v1/callback
--   4. Copy Team ID, Client ID, Key ID, Private Key → Supabase Auth → Apple provider
--   NOTE: Apple login is REQUIRED on iOS app if any other social login is offered
--
-- Facebook:
--   1. Facebook for Developers → Create App → Consumer
--   2. Add Facebook Login product
--   3. Valid OAuth redirect: https://YOUR_PROJECT.supabase.co/auth/v1/callback
--   4. Copy App ID + Secret → Supabase Auth → Facebook provider

-- ── Two-factor authentication (TOTP) ──
-- Enable in Supabase → Auth → Multi-Factor Authentication
-- Toggle: Enable TOTP MFA
-- That's it — Supabase handles the rest
-- No additional tables needed — Supabase manages MFA factors internally
--
-- Works with: Google Authenticator, Authy, Apple Passwords, Microsoft Authenticator
-- Flow: enroll (QR code) → verify (6-digit code) → enabled
-- On login: password → 2FA code → access granted

-- ════════════════════════════════════════════

-- ── Bump listing ──
alter table public.listings
  add column if not exists bumped_at    timestamptz,
  add column if not exists bumped_until timestamptz;

-- Bump pricing:
-- $2 per bump — 7 days at top of search results
-- Annual plan holders: 1 free bump per week
-- Admin: unlimited free bumps
-- Bump is a Stripe one-time payment (same as $1/listing checkout flow)

-- Bump sort: ORDER BY bumped_until DESC NULLS LAST, created_at DESC

-- ── Offer expiry updated to 6 hours ──
-- Accepted offers now lock listing for 6 hours (was 24)
-- Creates urgency for both buyer (pay quickly) and seller (respond quickly)
-- Sellers get push + email notification when offer received

-- ── Similar listings query ──
-- SELECT * FROM listings WHERE category = $1 AND id != $2 AND status = 'active'
-- ORDER BY bumped_until DESC NULLS LAST, created_at DESC LIMIT 4

-- ════════════════════════════════════════════
--  CATEGORY-SPECIFIC FIELDS
-- ════════════════════════════════════════════
alter table public.listings
  add column if not exists category_group  text default 'general',
  add column if not exists category_fields jsonb; -- stores vehicle make/model, bedrooms etc

-- Category group values: vehicles | property | electronics | clothing |
--   furniture | tools | pets | sport | kids | general

-- Example category_fields for a vehicle:
-- { "make": "Toyota", "model": "Corolla", "year": "2019",
--   "kilometres": "45000", "transmission": "Automatic",
--   "fuel_type": "Petrol", "body_type": "Sedan", "colour": "Silver" }

-- Example for property:
-- { "property_type": "For rent", "bedrooms": "3", "bathrooms": "2",
--   "parking": "2 spaces", "furnished": "Unfurnished",
--   "pets": "Yes", "available_date": "2026-09-01", "bond": "2400",
--   "price_period": "Per week",
--   "features": ["Air conditioning", "Dishwasher", "NBN"] }

-- Index for category filtering
create index if not exists listings_category_group_idx on public.listings(category_group, status);

-- Property-specific filter queries:
-- SELECT * FROM listings WHERE category_group = 'property'
--   AND (category_fields->>'bedrooms')::int >= 3
--   AND status = 'active'
--   ORDER BY bumped_until DESC NULLS LAST, created_at DESC;

-- Vehicles filter:
-- SELECT * FROM listings WHERE category_group = 'vehicles'
--   AND category_fields->>'make' = 'Toyota'
--   AND (category_fields->>'year')::int >= 2018
--   AND status = 'active';

-- ── Block user system ──
create table if not exists public.blocked_users (
  id          uuid default uuid_generate_v4() primary key,
  blocker_id  uuid references public.profiles(id) on delete cascade,
  blocked_id  uuid references public.profiles(id) on delete cascade,
  blocked_name text,
  blocked_at  timestamptz default now(),
  unique(blocker_id, blocked_id)
);

alter table public.blocked_users enable row level security;
create policy "Users manage their own blocks" on public.blocked_users
  for all using (auth.uid() = blocker_id);

-- Prevent blocked users sending messages
-- Check in message insert trigger:
-- IF EXISTS (SELECT 1 FROM blocked_users WHERE blocker_id = NEW.recipient_id AND blocked_id = NEW.sender_id)
-- THEN RAISE EXCEPTION 'You are blocked by this user';

-- ── Help centre contact form ──
create table if not exists public.support_requests (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id) on delete set null,
  email       text not null,
  category    text not null,
  message     text not null,
  status      text default 'open' check (status in ('open', 'in_progress', 'resolved')),
  created_at  timestamptz default now()
);

alter table public.support_requests enable row level security;
create policy "Anyone can submit support request" on public.support_requests for insert with check (true);
create policy "Admins can see all support requests" on public.support_requests for select
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- ── Admin user management ──
-- Suspend user: auth.admin.updateUserById(id, { ban_duration: '876600h' })
-- Unsuspend:    auth.admin.updateUserById(id, { ban_duration: 'none' })
-- Delete:       auth.admin.deleteUser(id)
-- All done via Supabase Admin API with service_role key in Edge Function
-- Never expose service_role key to frontend

-- ── Send support notification to admin ──
-- When a support request is submitted, send-notification fires:
-- type: SUPPORT_REQUEST → emails sales@selllikecrazy.app with details
