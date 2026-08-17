// ===== PRODUCTION-OPTIMIZED JAVASCRIPT =====
// Performance-focused navigation and interaction handling

(function() {
    'use strict';

    // ===== CONSTANTS =====
    const CONFIG = {
        pageSelector: '.page',
        buttonSelector: '.nav-btn',
        activeClass: 'active',
        transitionDuration: 300,
        defaultPage: 'home'
    };

    // ===== CACHE DOM ELEMENTS =====
    let cachedElements = {
        pages: null,
        buttons: null
    };

    // ===== UTILITY FUNCTIONS =====
    /**
     * Cache DOM elements for better performance
     */
    function cacheElements() {
        cachedElements.pages = document.querySelectorAll(CONFIG.pageSelector);
        cachedElements.buttons = document.querySelectorAll(CONFIG.buttonSelector);
    }

    /**
     * Hide all pages
     */
    function hideAllPages() {
        cachedElements.pages.forEach(page => {
            page.classList.remove(CONFIG.activeClass);
            page.setAttribute('aria-hidden', 'true');
        });
    }

    /**
     * Deactivate all buttons
     */
    function deactivateAllButtons() {
        cachedElements.buttons.forEach(button => {
            button.classList.remove(CONFIG.activeClass);
            button.setAttribute('aria-pressed', 'false');
        });
    }

    /**
     * Show specific page
     * @param {string} pageId - The ID of the page to show
     */
    function showPage(pageId) {
        // Validate page exists
        const pageElement = document.getElementById(pageId);
        if (!pageElement) {
            console.warn(`Page with ID "${pageId}" not found`);
            return;
        }

        // Hide all pages
        hideAllPages();

        // Show target page
        pageElement.classList.add(CONFIG.activeClass);
        pageElement.setAttribute('aria-hidden', 'false');

        // Update buttons
        updateButtonStates(pageId);

        // Scroll to top for better UX
        scrollToTop();

        // Fire custom event for external listeners
        dispatchPageChangeEvent(pageId);
    }

    /**
     * Update button active states
     * @param {string} activePageId - The currently active page ID
     */
    function updateButtonStates(activePageId) {
        cachedElements.buttons.forEach(button => {
            const pageId = button.getAttribute('data-page');
            const isActive = pageId === activePageId;

            button.classList.toggle(CONFIG.activeClass, isActive);
            button.setAttribute('aria-pressed', isActive.toString());

            // Remove focus from inactive buttons
            if (!isActive) {
                button.blur();
            }
        });
    }

    /**
     * Smooth scroll to top
     */
    function scrollToTop() {
        // Use requestAnimationFrame for smooth scroll
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    /**
     * Dispatch custom page change event
     * @param {string} pageId - The new active page ID
     */
    function dispatchPageChangeEvent(pageId) {
        const event = new CustomEvent('pageChanged', {
            detail: { pageId: pageId },
            bubbles: true
        });
        document.dispatchEvent(event);
    }

    /**
     * Handle button click events
     */
    function handleButtonClick(event) {
        const button = event.currentTarget;
        const pageId = button.getAttribute('data-page');

        if (pageId) {
            showPage(pageId);
        }
    }

    /**
     * Handle keyboard navigation
     */
    function handleKeyboardNavigation(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            event.target.click();
        }
    }

    /**
     * Setup event listeners with event delegation
     */
    function setupEventListeners() {
        // Button click handlers
        cachedElements.buttons.forEach(button => {
            button.addEventListener('click', handleButtonClick);
            button.addEventListener('keydown', handleKeyboardNavigation);
        });

        // Window resize handler for responsive adjustments
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(handleWindowResize, 250);
        });

        // Prevent default on external links
        document.addEventListener('click', handleLinkClick);
    }

    /**
     * Handle window resize events
     */
    function handleWindowResize() {
        // Re-cache elements if needed (for dynamic content)
        const currentPageId = getCurrentPageId();
        if (currentPageId) {
            updateButtonStates(currentPageId);
        }
    }

    /**
     * Get currently active page ID
     * @returns {string|null} - The active page ID
     */
    function getCurrentPageId() {
        const activePage = document.querySelector(`${CONFIG.pageSelector}.${CONFIG.activeClass}`);
        return activePage ? activePage.id : null;
    }

    /**
     * Handle link clicks (WhatsApp, external links)
     */
    function handleLinkClick(event) {
        const link = event.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        const target = link.getAttribute('target');

        // Track external link clicks (optional analytics)
        if (href && (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('https://wa.me'))) {
            trackExternalLink(href);
        }
    }

    /**
     * Track external link clicks (optional - for analytics)
     * @param {string} url - The URL clicked
     */
    function trackExternalLink(url) {
        // This can be extended to send analytics data
        // For now, just log in development
        if (process.env.NODE_ENV === 'development') {
            console.log('External link clicked:', url);
        }
    }

    /**
     * Initialize page history with browser back/forward
     */
    function initializeHistory() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', function(event) {
            if (event.state && event.state.pageId) {
                showPage(event.state.pageId);
            }
        });

        // Push initial state
        const initialPageId = CONFIG.defaultPage;
        window.history.replaceState({ pageId: initialPageId }, '', '#' + initialPageId);
    }

    /**
     * Handle page visibility changes
     */
    function handleVisibilityChange() {
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                // Page is hidden (tab switched away)
                console.log('Page hidden');
            } else {
                // Page is visible (tab switched back)
                console.log('Page visible');
            }
        });
    }

    /**
     * Performance monitoring
     */
    function monitorPerformance() {
        if (window.performance && window.performance.timing) {
            window.addEventListener('load', function() {
                const perfData = window.performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                console.log('Page Load Time:', pageLoadTime + 'ms');

                // Optional: Send to analytics
                // analytics.trackTiming('pageLoadTime', pageLoadTime);
            });
        }
    }

    /**
     * Setup intersection observer for lazy loading (future enhancement)
     */
    function setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            const imageElements = document.querySelectorAll('img[data-lazy]');

            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.lazy;
                        img.removeAttribute('data-lazy');
                        observer.unobserve(img);
                    }
                });
            });

            imageElements.forEach(img => imageObserver.observe(img));
        }
    }

    /**
     * Service Worker registration (optional - for PWA)
     */
    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    }

    /**
     * Initialize mobile menu (hamburger menu for small screens)
     */
    function initializeMobileMenu() {
        const navContainer = document.querySelector('.nav-container');
        if (!navContainer) return;

        // Check if we need hamburger menu (mobile)
        if (window.innerWidth <= 768) {
            setupMobileMenuHandlers();
        }

        window.addEventListener('resize', function() {
            if (window.innerWidth <= 768) {
                setupMobileMenuHandlers();
            }
        });
    }

    /**
     * Setup mobile menu handlers
     */
    function setupMobileMenuHandlers() {
        const buttons = document.querySelectorAll('.nav-btn');
        buttons.forEach(button => {
            button.addEventListener('click', function() {
                // Could close menu on click (if hamburger menu implemented)
            });
        });
    }

    /**
     * Add smooth scrolling behavior
     */
    function enableSmoothScrolling() {
        // Check if browser supports smooth scroll
        if (CSS && CSS.supports && CSS.supports('scroll-behavior', 'smooth')) {
            document.documentElement.style.scrollBehavior = 'smooth';
        }
    }

    /**
     * Setup dark mode toggle (future enhancement)
     */
    function setupDarkModeToggle() {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('theme');

        if (savedTheme === 'dark' || (prefersDark && !savedTheme)) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (e.matches) {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
            }
        });
    }

    /**
     * Main initialization function
     */
    function init() {
        try {
            // Cache DOM elements
            cacheElements();

            // Validate cached elements
            if (!cachedElements.pages || !cachedElements.buttons) {
                console.error('Required DOM elements not found');
                return;
            }

            // Setup all event listeners
            setupEventListeners();

            // Initialize history
            initializeHistory();

            // Handle visibility changes
            handleVisibilityChange();

            // Monitor performance
            monitorPerformance();

            // Setup intersection observer
            setupIntersectionObserver();

            // Initialize mobile menu
            initializeMobileMenu();

            // Enable smooth scrolling
            enableSmoothScrolling();

            // Setup dark mode toggle
            setupDarkModeToggle();

            // Set default active page
            showPage(CONFIG.defaultPage);

            // Log initialization complete
            console.log('Application initialized successfully');

            // Optional: Register service worker for PWA support
            // registerServiceWorker();

        } catch (error) {
            console.error('Error during initialization:', error);
        }
    }

    // ===== INITIALIZE ON DOM READY =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM is already ready
        init();
    }

    // ===== EXPORT FOR TESTING/EXTERNAL USE =====
    // Make key functions available globally for testing
    window.EtherApp = {
        showPage: showPage,
        getCurrentPageId: getCurrentPageId,
        cacheElements: cacheElements
    };

})();

// ===== UTILITY: DEFER NON-CRITICAL RESOURCES =====
// Load non-critical resources after page load
if ('requestIdleCallback' in window) {
    requestIdleCallback(function() {
        // Load optional enhancements here
        console.log('Idle callback - loading optional features');
    });
} else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(function() {
        console.log('Deferred loading - loading optional features');
    }, 2000);
}

// ===== ANALYTICS HELPER =====
// Simple analytics tracking (optional)
const Analytics = {
    trackEvent: function(category, action, label) {
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                'event_category': category,
                'event_label': label
            });
        }
    },
    trackPageView: function(pageId) {
        this.trackEvent('navigation', 'page_view', pageId);
    }
};

// Track page views
document.addEventListener('pageChanged', function(event) {
    Analytics.trackPageView(event.detail.pageId);
});
