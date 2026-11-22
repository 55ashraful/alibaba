/* ============================================================
   My Daraz — Internationalization (Bengali + English)
   ============================================================ */

const I18N = {
    bn: {
        // Header
        'nav.home': 'হোম',
        'nav.categories': 'ক্যাটাগরি',
        'nav.cart': 'কার্ট',
        'nav.wishlist': 'উইশলিস্ট',
        'nav.orders': 'অর্ডার',
        'nav.profile': 'প্রোফাইল',
        'nav.coins': 'কয়েন',
        'nav.notifications': 'নোটিফিকেশন',
        'nav.coupons': 'কুপন',
        'nav.compare': 'তুলনা',
        'nav.admin': 'অ্যাডমিন',
        'nav.logout': 'লগআউট',
        'nav.login': 'লগইন',
        'nav.register': 'রেজিস্টার',
        'nav.about': 'আমাদের সম্পর্কে',
        'nav.contact': 'যোগাযোগ',
        'nav.faq': 'প্রশ্নোত্তর',
        'nav.privacy': 'প্রাইভেসি পলিসি',
        'nav.terms': 'শর্তাবলী',
        'nav.flashSale': 'ফ্ল্যাশ সেল',
        'nav.freeGift': 'ফ্রি গিফট',

        // Common
        'common.search': 'Daraz-এ খুঁজুন...',
        'common.seeAll': 'সব দেখুন',
        'common.addToCart': 'কার্টে যোগ করুন',
        'common.buyNow': 'এখনই কিনুন',
        'common.orderNow': 'অর্ডার করুন',
        'common.save': 'সেভ করুন',
        'common.cancel': 'বাতিল',
        'common.confirm': 'নিশ্চিত করুন',
        'common.delete': 'ডিলিট',
        'common.edit': 'এডিট',
        'common.close': 'বন্ধ',
        'common.loading': 'লোড হচ্ছে...',
        'common.empty': 'কিছু পাওয়া যায়নি',
        'common.sold': 'বিক্রি হয়েছে',
        'common.reviews': 'রিভিউ',
        'common.qty': 'পরিমাণ',
        'common.total': 'মোট',
        'common.subtotal': 'সাবটোটাল',
        'common.shipping': 'শিপিং',
        'common.free': 'ফ্রি',
        'common.back': 'পেছনে',
        'common.next': 'পরবর্তী',
        'common.previous': 'পূর্ববর্তী',
        'common.yes': 'হ্যাঁ',
        'common.no': 'না',
        'common.viewAll': 'সব দেখুন',
        'common.apply': 'প্রয়োগ করুন',
        'common.claim': 'ক্লেইম করুন',
        'common.copied': 'কপি হয়েছে!',
        'common.copy': 'কপি',
        'common.share': 'শেয়ার',

        // Auth
        'auth.welcome': 'স্বাগতম!',
        'auth.email': 'ইমেইল',
        'auth.password': 'পাসওয়ার্ড',
        'auth.name': 'সম্পূর্ণ নাম',
        'auth.phone': 'ফোন নম্বর',
        'auth.loginBtn': 'লগইন',
        'auth.registerBtn': 'রেজিস্টার',
        'auth.noAccount': 'অ্যাকাউন্ট নেই?',
        'auth.hasAccount': 'অ্যাকাউন্ট আছে?',
        'auth.registerHere': 'রেজিস্টার করুন',
        'auth.loginHere': 'লগইন করুন',
        'auth.googleLogin': 'Google দিয়ে লগইন',
        'auth.loginSuccess': 'লগইন সফল হয়েছে!',
        'auth.loginFailed': 'লগইন করতে সমস্যা হয়েছে',
        'auth.registerSuccess': 'রেজিস্ট্রেশন সফল!',
        'auth.allFields': 'অনুগ্রহ করে সকল তথ্য পূরণ করুন।',
        'auth.emailPassword': 'ইমেইল এবং পাসওয়ার্ড দিন।',

        // Cart
        'cart.title': 'আমার কার্ট',
        'cart.empty': 'আপনার কার্ট খালি',
        'cart.emptyHint': 'কেনাকাটা শুরু করতে হোম পেজে যান',
        'cart.checkout': 'চেকআউট করুন',
        'cart.coupon': 'কুপন কোড',
        'cart.removeItem': 'সরান',
        'cart.addedSuccess': 'কার্টে যোগ হয়েছে!',
        'cart.total': 'মোট',

        // Checkout
        'checkout.title': 'চেকআউট',
        'checkout.address': 'ডেলিভারি ঠিকানা',
        'checkout.payment': 'পেমেন্ট মেথড',
        'checkout.review': 'অর্ডার রিভিউ',
        'checkout.cod': 'ক্যাশ অন ডেলিভারি',
        'checkout.online': 'অনলাইন পেমেন্ট',
        'checkout.homeDelivery': 'হোম ডেলিভারি',
        'checkout.prepaid': 'প্রিপেইড ডেলিভারি',
        'checkout.placeOrder': 'অর্ডার ফাইনাল করুন',
        'checkout.success': 'অর্ডার সফলভাবে সম্পন্ন হয়েছে!',
        'checkout.addAddress': 'নতুন ঠিকানা যোগ করুন',

        // Product
        'product.specifications': 'স্পেসিফিকেশন',
        'product.description': 'বিবরণ',
        'product.reviews': 'রিভিউ',
        'product.relatedProducts': 'সম্পর্কিত পণ্য',
        'product.inStock': 'স্টকে আছে',
        'product.outStock': 'স্টকে নেই',
        'product.writeReview': 'রিভিউ লিখুন',

        // Flash sale
        'flash.title': 'ফ্ল্যাশ সেল',
        'flash.endsIn': 'শেষ হবে',
        'flash.hours': 'ঘন্টা',
        'flash.mins': 'মিনিট',
        'flash.secs': 'সেকেন্ড',

        // Coins (replaces wallet)
        'coins.title': 'আমার কয়েন',
        'coins.balance': 'বর্তমান কয়েন',
        'coins.history': 'কয়েন হিস্ট্রি',
        'coins.earnTip': 'অর্ডার করলে কয়েন পাবেন, কয়েন দিয়ে প্রোডাক্টের দাম কমাতে পারবেন।',
        'coins.empty': 'এখনো কোনো কয়েন নেই',

        // Notifications
        'notif.title': 'নোটিফিকেশন',
        'notif.empty': 'কোনো নোটিফিকেশন নেই',
        'notif.markRead': 'সব পড়া হয়েছে মার্ক করুন',

        // Profile
        'profile.title': 'আমার প্রোফাইল',
        'profile.name': 'নাম',
        'profile.phone': 'ফোন',
        'profile.email': 'ইমেইল',
        'profile.save': 'প্রোফাইল সেভ করুন',
        'profile.deleteAccount': 'অ্যাকাউন্ট ডিলিট করুন',
        'profile.saved': 'প্রোফাইল সফলভাবে আপডেট হয়েছে!',
        'profile.deleteConfirm': 'আপনি কি নিশ্চিত? আপনার অ্যাকাউন্ট স্থায়ীভাবে মুছে যাবে।',

        // Compare
        'compare.title': 'পণ্য তুলনা',
        'compare.empty': 'তুলনা করার জন্য পণ্য যোগ করুন',
        'compare.price': 'দাম',
        'compare.brand': 'ব্র্যান্ড',
        'compare.category': 'ক্যাটাগরি',
        'compare.rating': 'রেটিং',

        // Footer
        'footer.customerService': 'কাস্টমার সার্ভিস',
        'footer.about': 'My Daraz সম্পর্কে',
        'footer.payment': 'পেমেন্ট',
        'footer.followUs': 'ফলো করুন',
        'footer.download': 'অ্যাপ ডাউনলোড',
        'footer.rights': '© 2026 My Daraz. সর্বস্বত্ব সংরক্ষিত।'
    },
    en: {
        'nav.home': 'Home',
        'nav.categories': 'Categories',
        'nav.cart': 'Cart',
        'nav.wishlist': 'Wishlist',
        'nav.orders': 'My Orders',
        'nav.profile': 'Profile',
        'nav.coins': 'Coins',
        'nav.notifications': 'Notifications',
        'nav.coupons': 'Coupons',
        'nav.compare': 'Compare',
        'nav.admin': 'Admin',
        'nav.logout': 'Logout',
        'nav.login': 'Login',
        'nav.register': 'Register',
        'nav.about': 'About Us',
        'nav.contact': 'Contact',
        'nav.faq': 'FAQ',
        'nav.privacy': 'Privacy Policy',
        'nav.terms': 'Terms',
        'nav.flashSale': 'Flash Sale',
        'nav.freeGift': 'Free Gift',

        'common.search': 'Search in Daraz...',
        'common.seeAll': 'See All',
        'common.addToCart': 'Add to Cart',
        'common.buyNow': 'Buy Now',
        'common.orderNow': 'Order Now',
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.confirm': 'Confirm',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.close': 'Close',
        'common.loading': 'Loading...',
        'common.empty': 'Nothing found',
        'common.sold': 'sold',
        'common.reviews': 'reviews',
        'common.qty': 'Quantity',
        'common.total': 'Total',
        'common.subtotal': 'Subtotal',
        'common.shipping': 'Shipping',
        'common.free': 'FREE',
        'common.back': 'Back',
        'common.next': 'Next',
        'common.previous': 'Previous',
        'common.yes': 'Yes',
        'common.no': 'No',
        'common.viewAll': 'View All',
        'common.apply': 'Apply',
        'common.claim': 'Claim',
        'common.copied': 'Copied!',
        'common.copy': 'Copy',
        'common.share': 'Share',

        'auth.welcome': 'Welcome!',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.name': 'Full Name',
        'auth.phone': 'Phone Number',
        'auth.loginBtn': 'Login',
        'auth.registerBtn': 'Register',
        'auth.noAccount': "Don't have an account?",
        'auth.hasAccount': 'Already have an account?',
        'auth.registerHere': 'Register here',
        'auth.loginHere': 'Login here',
        'auth.googleLogin': 'Sign in with Google',
        'auth.loginSuccess': 'Login successful!',
        'auth.loginFailed': 'Login failed',
        'auth.registerSuccess': 'Registration successful!',
        'auth.allFields': 'Please fill in all fields.',
        'auth.emailPassword': 'Enter email and password.',

        'cart.title': 'My Cart',
        'cart.empty': 'Your cart is empty',
        'cart.emptyHint': 'Go to home page to start shopping',
        'cart.checkout': 'Checkout',
        'cart.coupon': 'Coupon Code',
        'cart.removeItem': 'Remove',
        'cart.addedSuccess': 'Added to cart!',
        'cart.total': 'Total',

        'checkout.title': 'Checkout',
        'checkout.address': 'Delivery Address',
        'checkout.payment': 'Payment Method',
        'checkout.review': 'Order Review',
        'checkout.cod': 'Cash on Delivery',
        'checkout.online': 'Online Payment',
        'checkout.homeDelivery': 'Home Delivery',
        'checkout.prepaid': 'Prepaid Delivery',
        'checkout.placeOrder': 'Place Order',
        'checkout.success': 'Order placed successfully!',
        'checkout.addAddress': 'Add New Address',

        'product.specifications': 'Specifications',
        'product.description': 'Description',
        'product.reviews': 'Reviews',
        'product.relatedProducts': 'Related Products',
        'product.inStock': 'In Stock',
        'product.outStock': 'Out of Stock',
        'product.writeReview': 'Write a Review',

        'flash.title': 'Flash Sale',
        'flash.endsIn': 'Ends in',
        'flash.hours': 'h',
        'flash.mins': 'm',
        'flash.secs': 's',

        'coins.title': 'My Coins',
        'coins.balance': 'Current Coins',
        'coins.history': 'Coin History',
        'coins.earnTip': 'Earn coins on every order and use them to reduce product prices.',
        'coins.empty': 'No coins yet',

        'notif.title': 'Notifications',
        'notif.empty': 'No notifications',
        'notif.markRead': 'Mark all as read',

        'profile.title': 'My Profile',
        'profile.name': 'Name',
        'profile.phone': 'Phone',
        'profile.email': 'Email',
        'profile.save': 'Save Profile',
        'profile.deleteAccount': 'Delete Account',
        'profile.saved': 'Profile updated successfully!',
        'profile.deleteConfirm': 'Are you sure? Your account will be permanently deleted.',

        'compare.title': 'Compare Products',
        'compare.empty': 'Add products to compare',
        'compare.price': 'Price',
        'compare.brand': 'Brand',
        'compare.category': 'Category',
        'compare.rating': 'Rating',

        'footer.customerService': 'Customer Service',
        'footer.about': 'About My Daraz',
        'footer.payment': 'Payment',
        'footer.followUs': 'Follow Us',
        'footer.download': 'Download App',
        'footer.rights': '© 2026 My Daraz. All Rights Reserved.'
    }
};

function t(key) {
    const lang = AppState.language || 'bn';
    return (I18N[lang] && I18N[lang][key]) || (I18N.bn[key] || key);
}

function setLanguage(lang) {
    AppState.language = lang;
    localStorage.setItem('md_lang', lang);
    document.documentElement.lang = lang === 'bn' ? 'bn' : 'en';
    Bus.emit('languageChanged', lang);
}

function toggleLanguage() {
    setLanguage(AppState.language === 'bn' ? 'en' : 'bn');
}

// Apply data-i18n attributes after page load
function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });
}

Bus.on('languageChanged', () => applyI18n());
