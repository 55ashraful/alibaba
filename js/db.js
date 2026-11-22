/* ============================================================
   My Daraz — Data Layer (admin-managed via localStorage)
   ------------------------------------------------------------
   All products, categories, coupons, payment accounts, offer
   banners, coins settings and site info are stored in
   localStorage (md_admin_*). The admin panel writes to these
   stores; the rest of the site reads from them.

   The DEMO_* arrays below are only used ONCE — as a seed the
   very first time the site runs (when nothing is stored yet).
   After that, the admin panel is the single source of truth.

   If a real Firestore project is reachable, we try it first
   and fall back to localStorage.
   ============================================================ */

/* ----- Seed data (used only on the very first run) ----- */

const DEMO_CATEGORIES = [
    { id: 'phones', name: 'স্মার্টফোন', name_en: 'Smartphones', imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&q=70' },
    { id: 'laptops', name: 'ল্যাপটপ', name_en: 'Laptops', imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&q=70' },
    { id: 'audio', name: 'অডিও ডিভাইস', name_en: 'Audio', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=70' },
    { id: 'fashion-men', name: 'পুরুষ ফ্যাশন', name_en: 'Men Fashion', imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&q=70' },
    { id: 'fashion-women', name: 'নারী ফ্যাশন', name_en: 'Women Fashion', imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200&q=70' },
    { id: 'home', name: 'হোম অ্যাপ্লায়েন্স', name_en: 'Home Appliances', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&q=70' },
    { id: 'beauty', name: 'বিউটি', name_en: 'Beauty', imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=70' },
    { id: 'grocery', name: 'গ্রোসারি', name_en: 'Grocery', imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=70' },
    { id: 'sports', name: 'স্পোর্টস', name_en: 'Sports', imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066035b?w=200&q=70' },
    { id: 'toys', name: 'টয় ও বেবি', name_en: 'Toys & Baby', imageUrl: 'https://images.unsplash.com/photo-1558877385-8c1f7be4da9b?w=200&q=70' }
];

const DEMO_PRODUCTS = [
    { id: 'p1', name: 'Samsung Galaxy A15 4GB/64GB Smartphone', category: 'স্মার্টফোন', category_en: 'Smartphones', brand: 'Samsung', price: 14999, oldPrice: 17999, discount: 17, rating: 4.5, ratingCount: 234, sold: 1200, imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=70', images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=70','https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&q=70'], description: '6.5" HD+ display, 5000mAh battery, 50MP triple camera.', specs: { Display: '6.5" HD+', RAM: '4GB', Storage: '64GB', Battery: '5000mAh', Camera: '50MP' } },
    { id: 'p2', name: 'Xiaomi Redmi 13C 6GB/128GB', category: 'স্মার্টফোন', category_en: 'Smartphones', brand: 'Xiaomi', price: 12999, oldPrice: 14999, discount: 13, rating: 4.6, ratingCount: 511, sold: 3400, imageUrl: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&q=70', images: ['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&q=70'], description: 'Helio G85, 5000mAh, 50MP camera.', specs: { Display: '6.74" HD+', RAM: '6GB', Storage: '128GB', Battery: '5000mAh' } },
    { id: 'p3', name: 'Realme C53 6GB/128GB', category: 'স্মার্টফোন', category_en: 'Smartphones', brand: 'Realme', price: 11999, oldPrice: 13999, discount: 14, rating: 4.4, ratingCount: 198, sold: 890, imageUrl: 'https://images.unsplash.com/photo-1601784551445-931910051631?w=400&q=70', description: '108MP camera, 5000mAh battery.', specs: { Display: '6.72" FHD+', RAM: '6GB', Storage: '128GB' } },
    { id: 'p4', name: 'HP Pavilion 15 Intel Core i5 Laptop', category: 'ল্যাপটপ', category_en: 'Laptops', brand: 'HP', price: 64999, oldPrice: 72999, discount: 11, rating: 4.7, ratingCount: 89, sold: 230, imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=70', description: '12th Gen i5, 8GB RAM, 512GB SSD.', specs: { CPU: 'Intel i5-1235U', RAM: '8GB DDR4', Storage: '512GB SSD', Display: '15.6" FHD' } },
    { id: 'p5', name: 'ASUS VivoBook 14 Ryzen 5', category: 'ল্যাপটপ', category_en: 'Laptops', brand: 'ASUS', price: 58999, oldPrice: 65000, discount: 9, rating: 4.5, ratingCount: 124, sold: 110, imageUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62ad5?w=400&q=70', description: 'AMD Ryzen 5 5500U, 16GB RAM.', specs: { CPU: 'AMD Ryzen 5', RAM: '16GB', Storage: '512GB SSD' } },
    { id: 'p6', name: 'Apple MacBook Air M2 8GB/256GB', category: 'ল্যাপটপ', category_en: 'Laptops', brand: 'Apple', price: 119999, oldPrice: 134999, discount: 11, rating: 4.9, ratingCount: 67, sold: 85, imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=70', description: 'Apple M2 chip, 13.6" Liquid Retina.', specs: { CPU: 'Apple M2', RAM: '8GB', Storage: '256GB SSD' } },
    { id: 'p7', name: 'Boat Rockerz 450 Bluetooth Headphone', category: 'অডিও ডিভাইস', category_en: 'Audio', brand: 'Boat', price: 1499, oldPrice: 2999, discount: 50, rating: 4.3, ratingCount: 1240, sold: 8900, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=70', description: '40mm driver, 15hr playback.', specs: { Battery: '15 hours', Connectivity: 'Bluetooth 5.0' } },
    { id: 'p8', name: 'JBL Tune 510BT Wireless Headphone', category: 'অডিও ডিভাইস', category_en: 'Audio', brand: 'JBL', price: 3499, oldPrice: 4999, discount: 30, rating: 4.6, ratingCount: 432, sold: 1100, imageUrl: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&q=70', description: 'JBL Pure Bass, 40hr battery.', specs: { Battery: '40 hours', Connectivity: 'Bluetooth 5.0' } },
    { id: 'p9', name: 'Sony WH-1000XM4 Noise Cancelling', category: 'অডিও ডিভাইস', category_en: 'Audio', brand: 'Sony', price: 28999, oldPrice: 34999, discount: 17, rating: 4.8, ratingCount: 156, sold: 320, imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977676604?w=400&q=70', description: 'Industry-leading ANC.', specs: { Battery: '30 hours', ANC: 'Yes' } },
    { id: 'p10', name: 'Premium Cotton T-Shirt for Men', category: 'পুরুষ ফ্যাশন', category_en: 'Men Fashion', brand: 'Local', price: 499, oldPrice: 799, discount: 38, rating: 4.2, ratingCount: 567, sold: 4500, imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=70', description: '100% cotton, comfortable fit.', specs: { Material: 'Cotton', Sizes: 'S, M, L, XL' } },
    { id: 'p11', name: 'Denim Jacket — Classic Blue', category: 'পুরুষ ফ্যাশন', category_en: 'Men Fashion', brand: 'Local', price: 1299, oldPrice: 1999, discount: 35, rating: 4.4, ratingCount: 230, sold: 1200, imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=70', description: 'Stylish denim jacket.', specs: { Material: 'Denim' } },
    { id: 'p12', name: 'Women Stylish Kurti - Floral Print', category: 'নারী ফ্যাশন', category_en: 'Women Fashion', brand: 'Local', price: 899, oldPrice: 1499, discount: 40, rating: 4.5, ratingCount: 890, sold: 3200, imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=70', description: 'Comfortable floral kurti.', specs: { Material: 'Viscose' } },
    { id: 'p13', name: 'Women Handbag - Premium Faux Leather', category: 'নারী ফ্যাশন', category_en: 'Women Fashion', brand: 'Local', price: 1199, oldPrice: 1999, discount: 40, rating: 4.3, ratingCount: 156, sold: 560, imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=70', description: 'Stylish premium handbag.', specs: { Material: 'Faux Leather' } },
    { id: 'p14', name: 'Philips Air Fryer 4.1L HD9200', category: 'হোম অ্যাপ্লায়েন্স', category_en: 'Home Appliances', brand: 'Philips', price: 9999, oldPrice: 12999, discount: 23, rating: 4.7, ratingCount: 312, sold: 890, imageUrl: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400&q=70', description: 'Rapid Air technology.', specs: { Capacity: '4.1L', Power: '1400W' } },
    { id: 'p15', name: 'Panasonic Microwave Oven 23L', category: 'হোম অ্যাপ্লায়েন্স', category_en: 'Home Appliances', brand: 'Panasonic', price: 8999, oldPrice: 10999, discount: 18, rating: 4.6, ratingCount: 245, sold: 450, imageUrl: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&q=70', description: '23L convection microwave.', specs: { Capacity: '23L', Power: '800W' } },
    { id: 'p16', name: 'L\'Oreal Paris Revitalift Face Cream', category: 'বিউটি', category_en: 'Beauty', brand: 'L\'Oreal', price: 1299, oldPrice: 1799, discount: 28, rating: 4.5, ratingCount: 670, sold: 2100, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=70', description: 'Anti-aging moisturizer.', specs: { Volume: '50ml' } },
    { id: 'p17', name: 'Nivea Body Lotion 400ml', category: 'বিউটি', name_en: 'Beauty', category_en: 'Beauty', brand: 'Nivea', price: 599, oldPrice: 799, discount: 25, rating: 4.4, ratingCount: 432, sold: 1800, imageUrl: 'https://images.unsplash.com/photo-1556228852-80b6e5eeff06?w=400&q=70', description: 'Nourishing body lotion.', specs: { Volume: '400ml' } },
    { id: 'p18', name: 'ACI Pure Flour 2kg', category: 'গ্রোসারি', category_en: 'Grocery', brand: 'ACI', price: 120, oldPrice: 140, discount: 14, rating: 4.6, ratingCount: 1500, sold: 12000, imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=70', description: 'Premium quality flour.', specs: { Weight: '2kg' } },
    { id: 'p19', name: 'Pran Chilli Powder 100g', category: 'গ্রোসারি', category_en: 'Grocery', brand: 'Pran', price: 60, oldPrice: 75, discount: 20, rating: 4.5, ratingCount: 890, sold: 6700, imageUrl: 'https://images.unsplash.com/photo-1599909533730-c4009cc76b85?w=400&q=70', description: 'Pure chilli powder.', specs: { Weight: '100g' } },
    { id: 'p20', name: 'Yonex Mavis 350 Shuttlecock (Pack of 6)', category: 'স্পোর্টস', category_en: 'Sports', brand: 'Yonex', price: 1200, oldPrice: 1500, discount: 20, rating: 4.7, ratingCount: 234, sold: 780, imageUrl: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=70', description: 'Durable nylon shuttlecock.', specs: { Pack: '6 pieces' } },
    { id: 'p21', name: 'Lego City Police Station Set', category: 'টয় ও বেবি', category_en: 'Toys & Baby', brand: 'Lego', price: 4999, oldPrice: 6499, discount: 23, rating: 4.9, ratingCount: 87, sold: 120, imageUrl: 'https://images.unsplash.com/photo-1558877385-8c1f7be4da9b?w=400&q=70', description: 'Buildable police station.', specs: { Pieces: '661' } },
    { id: 'p22', name: 'Remote Control Car for Kids', category: 'টয় ও বেবি', category_en: 'Toys & Baby', brand: 'Local', price: 999, oldPrice: 1499, discount: 33, rating: 4.2, ratingCount: 312, sold: 1500, imageUrl: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=400&q=70', description: '2.4GHz RC car.', specs: { Battery: '4 AA' } }
];

const DEMO_COUPONS = [
    { id: 'c1', code: 'NEW100', amount: 100, type: 'fixed', minOrder: 500, validUntil: '2026-12-31', description: 'নতুন ইউজারদের জন্য ৳১০০ ছাড়' },
    { id: 'c2', code: 'DARAZ500', amount: 500, type: 'fixed', minOrder: 3000, validUntil: '2026-12-31', description: '৳৩০০০+ অর্ডারে ৳৫০০ ছাড়' },
    { id: 'c3', code: 'SAVE10', amount: 10, type: 'percent', minOrder: 1000, validUntil: '2026-12-31', description: '১০% ছাড় সর্বোচ্চ ৳১০০০' },
    { id: 'c4', code: 'FLASH15', amount: 15, type: 'percent', minOrder: 500, validUntil: '2026-12-31', description: 'Flash sale এ ১৫% অতিরিক্ত ছাড়' }
];

/* ----- Default admin-managed settings ----- */

const DEFAULT_SITE_INFO = {
    siteName: 'My Daraz',
    siteLogoUrl: '',
    bannerUrl: [
        'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=70',
        'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=70',
        'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=70'
    ],
    footerColor: '#1c5520',
    footerLogo1Url: '',
    footerLogo2Url: ''
};

const DEFAULT_CONTACT_INFO = {
    phone: '+880 1700-000000',
    email: 'support@mydaraz.bd',
    address: 'Gulshan-1, Dhaka 1212, Bangladesh',
    facebook: 'https://facebook.com',
    youtube: 'https://youtube.com',
    tiktok: 'https://tiktok.com',
    telegram: '',
    whatsapp: ''
};

// Payment accounts admin-managed (shown to users when Prepaid Delivery selected)
const DEFAULT_PAYMENT_ACCOUNTS = {
    bkash:   { number: '01XXXXXXXXX', type: 'Personal', note: 'bKash Send Money' },
    nagad:   { number: '01XXXXXXXXX', type: 'Personal', note: 'Nagad Send Money' },
    rocket:  { number: '01XXXXXXXXX', type: 'Personal', note: 'Rocket Send Money' }
};

// Coins settings — admin controls how coins work
const DEFAULT_COINS_SETTINGS = {
    enabled: true,
    // How much one coin is worth in Taka when used to reduce price
    coinValue: 1,
    // Coins earned per Taka spent (e.g. 1 coin per 100 tk)
    earnPerTk: 100,
    // Maximum % of order total that can be paid with coins
    maxRedeemPercent: 50,
    // Welcome bonus coins given to new users
    welcomeBonus: 50
};

// Offer banner popups (admin-managed). Each: { id, title, body, imageUrl, link, bgColor, active, durationMs }
const DEFAULT_OFFER_BANNERS = [
    {
        id: 'ob1',
        title: '🎉 বিশেষ অফার!',
        body: 'আজকের ফ্ল্যাশ সেলে ৫০% পর্যন্ত ছাড়! দেরি করবেন না।',
        imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=70',
        link: 'flash-sale.html',
        bgColor: '#f85606',
        active: true,
        durationMs: 3000
    }
];

/* ============================================================
   Storage keys
   ============================================================ */
const STORE = {
    products:   'admin_products',
    categories: 'admin_categories',
    coupons:    'admin_coupons',
    siteInfo:   'admin_site_info',
    contact:    'admin_contact_info',
    payments:   'admin_payment_accounts',
    coins:      'admin_coins_settings',
    offers:     'admin_offer_banners',
    userCoins:  'user_coins',          // { [uid]: number }
    coinTxns:   'admin_coin_transactions', // [{ id, uid, userName, type, amount, reason, status, date }]
    paymentsTxns: 'admin_payment_transactions', // [{ id, orderId, uid, userName, method, amount, txnId, status, date }]
    seeded:     'admin_seeded_v1'
};

/* ----- One-time seed (only if never seeded before) ----- */

function ensureSeeded() {
    if (!LS.get(STORE.seeded, false)) {
        if (!LS.get(STORE.products, null))   LS.set(STORE.products, DEMO_PRODUCTS);
        if (!LS.get(STORE.categories, null)) LS.set(STORE.categories, DEMO_CATEGORIES);
        if (!LS.get(STORE.coupons, null))    LS.set(STORE.coupons, DEMO_COUPONS);
        if (!LS.get(STORE.siteInfo, null))   LS.set(STORE.siteInfo, DEFAULT_SITE_INFO);
        if (!LS.get(STORE.contact, null))    LS.set(STORE.contact, DEFAULT_CONTACT_INFO);
        if (!LS.get(STORE.payments, null))   LS.set(STORE.payments, DEFAULT_PAYMENT_ACCOUNTS);
        if (!LS.get(STORE.coins, null))      LS.set(STORE.coins, DEFAULT_COINS_SETTINGS);
        if (!LS.get(STORE.offers, null))     LS.set(STORE.offers, DEFAULT_OFFER_BANNERS);
        LS.set(STORE.seeded, true);
    }
}
ensureSeeded();

/* ============================================================
   Generic store helpers
   ============================================================ */

function readStore(key, fallback) {
    return LS.get(key, fallback);
}
function writeStore(key, value) {
    LS.set(key, value);
}

/* ============================================================
   Categories
   ------------------------------------------------------------
   The admin panel writes to localStorage — that is the single
   source of truth shown to users. We do NOT load from Firestore
   here, because the admin's local edits would otherwise be
   overwritten on every page load. Firestore remains available
   for auth + orders (see store.js), but catalog data is local.
   ============================================================ */

async function fetchCategories() {
    return readStore(STORE.categories, DEMO_CATEGORIES);
}

function saveCategoriesLocal(list) { writeStore(STORE.categories, list); }

/* ============================================================
   Products
   ============================================================ */

async function fetchProducts() {
    return readStore(STORE.products, DEMO_PRODUCTS);
}

async function fetchProductById(id) {
    const local = readStore(STORE.products, []);
    const found = local.find(p => p.id === id);
    if (found) return found;
    return null;
}

function saveProductsLocal(list) { writeStore(STORE.products, list); }

/* ============================================================
   Coupons
   ============================================================ */

async function fetchCoupons() {
    return readStore(STORE.coupons, DEMO_COUPONS);
}

function saveCouponsLocal(list) { writeStore(STORE.coupons, list); }

function validateCoupon(code, cartTotal) {
    const coupons = readStore(STORE.coupons, DEMO_COUPONS);
    const c = coupons.find(c => c.code.toUpperCase() === (code || '').toUpperCase());
    if (!c) return { valid: false, message: 'Invalid coupon code' };
    if (cartTotal < (c.minOrder || 0)) return { valid: false, message: `Minimum order ৳${c.minOrder} required` };
    if (c.validUntil && new Date(c.validUntil) < new Date()) return { valid: false, message: 'Coupon expired' };
    const discount = c.type === 'fixed' ? (c.amount || 0) : Math.min((cartTotal * (c.amount || 0)) / 100, 1000);
    return { valid: true, discount: Math.round(discount), coupon: c };
}

/* ============================================================
   Site info / contact / payment accounts / coins / offers
   ============================================================ */

async function fetchSiteInfo() {
    return readStore(STORE.siteInfo, DEFAULT_SITE_INFO);
}

async function fetchContactInfo() {
    return readStore(STORE.contact, DEFAULT_CONTACT_INFO);
}

async function fetchPaymentAccounts() {
    return readStore(STORE.payments, DEFAULT_PAYMENT_ACCOUNTS);
}

async function fetchCoinsSettings() {
    return readStore(STORE.coins, DEFAULT_COINS_SETTINGS);
}

async function fetchOfferBanners() {
    return readStore(STORE.offers, DEFAULT_OFFER_BANNERS);
}

/* ============================================================
   Free product (preserved from original)
   ============================================================ */

let freeProductLink = '#';
async function fetchFreeProduct() {
    if (db) {
        try {
            const doc = await db.collection('settings').doc('freeProduct').get();
            if (doc.exists) {
                const d = doc.data();
                freeProductLink = d.btnLink || '#';
                return d;
            }
        } catch (e) {}
    }
    const data = {
        title: 'MY FREEBIE',
        imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=70',
        claimedText: '1,245',
        originalPrice: '999',
        amountCut: '999',
        amountRemaining: '0',
        progressPercentage: 100,
        btnText: 'CLAIM NOW',
        btnLink: '#'
    };
    freeProductLink = data.btnLink;
    return data;
}
