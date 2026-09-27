// Currency symbols and locale config per country code
export const CURRENCY_MAP = {
  AU: { currency: 'AUD', symbol: '$',  locale: 'en-AU', lang: 'en' },
  US: { currency: 'USD', symbol: '$',  locale: 'en-US', lang: 'en' },
  GB: { currency: 'GBP', symbol: '£',  locale: 'en-GB', lang: 'en' },
  NZ: { currency: 'NZD', symbol: '$',  locale: 'en-NZ', lang: 'en' },
  CA: { currency: 'CAD', symbol: '$',  locale: 'en-CA', lang: 'en' },
  DE: { currency: 'EUR', symbol: '€',  locale: 'de-DE', lang: 'de' },
  FR: { currency: 'EUR', symbol: '€',  locale: 'fr-FR', lang: 'fr' },
  JP: { currency: 'JPY', symbol: '¥',  locale: 'ja-JP', lang: 'ja' },
  CN: { currency: 'CNY', symbol: '¥',  locale: 'zh-CN', lang: 'zh' },
  BR: { currency: 'BRL', symbol: 'R$', locale: 'pt-BR', lang: 'pt' },
  AE: { currency: 'AED', symbol: 'د.إ',locale: 'ar-AE', lang: 'ar' },
  SG: { currency: 'SGD', symbol: '$',  locale: 'en-SG', lang: 'en' },
  IN: { currency: 'INR', symbol: '₹',  locale: 'en-IN', lang: 'en' },
}

export const LANGUAGE_MAP = {
  en: {
    heroTitle: 'The marketplace where everything sells.',
    heroSub: 'Buy and sell anything. First 10 listings free for every new seller.',
    sellBtn: 'Start selling free',
    browseBtn: 'Browse now',
    freePill: '10 free listings — no card needed',
    latest: 'Latest listings',
    shopByPrice: 'Shop by price',
    searchPh: 'Search anything...',
    allPrices: 'All prices',
    trending: 'Trending',
    hotBadge: 'Hot',
    newBadge: 'New',
    bundleBadge: 'Bundle',
    freeShip: 'Free ship',
    localOnly: 'Local only',
    dutyWarning: '⚠️ International buyers may incur customs duties and taxes. Check your country\'s import conditions before purchasing.',
  },
  zh: {
    heroTitle: '万物皆可卖的市场。',
    heroSub: '买卖任何东西。每位新卖家前10条免费。',
    sellBtn: '免费开始销售',
    browseBtn: '立即浏览',
    freePill: '10条免费房源 — 无需信用卡',
    latest: '最新商品',
    shopByPrice: '按价格购物',
    searchPh: '搜索任何东西...',
    allPrices: '全部价格',
    trending: '热门',
    hotBadge: '热门',
    newBadge: '新品',
    bundleBadge: '套装',
    freeShip: '免费配送',
    localOnly: '仅限本地',
    dutyWarning: '⚠️ 国际买家可能需要支付关税和税款。购买前请查看您所在国家的进口条件。',
  },
  ja: {
    heroTitle: '何でも売れるマーケットプレイス。',
    heroSub: '何でも売買できます。新規出品者は最初の10件無料。',
    sellBtn: '無料で出品開始',
    browseBtn: '今すぐ閲覧',
    freePill: '10件無料出品 — カード不要',
    latest: '最新リスト',
    shopByPrice: '価格で探す',
    searchPh: '何でも検索...',
    allPrices: '全価格帯',
    trending: 'トレンド',
    hotBadge: '人気',
    newBadge: '新着',
    bundleBadge: 'セット',
    freeShip: '送料無料',
    localOnly: '地域限定',
    dutyWarning: '⚠️ 海外からのご購入は関税・税金が発生する場合があります。購入前に輸入条件をご確認ください。',
  },
  de: {
    heroTitle: 'Der Marktplatz, auf dem alles verkauft wird.',
    heroSub: 'Kaufen und verkaufen Sie alles. Die ersten 10 Anzeigen sind kostenlos.',
    sellBtn: 'Kostenlos inserieren',
    browseBtn: 'Jetzt stöbern',
    freePill: '10 kostenlose Inserate — keine Karte nötig',
    latest: 'Neueste Anzeigen',
    shopByPrice: 'Nach Preis einkaufen',
    searchPh: 'Suche alles...',
    allPrices: 'Alle Preise',
    trending: 'Trending',
    hotBadge: 'Beliebt',
    newBadge: 'Neu',
    bundleBadge: 'Bundle',
    freeShip: 'Gratis Versand',
    localOnly: 'Nur lokal',
    dutyWarning: '⚠️ Internationale Käufer können Zölle und Steuern zahlen. Prüfen Sie die Einfuhrbedingungen Ihres Landes.',
  },
  pt: {
    heroTitle: 'O marketplace onde tudo vende.',
    heroSub: 'Compre e venda qualquer coisa. Primeiros 10 anúncios grátis.',
    sellBtn: 'Comece a vender grátis',
    browseBtn: 'Navegar agora',
    freePill: '10 anúncios grátis — sem cartão',
    latest: 'Últimos anúncios',
    shopByPrice: 'Comprar por preço',
    searchPh: 'Pesquisar tudo...',
    allPrices: 'Todos os preços',
    trending: 'Em alta',
    hotBadge: 'Popular',
    newBadge: 'Novo',
    bundleBadge: 'Pacote',
    freeShip: 'Frete grátis',
    localOnly: 'Somente local',
    dutyWarning: '⚠️ Compradores internacionais podem pagar impostos e taxas alfandegárias. Verifique as condições do seu país.',
  },
  ar: {
    heroTitle: 'السوق الذي يبيع فيه كل شيء.',
    heroSub: 'اشترِ وبع أي شيء. أول 10 إعلانات مجانية.',
    sellBtn: 'ابدأ البيع مجاناً',
    browseBtn: 'تصفح الآن',
    freePill: '10 إعلانات مجانية — بدون بطاقة',
    latest: 'أحدث الإعلانات',
    shopByPrice: 'التسوق حسب السعر',
    searchPh: 'ابحث عن أي شيء...',
    allPrices: 'جميع الأسعار',
    trending: 'رائج',
    hotBadge: 'رائج',
    newBadge: 'جديد',
    bundleBadge: 'حزمة',
    freeShip: 'شحن مجاني',
    localOnly: 'محلي فقط',
    dutyWarning: '⚠️ قد يتحمل المشترون الدوليون رسوماً جمركية وضرائب. تحقق من شروط الاستيراد في بلدك قبل الشراء.',
  },
}

export async function detectGeo() {
  try {
    const res = await fetch('https://ipapi.co/json/')
    const data = await res.json()
    const countryCode = data.country_code || 'AU'
    const geo = CURRENCY_MAP[countryCode] || CURRENCY_MAP['AU']
    return {
      country: data.country_name || 'Australia',
      countryCode,
      city: data.city || '',
      ...geo,
    }
  } catch {
    // Default to Australia if detection fails
    return {
      country: 'Australia',
      countryCode: 'AU',
      city: '',
      ...CURRENCY_MAP['AU'],
    }
  }
}

export function formatPrice(amount, symbol) {
  return `${symbol}${Number(amount).toLocaleString()}`
}
