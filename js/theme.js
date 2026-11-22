/* ============================================================
   My Daraz — Theme (Dark Mode) Toggle
   ============================================================ */

function applyTheme(theme) {
    AppState.theme = theme;
    localStorage.setItem('md_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    Bus.emit('themeChanged', theme);
    // Update toggle switch states if present
    document.querySelectorAll('.theme-toggle-input').forEach(input => {
        input.checked = (theme === 'dark');
    });
}

function toggleTheme() {
    applyTheme(AppState.theme === 'dark' ? 'light' : 'dark');
}

// Apply on load (so first paint is correct)
(function initThemeEarly() {
    const saved = localStorage.getItem('md_theme') || 'light';
    AppState.theme = saved;
    document.documentElement.setAttribute('data-theme', saved);
})();
