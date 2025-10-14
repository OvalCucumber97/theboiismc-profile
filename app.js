document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const appsMenuButton = document.getElementById('apps-menu-button');
    const appsMenu = document.getElementById('apps-menu');
    const profileMenuButton = document.getElementById('profile-menu-button');
    const profileMenu = document.getElementById('profile-menu');
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');
    const sidebarLinks = document.querySelectorAll('#sidebar-nav .sidebar-link');
    const htmlEl = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    // --- User Data Elements ---
    const userNameElements = document.querySelectorAll('.dynamic-user-name');
    const userEmailElements = document.querySelectorAll('.dynamic-user-email');
    const profileIconElements = document.querySelectorAll('.dynamic-profile-icon');
    const welcomeHeader = document.getElementById('welcome-header');

    // Define search data (remains the same)
    const searchData = [
        { title: "Account Home", description: "Overview of your account settings and status.", url: "index.html", category: "Settings" },
        { title: "Security", description: "Update password, manage 2FA, and review devices.", url: "security.html", category: "Settings" },
        { title: "Password Change", description: "Security setting to update your account password.", url: "security.html", category: "Settings" },
        { title: "2-Step Verification", description: "Security setting for two-factor authentication.", url: "security.html", category: "Settings" },
        { title: "Data & Privacy", description: "Review and manage data retention and activity controls.", url: "data-privacy.html", category: "Settings" },
        { title: "Personal Info", description: "Change name, email, and contact information.", url: "personal-info.html", category: "Profile" },
        { title: "Manage Account", description: "Manage profile, data, security, and payment options.", url: "personal-info.html", category: "Profile" },
        { title: "Developer Tools", description: "Manage API keys and access documentation.", url: "dev-tools.html", category: "Developer" },
        { title: "API Keys", description: "Manage your authentication keys.", url: "dev-tools.html", category: "Developer" }
    ];

    // --- Theme Logic (remains the same) ---
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

    // --- Sidebar Link Activation Logic (remains the same) ---
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
    
    // --- UPDATED: Dynamic User Data Fetch Function to mimic Authentik OIDC Userinfo ---
    function fetchUserData() {
        // In a real app, this function would make a fetch request to:
        // 'https://accounts.theboiismc.com/application/o/userinfo/'
        // using the user's Access Token in the Authorization header.

        const mockAuthentikUserinfo = {
            // Standard OIDC Claims expected from Authentik's userinfo endpoint
            "sub": "b2f0a1c3-2d4e-5f6g-7h8i-9j0k1l2m3n4o", // Subject (User ID)
            "name": "Alex Johnson",                     // Full Display Name
            "given_name": "Alex",                      // First Name
            "family_name": "Johnson",                  // Last Name
            "email": "alex.johnson@theboiismc.com",    // Email
            "picture": null                            // Profile Picture URL
        };

        const fullName = mockAuthentikUserinfo.name;
        
        // 1. Update text elements (Name and Email)
        userNameElements.forEach(el => el.textContent = fullName);
        userEmailElements.forEach(el => el.textContent = mockAuthentikUserinfo.email);
        
        // 2. Update Welcome Header
        if (welcomeHeader) {
            welcomeHeader.textContent = `Welcome, ${mockAuthentikUserinfo.given_name}`;
        }

        // 3. Update Profile Icons
        profileIconElements.forEach(el => {
            el.innerHTML = '';
            
            if (mockAuthentikUserinfo.picture) {
                // If a picture URL exists (e.g., from Gravatar integration)
                const img = document.createElement('img');
                img.src = mockAuthentikUserinfo.picture;
                img.alt = fullName;
                img.classList.add('w-full', 'h-full', 'object-cover', 'rounded-full');
                el.appendChild(img);
                el.classList.remove('bg-primary-blue-600', 'text-white');
            } else {
                // Otherwise, use initials generated from the name (or fall back to a short unique ID)
                el.classList.add('bg-primary-blue-600', 'text-white');
                const initials = (mockAuthentikUserinfo.given_name[0] + mockAuthentikUserinfo.family_name[0]).toUpperCase();
                
                const span = document.createElement('span');
                span.textContent = initials;
                el.appendChild(span);
            }
        });
    }

    // --- Search Functionality (remains the same) ---
    searchInput.addEventListener('input', () => {
        const fullQuery = searchInput.value.toLowerCase().trim();
        searchResults.innerHTML = '';
        
        if (fullQuery.length > 1) {
            let filterCategory = null;
            let query = fullQuery;
            if (fullQuery.startsWith('settings:')) {
                filterCategory = 'Settings';
                query = fullQuery.substring('settings:'.length).trim();
            } else if (fullQuery.startsWith('profile:') || fullQuery.startsWith('personal:')) {
                filterCategory = 'Profile';
                query = fullQuery.substring(fullQuery.startsWith('profile:') ? 'profile:'.length : 'personal:'.length).trim();
            }
            if (query === '' && filterCategory) {
                 query = fullQuery;
            }
            
            const filteredResults = searchData.filter(item => {
                const itemMatchesQuery = item.title.toLowerCase().includes(query) || 
                                         item.description.toLowerCase().includes(query);
                const itemMatchesCategory = filterCategory === null || item.category === filterCategory;
                const categoryKeywordMatch = item.category.toLowerCase().includes(fullQuery);
                return (itemMatchesQuery && itemMatchesCategory) || categoryKeywordMatch;
            }).slice(0, 8); 

            if (filteredResults.length > 0) {
                const groupedResults = filteredResults.reduce((acc, item) => {
                    (acc[item.category] = acc[item.category] || []).push(item);
                    return acc;
                }, {});

                for (const category in groupedResults) {
                    const header = document.createElement('h3');
                    header.classList.add('text-xs', 'font-bold', 'text-primary-blue-600', 'dark:text-primary-blue-400', 'uppercase', 'px-3', 'py-1', 'mt-1', 'mb-1');
                    header.textContent = category;
                    searchResults.appendChild(header);

                    groupedResults[category].forEach(item => {
                        const resultLink = document.createElement('a');
                        resultLink.href = item.url;
                        resultLink.classList.add('flex', 'flex-col', 'p-3', 'hover:bg-slate-100', 'dark:hover:bg-gray-600', 'rounded-xl', 'transition');
                        resultLink.innerHTML = `<span class="text-sm font-semibold text-gray-900 dark:text-white">${item.title}</span><span class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">${item.description}</span>`;
                        searchResults.appendChild(resultLink);
                    });
                }
                searchResults.classList.remove('hidden');
            } else {
                const noResults = document.createElement('p');
                noResults.classList.add('p-3', 'text-sm', 'text-gray-500', 'dark:text-gray-400', 'text-center');
                noResults.textContent = 'No results found.';
                searchResults.appendChild(noResults);
                searchResults.classList.remove('hidden');
            }
        } else {
            searchResults.classList.add('hidden');
        }
    });


    // --- UI Interactivity Logic (remains the same) ---
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('hidden');
        sidebar.classList.toggle('flex');
    });

    if (appsMenuButton) {
        appsMenuButton.addEventListener('click', (event) => {
            event.stopPropagation();
            profileMenu.classList.add('hidden');
            appsMenu.classList.toggle('hidden');
        });
    }
    if (profileMenuButton) {
        profileMenuButton.addEventListener('click', (event) => {
            event.stopPropagation();
            appsMenu.classList.add('hidden');
            profileMenu.classList.toggle('hidden');
        });
    }

    window.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target) && window.innerWidth < 1024) {
            if (!sidebar.classList.contains('hidden')){
                 sidebar.classList.add('hidden');
                 sidebar.classList.remove('flex');
            }
        }
        if (appsMenu && appsMenuButton && !appsMenu.contains(e.target) && !appsMenuButton.contains(e.target)) {
            if (!appsMenu.classList.contains('hidden')){
                appsMenu.classList.add('hidden');
            }
        }
        if (profileMenu && profileMenuButton && !profileMenu.contains(e.target) && !profileMenuButton.contains(e.target)) {
            if (!profileMenu.classList.contains('hidden')){
                profileMenu.classList.add('hidden');
            }
        }
    });
    
    // *** EXECUTE DYNAMIC DATA FETCH ON PAGE LOAD ***
    fetchUserData(); 
});
