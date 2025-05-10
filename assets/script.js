document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    
    // Set up a MutationObserver to detect when new content is loaded into the page
    const contentElement = document.getElementById('content');
    if (contentElement) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    // New content was loaded, initialize the carousels
                    initCarousels();
                    setupLightbox();
                    // Add the back to top button when new content is loaded
                    setupBackToTop();
                }
            });
        });

        // Start observing the content element for DOM changes
        observer.observe(contentElement, { childList: true });
    }
    
    // Initialize carousels
    initCarousels();
    
    // Form submission handling
    setupFormHandlers();
    
    // Certificate Lightbox functionality
    setupLightbox();
    
    // Smooth scrolling for anchors
    setupSmoothScrolling();
    
    // Initialize all carousels
    const carousels = document.querySelectorAll('.featured-products, .product-category');
    carousels.forEach(setupCarousel);
    
    // Setup dropdown menus
    setupDropdowns();
    
    // Setup mobile navigation
    setupMobileNav();
    
    // Setup back to top button
    setupBackToTop();
    
    // Setup mobile optimizations
    setupMobileOptimizations();
});

function initNavigation() {
    // Mobile Navigation Toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', function() {
            mainNav.querySelector('.nav-list').classList.toggle('active');
            this.classList.toggle('active');
        });
    }
    
    // Close mobile menu when a link is clicked
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                const navList = document.querySelector('.nav-list');
                if (navList) navList.classList.remove('active');
                if (mobileMenuToggle) mobileMenuToggle.classList.remove('active');
            }
        });
    });
    
    // Dropdown functionality for mobile
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const dropdownToggle = dropdown.querySelector('.dropdown-toggle');
        
        // Handle mobile dropdown click
        if (dropdownToggle) {
            dropdownToggle.addEventListener('click', function(e) {
                // Only intercept clicks on mobile
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    
                    // Close all other dropdowns
                    dropdowns.forEach(item => {
                        if (item !== dropdown) {
                            item.classList.remove('active');
                        }
                    });
                    
                    // Toggle current dropdown
                    dropdown.classList.toggle('active');
                }
            });
        }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        if (window.innerWidth > 768) {
            dropdowns.forEach(dropdown => {
                if (!dropdown.contains(event.target)) {
                    dropdown.classList.remove('active');
                }
            });
        }
    });
    
    // Window resize handler
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            // Reset mobile menu when switching to desktop view
            if (mainNav) {
                const navList = mainNav.querySelector('.nav-list');
                if (navList) navList.classList.remove('active');
            }
            
            if (mobileMenuToggle) {
            mobileMenuToggle.classList.remove('active');
            }
            
            // Reset all dropdowns
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
        
        // Re-initialize carousels on resize to adjust for new viewport
        initCarousels();
    });
}

function initCarousels() {
    // Initialize all carousels
    const carousels = document.querySelectorAll('.featured-products, .product-category');
    carousels.forEach(setupCarousel);
}

function setupCarousel(carouselContainer) {
    const productGrid = carouselContainer.querySelector('.product-grid');
    const cards = productGrid.querySelectorAll('.product-card');
    const container = carouselContainer.querySelector('.container');
    
    // Don't setup if no cards or already initialized
    if (!cards.length || carouselContainer.classList.contains('carousel-initialized')) return;
    
    let currentIndex = 0;
    let startX, moveX;
    let touchThreshold = 50; // Minimum distance to register as a swipe
    let autoSlideInterval = null;
    let isAnimating = false;
    
    // Create carousel controls
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'carousel-controls';
    
    const prevButton = document.createElement('button');
    prevButton.className = 'carousel-arrow prev';
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    
    const nextButton = document.createElement('button');
    nextButton.className = 'carousel-arrow next';
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    
    controlsDiv.appendChild(prevButton);
    controlsDiv.appendChild(nextButton);
    
    // Create navigation dots
    const navDiv = document.createElement('div');
    navDiv.className = 'carousel-nav';
    
    // Initial setup
    let visibleCards = getVisibleCardCount();
    let maxIndex = Math.max(0, cards.length - visibleCards);
    
    updateCardSizes();
    createNavDots();
    
    // Append controls
    carouselContainer.appendChild(controlsDiv);
    carouselContainer.appendChild(navDiv);
    
    // Add event listeners
    prevButton.addEventListener('click', () => navigate(-1));
    nextButton.addEventListener('click', () => navigate(1));
    
    // Add touch swipe functionality
    productGrid.addEventListener('touchstart', handleTouchStart, { passive: true });
    productGrid.addEventListener('touchmove', handleTouchMove, { passive: true });
    productGrid.addEventListener('touchend', handleTouchEnd);
    
    // Add keyboard navigation
    carouselContainer.setAttribute('tabindex', '0');
    carouselContainer.addEventListener('keydown', handleKeydown);
    
    // Pause auto sliding on hover
    carouselContainer.addEventListener('mouseenter', pauseAutoSlide);
    carouselContainer.addEventListener('mouseleave', startAutoSlide);
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Start auto sliding
    startAutoSlide();
    
    // Add initial position
    updatePosition(true);
    
    // Mark as initialized
    carouselContainer.classList.add('carousel-initialized');
    
    // Add fade-in animation to cards
    cards.forEach(card => {
        card.style.opacity = '0';
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease';
            card.style.opacity = '1';
        }, 100);
    });
    
    // Force initial position update
    setTimeout(updatePosition, 100);
    
    function getVisibleCardCount() {
        const viewportWidth = window.innerWidth;
        if (viewportWidth > 1200) return 4;  // Increased for larger screens
        if (viewportWidth > 992) return 3;   // Increased from 2 to 3
        if (viewportWidth > 576) return 2;
        return 1;
    }
    
    function updateCardSizes() {
        const gapSize = 30; // Fixed gap size in pixels
        const containerWidth = carouselContainer.clientWidth;
        visibleCards = getVisibleCardCount();
        
        // Calculate card width
        let cardWidth;
        if (visibleCards === 1) {
            cardWidth = Math.min(containerWidth * 0.85, 320); // 85% of container width or 320px max
        } else {
            // Account for gaps between cards
            cardWidth = (containerWidth - (gapSize * (visibleCards - 1))) / visibleCards;
            cardWidth = Math.min(cardWidth - 20, 380); // Subtract padding, max width 380px
        }
        
        // Update cards
        cards.forEach(card => {
            card.style.width = `${cardWidth}px`;
            // Maintain aspect ratio
            card.style.minWidth = card.style.width;
            
            // Set fixed height based on width to maintain proper aspect ratio
            const productImage = card.querySelector('.product-image');
            if (productImage) {
                productImage.style.height = `${cardWidth * 0.75}px`;
            }
            
            // Enhance visibility of text on mobile devices
            if (window.innerWidth <= 576) {
                const title = card.querySelector('.product-title');
                const price = card.querySelector('.product-price');
                
                if (title) title.style.fontSize = '16px';
                if (price) price.style.fontSize = '15px';
            }
        });
        
        // Update maxIndex
        maxIndex = Math.max(0, cards.length - visibleCards);
        
        // Adjust current index if needed
        if (currentIndex > maxIndex) {
            currentIndex = maxIndex;
            updatePosition(true);
        }
        
        // Update dot count
        createNavDots();
    }
    
    function createNavDots() {
        // Clear existing dots
        navDiv.innerHTML = '';
        
        // Create dots based on number of pages
        const dotCount = maxIndex + 1;
        
        for (let i = 0; i < dotCount; i++) {
            const dot = document.createElement('div');
            dot.className = 'carousel-dot';
            if (i === currentIndex) dot.classList.add('active');
            
            // Add aria labels for accessibility
            dot.setAttribute('role', 'button');
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.setAttribute('tabindex', '0');
            
            // Make dots larger and more tappable on mobile
            if (window.innerWidth <= 576) {
                dot.style.width = '14px';
                dot.style.height = '14px';
                dot.style.margin = '0 6px';
            }
            
            dot.addEventListener('click', () => {
                currentIndex = i;
                updatePosition();
            });
            
            // Add keyboard support
            dot.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    currentIndex = i;
                    updatePosition();
                }
            });
            
            navDiv.appendChild(dot);
        }
        
        // Show dots only if we have more than one page
        navDiv.style.display = dotCount > 1 ? 'flex' : 'none';
        
        // Position nav dots better on mobile
        if (window.innerWidth <= 576) {
            navDiv.style.bottom = '10px';
        }
    }
    
    function updatePosition(immediate = false) {
        // Calculate total width of cards including gaps
        const cardWidth = cards[0].offsetWidth;
        const gapSize = 30; // Same as CSS gap
        
        // Calculate offset
        const offset = currentIndex * (cardWidth + gapSize);
        
        // Update transform
        if (immediate) {
            productGrid.style.transition = 'none';
            requestAnimationFrame(() => {
                productGrid.style.transform = `translateX(-${offset}px)`;
                requestAnimationFrame(() => {
                    productGrid.style.transition = 'transform 0.5s ease';
                });
            });
        } else {
            isAnimating = true;
            productGrid.style.transform = `translateX(-${offset}px)`;
            
            // Reset isAnimating after transition completes
            setTimeout(() => {
                isAnimating = false;
            }, 500);
        }
        
        // Update active dot
        const dots = navDiv.querySelectorAll('.carousel-dot');
        dots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === currentIndex);
        });
        
        // Update button states for accessibility
        prevButton.disabled = currentIndex === 0;
        nextButton.disabled = currentIndex === maxIndex;
        
        // Update aria attributes
        prevButton.setAttribute('aria-disabled', currentIndex === 0);
        nextButton.setAttribute('aria-disabled', currentIndex === maxIndex);
        
        // Add screen reader text
        prevButton.setAttribute('aria-label', 'Previous slide');
        nextButton.setAttribute('aria-label', 'Next slide');
        
        // Show/hide controls if needed
        controlsDiv.style.display = maxIndex > 0 ? 'flex' : 'none';
        
        // Make buttons larger on mobile
        if (window.innerWidth <= 576) {
            prevButton.style.width = '40px';
            prevButton.style.height = '40px';
            nextButton.style.width = '40px';
            nextButton.style.height = '40px';
        }
    }
    
    function navigate(direction) {
        if (isAnimating) return;
        
        currentIndex += direction;
        // Boundary check
        if (currentIndex < 0) currentIndex = 0;
        if (currentIndex > maxIndex) currentIndex = maxIndex;
        
        updatePosition();
        pauseAutoSlide(); // Pause auto-sliding when user interacts
        setTimeout(startAutoSlide, 5000); // Restart after 5 seconds
    }
    
    function handleTouchStart(e) {
        startX = e.touches[0].clientX;
        pauseAutoSlide();
        
        // Add active touch state to indicate the carousel is being interacted with
        productGrid.classList.add('touch-active');
    }
    
    function handleTouchMove(e) {
        if (!startX) return;
        
        moveX = e.touches[0].clientX;
        const diff = moveX - startX;
        
        // Apply a more responsive movement to follow finger on mobile
        if (Math.abs(diff) > 5) { // Reduced threshold for more responsive feeling
            const cardWidth = cards[0].offsetWidth;
            const gapSize = 30;
            const baseOffset = currentIndex * (cardWidth + gapSize);
            const moveOffset = Math.max(
                0, 
                Math.min(
                    baseOffset - diff * 0.8, // Increased from 0.5 for more responsive movement
                    (cards.length - visibleCards) * (cardWidth + gapSize)
                )
            );
            
            productGrid.style.transition = 'none';
            productGrid.style.transform = `translateX(-${moveOffset}px)`;
            
            // Prevent page scrolling if significant horizontal movement
            if (Math.abs(diff) > 10) { // Reduced from 30 to 10
                e.preventDefault();
            }
        }
    }
    
    function handleTouchEnd(e) {
        productGrid.classList.remove('touch-active');
        
        if (!startX || !moveX) {
            startX = null;
            moveX = null;
            return;
        }
        
        const diff = moveX - startX;
        
        // Make swiping more sensitive for mobile devices
        const adjustedThreshold = window.innerWidth <= 576 ? 30 : touchThreshold; // Lower threshold on small screens
        
        if (Math.abs(diff) > adjustedThreshold) {
            // Left swipe
            if (diff < 0 && currentIndex < maxIndex) {
                navigate(1);
            }
            // Right swipe
            else if (diff > 0 && currentIndex > 0) {
                navigate(-1);
            } else {
                // Snap back to current position
                updatePosition();
            }
        } else {
            // Snap back to current position
            updatePosition();
        }
        
        startX = null;
        moveX = null;
        setTimeout(startAutoSlide, 5000);
    }
    
    function handleKeydown(e) {
        if (e.key === 'ArrowLeft') {
            navigate(-1);
            e.preventDefault();
        } else if (e.key === 'ArrowRight') {
            navigate(1);
            e.preventDefault();
        }
    }
    
    function startAutoSlide() {
        // Only auto slide on screens larger than 768px
        if (window.innerWidth <= 768) return;
        
        clearInterval(autoSlideInterval);
        autoSlideInterval = setInterval(() => {
            if (currentIndex < maxIndex) {
                currentIndex++;
                updatePosition();
            } else {
                currentIndex = 0;
                updatePosition();
            }
        }, 6000);
    }
    
    function pauseAutoSlide() {
        clearInterval(autoSlideInterval);
    }
    
    function handleResize() {
        const newVisibleCards = getVisibleCardCount();
        
        // If visible card count changes, we need to recalculate
        if (newVisibleCards !== visibleCards) {
            updateCardSizes();
            updatePosition(true);
        }
    }
}

function setupDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const button = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        // Toggle menu on button click
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });
        
        // Close when clicking outside
        document.addEventListener('click', () => {
            dropdown.classList.remove('show');
        });
        
        // Prevent menu clicks from closing
        menu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });
}

function setupMobileNav() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const closeMenu = document.querySelector('.close-menu');
    const overlay = document.querySelector('.overlay');
    
    if (!menuToggle || !mobileNav) return;
    
    // Toggle mobile menu
    menuToggle.addEventListener('click', () => {
        mobileNav.classList.add('open');
        if (overlay) overlay.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    });
    
    // Close mobile menu
    if (closeMenu) {
        closeMenu.addEventListener('click', closeMobileNav);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeMobileNav);
    }
    
    function closeMobileNav() {
        mobileNav.classList.remove('open');
        if (overlay) overlay.classList.remove('show');
        document.body.style.overflow = ''; // Restore scrolling
    }
    
    // Handle mobile sub-menus
    const subMenuToggles = mobileNav.querySelectorAll('.has-children > a');
    
    subMenuToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const parent = toggle.parentElement;
            const subMenu = parent.querySelector('ul');
            
            parent.classList.toggle('expanded');
            
            if (subMenu) {
                if (parent.classList.contains('expanded')) {
                    subMenu.style.maxHeight = subMenu.scrollHeight + 'px';
                } else {
                    subMenu.style.maxHeight = '0';
                }
            }
        });
    });
}

function setupFormHandlers() {
    // Contact form handler
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic email validation
            const emailInput = this.querySelector('input[type="email"]');
            if (emailInput && !validateEmail(emailInput.value)) {
                alert('Please enter a valid email address.');
                emailInput.focus();
                return;
            }
            
            // Here you would typically send the data to your server
            // For now, we'll just show a success message
            const formData = new FormData(this);
            let formValues = {};
            
            formData.forEach((value, key) => {
                formValues[key] = value;
            });
            
            console.log('Form submitted with values:', formValues);
            
            // Show success message
            this.innerHTML = '<div class="success-message"><i class="fas fa-check-circle"></i><h3>Thank you for your message!</h3><p>We\'ll get back to you as soon as possible.</p></div>';
        });
    }
    
    // Consultation form handler
    const consultationForm = document.getElementById('consultation-form');
    if (consultationForm) {
        consultationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic validation
            const emailInput = this.querySelector('input[type="email"]');
            if (emailInput && !validateEmail(emailInput.value)) {
                alert('Please enter a valid email address.');
                emailInput.focus();
                return;
            }
            
            // Here you would send the data to your server
            console.log('Consultation form submitted');
            
            // Show success message
            this.innerHTML = '<div class="success-message"><i class="fas fa-check-circle"></i><h3>Thank you for your consultation request!</h3><p>Our team will contact you shortly to discuss your needs.</p></div>';
        });
    }
}

function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function setupSmoothScrolling() {
    // Get all links that have hash
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#" or it's handling page loading
            if (href === '#' || this.hasAttribute('onclick')) {
                return;
            }
            
                e.preventDefault();
                
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
                if (targetElement) {
                    targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                    });
            }
        });
    });
}

function setupLightbox() {
    // Certificate image lightbox
    const certificateImages = document.querySelectorAll('.product-image img');
    
    certificateImages.forEach(img => {
        img.addEventListener('click', function() {
            // Create lightbox elements
            const lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            
            const lightboxContent = document.createElement('div');
            lightboxContent.className = 'lightbox-content';
            
            const closeBtn = document.createElement('span');
                    closeBtn.className = 'lightbox-close';
                    closeBtn.innerHTML = '&times;';
            
            const lightboxImg = document.createElement('img');
            lightboxImg.src = this.src;
            
            // Append elements
            lightboxContent.appendChild(closeBtn);
            lightboxContent.appendChild(lightboxImg);
            lightbox.appendChild(lightboxContent);
            document.body.appendChild(lightbox);
            
            // Add fade-in animation
            setTimeout(() => {
                lightbox.classList.add('active');
            }, 10);
            
            // Close lightbox when clicking outside or on close button
                    lightbox.addEventListener('click', function(e) {
                        if (e.target === lightbox || e.target === closeBtn) {
                            lightbox.classList.remove('active');
                    
                    // Remove from DOM after animation
                    setTimeout(() => {
                        document.body.removeChild(lightbox);
                    }, 300);
                }
            });
        });
    });
}

function setupMobileOptimizations() {
    // Prevent double-tap to zoom on buttons and navigation items
    const touchTargets = document.querySelectorAll('.btn, .btn-small, .nav-link, .carousel-dot, .dropdown-item a');
    touchTargets.forEach(element => {
        element.addEventListener('touchend', function(e) {
            // Add active touch state
            this.classList.add('touch-active');
            
            // Remove it after animation completes
            setTimeout(() => {
                this.classList.remove('touch-active');
            }, 300);
        });
    });
    
    // Add fast click for mobile devices to reduce tap delay
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
        
        // Add visual feedback for touch on cards
        const cards = document.querySelectorAll('.product-card');
        cards.forEach(card => {
            card.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            }, { passive: true });
            
            card.addEventListener('touchend', function() {
                this.classList.remove('touch-active');
            });
            
            card.addEventListener('touchcancel', function() {
                this.classList.remove('touch-active');
            });
        });
    }
    
    // Optimize images for mobile
    if (window.innerWidth <= 768) {
        // Delay loading of non-critical images
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            // Set up intersection observer for lazy loading
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        img.src = img.getAttribute('data-src');
                        observer.unobserve(img);
                    }
                });
            });
            
            observer.observe(img);
        });
    }
}

function setupBackToTop() {
    // Create back to top button if it doesn't exist
    if (!document.querySelector('.back-to-top')) {
        const backToTop = document.createElement('div');
        backToTop.className = 'back-to-top';
        backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
        document.body.appendChild(backToTop);
        
        // Add click handler
        backToTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // Add keyboard accessibility
        backToTop.setAttribute('tabindex', '0');
        backToTop.setAttribute('role', 'button');
        backToTop.setAttribute('aria-label', 'Back to top');
        backToTop.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                        }
                    });
                }
                
    // Show/hide back to top button based on scroll position
    const backToTopButton = document.querySelector('.back-to-top');
    
    // Only set up the scroll listener once
    if (!window.backToTopListenerAdded) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });
        
        window.backToTopListenerAdded = true;
    }
    
    // Initial check for scroll position
    if (window.pageYOffset > 300) {
        backToTopButton.classList.add('visible');
    }
} 