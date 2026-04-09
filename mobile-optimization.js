class MobileOptimizer {
    constructor() {
        this.isMobile = this.detectMobile();
        this.browser = this.detectBrowser();
        this.os = this.detectOS();
        this.init();
    }

    detectMobile() {
        const ua = navigator.userAgent;
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    }

    detectBrowser() {
        const ua = navigator.userAgent;
        
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        return 'Unknown';
    }

    detectOS() {
        const ua = navigator.userAgent;
        
        if (ua.includes('Android')) return 'Android';
        if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')) return 'iOS';
        if (ua.includes('Windows')) return 'Windows';
        if (ua.includes('Mac')) return 'macOS';
        if (ua.includes('Linux')) return 'Linux';
        return 'Unknown';
    }

    init() {
        if (this.isMobile) {
            this.optimizeForMobile();
        }
        
        // Detect standalone mode (PWA)
        if (window.navigator.standalone === true) {
            this.optimizeForStandalone();
        }

        // Listen for app installation
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.showInstallPrompt();
        });

        window.addEventListener('appinstalled', () => {
            console.log('App installed');
        });
    }

    optimizeForMobile() {
        // Hide address bar
        document.documentElement.style.height = '100%';
        document.body.style.height = '100%';

        // Add touch event optimization
        document.addEventListener('touchmove', (e) => {
            if (e.target.closest('.scrollable')) {
                e.target.closest('.scrollable')._scrolling = true;
            }
        }, false);

        // Optimize images for mobile
        this.optimizeImages();

        // Add safe area insets for notched devices
        this.addSafeAreaSupport();

        // Disable pinch zoom on inputs (except on iOS < 11)
        if (!/iPad|iPhone|iPod|OS [1-9]|OS 1[0]_/.test(navigator.userAgent)) {
            document.addEventListener('touchmove', (e) => {
                if (e.touches.length > 1) {
                    e.preventDefault();
                }
            }, { passive: false });
        }
    }

    optimizeForStandalone() {
        document.body.classList.add('standalone-mode');
        
        // Hide browser UI elements
        document.documentElement.style.height = '100vh';
        document.body.style.height = '100vh';
        
        // Optimize for full screen
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        }
    }

    optimizeImages() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            // Use srcset for responsive images
            if (!img.srcset) {
                img.srcset = `
                    ${img.src}?w=320 320w,
                    ${img.src}?w=640 640w,
                    ${img.src}?w=1024 1024w
                `;
                img.sizes = '(max-width: 640px) 100vw, 50vw';
            }

            // Lazy load images
            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src || img.src;
                            observer.unobserve(img);
                        }
                    });
                });
                observer.observe(img);
            }

            // Add loading="lazy"
            img.loading = 'lazy';
        });
    }

    addSafeAreaSupport() {
        const style = document.createElement('style');
        style.textContent = `
            body {
                padding-left: max(1rem, env(safe-area-inset-left));
                padding-right: max(1rem, env(safe-area-inset-right));
                padding-top: max(1rem, env(safe-area-inset-top));
                padding-bottom: max(1rem, env(safe-area-inset-bottom));
            }
        `;
        document.head.appendChild(style);
    }

    showInstallPrompt() {
        const installPrompt = document.getElementById('installPrompt');
        if (installPrompt) {
            installPrompt.style.display = 'block';
        }
    }

    // Get device info
    getDeviceInfo() {
        return {
            isMobile: this.isMobile,
            browser: this.browser,
            os: this.os,
            userAgent: navigator.userAgent,
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            dpr: window.devicePixelRatio,
            connection: navigator.connection?.effectiveType || 'unknown'
        };
    }
}

// Initialize
const optimizer = new MobileOptimizer();
