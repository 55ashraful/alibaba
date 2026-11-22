/* ============================================================
   My Daraz — Notifications Page
   ============================================================ */

async function initNotificationsPage() {
    await loadNotifications();
    renderNotificationsPage();
    hideSplash();
}

function renderNotificationsPage() {
    const host = document.getElementById('notifications-host');
    if (!host) return;
    if (!AppState.notifications.length) {
        host.innerHTML = `
            <div class="empty-state">
                <div class="icon">🔔</div>
                <h3>${t('notif.empty')}</h3>
                <p>আপনার নতুন কোনো নোটিফিকেশন এলে এখানে দেখাবে</p>
            </div>
        `;
        return;
    }
    // Sort newest first
    const sorted = AppState.notifications.slice().sort((a, b) => (b.time || 0) - (a.time || 0));
    host.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--sp-3);">
            <h2>${t('notif.title')}</h2>
            <div>
                <button class="btn btn-sm btn-outline" onclick="markAllRead()">${t('notif.markRead')}</button>
                <button class="btn btn-sm btn-ghost" onclick="clearAllNotifications()">Clear</button>
            </div>
        </div>
        <div class="notif-list">
            ${sorted.map(n => `
                <div class="notif-item ${n.read ? '' : 'unread'}" onclick="openNotif('${n.id}')">
                    <div class="notif-icon">${n.icon || '🔔'}</div>
                    <div class="notif-info">
                        <h5>${n.title}</h5>
                        <p>${n.body}</p>
                    </div>
                    <div class="notif-time">${timeAgo(n.time)}</div>
                    ${n.read ? '' : '<div class="unread-dot"></div>'}
                </div>
            `).join('')}
        </div>
    `;
}

function markAllRead() {
    markAllNotificationsRead();
    renderNotificationsPage();
}

function clearAllNotifications() {
    if (!confirm('Clear all notifications?')) return;
    clearNotifications();
    renderNotificationsPage();
}

function openNotif(id) {
    const n = AppState.notifications.find(x => x.id === id);
    if (!n) return;
    if (!n.read) {
        n.read = true;
        LS.set('notifications', AppState.notifications);
        Bus.emit('notificationsChanged');
        renderNotificationsPage();
    }
    showToast(n.body, 'info', 4000);
}
