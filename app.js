// IMPORTANT: oidc-client-ts is loaded globally via CDN in index.html
// We access the UserManager constructor from the global scope (window.UserManager)

// --- OIDC Configuration ---
const OIDC_CONFIG = {
    // !!! IMPORTANT: REPLACE THESE PLACEHOLDERS WITH YOUR ACTUAL IDENTITY PROVIDER DETAILS !!!
    authority: "https://accounts.theboiismc.com/application/o/accountdashboard/.well-known/openid-configuration", // e.g., 'https://your-auth-server.com'
    client_id: "yopePhMvPt1dj65UFbmVkxHIuX7MDeeNBoobKSQy", // The client ID registered for this application
    redirect_uri: window.location.origin, // This page (index.html) handles both the dashboard and the callback
    response_type: "code", // Using Authorization Code Flow with PKCE
    scope: "openid profile email", // Standard scopes for basic user info
    post_logout_redirect_uri: window.location.origin, // Redirect here after logout
    userStore: window.localStorage, // Persist session across browser restarts
    extraQueryParams: {
        // Example: if your IDP needs extra params
        // kc_idp_hint: 'google'
    },
    // PKCE is enabled by default for 'code' response_type
};

// Initialize the UserManager
const userManager = new UserManager(OIDC_CONFIG);

// --- UI Element Selectors ---
const ui = {
    appContainer: document.getElementById('app-container'),
    loadingSpinner: document.getElementById('loading-spinner'),
    themeToggle: document.getElementById('theme-toggle'),
    themeIcon: document.getElementById('theme-icon'),
    themeText: document.getElementById('theme-text'),
    logoutButtons: [
        document.getElementById('sidebar-logout-button'),
        document.getElementById('dropdown-logout-button')
    ],
    // Dynamic content placeholders
    welcomeName: document.getElementById('user-name-display-welcome'),
    dropdownName: document.getElementById('user-name-display-dropdown'),
    dropdownEmail: document.getElementById('user-email-display-dropdown'),
    headerIcon: document.getElementById('header-profile-icon'),
    dropdownIcon: document.getElementById('dropdown-profile-icon'),
    welcomeIcon: document.getElementById('welcome-profile-icon'),
};

/**
 * Generates initials from a full name.
 * @param {string} name - The user's full name.
 * @returns {string} The first two initials (e.g., "John Doe" -> "JD").
 */
function getInitials(name) {
    if (!name) return '?';
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }
    return parts.map(p => p[0]).join('').substring(0, 2).toUpperCase();
}

/**
 * Updates the entire UI with user information from OIDC claims.
 * @param {User} user - The user object from oidc-client-ts.
 */
function updateUI(user) {
    if (!user || !user.profile) {
        console.error("User object or profile is missing. Cannot update UI.");
        return;
    }

    const { name, email } = user.profile;
    const displayName = name || email.split('@')[0];
    const initials = getInitials(displayName);

    // Update Text Fields
    if (ui.welcomeName) ui.welcomeName.textContent = displayName;
    if (ui.dropdownName) ui.dropdownName.textContent = displayName;
    if (ui.dropdownEmail) ui.dropdownEmail.textContent = email;

    // Update Profile Icons
    [ui.headerIcon, ui.dropdownIcon, ui.welcomeIcon].forEach(el => {
        if (el) el.textContent = initials;
    });

    // Show the main content and hide the spinner
    if (ui.loadingSpinner) ui.loadingSpinner.style.display = 'none';
    if (ui.appContainer) ui.appContainer.style.display = 'flex';
}

/**
 * Handles the application's core authentication flow:
 * 1. Checks if this is an OIDC redirect callback.
 * 2. If not, checks for an existing user session.
 * 3. Redirects to login if no session is found.
 */
async function handleAuthFlow() {
    // 1. Check for OIDC Callback
    if (window.location.search.includes('code') || window.location.hash.includes('id_token')) {
        try {
            // Process the tokens and store the session
            const user = await userManager.signinCallback(window.location.href);

            // Once successful, clean the URL and load the dashboard
            window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
            updateUI(user);
        } catch (error) {
            console.error("OIDC Callback Error:", error);
            // On callback error (e.g., state mismatch, token expired), force redirect to login
            userManager.signinRedirect();
        }
        return;
    }

    // 2. Check for Existing User Session
    try {
        const user = await userManager.getUser();

        if (user && !user.expired) {
            // User is authenticated and session is valid
            updateUI(user);
        } else {
            // No valid session, redirect to Identity Provider for login
            console.log("No valid session found. Redirecting to login.");
            userManager.signinRedirect();
        }
    } catch (error) {
        console.error("Error during authentication check:", error);
        // Fallback: If any error occurs, assume not logged in and redirect
        userManager.signinRedirect();
    }
}

/**
 * Logs the user out.
 */
function handleLogout() {
    // Clear the session and redirect to the IDP's logout endpoint
    userManager.signoutRedirect();
}

/**
 * Toggles the application's theme (light/dark).
 */
function handleThemeToggle() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    if (ui.themeIcon && ui.themeText) {
        if (isDark) {
            ui.themeIcon.textContent = 'light_mode';
            ui.themeText.textContent = 'Light Mode';
        } else {
            ui.themeIcon.textContent = 'dark_mode';
            ui.themeText.textContent = 'Dark Mode';
        }
    }
}

// --- Event Listeners and Initialization ---

window.onload = () => {
    // Initialize theme state on load
    const currentTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark');
        if (ui.themeIcon) ui.themeIcon.textContent = 'light_mode';
        if (ui.themeText) ui.themeText.textContent = 'Light Mode';
    } else {
        if (ui.themeIcon) ui.themeIcon.textContent = 'dark_mode';
        if (ui.themeText) ui.themeText.textContent = 'Dark Mode';
    }


    // Add event listener for theme toggle
    if (ui.themeToggle) {
        ui.themeToggle.addEventListener('click', handleThemeToggle);
    }

    // Add event listeners for all logout buttons
    ui.logoutButtons.forEach(button => {
        if (button) {
            button.addEventListener('click', handleLogout);
        }
    });
    
    // Header/Dropdown menu toggles (re-adding from original script, simplified)
    const appsMenuButton = document.getElementById('apps-menu-button');
    const appsMenu = document.getElementById('apps-menu');
    const profileMenuButton = document.getElementById('profile-menu-button');
    const profileMenu = document.getElementById('profile-menu');
    
    function toggleMenu(button, menu) {
        if (menu) menu.classList.toggle('hidden');
    }

    if (appsMenuButton) appsMenuButton.addEventListener('click', () => toggleMenu(appsMenuButton, appsMenu));
    if (profileMenuButton) profileMenuButton.addEventListener('click', () => toggleMenu(profileMenuButton, profileMenu));


    // Start the Authentication Flow
    handleAuthFlow();
};
