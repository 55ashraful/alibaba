/* ============================================================
   My Daraz — Compare + Notifications + Orders + Coins
   (Wallet removed — only Coins remain, fully admin-managed)
   ============================================================ */

/* ----- Compare list (max 4 products) ----- */
function getCompare() { return AppState.compare || []; }

function saveCompare() {
    LS.set('compare', AppState.compare);
    Bus.emit('compareChanged');
}

function toggleCompare(product) {
    if (!product) return;
    const idx = AppState.compare.findIndex(p => p.id === product.id);
    if (idx >= 0) {
        AppState.compare.splice(idx, 1);
        showToast('Removed from compare', 'info');
    } else {
        if (AppState.compare.length >= 4) {
            showToast('You can compare up to 4 products', 'warning');
            return;
        }
        AppState.compare.push({
            id: product.id,
            name: product.name,
            imageUrl: product.imageUrl,
            price: Number(product.price) || 0,
            oldPrice: Number(product.oldPrice) || 0,
            brand: product.brand || '',
            category: product.category,
            category_en: product.category_en,
            rating: product.rating || 0,
            ratingCount: product.ratingCount || 0
        });
        showToast('Added to compare', 'success');
    }
    saveCompare();
}

function isInCompare(id) {
    return AppState.compare.some(p => p.id === id);
}

function removeFromCompare(id) {
    AppState.compare = AppState.compare.filter(p => p.id !== id);
    saveCompare();
}

/* ----- Notifications ----- */
const DEMO_NOTIFICATIONS = [
    { id: 'n1', title: 'Order Delivered', body: 'Your order #10245 has been delivered. Enjoy!', icon: '📦', time: Date.now() - 3600000, read: false },
    { id: 'n2', title: 'Flash Sale Live!', body: 'Up to 50% off on smartphones. Hurry up!', icon: '⚡', time: Date.now() - 7200000, read: false },
    { id: 'n3', title: 'Coupon Available', body: 'Use code DARAZ500 to save ৳500 on your next order.', icon: '🎟', time: Date.now() - 86400000, read: true },
    { id: 'n4', title: 'Coins Credited', body: '৫০ কয়েন ওয়েলকাম বোনাস হিসেবে যোগ হয়েছে।', icon: '🪙', time: Date.now() - 172800000, read: true }
];

async function loadNotifications() {
    AppState.notifications = LS.get('notifications', DEMO_NOTIFICATIONS);
    if (AppState.user && db) {
        const uid = AppState.user.uid;
        if (!uid.startsWith('demo-')) {
            try {
                const snap = await db.collection('notifications').where('userId', '==', uid).orderBy('time', 'desc').limit(20).get();
                if (!snap.empty) {
                    AppState.notifications = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                    LS.set('notifications', AppState.notifications);
                }
            } catch (e) {}
        }
    }
    Bus.emit('notificationsChanged');
}

function markAllNotificationsRead() {
    AppState.notifications.forEach(n => n.read = true);
    LS.set('notifications', AppState.notifications);
    Bus.emit('notificationsChanged');
    showToast('All notifications marked as read', 'success');
}

function clearNotifications() {
    AppState.notifications = [];
    LS.set('notifications', AppState.notifications);
    Bus.emit('notificationsChanged');
}

function pushNotification(uid, title, body, icon) {
    const n = { id: 'n' + Date.now(), userId: uid, title, body, icon: icon || '🔔', time: Date.now(), read: false };
    const list = LS.get('notifications', []);
    list.unshift(n);
    LS.set('notifications', list);
    // If admin is viewing notifications list, refresh
    Bus.emit('notificationsChanged');
}

/* ============================================================
   Orders
   ------------------------------------------------------------
   Order object:
   {
     id, userId, items, address,
     payment: 'home' | 'cod' | 'prepaid',
     paymentMethod: 'bkash'|'nagad'|'rocket' (only when payment === 'prepaid'),
     txnId: string (user-entered transaction id, only when prepaid),
     paymentStatus: 'pending' | 'approved' | 'rejected' (only when prepaid),
     coinsUsed: number,
     coinDiscount: number,
     couponCode, subtotal, discount, shipping, coinDiscount, total,
     status: 'Pending'|'Confirmed'|'Shipped'|'Delivered'|'Cancelled',
     orderDate, createdAt
   }
   ============================================================ */

async function placeOrder({ items, address, payment, paymentMethod, txnId, coupon, coinsUsed, coinDiscount }) {
    if (!AppState.user) {
        showToast('Please login to place order', 'warning');
        return null;
    }
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const couponDiscount = coupon ? (coupon.discount || 0) : 0;
    const shipping = subtotal >= 500 ? 0 : 60;
    const afterCoupon = Math.max(0, subtotal - couponDiscount);
    const cDiscount = coinDiscount || 0;
    const total = Math.max(0, afterCoupon - cDiscount) + shipping;

    const order = {
        userId: AppState.user.uid,
        userName: AppState.userData?.displayName || '',
        items,
        address,
        payment,
        paymentMethod: paymentMethod || null,
        txnId: txnId || null,
        paymentStatus: payment === 'prepaid' ? 'pending' : null,
        couponCode: coupon ? coupon.coupon.code : null,
        coinsUsed: coinsUsed || 0,
        coinDiscount: cDiscount,
        subtotal,
        discount: couponDiscount,
        shipping,
        total,
        status: 'Pending',
        orderDate: new Date().toISOString(),
        createdAt: Date.now()
    };

    const orders = LS.get('orders', []);
    order.id = 'ORD-' + Date.now();
    orders.push(order);
    LS.set('orders', orders);

    // If Firestore reachable and not demo, also push there
    if (db && !AppState.user.uid.startsWith('demo-')) {
        try {
            const ref = await db.collection('orders').add({
                ...order,
                orderDate: firebase.firestore.FieldValue.serverTimestamp()
            });
            order.id = ref.id;
            // update local copy with firestore id
            const idx = orders.findIndex(o => o.createdAt === order.createdAt);
            if (idx >= 0) { orders[idx].id = order.id; LS.set('orders', orders); }
        } catch (e) {
            console.warn('Firestore order create failed, kept local only:', e);
        }
    }

    // Deduct used coins immediately (they were reserved at checkout)
    if (coinsUsed && coinsUsed > 0) {
        deductUserCoins(AppState.user.uid, coinsUsed, `Spent on order ${order.id}`);
    }
    // Award coins for this order (per Taka spent, per admin setting)
    const settings = await fetchCoinsSettings();
    if (settings.enabled && total > 0 && settings.earnPerTk > 0) {
        const earned = Math.floor(total / settings.earnPerTk);
        if (earned > 0) {
            addUserCoins(AppState.user.uid, earned, `Coins earned from order ${order.id}`);
        }
    }

    return order;
}

async function fetchUserOrders() {
    if (!AppState.user) return [];
    const uid = AppState.user.uid;
    if (db && !uid.startsWith('demo-')) {
        try {
            const snap = await db.collection('orders').where('userId', '==', uid).get();
            if (!snap.empty) {
                return snap.docs.map(d => ({ id: d.id, ...d.data() }));
            }
        } catch (e) { console.warn(e); }
    }
    return LS.get('orders', []).filter(o => o.userId === uid);
}

async function fetchAllOrders() {
    return LS.get('orders', []);
}

/* ----- Reviews ----- */
async function fetchProductReviews(productId) {
    if (db) {
        try {
            const snap = await db.collection('reviews').where('productId', '==', productId).get();
            if (!snap.empty) return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (e) {}
    }
    return [
        { id: 'r1', productId, userName: 'Rahim Uddin', userPhoto: DEFAULT_AVATAR, rating: 5, comment: 'খুব ভালো পণ্য, দ্রুত ডেলিভারি পেয়েছি।', date: Date.now() - 86400000 * 5 },
        { id: 'r2', productId, userName: 'Karim Ahmed', userPhoto: DEFAULT_AVATAR, rating: 4, comment: 'মান ভালো কিন্তু প্যাকেজিং আরও ভালো হতে পারে।', date: Date.now() - 86400000 * 2 }
    ];
}

async function submitReview(productId, rating, comment) {
    if (!AppState.user) {
        showToast('Please login to submit a review', 'warning');
        return;
    }
    const review = {
        productId,
        userId: AppState.user.uid,
        userName: AppState.userData.displayName || AppState.user.displayName || 'User',
        userPhoto: AppState.userData.photoURL || DEFAULT_AVATAR,
        rating,
        comment,
        date: Date.now()
    };
    if (db && !AppState.user.uid.startsWith('demo-')) {
        try {
            await db.collection('reviews').add(review);
        } catch (e) {
            const reviews = LS.get('reviews_' + productId, []);
            reviews.push(review);
            LS.set('reviews_' + productId, reviews);
        }
    } else {
        const reviews = LS.get('reviews_' + productId, []);
        reviews.push(review);
        LS.set('reviews_' + productId, reviews);
    }
    showToast('Review submitted!', 'success');
}

/* ============================================================
   Coins (replaces Wallet)
   ------------------------------------------------------------
   Stored as { [uid]: number } in localStorage (md_user_coins).
   A separate ledger (md_admin_coin_transactions) keeps a full
   history that the admin can audit.
   ============================================================ */

function getAllUserCoins() {
    return LS.get('user_coins', {});
}
function getUserCoins(uid) {
    const all = getAllUserCoins();
    return all[uid] || 0;
}
function setUserCoins(uid, value) {
    const all = getAllUserCoins();
    all[uid] = Math.max(0, Math.floor(value));
    LS.set('user_coins', all);
    Bus.emit('coinsChanged', { uid, balance: all[uid] });
    return all[uid];
}
function addUserCoins(uid, amount, reason) {
    if (!uid || !amount) return;
    const newBal = getUserCoins(uid) + amount;
    setUserCoins(uid, newBal);
    logCoinTransaction({ uid, userName: getUserNameByUid(uid), type: 'in', amount, reason, status: 'approved' });
    // Notify the user in-app
    pushNotification(uid, '🪙 কয়েন যোগ হয়েছে', `${bn(amount)} কয়েন যোগ হয়েছে। নতুন ব্যালেন্স: ${bn(newBal)} কয়েন`, '🪙');
    return newBal;
}
function deductUserCoins(uid, amount, reason) {
    if (!uid || !amount) return;
    const cur = getUserCoins(uid);
    if (cur < amount) amount = cur; // never go negative
    const newBal = cur - amount;
    setUserCoins(uid, newBal);
    logCoinTransaction({ uid, userName: getUserNameByUid(uid), type: 'out', amount, reason, status: 'approved' });
    return newBal;
}

function getUserNameByUid(uid) {
    const acc = getDemoAccounts().find(a => a.uid === uid);
    if (acc) return acc.displayName;
    if (AppState.user && AppState.user.uid === uid) return AppState.userData?.displayName || AppState.user.displayName || 'User';
    return 'User';
}

/* Coin transaction ledger */
function getCoinTransactions() {
    return LS.get('admin_coin_transactions', []);
}
function logCoinTransaction(txn) {
    const list = getCoinTransactions();
    list.unshift({
        id: 'ct' + Date.now() + Math.floor(Math.random() * 1000),
        date: Date.now(),
        ...txn
    });
    LS.set('admin_coin_transactions', list);
}
function setCoinTransactionStatus(id, status) {
    const list = getCoinTransactions();
    const idx = list.findIndex(t => t.id === id);
    if (idx < 0) return;
    list[idx].status = status;
    LS.set('admin_coin_transactions', list);
}

/* Compute how many coins a user can redeem for a given cart total */
function maxCoinsRedeemable(cartTotal) {
    if (cartTotal <= 0) return 0;
    return Math.max(0, Math.floor(cartTotal * 0.5)); // hard cap: half of total
}

/* Compute Taka discount for a number of coins (per admin coinValue setting) */
function coinsToTk(coins, settings) {
    const s = settings || DEFAULT_COINS_SETTINGS;
    return Math.floor((coins || 0) * (s.coinValue || 0));
}

/* ============================================================
   Payment transactions (Prepaid Delivery approvals)
   ============================================================ */
function getPaymentTransactions() {
    return LS.get('admin_payment_transactions', []);
}
function setPaymentTransactionStatus(id, status) {
    const list = getPaymentTransactions();
    const idx = list.findIndex(t => t.id === id);
    if (idx < 0) return;
    list[idx].status = status;
    list[idx].processedAt = Date.now();
    LS.set('admin_payment_transactions', list);
    // Update order's paymentStatus too
    const orders = LS.get('orders', []);
    const oIdx = orders.findIndex(o => o.id === list[idx].orderId);
    if (oIdx >= 0) {
        orders[oIdx].paymentStatus = status;
        if (status === 'approved' && orders[oIdx].status === 'Pending') {
            orders[oIdx].status = 'Confirmed';
        }
        LS.set('orders', orders);
    }
}
function logPaymentTransaction(txn) {
    const list = getPaymentTransactions();
    list.unshift({ id: 'pt' + Date.now() + Math.floor(Math.random() * 1000), date: Date.now(), status: 'pending', ...txn });
    LS.set('admin_payment_transactions', list);
}

/* ============================================================
   Date / time helpers
   ============================================================ */
function formatDate(ts, withTime = false) {
    if (!ts) return '';
    const d = new Date(typeof ts === 'number' ? ts : (ts.seconds ? ts.seconds * 1000 : Date.now()));
    const opts = { dateStyle: 'medium' };
    if (withTime) opts.timeStyle = 'short';
    try {
        return d.toLocaleString(AppState.language === 'bn' ? 'bn-BD' : 'en-US', opts);
    } catch (e) {
        return d.toLocaleDateString();
    }
}

function timeAgo(ts) {
    if (!ts) return '';
    const diff = Date.now() - (typeof ts === 'number' ? ts : (ts.seconds ? ts.seconds * 1000 : 0));
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return (AppState.language === 'bn' ? toBnDigits(days) + ' দিন আগে' : days + 'd ago');
    if (hours > 0) return (AppState.language === 'bn' ? toBnDigits(hours) + ' ঘন্টা আগে' : hours + 'h ago');
    if (minutes > 0) return (AppState.language === 'bn' ? toBnDigits(minutes) + ' মিনিট আগে' : minutes + 'm ago');
    return AppState.language === 'bn' ? 'এইমাত্র' : 'just now';
}
