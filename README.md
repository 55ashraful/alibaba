# My Daraz — Multi-page E-commerce Website (Bengali + English)

A fully functional Daraz-style e-commerce website built as a **multi-page static site**
with **Firebase Auth + Firestore** backend and a **demo-data fallback** so the site works
even when Firebase is unreachable.

## Project structure

```
my-daraz/
├── index.html                  # Home page (banner, categories, flash sale, products)
├── login.html                  # Login page
├── register.html               # Register page
├── README.md                   # This file
│
├── css/                        # All stylesheets (modular)
│   ├── variables.css           # Theme tokens (light + dark)
│   ├── base.css                # Reset, typography, layout, splash
│   ├── components.css          # Buttons, inputs, cards, badges, modal, toast, etc.
│   ├── header.css              # Header + side menu + search bar
│   ├── footer.css              # Footer
│   ├── home.css                # Home: banner, categories, product grid, flash sale
│   ├── product.css             # Product detail page
│   ├── cart.css                # Cart + checkout + order confirmation
│   ├── account.css             # Profile, wallet, wishlist, orders, coupons, notifications, compare, search, flash sale
│   ├── admin.css               # Admin dashboard
│   ├── chat.css                # Live chat widget
│   └── responsive.css          # Media queries
│
├── js/                         # All scripts (modular)
│   ├── config.js               # Firebase config + global state + helpers
│   ├── i18n.js                 # Bengali + English translations
│   ├── theme.js                # Dark / light theme toggle
│   ├── auth.js                 # Login / register / logout / Google / demo fallback
│   ├── db.js                   # Data layer (admin-managed via localStorage)
│   ├── ui.js                   # Header / footer / side-menu / toast / modal injection
│   ├── store.js                # Compare, notifications, orders, reviews, coins helpers
│   ├── cart.js                 # Cart logic (local + Firestore sync)
│   ├── wishlist.js             # Wishlist logic
│   ├── common.js               # Bootstrap that runs on every page
│   ├── home.js                 # Home page logic + product card renderer + offer popup
│   ├── category.js             # Category page
│   ├── product.js              # Product detail page
│   ├── search.js               # Search page with filters
│   ├── cart-page.js            # Cart page renderer
│   ├── checkout.js             # Checkout flow (Home Delivery / COD / Prepaid)
│   ├── orders.js               # Orders + order detail
│   ├── profile.js              # Profile page
│   ├── wishlist-page.js        # Wishlist page renderer
│   ├── flash-sale.js           # Flash sale page
│   ├── coupons.js              # Coupons page
│   ├── coins.js                # Coins page (replaces wallet)
│   ├── notifications.js        # Notifications page
│   ├── compare.js              # Compare page
│   ├── admin.js                # Admin dashboard (full control)
│   └── live-chat.js            # Live chat widget
│
└── pages/                      # All inner pages (linked with ../css and ../js)
    ├── category.html
    ├── product.html
    ├── search.html
    ├── cart.html
    ├── checkout.html
    ├── orders.html
    ├── order-detail.html
    ├── wishlist.html
    ├── profile.html
    ├── flash-sale.html
    ├── coupons.html
    ├── wallet.html
    ├── notifications.html
    ├── compare.html
    ├── categories.html
    ├── free-product.html       # Original freebie page (purple gradient)
    ├── admin.html
    ├── about.html
    ├── contact.html
    ├── faq.html
    ├── privacy.html
    └── terms.html
```

Total: **23 HTML pages** + **12 CSS files** + **22 JS files** = **57 files** + README.

## How to run

### Option 1: Just open `index.html`
Open the file in any modern browser. Firebase will load from CDN. Demo accounts
will work if Firebase is unreachable.

### Option 2: Local server (recommended)
```bash
cd my-daraz
python3 -m http.server 8000
# Visit http://localhost:8000
```

## Demo accounts

Because Firebase may not be configured to accept new users on the original project,
the site automatically falls back to demo accounts:

| Role  | Email                | Password   |
|-------|----------------------|------------|
| User  | user@daraz.local     | user123    |
| Admin | admin@daraz.local    | admin123   |

You can also register a new account — it will be saved to localStorage so you stay
logged in across pages.

## Features

### Shopping
- **Home page** — banner slider, quick category icons, flash sale section with countdown,
  category-wise product sections
- **Category page** — filter products by category
- **Product detail** — image gallery, variant selector, quantity, specs, reviews,
  rating summary, related products, add to cart / wishlist / compare / buy now
- **Search** — keyword search + brand/category/price filters + sorting
- **Flash sale page** — products grouped by discount tier with live countdown
- **Compare page** — side-by-side comparison of up to 4 products
- **Categories index page** — all categories in one grid

### Cart & Checkout
- **Cart** — add/remove items, quantity control, coupon code, live total + shipping
- **Checkout** — multiple saved addresses, three payment options:
  - **Home Delivery** — pay cash at home on delivery
  - **Cash on Delivery (COD)** — pay cash when courier arrives
  - **Prepaid Delivery** — bKash / Nagad / Rocket Send Money (admin-set account
    numbers shown to user, user pastes TrxID and confirms, order stays **Pending**
    until admin approves the payment in the Admin Panel)
- **Coins** — admin-controlled loyalty coins (no wallet): users earn coins per order,
  can redeem coins to reduce product price at checkout
- **Free shipping** on orders over ৳500, otherwise ৳60 flat

### Account
- **Profile** — edit name, phone, photo (uploaded to ImgBB), language, theme, view
  stats, logout, delete account
- **Orders** — list of past orders with status badge, cancel pending order
- **Order detail** — tracking progress (Placed → Confirmed → Shipped → Out for
  Delivery → Delivered), address, items, payment summary; prepaid orders show
  payment status (pending / approved / rejected) and TrxID
- **Wishlist** — saved products, add to cart, remove
- **Coins** — coin balance, how-to-earn info, full coin transaction history
  (admin can give bonus coins to any user from the Admin Panel)
- **Coupons** — copy code to clipboard, validity & min order shown
- **Notifications** — in-app bell with unread badge, mark all read, clear

### Admin (requires admin login)
- **Dashboard** — stats (products, orders, pending payments, revenue) + recent orders
- **Products** — add / edit / delete products with full form (real, saved to localStorage)
- **Categories** — add / edit / delete categories
- **Orders** — list all orders, change status from dropdown
- **Payment Approvals** — approve / reject Prepaid Delivery payments
  (when admin approves, order auto-confirmed; user sees status in order detail)
- **Users** — list, give bonus coins, delete users
- **Coupons** — add / edit / delete coupons
- **Payment Accounts** — set bKash / Nagad / Rocket account numbers and notes
  (shown to users at checkout when they pick Prepaid Delivery)
- **Offer Banners** — add / edit / delete home-page popup offers
  (each shows once per session, auto-dismiss after a duration the admin sets, X button)
- **Coins** — toggle the whole coins system, set coin value, earn rate, max redeem %,
  welcome bonus; view recent coin transactions
- **Settings** — site info, footer color, banner URLs, contact info, social links

### Cross-cutting
- **Bilingual (Bangla + English)** — toggle in side menu, persisted to localStorage,
  every UI string translated
- **Dark / light theme** — toggle in side menu, persisted
- **Live chat widget** — bot replies to common keywords (order, delivery, payment,
  coupon, etc.) on every page
- **Responsive** — mobile-first, works on phone / tablet / desktop
- **Splash screen** — orange branding splash on every page
- **Toasts** — success / error / info / warning notifications
- **Modals** — for order placement, address entry, review submission, wallet top-up

## Data storage

The site stores all admin-managed data in `localStorage` (keys prefixed `md_admin_*`):

- `md_admin_products` — all products (add/edit/delete in admin panel)
- `md_admin_categories` — all categories
- `md_admin_coupons` — all coupons
- `md_admin_site_info` — site name, logo, footer color, banner URLs
- `md_admin_contact_info` — phone, email, address, social links
- `md_admin_payment_accounts` — bKash / Nagad / Rocket numbers shown at checkout
- `md_admin_offer_banners` — home-page popup offer banners
- `md_admin_coins_settings` — coins system config (value, earn rate, welcome bonus)
- `md_admin_payment_transactions` — Prepaid payment approvals queue
- `md_admin_coin_transactions` — full coin ledger (audit)
- `md_user_coins` — `{ [uid]: number }` coin balances
- `md_orders` — all orders
- `md_cart`, `md_wishlist`, `md_compare`, `md_notifications` — per-browser data

On the very first run, `js/db.js` seeds the demo catalog (DEMO_PRODUCTS, DEMO_CATEGORIES,
DEMO_COUPONS) and default settings ONCE — after that the admin panel is the single
source of truth. If a real Firestore project is configured and reachable, the site
tries Firestore first and mirrors to localStorage.

## Firebase collections (optional, when Firestore is reachable)

- `users/{uid}` — displayName, email, phone, photoURL, role
- `carts/{uid}` — items[]
- `wishlists/{uid}` — items[]
- `addresses/{uid}` — list[]
- `orders/{orderId}` — items, address, payment, paymentMethod, txnId, paymentStatus,
  coinsUsed, coinDiscount, status, totals, etc.
- `notifications/{notifId}` — userId, title, body, time, read
- `reviews/{reviewId}` — productId, userId, userName, rating, comment
- `categories/{categoryId}` — name, name_en, imageUrl
- `products/{productId}` — name, brand, price, oldPrice, discount, imageUrl, etc.
- `coupons/{couponId}` — code, amount, type, minOrder, validUntil
- `settings/siteInfo` — siteName, siteLogoUrl, bannerUrl[], footerColor, etc.
- `settings/contactInfo` — phone, email, address, social links
- `settings/freeProduct` — original freebie config

If any collection is empty or unreachable, the localStorage data above is shown.

## Notes

- **Firebase config** is preserved from the original `index.html`. If the original
  project is closed or quotas are exceeded, the site still works using the demo
  fallback (localStorage).
- **ImgBB API key** is preserved from the original (used for profile photo uploads).
- **Swiper** is loaded from CDN for the home banner slider.
- No build step required — everything runs as static files.

## Browser support

Tested in modern Chrome, Firefox, Edge, Safari. Mobile browsers (Chrome Android,
Safari iOS) fully supported.
