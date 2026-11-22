/* ============================================================
   My Daraz — Auth (Login / Register / Logout / Google)
   ============================================================ */

// Demo accounts (so the site works without a real Firebase project being open)
// Real Firebase auth is tried first; if it fails (e.g. project closed), the
// demo fallback is used so the user can still browse the site.
const DEMO_ACCOUNTS_KEY = 'md_demo_accounts';

function getDemoAccounts() {
    return LS.get('demo_accounts', [
        {
            uid: 'demo-admin',
            displayName: 'Demo Admin',
            email: 'admin@daraz.local',
            password: 'admin123',
            phone: '01700000000',
            photoURL: DEFAULT_AVATAR,
            role: 'admin'
        },
        {
            uid: 'demo-user',
            displayName: 'Demo User',
            email: 'user@daraz.local',
            password: 'user123',
            phone: '01711111111',
            photoURL: DEFAULT_AVATAR,
            role: 'user'
        }
    ]);
}

function saveDemoAccounts(list) { LS.set('demo_accounts', list); }

// Current user — try Firebase first, otherwise fall back to demo
function getCurrentUser() {
    return AppState.user;
}

function isUserLoggedIn() {
    return !!AppState.user;
}

function isUserAdmin() {
    if (!AppState.user) return false;
    if (AppState.userData && AppState.userData.role === 'admin') return true;
    // Email-based fallback for demo admin
    const email = (AppState.user.email || '').toLowerCase();
    return email === 'admin@daraz.local' || email.endsWith('@daraz.admin');
}

// Email/password login — Firebase first, demo fallback
async function loginWithEmail(email, password) {
    if (!email || !password) {
        showToast(t('auth.emailPassword'), 'error');
        return;
    }
    // Try Firebase first
    if (auth) {
        try {
            await auth.signInWithEmailAndPassword(email, password);
            showToast(t('auth.loginSuccess'), 'success');
            return;
        } catch (err) {
            console.warn('Firebase login failed, trying demo:', err.message);
            // Fall through to demo
        }
    }
    // Demo fallback
    const accounts = getDemoAccounts();
    const found = accounts.find(a => a.email.toLowerCase() === email.toLowerCase() && a.password === password);
    if (!found) {
        showToast('Invalid email or password. Try admin@daraz.local/admin123', 'error');
        return;
    }
    const demoUser = {
        uid: found.uid,
        email: found.email,
        displayName: found.displayName,
        photoURL: found.photoURL
    };
    LS.set('demo_current_user', demoUser);
    AppState.user = demoUser;
    AppState.userData = { displayName: found.displayName, email: found.email, phone: found.phone, photoURL: found.photoURL, role: found.role };
    showToast(t('auth.loginSuccess'), 'success');
    Bus.emit('authChanged', AppState.user);
    redirectAfterLogin();
}

// Email/password registration — Firebase first, demo fallback
async function registerWithEmail(name, phone, email, password) {
    if (!name || !phone || !email || !password) {
        showToast(t('auth.allFields'), 'error');
        return;
    }
    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }
    if (auth) {
        try {
            const cred = await auth.createUserWithEmailAndPassword(email, password);
            await cred.user.updateProfile({ displayName: name });
            await db.collection('users').doc(cred.user.uid).set({
                displayName: name, phone: phone, email: email,
                photoURL: DEFAULT_AVATAR, role: 'user',
                createdAt: new Date().toISOString()
            });
            // Welcome bonus coins
            try {
                const coinsSettings = readStore ? readStore(STORE.coins, DEFAULT_COINS_SETTINGS) : DEFAULT_COINS_SETTINGS;
                if (coinsSettings.enabled && coinsSettings.welcomeBonus > 0) {
                    addUserCoins(cred.user.uid, coinsSettings.welcomeBonus, 'Welcome bonus');
                }
            } catch (e) {}
            showToast(t('auth.registerSuccess'), 'success');
            redirectAfterLogin();
            return;
        } catch (err) {
            console.warn('Firebase register failed, trying demo:', err.message);
        }
    }
    // Demo fallback
    const accounts = getDemoAccounts();
    if (accounts.find(a => a.email.toLowerCase() === email.toLowerCase())) {
        showToast('Email already registered', 'error');
        return;
    }
    const uid = 'demo-' + Date.now();
    const newAccount = { uid, displayName: name, email, password, phone, photoURL: DEFAULT_AVATAR, role: 'user' };
    accounts.push(newAccount);
    saveDemoAccounts(accounts);
    const demoUser = { uid, email, displayName: name, photoURL: DEFAULT_AVATAR };
    LS.set('demo_current_user', demoUser);
    AppState.user = demoUser;
    AppState.userData = { displayName: name, phone, email, photoURL: DEFAULT_AVATAR, role: 'user' };
    // Welcome bonus coins (admin-controlled amount)
    try {
        const coinsSettings = readStore ? readStore(STORE.coins, DEFAULT_COINS_SETTINGS) : DEFAULT_COINS_SETTINGS;
        if (coinsSettings.enabled && coinsSettings.welcomeBonus > 0) {
            addUserCoins(uid, coinsSettings.welcomeBonus, 'Welcome bonus');
        }
    } catch (e) { /* store.js may not be loaded yet */ }
    showToast(t('auth.registerSuccess'), 'success');
    Bus.emit('authChanged', AppState.user);
    redirectAfterLogin();
}

// Google sign-in (popup) — Firebase only
async function loginWithGoogle() {
    if (!auth || !firebase.auth.GoogleAuthProvider) {
        showToast('Google login needs Firebase. Try demo account instead.', 'warning');
        return;
    }
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        let photoURL = user.photoURL || DEFAULT_AVATAR;
        if (photoURL.includes('googleusercontent.com')) {
            photoURL = photoURL.replace(/=s\d+-c/, '=s400-c');
        }
        await db.collection('users').doc(user.uid).set({
            displayName: user.displayName || 'User',
            email: user.email || '',
            photoURL
        }, { merge: true });
        showToast(t('auth.loginSuccess'), 'success');
    } catch (err) {
        showToast('Google login failed: ' + err.message, 'error');
    }
}

function logoutUser() {
    if (auth && AppState.user && !AppState.user.uid.startsWith('demo-')) {
        auth.signOut();
    } else {
        LS.remove('demo_current_user');
        AppState.user = null;
        AppState.userData = {};
        Bus.emit('authChanged', null);
        showToast('Logged out', 'info');
        // Redirect to login page on logout
        setTimeout(() => { window.location.href = baseUrl('login.html'); }, 600);
    }
}

// Update profile (name, phone, photoURL) — Firebase or demo
async function updateProfile({ name, phone, photoURL }) {
    if (!AppState.user) return;
    const uid = AppState.user.uid;
    if (!uid.startsWith('demo-') && auth && AppState.user) {
        try {
            await AppState.user.updateProfile({ displayName: name, photoURL });
            await db.collection('users').doc(uid).set({
                displayName: name, phone, photoURL, email: AppState.user.email
            }, { merge: true });
            showToast(t('profile.saved'), 'success');
            return;
        } catch (err) {
            console.warn('Firebase profile update failed:', err);
        }
    }
    // Demo fallback
    const accounts = getDemoAccounts();
    const idx = accounts.findIndex(a => a.uid === uid);
    if (idx >= 0) {
        accounts[idx].displayName = name;
        accounts[idx].phone = phone;
        if (photoURL) accounts[idx].photoURL = photoURL;
        saveDemoAccounts(accounts);
    }
    AppState.userData.displayName = name;
    AppState.userData.phone = phone;
    if (photoURL) AppState.userData.photoURL = photoURL;
    if (AppState.user) AppState.user.displayName = name;
    if (photoURL) AppState.user.photoURL = photoURL;
    LS.set('demo_current_user', AppState.user);
    showToast(t('profile.saved'), 'success');
    Bus.emit('authChanged', AppState.user);
}

async function deleteAccount() {
    if (!AppState.user) return;
    if (!confirm(t('profile.deleteConfirm'))) return;
    const uid = AppState.user.uid;
    if (!uid.startsWith('demo-') && auth) {
        try {
            await db.collection('users').doc(uid).delete();
            await AppState.user.delete();
            return;
        } catch (err) {
            if (err.code === 'auth/requires-recent-login') {
                showToast('Please log in again before deleting your account', 'warning');
                logoutUser();
                return;
            }
            console.warn('Firebase delete failed:', err);
        }
    }
    // Demo
    const accounts = getDemoAccounts().filter(a => a.uid !== uid);
    saveDemoAccounts(accounts);
    LS.remove('demo_current_user');
    AppState.user = null;
    AppState.userData = {};
    Bus.emit('authChanged', null);
    showToast('Account deleted', 'info');
    setTimeout(() => { window.location.href = baseUrl('login.html'); }, 600);
}

function redirectAfterLogin() {
    const next = getQueryParam('next');
    setTimeout(() => {
        if (next) {
            window.location.href = baseUrl(next);
        } else {
            window.location.href = baseUrl('index.html');
        }
    }, 600);
}

// Initialize auth state listener (Firebase). Also pull demo user if no Firebase.
// Returns a Promise that resolves once the initial auth state is known.
let _authReady = null;
function initAuth() {
    if (_authReady) return _authReady;
    _authReady = new Promise((resolve) => {
        let resolved = false;
        const finish = () => { if (!resolved) { resolved = true; resolve(); } };
        // Safety timeout — never hang the page waiting for Firebase
        setTimeout(finish, 4000);

        if (auth) {
            try {
                const unsub = auth.onAuthStateChanged(async user => {
                    if (user) {
                        AppState.user = user;
                        try {
                            const doc = await db.collection('users').doc(user.uid).get();
                            if (!doc.exists) {
                                let photoURL = user.photoURL || DEFAULT_AVATAR;
                                if (photoURL.includes('googleusercontent.com')) {
                                    photoURL = photoURL.replace(/=s\d+-c/, '=s400-c');
                                }
                                const initData = {
                                    displayName: user.displayName || 'User',
                                    email: user.email || '',
                                    phone: user.phoneNumber || '',
                                    photoURL,
                                    role: 'user',
                                    createdAt: new Date().toISOString()
                                };
                                await db.collection('users').doc(user.uid).set(initData);
                                AppState.userData = initData;
                            } else {
                                AppState.userData = doc.data() || {};
                            }
                        } catch (e) {
                            console.warn('Failed to load user data from Firestore:', e);
                            AppState.userData = { displayName: user.displayName, email: user.email, photoURL: user.photoURL };
                        }
                    } else {
                        // Firebase says no user — try demo fallback from localStorage
                        const demo = LS.get('demo_current_user', null);
                        if (demo) {
                            AppState.user = demo;
                            const accounts = getDemoAccounts();
                            const acc = accounts.find(a => a.uid === demo.uid);
                            AppState.userData = acc || { displayName: demo.displayName, email: demo.email, photoURL: DEFAULT_AVATAR };
                        }
                    }
                    Bus.emit('authChanged', AppState.user);
                    finish();
                });
            } catch (e) {
                console.warn('Firebase auth listener setup failed, using demo:', e);
                const demo = LS.get('demo_current_user', null);
                if (demo) {
                    AppState.user = demo;
                    const accounts = getDemoAccounts();
                    const acc = accounts.find(a => a.uid === demo.uid);
                    AppState.userData = acc || { displayName: demo.displayName, email: demo.email, photoURL: DEFAULT_AVATAR };
                    Bus.emit('authChanged', demo);
                }
                finish();
            }
        } else {
            // No Firebase — demo only
            const demo = LS.get('demo_current_user', null);
            if (demo) {
                AppState.user = demo;
                const accounts = getDemoAccounts();
                const acc = accounts.find(a => a.uid === demo.uid);
                AppState.userData = acc || { displayName: demo.displayName, email: demo.email, photoURL: DEFAULT_AVATAR };
                Bus.emit('authChanged', demo);
            }
            finish();
        }
    });
    return _authReady;
}
