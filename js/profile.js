/* ============================================================
   My Daraz — Profile Page
   ============================================================ */

let newProfilePicFile = null;

async function initProfilePage() {
    if (!AppState.user) {
        setTimeout(() => { window.location.href = baseUrl('login.html?next=profile.html'); }, 400);
        return;
    }
    renderProfilePage();
    hideSplash();
}

function renderProfilePage() {
    const host = document.getElementById('profile-host');
    if (!host) return;
    const u = AppState.user;
    const d = AppState.userData || {};
    const photo = d.photoURL || u.photoURL || DEFAULT_AVATAR;
    const isAdmin = isUserAdmin();
    const ordersCount = LS.get('orders', []).filter(o => o.userId === u.uid).length;
    const wishlistCount = AppState.wishlist.length;
    const userCoins = getUserCoins(u.uid);

    host.innerHTML = `
        <div class="profile-page">
            <div class="profile-side">
                <img class="profile-avatar" src="${photo}" alt="">
                <div class="profile-name">${d.displayName || u.displayName || 'User'}</div>
                <div class="profile-email">${d.email || u.email || ''}</div>
                ${isAdmin ? `<span class="badge badge-orange mt-2">Admin</span>` : ''}
                <div class="profile-stats">
                    <div class="stat-item"><div class="num">${bn(ordersCount)}</div><div class="label">Orders</div></div>
                    <div class="stat-item"><div class="num">${bn(wishlistCount)}</div><div class="label">Wishlist</div></div>
                    <div class="stat-item"><div class="num">🪙 ${bn(userCoins)}</div><div class="label">Coins</div></div>
                </div>
                <div class="profile-menu">
                    <a class="pm-link" href="${baseUrl('orders.html')}"><span class="icon">📦</span>${t('nav.orders')}<span class="chevron">›</span></a>
                    <a class="pm-link" href="${baseUrl('wishlist.html')}"><span class="icon">❤</span>${t('nav.wishlist')}<span class="chevron">›</span></a>
                    <a class="pm-link" href="${baseUrl('coins.html')}"><span class="icon">🪙</span>${t('nav.coins')}<span class="chevron">›</span></a>
                    <a class="pm-link" href="${baseUrl('coupons.html')}"><span class="icon">🎟</span>${t('nav.coupons')}<span class="chevron">›</span></a>
                    <a class="pm-link" href="${baseUrl('notifications.html')}"><span class="icon">🔔</span>${t('nav.notifications')}<span class="chevron">›</span></a>
                    <a class="pm-link" href="${baseUrl('compare.html')}"><span class="icon">⚖</span>${t('nav.compare')}<span class="chevron">›</span></a>
                    ${isAdmin ? `<a class="pm-link" href="${baseUrl('admin.html')}"><span class="icon">🛠</span>${t('nav.admin')}<span class="chevron">›</span></a>` : ''}
                    <a class="pm-link" href="javascript:void(0)" onclick="logoutUser()"><span class="icon">🚪</span>${t('nav.logout')}</a>
                </div>
            </div>
            <div class="profile-main">
                <h2>${t('profile.title')}</h2>
                <div style="text-align:center;margin-bottom:var(--sp-4);">
                    <img id="profile-pic-display" class="avatar avatar-lg" src="${photo}" alt="">
                    <div style="margin-top:var(--sp-2);">
                        <input type="file" id="profilePicInput" accept="image/*" style="display:none;">
                        <label for="profilePicInput" class="btn btn-sm btn-outline">${t('common.edit')} Photo</label>
                    </div>
                </div>
                <div class="admin-form-row two">
                    <div>
                        <label class="label">${t('profile.name')}</label>
                        <input type="text" id="userNameInput" class="input" value="${d.displayName || u.displayName || ''}">
                    </div>
                    <div>
                        <label class="label">${t('profile.phone')}</label>
                        <input type="tel" id="userPhoneInput" class="input" value="${d.phone || ''}">
                    </div>
                </div>
                <div class="admin-form-row two">
                    <div>
                        <label class="label">${t('profile.email')}</label>
                        <input type="email" id="userEmailInput" class="input" value="${d.email || u.email || ''}" disabled>
                    </div>
                    <div>
                        <label class="label">Language</label>
                        <select class="select" onchange="setLanguage(this.value)">
                            <option value="bn" ${AppState.language === 'bn' ? 'selected' : ''}>বাংলা</option>
                            <option value="en" ${AppState.language === 'en' ? 'selected' : ''}>English</option>
                        </select>
                    </div>
                </div>
                <div class="admin-form-row two">
                    <div>
                        <label class="label">Theme</label>
                        <select class="select" onchange="applyTheme(this.value)">
                            <option value="light" ${AppState.theme === 'light' ? 'selected' : ''}>Light</option>
                            <option value="dark" ${AppState.theme === 'dark' ? 'selected' : ''}>Dark</option>
                        </select>
                    </div>
                </div>
                <div class="mt-4" style="display:flex;gap:var(--sp-2);flex-wrap:wrap;">
                    <button class="btn" onclick="saveProfileChanges()">${t('profile.save')}</button>
                    <button class="btn btn-danger" onclick="deleteAccount()">${t('profile.deleteAccount')}</button>
                </div>
            </div>
        </div>
    `;
    // Wire up photo input
    const input = document.getElementById('profilePicInput');
    if (input) {
        input.addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;
            newProfilePicFile = file;
            const reader = new FileReader();
            reader.onload = ev => { document.getElementById('profile-pic-display').src = ev.target.result; };
            reader.readAsDataURL(file);
        });
    }
}

async function saveProfileChanges() {
    const name = document.getElementById('userNameInput').value.trim();
    const phone = document.getElementById('userPhoneInput').value.trim();
    if (!name) { showToast('Name is required', 'warning'); return; }

    let photoURL = document.getElementById('profile-pic-display').src;
    if (newProfilePicFile) {
        // Upload to ImgBB if available
        try {
            const formData = new FormData();
            formData.append('image', newProfilePicFile);
            const resp = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: formData });
            const result = await resp.json();
            if (result.success) {
                photoURL = result.data.url;
            } else {
                // Use data URL as fallback
                photoURL = document.getElementById('profile-pic-display').src;
            }
        } catch (e) {
            // Keep data URL fallback
            photoURL = document.getElementById('profile-pic-display').src;
        }
    }
    await updateProfile({ name, phone, photoURL });
    newProfilePicFile = null;
    renderProfilePage();
}
