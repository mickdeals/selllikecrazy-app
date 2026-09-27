/**
 * Category-specific listing field definitions
 * Each category has its own set of fields that appear on the listing form
 * Fields are rendered dynamically based on the selected category group
 */

export const CATEGORY_GROUPS = [
  {
    id: 'vehicles',
    label: 'Vehicles',
    icon: '🚗',
    color: '#007AFF',
    bg: '#F0F5FF',
    border: '#D6E4FF',
    categories: ['Cars & Utes', 'Motorcycles', 'Trucks & Vans', 'Boats & Watercraft', 'Caravans & Campervans', 'Trailers', 'Other Vehicles'],
    shippingDefault: 'pickup_only',
    fields: [
      { id: 'make',         label: 'Make',           type: 'text',     placeholder: 'e.g. Toyota, Ford, BMW',  required: true },
      { id: 'model',        label: 'Model',          type: 'text',     placeholder: 'e.g. Corolla, Ranger',     required: true },
      { id: 'year',         label: 'Year',           type: 'number',   placeholder: 'e.g. 2019',               required: true, min: 1950, max: 2025 },
      { id: 'kilometres',   label: 'Kilometres',     type: 'number',   placeholder: 'e.g. 45000' },
      { id: 'transmission', label: 'Transmission',   type: 'select',   options: ['Automatic', 'Manual', 'CVT', 'Semi-auto'] },
      { id: 'fuel_type',    label: 'Fuel type',      type: 'select',   options: ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'LPG'] },
      { id: 'body_type',    label: 'Body type',      type: 'select',   options: ['Sedan', 'SUV', 'Hatchback', 'Ute', 'Wagon', 'Coupe', 'Convertible', 'Van', 'Other'] },
      { id: 'colour',       label: 'Colour',         type: 'text',     placeholder: 'e.g. Silver, White' },
      { id: 'rego_state',   label: 'Rego state',     type: 'select',   options: ['WA', 'NSW', 'VIC', 'QLD', 'SA', 'TAS', 'NT', 'ACT', 'Unregistered'] },
      { id: 'rego_expiry',  label: 'Rego expiry',    type: 'month',    placeholder: 'MM/YYYY' },
      { id: 'rwc',          label: 'Roadworthy cert',type: 'select',   options: ['Yes — included', 'No', 'Not required in this state'] },
      { id: 'drive_away',   label: 'Price includes', type: 'select',   options: ['Drive away — no more to pay', 'Plus on-roads'] },
    ],
  },

  {
    id: 'property',
    label: 'Property & Rentals',
    icon: '🏠',
    color: '#34C759',
    bg: '#F0FFF4',
    border: '#D6FFE4',
    categories: ['Houses for Rent', 'Houses for Sale', 'Apartments & Units', 'Rooms for Rent', 'Share Houses', 'Land', 'Commercial', 'Holiday & Short Stay'],
    shippingDefault: 'pickup_only',
    priceLabel: 'Price / Rent',
    fields: [
      { id: 'property_type', label: 'Listing type',   type: 'select',  options: ['For rent', 'For sale', 'Share house', 'Holiday let'], required: true },
      { id: 'bedrooms',      label: 'Bedrooms',       type: 'select',  options: ['Studio', '1', '2', '3', '4', '5', '6+'],            required: true },
      { id: 'bathrooms',     label: 'Bathrooms',      type: 'select',  options: ['1', '1.5', '2', '2.5', '3', '4+'] },
      { id: 'parking',       label: 'Parking',        type: 'select',  options: ['None', '1 space', '2 spaces', '3+ spaces', 'Garage', 'Carport'] },
      { id: 'furnished',     label: 'Furnished',      type: 'select',  options: ['Unfurnished', 'Partially furnished', 'Fully furnished'] },
      { id: 'pets',          label: 'Pets allowed',   type: 'select',  options: ['Yes', 'No', 'Negotiable', 'Small pets only'] },
      { id: 'available_date',label: 'Available from', type: 'date',    placeholder: 'dd/mm/yyyy' },
      { id: 'bond',          label: 'Bond amount',    type: 'number',  placeholder: 'e.g. 2400' },
      { id: 'price_period',  label: 'Price per',      type: 'select',  options: ['Per week', 'Per month', 'Per night', 'Total price (sale)'] },
      { id: 'features',      label: 'Features',       type: 'multicheck', options: ['Air conditioning', 'Dishwasher', 'Pool', 'Gym', 'Balcony', 'Garden', 'Solar', 'NBN', 'Security system', 'Storage', 'Wheelchair access'] },
    ],
  },

  {
    id: 'electronics',
    label: 'Electronics & Tech',
    icon: '📱',
    color: '#635BFF',
    bg: '#F0F0FF',
    border: '#C0C0FF',
    categories: ['Mobile Phones', 'Laptops & Computers', 'Tablets', 'Cameras & Photography', 'Audio & Headphones', 'Gaming', 'TVs & Monitors', 'Smart Home', 'Computer Parts', 'Other Electronics'],
    fields: [
      { id: 'brand',      label: 'Brand',          type: 'text',    placeholder: 'e.g. Apple, Samsung, Sony', required: true },
      { id: 'model',      label: 'Model',          type: 'text',    placeholder: 'e.g. iPhone 14 Pro, Galaxy S24' },
      { id: 'storage',    label: 'Storage / Specs',type: 'text',    placeholder: 'e.g. 256GB, 16GB RAM, 4K' },
      { id: 'colour',     label: 'Colour',         type: 'text',    placeholder: 'e.g. Space Black, Silver' },
      { id: 'battery',    label: 'Battery health', type: 'text',    placeholder: 'e.g. 97% (phones/laptops only)' },
      { id: 'warranty',   label: 'Warranty',       type: 'select',  options: ['No warranty', 'Under warranty — expires soon', 'Under manufacturer warranty', 'AppleCare / extended warranty'] },
      { id: 'accessories',label: 'Included with sale', type: 'multicheck', options: ['Original box', 'Charger', 'Case', 'Screen protector', 'Earphones/AirPods', 'Manual', 'All accessories'] },
      { id: 'icloud',     label: 'iCloud / Google account', type: 'select', options: ['Signed out — ready to use', 'Will be signed out before sale', 'N/A (not Apple/Google device)'] },
    ],
  },

  {
    id: 'clothing',
    label: 'Clothing & Fashion',
    icon: '👗',
    color: '#FF2D55',
    bg: '#FFF0F3',
    border: '#FFD0D8',
    categories: ['Womens Clothing', 'Mens Clothing', 'Kids & Baby Clothing', 'Shoes', 'Bags & Handbags', 'Jewellery & Watches', 'Accessories', 'Sportswear', 'Formal & Wedding'],
    fields: [
      { id: 'brand',   label: 'Brand',         type: 'text',   placeholder: 'e.g. Country Road, Nike, Zara' },
      { id: 'size',    label: 'Size',          type: 'text',   placeholder: 'e.g. AU 12, M, US 8, EU 40',  required: true },
      { id: 'colour',  label: 'Colour',        type: 'text',   placeholder: 'e.g. Navy blue, Floral print' },
      { id: 'gender',  label: 'For',           type: 'select', options: ['Women', 'Men', 'Girls', 'Boys', 'Unisex', 'Baby'] },
      { id: 'material',label: 'Material',      type: 'text',   placeholder: 'e.g. 100% cotton, Polyester blend' },
      { id: 'worn',    label: 'Times worn',    type: 'select', options: ['Never worn — tags on', 'Worn once', 'Worn a few times', 'Worn regularly — good condition', 'Worn — some signs of use'] },
      { id: 'washing', label: 'Washing',       type: 'select', options: ['Machine washable', 'Hand wash only', 'Dry clean only'] },
    ],
  },

  {
    id: 'furniture',
    label: 'Furniture & Home',
    icon: '🛋️',
    color: '#FF9500',
    bg: '#FFF9E6',
    border: '#FFD080',
    categories: ['Sofas & Lounges', 'Beds & Bedroom', 'Dining & Kitchen', 'Outdoor Furniture', 'Storage & Shelving', 'Desks & Office', 'Lighting', 'Rugs & Curtains', 'Appliances', 'Home Decor'],
    fields: [
      { id: 'material',   label: 'Material / Style', type: 'text',   placeholder: 'e.g. Timber, Leather, Fabric, Rattan' },
      { id: 'colour',     label: 'Colour',           type: 'text',   placeholder: 'e.g. White, Oak, Charcoal' },
      { id: 'dimensions', label: 'Dimensions',       type: 'text',   placeholder: 'e.g. 180cm W × 90cm D × 75cm H' },
      { id: 'brand',      label: 'Brand',            type: 'text',   placeholder: 'e.g. IKEA, Freedom, Koala' },
      { id: 'assembly',   label: 'Assembly',         type: 'select', options: ['Fully assembled', 'Requires assembly', 'Flat-pack — unused'] },
      { id: 'smoke_pet',  label: 'Smoke / pet free', type: 'select', options: ['Smoke-free and pet-free home', 'Smoke-free home', 'Pet-friendly home', 'Smoker in home'] },
    ],
  },

  {
    id: 'tools',
    label: 'Tools & Equipment',
    icon: '🔧',
    color: '#8B4513',
    bg: '#FFF5F0',
    border: '#FFCCAA',
    categories: ['Power Tools', 'Hand Tools', 'Garden & Outdoor', 'Farming & Agricultural', 'Industrial', 'Measuring & Levels', 'Safety Equipment'],
    fields: [
      { id: 'brand',        label: 'Brand',         type: 'text',   placeholder: 'e.g. Makita, DeWalt, Bosch' },
      { id: 'model',        label: 'Model / Part #',type: 'text',   placeholder: 'e.g. DDF482Z' },
      { id: 'power_source', label: 'Power source',  type: 'select', options: ['Battery / Cordless', 'Corded — 240V', 'Petrol', 'Pneumatic / Air', 'Manual / Hand tool'] },
      { id: 'battery_volt', label: 'Battery',       type: 'text',   placeholder: 'e.g. 18V, 2 × 5.0Ah batteries included' },
      { id: 'hours',        label: 'Hours of use',  type: 'select', options: ['Brand new', 'Light use', 'Moderate use', 'Heavy use — still fully functional'] },
      { id: 'case',         label: 'Case / storage',type: 'select', options: ['Includes original case', 'Includes carry bag', 'No case', 'Custom storage included'] },
    ],
  },

  {
    id: 'pets',
    label: 'Pets & Animals',
    icon: '🐾',
    color: '#FF6B00',
    bg: '#FFF5F0',
    border: '#FFCCAA',
    categories: ['Dogs', 'Cats', 'Birds', 'Fish & Aquariums', 'Small Animals', 'Reptiles', 'Livestock', 'Pet Accessories', 'Pet Food & Supplies'],
    fields: [
      { id: 'species',    label: 'Species / Breed', type: 'text',   placeholder: 'e.g. Labrador Retriever, Domestic Shorthair', required: true },
      { id: 'age',        label: 'Age',             type: 'text',   placeholder: 'e.g. 8 weeks, 2 years' },
      { id: 'gender',     label: 'Gender',          type: 'select', options: ['Male', 'Female', 'Unknown'] },
      { id: 'colour_mark',label: 'Colour / Markings',type: 'text',  placeholder: 'e.g. Black and tan, Tabby' },
      { id: 'vaccinated', label: 'Vaccinated',      type: 'select', options: ['Up to date', 'Partially vaccinated', 'Not vaccinated', 'Unknown'] },
      { id: 'microchip',  label: 'Microchipped',    type: 'select', options: ['Yes', 'No', 'Unknown'] },
      { id: 'desexed',    label: 'Desexed',         type: 'select', options: ['Yes', 'No', 'Unknown'] },
      { id: 'papers',     label: 'Papers / Pedigree',type: 'select',options: ['ANKC registered — papers included', 'Papers available', 'No papers', 'N/A'] },
      { id: 'health',     label: 'Health checks',   type: 'text',   placeholder: 'e.g. Vet checked, flea treated, wormed' },
    ],
  },

  {
    id: 'sport',
    label: 'Sport & Recreation',
    icon: '⚽',
    color: '#34C759',
    bg: '#F0FFF4',
    border: '#D6FFE4',
    categories: ['Exercise & Gym', 'Cycling', 'Water Sports', 'Team Sports', 'Golf', 'Fishing & Hunting', 'Camping & Hiking', 'Snow Sports', 'Martial Arts'],
    fields: [
      { id: 'brand',  label: 'Brand',          type: 'text',   placeholder: 'e.g. Trek, Callaway, Shimano' },
      { id: 'size',   label: 'Size / Spec',    type: 'text',   placeholder: 'e.g. Medium frame, 54cm, 20kg capacity' },
      { id: 'age',    label: 'Age / Use',      type: 'select', options: ['Brand new', 'Less than 1 year old', '1–3 years old', '3+ years — good condition', 'Vintage / collector'] },
      { id: 'suitable',label: 'Suitable for',  type: 'text',   placeholder: 'e.g. Adults, Kids 8–12, Beginners' },
    ],
  },

  {
    id: 'kids',
    label: 'Baby & Kids',
    icon: '🧸',
    color: '#FF9500',
    bg: '#FFF9E6',
    border: '#FFD080',
    categories: ['Prams & Strollers', 'Car Seats', 'Baby Furniture', 'Toys & Games', 'Kids Clothing', 'Baby Gear', 'Kids Books', 'School Supplies'],
    fields: [
      { id: 'brand',    label: 'Brand',           type: 'text',   placeholder: 'e.g. Bugaboo, Chicco, LEGO' },
      { id: 'age_range',label: 'Age range',       type: 'text',   placeholder: 'e.g. 0–6 months, 3–8 years' },
      { id: 'safety',   label: 'Safety standard', type: 'select', options: ['Meets current Australian standards', 'Older model — check standards', 'N/A'] },
      { id: 'reason',   label: 'Reason for selling', type: 'select', options: ['Child outgrown', 'Upgraded', 'No longer needed', 'Received duplicate as gift'] },
      { id: 'smoke_pet',label: 'Smoke / pet free', type: 'select', options: ['Smoke-free and pet-free', 'Smoke-free', 'Pet in home', 'Smoker in home'] },
    ],
  },

  {
    id: 'general',
    label: 'General / Other',
    icon: '📦',
    color: 'var(--muted)',
    bg: 'var(--bg)',
    border: 'var(--border)',
    categories: ['Books & Magazines', 'Music & Instruments', 'Art & Collectables', 'Movies & Games', 'Garden', 'Office & Business', 'Food & Drinks', 'Other'],
    fields: [], // Uses the standard form
  },
]

export function getCategoryGroup(category) {
  if (!category) return CATEGORY_GROUPS.find(g => g.id === 'general')
  const cat = category.toLowerCase()
  return CATEGORY_GROUPS.find(g =>
    g.categories.some(c => c.toLowerCase() === cat) ||
    g.id === cat ||
    g.label.toLowerCase() === cat
  ) || CATEGORY_GROUPS.find(g => g.id === 'general')
}

export function getCategoryGroupById(id) {
  return CATEGORY_GROUPS.find(g => g.id === id) || CATEGORY_GROUPS.find(g => g.id === 'general')
}
