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

    // --- NEW: User Data Elements ---
    const userNameElements = document.querySelectorAll('.dynamic-user-name');
    const userEmailElements = document.querySelectorAll('.dynamic-user-email');
    const profileIconElements = document.querySelectorAll('.dynamic-profile-icon');
    const welcomeHeader = document.getElementById('welcome-header');


    // Define search data based on available pages and descriptions
    const searchData = [
        // Settings Pages
        { title: "Account Home", description: "Overview of your account settings and status.", url: "index.html", category: "Settings" },
        { title: "Security", description: "Update password, manage 2FA, and review devices.", url: "security.html", category: "Settings" },
        { title: "Password Change", description: "Security setting to update your account password.", url: "security.html", category: "Settings" },
        { title: "2-Step Verification", description: "Security setting for two-factor authentication.", url: "security.html", category: "Settings" },
        { title: "Data & Privacy", description: "Review and manage data retention and activity controls.", url: "data-privacy.html", category: "Settings" },
        // Profile/Personal Info Pages
        { title: "Personal Info", description: "Change name, email, and contact information.", url: "personal-info.html", category: "Profile" },
        { title: "Manage Account", description: "Manage profile, data, security, and payment options.", url: "personal-info.html", category: "Profile" },
        { title: "Developer Tools", description: "Manage API keys and access documentation.", url: "dev-tools.html", category: "Developer" },
        { title: "API Keys", description: "Manage your authentication keys.", url: "dev-tools.html", category: "Developer" }
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
    // Initial theme setup
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
    
    // --- NEW: Dynamic User Data Fetch Function ---
    function fetchUserData() {
        // Simulate fetching data from https://accounts.theboiismc.com/api/user-data
        const mockUserData = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@theboiismc.com',
            initials: 'JD',
            // Set to a URL to test image rendering, or null/empty string for initials
            profilePicUrl: null 
        };

        const fullName = `${mockUserData.firstName} ${mockUserData.lastName}`;

        // 1. Update text elements (Name and Email)
        userNameElements.forEach(el => el.textContent = fullName);
        userEmailElements.forEach(el => el.textContent = mockUserData.email);
        
        // 2. Update Welcome Header
        if (welcomeHeader) {
            welcomeHeader.textContent = `Welcome, ${mockUserData.firstName}`;
        }

        // 3. Update Profile Icons
        profileIconElements.forEach(el => {
            // Clear existing content and apply base styling
            el.innerHTML = '';

            if (mockUserData.profilePicUrl) {
                // If a picture URL exists, use an image
                const img = document.createElement('img');
                img.src = mockUserData.profilePicUrl;
                img.alt = fullName;
                img.classList.add('w-full', 'h-full', 'object-cover', 'rounded-full');
                el.appendChild(img);
                // Remove initials styling if image is used
                el.classList.remove('bg-primary-blue-600', 'text-white'); 
            } else {
                // Otherwise, use initials for the avatar
                el.classList.add('bg-primary-blue-600', 'text-white');
                const span = document.createElement('span');
                span.textContent = mockUserData.initials;
                el.appendChild(span);
            }
        });
    }

    // --- Advanced Search Functionality ---
    searchInput.addEventListener('input', () => {
        const fullQuery = searchInput.value.toLowerCase().trim();
        searchResults.innerHTML = '';
        
        if (fullQuery.length > 1) {
            let filterCategory = null;
            let query = fullQuery;

            // 1. Check for Search Operators (settings: or profile:)
            if (fullQuery.startsWith('settings:')) {
                filterCategory = 'Settings';
                query = fullQuery.substring('settings:'.length).trim();
            } else if (fullQuery.startsWith('profile:') || fullQuery.startsWith('personal:')) {
                filterCategory = 'Profile';
                query = fullQuery.substring(fullQuery.startsWith('profile:') ? 'profile:'.length : 'personal:'.length).trim();
            }

            // Ensure query is not empty if operator was used
            if (query === '' && filterCategory) {
                 query = fullQuery;
            }
            
            // 2. Filter Results
            const filteredResults = searchData.filter(item => {
                const itemMatchesQuery = item.title.toLowerCase().includes(query) || 
                                         item.description.toLowerCase().includes(query);
                
                const itemMatchesCategory = filterCategory === null || item.category === filterCategory;

                // Also allow matching if the query is just the category keyword itself
                const categoryKeywordMatch = item.category.toLowerCase().includes(fullQuery);

                return (itemMatchesQuery && itemMatchesCategory) || categoryKeywordMatch;
            }).slice(0, 8); 

            if (filteredResults.length > 0) {
                // 3. Categorize and Group Results
                const groupedResults = filteredResults.reduce((acc, item) => {
                    (acc[item.category] = acc[item.category] || []).push(item);
                    return acc;
                }, {});

                // 4. Render Grouped Results with Labels
                for (const category in groupedResults) {
                    // Add the category label (Section Header)
                    const header = document.createElement('h3');
                    header.classList.add('text-xs', 'font-bold', 'text-primary-blue-600', 'dark:text-primary-blue-400', 'uppercase', 'px-3', 'py-1', 'mt-1', 'mb-1');
                    header.textContent = category;
                    searchResults.appendChild(header);

                    // Add the search links
                    groupedResults[category].forEach(item => {
                        const resultLink = document.createElement('a');
                        resultLink.href = item.url;
                        resultLink.classList.add('flex', 'flex-col', 'p-3', 'hover:bg-slate-100', 'dark:hover:bg-gray-600', 'rounded-xl', 'transition');
                        resultLink.innerHTML = `
                            <span class="text-sm font-semibold text-gray-900 dark:text-white">${item.title}</span>
                            <span class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">${item.description}</span>
                        `;
                        searchResults.appendChild(resultLink);
                    });
                }
                
                searchResults.classList.remove('hidden');
            } else {
                // Display "No results found"
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

    // Profile Menu Dropdown 
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
        // Close Profile Menu
        if (profileMenu && profileMenuButton && !profileMenu.contains(e.target) && !profileMenuButton.contains(e.target)) {
            if (!profileMenu.classList.contains('hidden')){
                profileMenu.classList.add('hidden');
            }
        }
    });
    
    // *** EXECUTE DYNAMIC DATA FETCH ON PAGE LOAD ***
    fetchUserData(); 
});
