// --- OIDC Configuration ---
const OIDC_CONFIG = {
    // Correct Authority/Issuer URL: oidc-client-ts will append /.well-known/openid-configuration
    authority: "https://accounts.theboiismc.com/application/o/accountdashboard/",
    // The client ID registered for this application
    client_id: "yopePhMvPt1dj65UFbmVkxHIuX7MDeeNBoobKSQy", 
    // The full, correct URL where the user will be redirected after login
    redirect_uri: "https://myaccount.theboiismc.com/", 
    // The URL for the user to be redirected after logout (usually the same as redirect_uri for SPAs)
    post_logout_redirect_uri: "https://myaccount.theboiismc.com/",
    
    response_type: "code", // Authorization Code Flow with PKCE (Recommended for SPAs)
    scope: "openid profile email", // Standard scopes for basic user info
    userStore: window.localStorage, // Persist session across browser restarts
    
    // Custom parameter to direct the user to the specific authentik login flow
    extraQueryParams: {
        // CORRECTED HINT: This tells authentik to use the specified flow.
        login_hint: 'default-authentication-flow' 
    },
    // PKCE is enabled by default for 'code' response_type
};

// Initialize the UserManager
// Assuming oidc-client-ts is loaded globally and available as window.UserManager
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
    // OIDC standard claims: name and email
    const { name, email } = user.profile; 
    const displayName = name || (email ? email.split('@')[0] : 'User');
    const initials = getInitials(displayName);

    // Update Text Fields
    if (ui.welcomeName) ui.welcomeName.textContent = displayName;
    if (ui.dropdownName) ui.dropdownName.textContent = displayName;
    if (ui.dropdownEmail && email) ui.dropdownEmail.textContent = email;

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
            // On callback error, force redirect to login
            // Use the extraQueryParams for the required login flow hint
            userManager.signinRedirect({ 
                extraQueryParams: OIDC_CONFIG.extraQueryParams 
            }); 
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
            // Use the extraQueryParams for the required login flow hint
            userManager.signinRedirect({ 
                extraQueryParams: OIDC_CONFIG.extraQueryParams 
            });
        }
    } catch (error) {
        console.error("Error during authentication check:", error);
        // Fallback: If any error occurs, assume not logged in and redirect
        userManager.signinRedirect({ 
            extraQueryParams: OIDC_CONFIG.extraQueryParams 
        });
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
        document.documentElement.classList.remove('dark'); // Ensure 'dark' is removed on light theme
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
    
    // Header/Dropdown menu toggles 
    const appsMenuButton = document.getElementById('apps-menu-button');
    const appsMenu = document.getElementById('apps-menu');
    const profileMenuButton = document.getElementById('profile-menu-button');
    const profileMenu = document.getElementById('profile-menu');
    
    function toggleMenu(menu) {
        if (menu) menu.classList.toggle('hidden');
    }
    
    if (appsMenuButton) appsMenuButton.addEventListener('click', () => toggleMenu(appsMenu));
    if (profileMenuButton) profileMenuButton.addEventListener('click', () => toggleMenu(profileMenu));
    
    // Start the Authentication Flow
    handleAuthFlow();
};
