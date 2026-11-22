/* ============================================================
   My Daraz — Wishlist Logic
   ============================================================ */

function getWishlist() { return AppState.wishlist || []; }

function saveWishlist() {
    LS.set('wishlist', AppState.wishlist);
    if (AppState.user && db) {
        const uid = AppState.user.uid;
        if (uid.startsWith('demo-')) return;
        try {
            db.collection('wishlists').doc(uid).set({
                items: AppState.wishlist,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true }).catch(() => {});
        } catch (e) {}
    }
    Bus.emit('wishlistChanged');
}

async function loadWishlist() {
    AppState.wishlist = LS.get('wishlist', []);
    if (AppState.user && db) {
        const uid = AppState.user.uid;
        if (!uid.startsWith('demo-')) {
            try {
                const doc = await db.collection('wishlists').doc(uid).get();
                if (doc.exists && doc.data().items) {
                    AppState.wishlist = doc.data().items;
                    LS.set('wishlist', AppState.wishlist);
                }
            } catch (e) {}
        }
    }
    Bus.emit('wishlistChanged');
}

function toggleWishlist(product) {
    if (!product) return;
    const idx = AppState.wishlist.findIndex(w => w.id === product.id);
    if (idx >= 0) {
        AppState.wishlist.splice(idx, 1);
        showToast('Removed from wishlist', 'info');
    } else {
        AppState.wishlist.push({
            id: product.id,
            name: product.name,
            imageUrl: product.imageUrl,
            price: Number(product.price) || 0,
            oldPrice: Number(product.oldPrice) || 0,
            discount: product.discount || 0,
            category: product.category,
            category_en: product.category_en,
            rating: product.rating || 0,
            link: product.link || ''
        });
        showToast('Added to wishlist', 'success');
    }
    saveWishlist();
}

function isInWishlist(id) {
    return AppState.wishlist.some(w => w.id === id);
}

function removeFromWishlist(id) {
    AppState.wishlist = AppState.wishlist.filter(w => w.id !== id);
    saveWishlist();
}
