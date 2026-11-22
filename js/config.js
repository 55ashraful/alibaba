/* ============================================================
   My Daraz — Firebase Config + Global Setup
   Loads first on every page.
   ============================================================ */

// Firebase configuration (preserved from original project)
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyAVFJyAI2q946P2l57xwFN1DXQ54D7a7g0",
    authDomain: "my-daraz-d216e.firebaseapp.com",
    databaseURL: "https://my-daraz-d216e-default-rtdb.firebaseio.com",
    projectId: "my-daraz-d216e",
    storageBucket: "my-daraz-d216e.firebasestorage.app",
    messagingSenderId: "316479124711",
    appId: "1:316479124711:web:cc80d8d3aeb3c5e48f9e42",
    measurementId: "G-RTGB9WQC3Y"
};

// ImgBB key (preserved from original project)
const IMGBB_API_KEY = "d617dab9d2117228e38549791d42104a";

// Default avatar fallback
const DEFAULT_AVATAR = "https://i.ibb.co/prRXDJLF/1000097700.png";

// Initialize Firebase
let auth = null, db = null;
try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(FIREBASE_CONFIG);
        auth = firebase.auth();
        db = firebase.firestore();
        // Persist auth across pages by default
        auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(() => {});
    }
} catch (e) {
    console.warn('Firebase init failed — running in demo mode:', e);
}

// Global app state
const AppState = {
    user: null,
    userData: {},
    cart: [],
    wishlist: [],
    compare: [],
    notifications: [],
    language: localStorage.getItem('md_lang') || 'bn',
    theme: localStorage.getItem('md_theme') || 'light',
    allProducts: [],
    allCategories: []
};

// LocalStorage helpers (used as cache so the UI is responsive even when Firestore is slow)
const LS = {
    get(key, fallback) {
        try { const v = localStorage.getItem('md_' + key); return v ? JSON.parse(v) : fallback; }
        catch (e) { return fallback; }
    },
    set(key, value) {
        try { localStorage.setItem('md_' + key, JSON.stringify(value)); }
        catch (e) {}
    },
    remove(key) { localStorage.removeItem('md_' + key); }
};

// Simple event bus for cross-module updates (cart count badge, etc.)
const Bus = {
    _handlers: {},
    on(event, cb) {
        (this._handlers[event] = this._handlers[event] || []).push(cb);
    },
    emit(event, payload) {
        (this._handlers[event] || []).forEach(cb => { try { cb(payload); } catch (e) { console.error(e); } });
    }
};

// Format Bangladeshi Taka
function formatTk(n) {
    const num = Number(n || 0);
    const formatted = num.toLocaleString('en-US');
    return '৳ ' + formatted;
}

// Convert English digits to Bengali
function toBnDigits(s) {
    const map = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
    return String(s).replace(/\d/g, d => map[+d]);
}

// Resolve a value with current language
function bn(s) {
    if (AppState.language === 'bn') return toBnDigits(s);
    return String(s);
}

// URL param helper
function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

// Relative path helper — auto-routes between root and /pages/ subdirectory.
// Inner pages live in /pages/, root pages live at /.
// baseUrl('category.html?id=X') →
//   from root:    './pages/category.html?id=X'
//   from /pages/: './category.html?id=X'
// baseUrl('index.html') →
//   from root:    './index.html'
//   from /pages/: '../index.html'
const INNER_PAGES = ['category.html','product.html','search.html','cart.html','checkout.html','orders.html','order-detail.html','wishlist.html','profile.html','flash-sale.html','coupons.html','coins.html','notifications.html','compare.html','categories.html','free-product.html','admin.html','about.html','contact.html','faq.html','privacy.html','terms.html'];
const ROOT_PAGES = ['index.html','login.html','register.html'];

function baseUrl(path) {
    const inPages = window.location.pathname.includes('/pages/');
    const baseFile = path.split('?')[0].split('#')[0];
    if (inPages) {
        if (INNER_PAGES.includes(baseFile)) return './' + path;
        if (ROOT_PAGES.includes(baseFile)) return '../' + path;
        return './' + path;
    } else {
        if (INNER_PAGES.includes(baseFile)) return './pages/' + path;
        return './' + path;
    }
}
