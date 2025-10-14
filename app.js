document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const appsMenuButton = document.getElementById('apps-menu-button');
    const appsMenu = document.getElementById('apps-menu');
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');
    const sidebarLinks = document.querySelectorAll('#sidebar-nav .sidebar-link');
    const htmlEl = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    // --- Theme Logic (Handles toggle only, initial load is in HTML) ---

    function updateTheme(theme) {
        if (theme === 'dark') {
            htmlEl.classList.add('dark');
            themeIcon.textContent = 'light_mode';
            themeText.textContent = 'Light Mode';
        } else {
            htmlEl.classList.remove('dark');
            themeIcon.textContent = 'dark_mode';
            themeText.textContent = 'Dark Mode';
        }
        localStorage.setItem('theme', theme);
    }

    // Set initial text/icon based on current state (which was set by the HTML script)
    if (htmlEl.classList.contains('dark')) {
        themeIcon.textContent = 'light_mode';
        themeText.textContent = 'Light Mode';
    } else {
        themeIcon.textContent = 'dark_mode';
        themeText.textContent = 'Dark Mode';
    }

    // Set up media query listener for un-saved theme changes
    prefersDark.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            updateTheme(e.matches ? 'dark' : 'light');
        }
    });

    themeToggle.addEventListener('click', () => {
        const newTheme = htmlEl.classList.contains('dark') ? 'light' : 'dark';
        updateTheme(newTheme);
    });

    // --- Sidebar Link Activation Logic ---
    function setActiveLink() {
        // Get the current page file name (e.g., "index.html" or "personal-info.html")
        const currentPath = window.location.pathname.split('/').pop();

        sidebarLinks.forEach(link => {
            link.classList.remove('active-link');
            const linkPath = link.getAttribute('href');

            // Compare the current page name with the link's href
            if (currentPath === linkPath || (currentPath === '' && linkPath === 'index.html')) {
                link.classList.add('active-link');
            }
        });
    }

    setActiveLink(); // Run on load

    // --- UI Interactivity Logic (Menu Toggle & Apps Menu) ---
    
    // Mobile Menu Toggle
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('hidden');
        sidebar.classList.toggle('flex');
    });

    // Apps Menu Dropdown
    if (appsMenuButton) {
        appsMenuButton.addEventListener('click', (event) => {
            event.stopPropagation();
            appsMenu.classList.toggle('hidden');
        });
    }

    // Close menus when clicking outside
    window.addEventListener('click', (e) => {
        // Close Mobile Sidebar on outside click
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target) && window.innerWidth < 1024) {
            if (!sidebar.classList.contains('hidden')){
                 sidebar.classList.add('hidden');
                 sidebar.classList.remove('flex');
            }
        }
        // Close Apps Menu on outside click
        if (appsMenu && appsMenuButton && !appsMenu.contains(e.target) && !appsMenuButton.contains(e.target)) {
            if (!appsMenu.classList.contains('hidden')){
                appsMenu.classList.add('hidden');
            }
        }
    });
});
