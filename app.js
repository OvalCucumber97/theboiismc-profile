document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const appsMenuButton = document.getElementById('apps-menu-button');
    const appsMenu = document.getElementById('apps-menu');
    const profileMenuButton = document.getElementById('profile-menu-button'); // NEW
    const profileMenu = document.getElementById('profile-menu'); // NEW
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');
    const sidebarLinks = document.querySelectorAll('#sidebar-nav .sidebar-link');
    const htmlEl = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    const searchInput = document.getElementById('search-input'); // NEW
    const searchResults = document.getElementById('search-results'); // NEW

    // Define search data based on available pages and descriptions
    const searchData = [
        { title: "Account Home", description: "Overview of your account settings and status.", url: "index.html" },
        { title: "Personal Info", description: "Change name, email, and contact information.", url: "personal-info.html" },
        { title: "Security", description: "Update password, manage 2FA, and review devices.", url: "security.html" },
        { title: "Password Change", description: "Security settings to update your account password.", url: "security.html" },
        { title: "2-Step Verification", description: "Security setting for two-factor authentication.", url: "security.html" },
        { title: "Data & Privacy", description: "Review and manage data retention and activity controls.", url: "data-privacy.html" },
        { title: "Developer Tools", description: "Manage API keys and access documentation.", url: "dev-tools.html" },
        { title: "API Keys", description: "Manage your authentication keys.", url: "dev-tools.html" }
    ];

    // --- Theme Logic ---
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

    if (htmlEl.classList.contains('dark')) {
        themeIcon.textContent = 'light_mode';
        themeText.textContent = 'Light Mode';
    } else {
        themeIcon.textContent = 'dark_mode';
        themeText.textContent = 'Dark Mode';
    }

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
        const currentPath = window.location.pathname.split('/').pop();
        sidebarLinks.forEach(link => {
            link.classList.remove('active-link');
            const linkPath = link.getAttribute('href');
            if (currentPath === linkPath || (currentPath === '' && linkPath === 'index.html')) {
                link.classList.add('active-link');
            }
        });
    }

    setActiveLink();

    // --- Search Functionality (NEW) ---
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        searchResults.innerHTML = '';
        
        if (query.length > 1) {
            const filteredResults = searchData.filter(item => 
                item.title.toLowerCase().includes(query) || 
                item.description.toLowerCase().includes(query)
            ).slice(0, 5); // Limit to top 5 results

            if (filteredResults.length > 0) {
                filteredResults.forEach(item => {
                    const resultLink = document.createElement('a');
                    resultLink.href = item.url;
                    resultLink.classList.add('flex', 'flex-col', 'p-3', 'hover:bg-slate-100', 'dark:hover:bg-gray-600', 'rounded-xl', 'transition');
                    resultLink.innerHTML = `
                        <span class="text-sm font-semibold text-gray-900 dark:text-white">${item.title}</span>
                        <span class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">${item.description}</span>
                    `;
                    searchResults.appendChild(resultLink);
                });
                searchResults.classList.remove('hidden');
            } else {
                searchResults.classList.add('hidden');
            }
        } else {
            searchResults.classList.add('hidden');
        }
    });


    // --- UI Interactivity Logic (Menu Toggle, Apps Menu & Profile Dropdown) ---
    
    // Mobile Menu Toggle
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('hidden');
        sidebar.classList.toggle('flex');
    });

    // Apps Menu Dropdown
    if (appsMenuButton) {
        appsMenuButton.addEventListener('click', (event) => {
            event.stopPropagation();
            profileMenu.classList.add('hidden'); // Close profile menu
            appsMenu.classList.toggle('hidden');
        });
    }

    // Profile Menu Dropdown (NEW)
    if (profileMenuButton) {
        profileMenuButton.addEventListener('click', (event) => {
            event.stopPropagation();
            appsMenu.classList.add('hidden'); // Close apps menu
            profileMenu.classList.toggle('hidden');
        });
    }

    // Close menus when clicking outside
    window.addEventListener('click', (e) => {
        // Close Mobile Sidebar
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target) && window.innerWidth < 1024) {
            if (!sidebar.classList.contains('hidden')){
                 sidebar.classList.add('hidden');
                 sidebar.classList.remove('flex');
            }
        }
        // Close Apps Menu
        if (appsMenu && appsMenuButton && !appsMenu.contains(e.target) && !appsMenuButton.contains(e.target)) {
            if (!appsMenu.classList.contains('hidden')){
                appsMenu.classList.add('hidden');
            }
        }
        // Close Profile Menu (NEW)
        if (profileMenu && profileMenuButton && !profileMenu.contains(e.target) && !profileMenuButton.contains(e.target)) {
            if (!profileMenu.classList.contains('hidden')){
                profileMenu.classList.add('hidden');
            }
        }
    });
});
