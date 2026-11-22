/* ============================================================
   My Daraz — Live Chat Widget
   ============================================================ */

const CHAT_BOT_REPLIES = [
    { keywords: ['hi', 'hello', 'হাই', 'সালাম', 'হ্যালো'], reply: 'আসসালামু আলাইকুম! My Daraz সাপোর্টে স্বাগতম। আমি কীভাবে সাহায্য করতে পারি?' },
    { keywords: ['order', 'অর্ডার', 'track'], reply: 'আপনার অর্ডার ট্র্যাক করতে "My Orders" পেজে যান। স্ট্যাটাস আপডেট সেখানে দেখাবে।' },
    { keywords: ['delivery', 'ডেলিভারি', 'shipping', 'শিপিং'], reply: 'ঢাকার ভিতরে ২-৪ দিন, বাইরে ৩-৭ দিন। ৳৫০০+ অর্ডারে ফ্রি শিপিং!' },
    { keywords: ['payment', 'পেমেন্ট', 'pay', 'bKash', 'নগদ'], reply: 'আমরা bKash, Nagad, Rocket, Card, Wallet ও Cash on Delivery সাপোর্ট করি।' },
    { keywords: ['return', 'রিটার্ন', 'refund', 'রিফান্ড'], reply: '৭ দিনের মধ্যে রিটার্ন করতে পারবেন যদি পণ্য ক্ষতিগ্রস্ত হয়। My Orders → Return এ ক্লিক করুন।' },
    { keywords: ['coupon', 'কুপন', 'discount', 'ছাড়'], reply: 'বর্তমান কুপন: NEW100 (৳100 ছাড়), DARAZ500 (৳500 ছাড়), SAVE10 (10% ছাড়)। Coupons পেজে দেখুন।' },
    { keywords: ['flash', 'ফ্ল্যাশ'], reply: 'ফ্ল্যাশ সেল চলছে! স্মার্টফোন, অডিও, ফ্যাশনে ৫০% পর্যন্ত ছাড়।' },
    { keywords: ['coin', 'কয়েন', 'wallet', 'ওয়ালেট'], reply: 'আপনার কয়েন ব্যালেন্স My Coins পেজে দেখুন। অর্ডার থেকে কয়েন জমা হবে এবং কয়েন দিয়ে প্রোডাক্টের দাম কমাতে পারবেন।' },
    { keywords: ['thanks', 'ধন্যবাদ', 'thank you'], reply: 'সাহায্য করতে পেরে ভালো লাগলো! আরও কিছু লাগলে বলবেন। 😊' }
];

let chatState = { open: false, history: [] };

function initChatWidget() {
    const host = document.getElementById('chat-widget-host');
    if (!host) return;
    host.innerHTML = `
        <div class="chat-widget">
            <div class="chat-fab" onclick="toggleChat()" title="Chat with us">
                💬
                <span class="chat-badge" id="chatBadge">1</span>
            </div>
            <div class="chat-window" id="chatWindow">
                <div class="chat-header">
                    <div class="agent-info">
                        <div class="name">Daraz Support</div>
                        <div class="status">● Online</div>
                    </div>
                    <span class="chat-close" onclick="toggleChat()">×</span>
                </div>
                <div class="chat-body" id="chatBody"></div>
                <div class="chat-quick-replies">
                    <span class="chat-quick-reply" onclick="sendQuickReply('Order')">📦 Order</span>
                    <span class="chat-quick-reply" onclick="sendQuickReply('Delivery')">🚚 Delivery</span>
                    <span class="chat-quick-reply" onclick="sendQuickReply('Payment')">💳 Payment</span>
                    <span class="chat-quick-reply" onclick="sendQuickReply('Coupon')">🎟 Coupon</span>
                </div>
                <div class="chat-input-row">
                    <input type="text" id="chatInput" placeholder="Type your message..." onkeydown="if(event.key==='Enter')sendChat()">
                    <button onclick="sendChat()">➤</button>
                </div>
            </div>
        </div>
    `;
    // Add greeting after a delay if user hasn't opened
    setTimeout(() => {
        if (!chatState.open) {
            const badge = document.getElementById('chatBadge');
            if (badge) badge.style.display = 'flex';
        }
    }, 5000);
    // Initial greeting in chat body
    pushBotMessage('আসসালামু আলাইকুম! 👋 My Daraz সাপোর্টে স্বাগতম। নিচের অপশনে ক্লিক করুন অথবা আপনার প্রশ্ন লিখুন।');
}

function toggleChat() {
    const win = document.getElementById('chatWindow');
    if (!win) return;
    chatState.open = !chatState.open;
    win.classList.toggle('open', chatState.open);
    const badge = document.getElementById('chatBadge');
    if (badge && chatState.open) badge.style.display = 'none';
}

function pushBotMessage(text) {
    const body = document.getElementById('chatBody');
    if (!body) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msg = document.createElement('div');
    msg.className = 'chat-msg bot';
    msg.innerHTML = `<div class="bubble">${text}</div><div class="time">${bn(time)}</div>`;
    body.appendChild(msg);
    body.scrollTop = body.scrollHeight;
    chatState.history.push({ type: 'bot', text });
}

function pushUserMessage(text) {
    const body = document.getElementById('chatBody');
    if (!body) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msg = document.createElement('div');
    msg.className = 'chat-msg user';
    msg.innerHTML = `<div class="bubble">${text}</div><div class="time">${bn(time)}</div>`;
    body.appendChild(msg);
    body.scrollTop = body.scrollHeight;
    chatState.history.push({ type: 'user', text });
}

function sendChat() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;
    pushUserMessage(text);
    input.value = '';
    // Find bot reply
    setTimeout(() => {
        const match = CHAT_BOT_REPLIES.find(r => r.keywords.some(k => text.toLowerCase().includes(k.toLowerCase())));
        pushBotMessage(match ? match.reply : 'আমরা শীঘ্রই একজন সাপোর্ট এজেন্ট পাঠাচ্ছি। অন্য কোনো প্রশ্ন থাকলে লিখুন। 🙏');
    }, 600);
}

function sendQuickReply(topic) {
    document.getElementById('chatInput').value = topic;
    sendChat();
}
