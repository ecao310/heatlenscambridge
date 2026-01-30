// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Interactive Before/After Slider
document.addEventListener('DOMContentLoaded', function() {
    const slider = document.querySelector('.image-slider');
    const afterImage = document.querySelector('.after-image');
    const sliderHandle = document.querySelector('.slider-handle');
    
    if (slider && afterImage && sliderHandle) {
        let isSliding = false;
        
        function updateSlider(x) {
            const rect = slider.getBoundingClientRect();
            const percentage = Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100));
            
            afterImage.style.clipPath = `polygon(${percentage}% 0%, 100% 0%, 100% 100%, ${percentage}% 100%)`;
            sliderHandle.style.left = `${percentage}%`;
        }
        
        // Mouse events
        sliderHandle.addEventListener('mousedown', function(e) {
            isSliding = true;
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', function(e) {
            if (isSliding) {
                updateSlider(e.clientX);
            }
        });
        
        document.addEventListener('mouseup', function() {
            isSliding = false;
        });
        
        // Touch events for mobile
        sliderHandle.addEventListener('touchstart', function(e) {
            isSliding = true;
            e.preventDefault();
        });
        
        document.addEventListener('touchmove', function(e) {
            if (isSliding && e.touches[0]) {
                updateSlider(e.touches[0].clientX);
            }
        });
        
        document.addEventListener('touchend', function() {
            isSliding = false;
        });
        
        // Click anywhere on slider to move handle
        slider.addEventListener('click', function(e) {
            if (!isSliding) {
                updateSlider(e.clientX);
            }
        });
        
        // Auto-demo animation on page load
        setTimeout(() => {
            let position = 50;
            let direction = 1;
            const autoSlide = setInterval(() => {
                position += direction * 2;
                if (position >= 80 || position <= 20) {
                    direction *= -1;
                }
                
                const rect = slider.getBoundingClientRect();
                const x = rect.left + (position / 100) * rect.width;
                updateSlider(x);
            }, 100);
            
            // Stop auto-demo after 5 seconds or on user interaction
            setTimeout(() => clearInterval(autoSlide), 5000);
            
            slider.addEventListener('mousedown', () => clearInterval(autoSlide));
            slider.addEventListener('touchstart', () => clearInterval(autoSlide));
        }, 1000);
    }
});

// Customer Reviews Data Model and Sample Content
const reviewsData = [
    {
        id: "review-001",
        quote: "I found an air leak around some of my window frames. The thermal images showed exactly where to add sealing.",
        author: "Eric C.",
        context: "The one with the thermal camera",
        featured: true
    },
        {
        id: "review-002",
        quote: "Your review will go here!",
        author: "You!",
        context: "Contact us to schedule an appointment",
        featured: true
    },
];
// Reviews Carousel Class - Handles review display and navigation
class ReviewsCarousel {
    constructor(containerSelector) {
        try {
            this.container = document.querySelector(containerSelector);
            
            // Error handling: Check if container exists
            if (!this.container) {
                console.warn(`ReviewsCarousel: Container not found with selector "${containerSelector}"`);
                return;
            }
            
            // Error handling: Validate and filter reviews data
            this.reviews = this.validateAndFilterReviews(reviewsData);
            this.currentIndex = 0;
            this.autoRotateInterval = null;
            this.autoRotateDelay = 5000; // 5 seconds
            this.inactivityTimer = null;
            this.inactivityDelay = 3000; // 3 seconds of inactivity before resuming
            this.isUserInteracting = false;
            
            // Performance optimization: Cache DOM elements
            this.cachedElements = {};
            this.isTransitioning = false;
            this.animationFrameId = null;
            this.eventListeners = new Map(); // Track event listeners for cleanup
            
            // Initialize regardless of reviews length - handle empty state gracefully
            this.init();
            
        } catch (error) {
            console.error('ReviewsCarousel: Error during initialization:', error);
            this.handleInitializationError();
        }
    }
    
    validateAndFilterReviews(reviewsData) {
        try {
            // Error handling: Check if reviewsData exists and is an array
            if (!reviewsData || !Array.isArray(reviewsData)) {
                console.warn('ReviewsCarousel: Invalid reviews data provided, using empty array');
                return [];
            }
            
            // Filter and validate each review
            const validReviews = reviewsData.filter(review => {
                // Basic validation - review must be an object
                if (!review || typeof review !== 'object') {
                    console.warn('ReviewsCarousel: Invalid review object found, skipping');
                    return false;
                }
                
                // Check for featured flag (default to true if missing)
                const isFeatured = review.featured !== undefined ? review.featured : true;
                
                return isFeatured;
            }).map(review => {
                // Ensure each review has required properties with fallbacks
                return {
                    id: review.id || `review-${Date.now()}-${Math.random()}`,
                    quote: review.quote || "Review content unavailable",
                    author: review.author || "Anonymous Customer",
                    context: review.context || "",
                    featured: review.featured !== undefined ? review.featured : true
                };
            });
            
            return validReviews;
            
        } catch (error) {
            console.error('ReviewsCarousel: Error validating reviews data:', error);
            return [];
        }
    }
    
    handleInitializationError() {
        // Fallback behavior when initialization fails
        if (this.container) {
            this.container.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <h3>Unable to load reviews</h3>
                    <p>We're having trouble displaying customer reviews right now. Please try refreshing the page.</p>
                </div>
            `;
        }
    }
    
    init() {
        try {
            // Error handling: Check if required DOM elements exist
            if (!this.validateRequiredElements()) {
                console.error('ReviewsCarousel: Required DOM elements not found');
                this.renderErrorState();
                return;
            }
            
            // Performance optimization: Cache DOM elements upfront
            this.cacheElements();
            
            // Performance optimization: Enable hardware acceleration
            this.enableHardwareAcceleration();
            
            this.renderCurrentReview();
            this.createDotIndicators();
            this.bindEvents();
            this.handleResponsiveLayout();
            
            // Only start auto-rotation if we have multiple reviews
            if (this.reviews.length > 1) {
                this.startAutoRotation();
            }
            
            this.setupInactivityDetection();
            this.preventTouchConflicts();
            
        } catch (error) {
            console.error('ReviewsCarousel: Error during initialization:', error);
            this.renderErrorState();
        }
    }
    
    // Performance optimization: Cache frequently accessed DOM elements
    cacheElements() {
        this.cachedElements = {
            reviewDisplay: this.container.querySelector('.review-display'),
            reviewContent: this.container.querySelector('.review-content'),
            quoteElement: this.container.querySelector('.review-quote'),
            authorElement: this.container.querySelector('.review-author strong'),
            contextElement: this.container.querySelector('.review-context'),
            navigation: this.container.querySelector('.review-navigation'),
            dotsContainer: this.container.querySelector('.review-dots'),
            prevBtn: this.container.querySelector('.nav-btn.prev'),
            nextBtn: this.container.querySelector('.nav-btn.next')
        };
    }
    
    // Performance optimization: Enable hardware acceleration for smooth animations
    enableHardwareAcceleration() {
        if (this.cachedElements.reviewContent) {
            this.cachedElements.reviewContent.style.willChange = 'transform, opacity';
            this.cachedElements.reviewContent.style.transform = 'translateZ(0)';
        }
        
        if (this.cachedElements.reviewDisplay) {
            this.cachedElements.reviewDisplay.style.willChange = 'transform';
        }
        
        // Enable hardware acceleration for navigation elements
        const navElements = [this.cachedElements.prevBtn, this.cachedElements.nextBtn];
        navElements.forEach(element => {
            if (element) {
                element.style.willChange = 'transform';
                element.style.transform = 'translateZ(0)';
            }
        });
    }
    
    validateRequiredElements() {
        // Check for essential DOM elements
        const requiredSelectors = [
            '.review-quote',
            '.review-author strong',
            '.review-context',
            '.review-navigation'
        ];
        
        for (const selector of requiredSelectors) {
            if (!this.container.querySelector(selector)) {
                console.warn(`ReviewsCarousel: Required element not found: ${selector}`);
                return false;
            }
        }
        
        return true;
    }
    
    renderErrorState() {
        try {
            const reviewDisplay = this.container.querySelector('.review-display');
            if (reviewDisplay) {
                reviewDisplay.innerHTML = `
                    <div class="review-content error-state">
                        <blockquote class="review-quote">
                            We're having trouble loading customer reviews right now.
                        </blockquote>
                        <div class="review-author">
                            <strong>HeatLens Cambridge Team</strong>
                        </div>
                        <div class="review-context">
                            Please try refreshing the page or contact us if the problem persists.
                        </div>
                    </div>
                `;
            }
            
            // Hide navigation for error state
            const navigation = this.container.querySelector('.review-navigation');
            if (navigation) {
                navigation.style.display = 'none';
            }
            
        } catch (error) {
            console.error('ReviewsCarousel: Error rendering error state:', error);
        }
    }
    
    handleResponsiveLayout() {
        // Adjust carousel behavior based on screen size
        const updateLayout = () => {
            const isMobile = window.innerWidth <= 767;
            const isTablet = window.innerWidth >= 768 && window.innerWidth <= 991;
            
            // Adjust auto-rotation timing for different devices
            if (isMobile) {
                this.autoRotateDelay = 6000; // Slower on mobile for better readability
            } else if (isTablet) {
                this.autoRotateDelay = 5500; // Slightly slower on tablet
            } else {
                this.autoRotateDelay = 5000; // Default for desktop
            }
            
            // Update navigation visibility based on screen size
            this.updateNavigationForScreenSize(isMobile, isTablet);
            
            // Restart auto-rotation with new timing
            if (this.autoRotateInterval) {
                this.restartAutoRotation();
            }
        };
        
        // Initial layout update
        updateLayout();
        
        // Update layout on window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(updateLayout, 250);
        });
    }
    
    updateNavigationForScreenSize(isMobile, isTablet) {
        const navigation = this.container.querySelector('.review-navigation');
        const prevBtn = this.container.querySelector('.nav-btn.prev');
        const nextBtn = this.container.querySelector('.nav-btn.next');
        const dots = this.container.querySelector('.review-dots');
        
        if (!navigation) return;
        
        if (this.reviews.length <= 1) {
            navigation.style.display = 'none';
            return;
        }
        
        navigation.style.display = 'flex';
        
        // Ensure proper touch targets on mobile
        if (isMobile) {
            if (prevBtn) {
                prevBtn.style.minWidth = '44px';
                prevBtn.style.minHeight = '44px';
            }
            if (nextBtn) {
                nextBtn.style.minWidth = '44px';
                nextBtn.style.minHeight = '44px';
            }
            
            // Ensure dots have proper touch targets
            const dotElements = this.container.querySelectorAll('.dot');
            dotElements.forEach(dot => {
                dot.style.minWidth = '44px';
                dot.style.minHeight = '44px';
            });
        }
    }
    
    renderCurrentReview() {
        try {
            // Performance optimization: Prevent multiple simultaneous transitions
            if (this.isTransitioning) {
                return;
            }
            
            // Error handling: Check if we have any reviews
            if (!this.reviews || this.reviews.length === 0) {
                this.renderEmptyState();
                return;
            }
            
            // Error handling: Validate current index
            if (this.currentIndex < 0 || this.currentIndex >= this.reviews.length) {
                console.warn(`ReviewsCarousel: Invalid currentIndex ${this.currentIndex}, resetting to 0`);
                this.currentIndex = 0;
            }
            
            const review = this.reviews[this.currentIndex];
            
            if (!review) {
                console.error('ReviewsCarousel: No review found at current index');
                this.renderEmptyState();
                return;
            }
            
            // Performance optimization: Use requestAnimationFrame for smooth rendering
            this.isTransitioning = true;
            
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
            }
            
            this.animationFrameId = requestAnimationFrame(() => {
                this.performRender(review);
                this.isTransitioning = false;
            });
            
        } catch (error) {
            console.error('ReviewsCarousel: Error rendering current review:', error);
            this.renderErrorState();
            this.isTransitioning = false;
        }
    }
    
    // Performance optimization: Batch DOM operations for efficient rendering
    performRender(review) {
        try {
            // Use cached elements for better performance
            const elements = this.cachedElements;
            
            if (!elements.quoteElement || !elements.authorElement || !elements.contextElement) {
                console.error('ReviewsCarousel: Required cached elements not found');
                this.renderErrorState();
                return;
            }
            
            // Performance optimization: Batch DOM updates to minimize reflows
            const fragment = document.createDocumentFragment();
            
            // Safely populate review content with fallbacks
            this.populateReviewContent(elements, review);
            
            // Add visual elements and update navigation
            this.addVisualElements();
            this.updateNavigationState();
            
        } catch (error) {
            console.error('ReviewsCarousel: Error performing render:', error);
            this.renderErrorState();
        }
    }
    
    getReviewElements() {
        try {
            const quoteElement = this.container.querySelector('.review-quote');
            const authorElement = this.container.querySelector('.review-author strong');
            const contextElement = this.container.querySelector('.review-context');
            
            const isValid = quoteElement && authorElement && contextElement;
            
            return {
                isValid,
                quoteElement,
                authorElement,
                contextElement
            };
            
        } catch (error) {
            console.error('ReviewsCarousel: Error getting review elements:', error);
            return { isValid: false };
        }
    }
    
    populateReviewContent(elements, review) {
        try {
            // Handle missing or invalid review data gracefully
            const safeQuote = this.sanitizeText(review.quote) || "Review content unavailable";
            const safeAuthor = this.sanitizeText(review.author) || "Anonymous Customer";
            const safeContext = this.sanitizeText(review.context) || "";
            
            // Performance optimization: Batch DOM updates to minimize reflows
            const updates = [];
            
            // Populate quote
            if (elements.quoteElement) {
                updates.push(() => {
                    elements.quoteElement.textContent = safeQuote;
                });
            }
            
            // Populate author
            if (elements.authorElement) {
                updates.push(() => {
                    elements.authorElement.textContent = safeAuthor;
                });
            }
            
            // Populate context (hide if empty)
            if (elements.contextElement) {
                updates.push(() => {
                    if (safeContext) {
                        elements.contextElement.textContent = safeContext;
                        elements.contextElement.style.display = 'block';
                    } else {
                        elements.contextElement.style.display = 'none';
                    }
                });
            }
            

            
            // Performance optimization: Execute all DOM updates in a single batch
            updates.forEach(update => update());
            
        } catch (error) {
            console.error('ReviewsCarousel: Error populating review content:', error);
            // Fallback to basic content
            if (elements.quoteElement) elements.quoteElement.textContent = "Review content unavailable";
            if (elements.authorElement) elements.authorElement.textContent = "Anonymous Customer";
            if (elements.contextElement) elements.contextElement.style.display = 'none';
        }
    }
    
    sanitizeText(text) {
        // Basic text sanitization and validation
        if (typeof text !== 'string') {
            return '';
        }
        
        // Remove potentially harmful content and trim whitespace
        return text.trim().replace(/<[^>]*>/g, '').substring(0, 500); // Limit length
    }
    
    addVisualElements() {
        const reviewContent = this.cachedElements.reviewContent;
        if (!reviewContent) return;
        
        // Performance optimization: Use CSS custom properties for dynamic styling
        reviewContent.style.setProperty('--review-bg-primary', '#f8f9fa');
        reviewContent.style.setProperty('--review-bg-secondary', '#ffffff');
        reviewContent.style.setProperty('--review-accent', 'rgba(255, 107, 107, 0.1)');
    }
    
    renderEmptyState() {
        try {
            const elements = this.getReviewElements();
            
            // Provide fallback even if elements are missing
            const quoteElement = elements.quoteElement || this.container.querySelector('.review-quote');
            const authorElement = elements.authorElement || this.container.querySelector('.review-author strong');
            const contextElement = elements.contextElement || this.container.querySelector('.review-context');
            
            if (quoteElement) {
                quoteElement.textContent = "Reviews coming soon!";
            }
            
            if (authorElement) {
                authorElement.textContent = "HeatLens Cambridge Team";
            }
            
            if (contextElement) {
                contextElement.textContent = "We're collecting customer experiences to share here";
                contextElement.style.display = 'block';
            }
            
            // Hide navigation for empty state
            this.hideNavigation();
            
        } catch (error) {
            console.error('ReviewsCarousel: Error rendering empty state:', error);
            // Ultimate fallback - create basic empty state
            this.createBasicEmptyState();
        }
    }
    
    createBasicEmptyState() {
        try {
            const reviewDisplay = this.container.querySelector('.review-display');
            if (reviewDisplay) {
                reviewDisplay.innerHTML = `
                    <div class="review-content">
                        <blockquote class="review-quote">Reviews coming soon!</blockquote>
                        <div class="review-author"><strong>HeatLens Cambridge Team</strong></div>
                        <div class="review-context">We're collecting customer experiences to share here</div>
                    </div>
                `;
            }
            this.hideNavigation();
        } catch (error) {
            console.error('ReviewsCarousel: Error creating basic empty state:', error);
        }
    }
    
    hideNavigation() {
        try {
            const navigation = this.container.querySelector('.review-navigation');
            if (navigation) {
                navigation.style.display = 'none';
            }
        } catch (error) {
            console.error('ReviewsCarousel: Error hiding navigation:', error);
        }
    }
    
    createDotIndicators() {
        try {
            const dotsContainer = this.cachedElements.dotsContainer;
            if (!dotsContainer) {
                console.warn('ReviewsCarousel: Dots container not found');
                return;
            }
            
            // Error handling: Don't create dots if we have 1 or fewer reviews
            if (!this.reviews || this.reviews.length <= 1) {
                dotsContainer.innerHTML = '';
                return;
            }
            
            // Performance optimization: Create dots in document fragment
            const fragment = document.createDocumentFragment();
            
            this.reviews.forEach((_, index) => {
                const dot = document.createElement('div');
                dot.className = 'dot';
                if (index === this.currentIndex) {
                    dot.classList.add('active');
                }
                
                // Performance optimization: Enable hardware acceleration for dots
                dot.style.willChange = 'transform';
                dot.style.transform = 'translateZ(0)';
                
                fragment.appendChild(dot);
            });
            
            // Performance optimization: Single DOM operation
            dotsContainer.innerHTML = '';
            dotsContainer.appendChild(fragment);
            
            // Ensure touch conflicts are prevented for new dots
            this.preventTouchConflicts();
            
        } catch (error) {
            console.error('ReviewsCarousel: Error creating dot indicators:', error);
        }
    }
    
    updateNavigationState() {
        try {
            // Error handling: Don't update navigation if no reviews
            if (!this.reviews || this.reviews.length === 0) {
                this.hideNavigation();
                return;
            }
            
            // Performance optimization: Batch DOM updates
            const updates = [];
            
            // Update dot indicators
            const dots = this.cachedElements.dotsContainer?.querySelectorAll('.dot') || [];
            dots.forEach((dot, index) => {
                try {
                    const isActive = index === this.currentIndex;
                    updates.push(() => {
                        dot.classList.toggle('active', isActive);
                    });
                } catch (dotError) {
                    console.warn('ReviewsCarousel: Error updating dot at index', index, dotError);
                }
            });
            
            // Update navigation buttons
            const prevBtn = this.cachedElements.prevBtn;
            const nextBtn = this.cachedElements.nextBtn;
            
            if (this.reviews.length <= 1) {
                // Hide navigation buttons for single or no reviews
                updates.push(() => {
                    if (prevBtn) prevBtn.style.display = 'none';
                    if (nextBtn) nextBtn.style.display = 'none';
                });
            } else {
                // Show and update navigation buttons
                updates.push(() => {
                    if (prevBtn) {
                        prevBtn.style.display = 'flex';
                    }
                    if (nextBtn) {
                        nextBtn.style.display = 'flex';
                    }
                });
            }
            
            // Performance optimization: Execute all updates in a single batch
            updates.forEach(update => update());
            
        } catch (error) {
            console.error('ReviewsCarousel: Error updating navigation state:', error);
        }
    }
    
    bindEvents() {
        // Performance optimization: Use cached elements and track event listeners
        const prevBtn = this.cachedElements.prevBtn;
        const nextBtn = this.cachedElements.nextBtn;
        
        // Navigation button events
        if (prevBtn) {
            const prevHandler = () => {
                this.handleUserInteraction();
                this.prevReview();
            };
            prevBtn.addEventListener('click', prevHandler);
            this.eventListeners.set(prevBtn, [{ event: 'click', handler: prevHandler }]);
        }
        
        if (nextBtn) {
            const nextHandler = () => {
                this.handleUserInteraction();
                this.nextReview();
            };
            nextBtn.addEventListener('click', nextHandler);
            this.eventListeners.set(nextBtn, [{ event: 'click', handler: nextHandler }]);
        }
        
        // Performance optimization: Use passive listeners where possible
        const mouseEnterHandler = () => {
            this.handleUserInteraction();
            this.pauseAutoRotation();
        };
        
        const mouseLeaveHandler = () => {
            this.scheduleAutoRotationResume();
        };
        
        const touchStartHandler = () => {
            this.handleUserInteraction();
            this.pauseAutoRotation();
        };
        
        const touchEndHandler = () => {
            this.scheduleAutoRotationResume();
        };
        
        // Pause auto-rotation on hover (desktop)
        this.container.addEventListener('mouseenter', mouseEnterHandler, { passive: true });
        this.container.addEventListener('mouseleave', mouseLeaveHandler, { passive: true });
        
        // Pause auto-rotation on touch (mobile)
        this.container.addEventListener('touchstart', touchStartHandler, { passive: true });
        this.container.addEventListener('touchend', touchEndHandler, { passive: true });
        
        // Track container event listeners for cleanup
        this.eventListeners.set(this.container, [
            { event: 'mouseenter', handler: mouseEnterHandler, options: { passive: true } },
            { event: 'mouseleave', handler: mouseLeaveHandler, options: { passive: true } },
            { event: 'touchstart', handler: touchStartHandler, options: { passive: true } },
            { event: 'touchend', handler: touchEndHandler, options: { passive: true } }
        ]);
        
        // Touch/swipe support for mobile devices
        this.addTouchSupport();
    }
    
    setupInactivityDetection() {
        // Track user activity to manage auto-rotation
        const activityEvents = ['mousedown', 'mousemove', 'scroll', 'touchstart', 'click'];
        
        activityEvents.forEach(event => {
            document.addEventListener(event, () => {
                this.handleUserInteraction();
            }, { passive: true });
        });
    }
    
    handleUserInteraction() {
        this.isUserInteracting = true;
        this.pauseAutoRotation();
        this.clearInactivityTimer();
    }
    
    scheduleAutoRotationResume() {
        this.clearInactivityTimer();
        this.inactivityTimer = setTimeout(() => {
            this.isUserInteracting = false;
            this.resumeAutoRotation();
        }, this.inactivityDelay);
    }
    
    clearInactivityTimer() {
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
            this.inactivityTimer = null;
        }
    }
    
    pauseAutoRotation() {
        if (this.autoRotateInterval) {
            clearInterval(this.autoRotateInterval);
            this.autoRotateInterval = null;
        }
    }
    
    resumeAutoRotation() {
        if (!this.isUserInteracting && this.reviews.length > 1) {
            this.startAutoRotation();
        }
    }
    
    isCarouselVisible() {
        // Check if the carousel is visible in the viewport
        const rect = this.container.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    }
    
    addTouchSupport() {
        const reviewDisplay = this.container.querySelector('.review-display');
        if (!reviewDisplay) return;
        
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;
        let minSwipeDistance = 50;
        let isSwipeInProgress = false;
        let swipeDirection = null;
        
        // Add visual feedback elements
        this.createSwipeIndicators();
        
        reviewDisplay.addEventListener('touchstart', (e) => {
            this.handleUserInteraction();
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isSwipeInProgress = false;
            swipeDirection = null;
            
            // Add touch start visual feedback
            reviewDisplay.classList.add('touch-active');
        }, { passive: true });
        
        reviewDisplay.addEventListener('touchmove', (e) => {
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const deltaX = currentX - startX;
            const deltaY = currentY - startY;
            const absDeltaX = Math.abs(deltaX);
            const absDeltaY = Math.abs(deltaY);
            
            // Determine if this is a horizontal swipe
            if (absDeltaX > absDeltaY && absDeltaX > 10) {
                isSwipeInProgress = true;
                swipeDirection = deltaX > 0 ? 'right' : 'left';
                
                // Prevent default scrolling during horizontal swipes
                e.preventDefault();
                
                // Provide visual feedback during swipe
                this.updateSwipeVisualFeedback(deltaX, absDeltaX);
            } else if (absDeltaY > absDeltaX && absDeltaY > 10) {
                // This is a vertical scroll, don't interfere
                isSwipeInProgress = false;
                swipeDirection = null;
                this.clearSwipeVisualFeedback();
            }
        }, { passive: false });
        
        reviewDisplay.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const absDeltaX = Math.abs(deltaX);
            const absDeltaY = Math.abs(deltaY);
            
            // Remove touch active state
            reviewDisplay.classList.remove('touch-active');
            
            // Only process horizontal swipes that meet minimum distance
            if (isSwipeInProgress && absDeltaX > absDeltaY && absDeltaX > minSwipeDistance) {
                // Provide completion visual feedback
                this.showSwipeCompletionFeedback(swipeDirection);
                
                if (deltaX > 0) {
                    // Swipe right - go to previous review
                    this.prevReview();
                } else {
                    // Swipe left - go to next review
                    this.nextReview();
                }
            } else {
                // Clear visual feedback if swipe wasn't completed
                this.clearSwipeVisualFeedback();
            }
            
            // Reset swipe state
            isSwipeInProgress = false;
            swipeDirection = null;
            
            // Schedule auto-rotation resume after touch ends
            this.scheduleAutoRotationResume();
        }, { passive: true });
        
        // Handle touch cancel (when user drags outside the element)
        reviewDisplay.addEventListener('touchcancel', () => {
            reviewDisplay.classList.remove('touch-active');
            this.clearSwipeVisualFeedback();
            isSwipeInProgress = false;
            swipeDirection = null;
            this.scheduleAutoRotationResume();
        }, { passive: true });
    }
    
    createSwipeIndicators() {
        // Create left swipe indicator
        const leftIndicator = document.createElement('div');
        leftIndicator.className = 'swipe-indicator swipe-left';
        leftIndicator.innerHTML = '‹';
        leftIndicator.setAttribute('aria-hidden', 'true');
        
        // Create right swipe indicator  
        const rightIndicator = document.createElement('div');
        rightIndicator.className = 'swipe-indicator swipe-right';
        rightIndicator.innerHTML = '›';
        rightIndicator.setAttribute('aria-hidden', 'true');
        
        const reviewDisplay = this.container.querySelector('.review-display');
        if (reviewDisplay) {
            reviewDisplay.appendChild(leftIndicator);
            reviewDisplay.appendChild(rightIndicator);
        }
    }
    
    updateSwipeVisualFeedback(deltaX, absDeltaX) {
        const reviewDisplay = this.container.querySelector('.review-display');
        const leftIndicator = this.container.querySelector('.swipe-indicator.swipe-left');
        const rightIndicator = this.container.querySelector('.swipe-indicator.swipe-right');
        
        if (!reviewDisplay || !leftIndicator || !rightIndicator) return;
        
        // Calculate opacity based on swipe progress (0 to 1)
        const progress = Math.min(absDeltaX / 100, 1);
        
        if (deltaX > 0) {
            // Swiping right (previous review)
            leftIndicator.style.opacity = progress;
            rightIndicator.style.opacity = 0;
            reviewDisplay.classList.add('swiping-right');
            reviewDisplay.classList.remove('swiping-left');
        } else {
            // Swiping left (next review)
            rightIndicator.style.opacity = progress;
            leftIndicator.style.opacity = 0;
            reviewDisplay.classList.add('swiping-left');
            reviewDisplay.classList.remove('swiping-right');
        }
    }
    
    showSwipeCompletionFeedback(direction) {
        const reviewDisplay = this.container.querySelector('.review-display');
        if (!reviewDisplay) return;
        
        // Add completion animation class
        reviewDisplay.classList.add(`swipe-complete-${direction}`);
        
        // Remove the class after animation completes
        setTimeout(() => {
            reviewDisplay.classList.remove(`swipe-complete-${direction}`);
            this.clearSwipeVisualFeedback();
        }, 300);
    }
    
    clearSwipeVisualFeedback() {
        const reviewDisplay = this.container.querySelector('.review-display');
        const leftIndicator = this.container.querySelector('.swipe-indicator.swipe-left');
        const rightIndicator = this.container.querySelector('.swipe-indicator.swipe-right');
        
        if (reviewDisplay) {
            reviewDisplay.classList.remove('swiping-left', 'swiping-right');
        }
        
        if (leftIndicator) leftIndicator.style.opacity = 0;
        if (rightIndicator) rightIndicator.style.opacity = 0;
    }
    
    preventTouchConflicts() {
        // Prevent touch conflicts with other page elements
        const reviewsSection = this.container;
        
        // Stop propagation of touch events within the reviews section
        // to prevent interference with page scrolling
        reviewsSection.addEventListener('touchstart', (e) => {
            // Only stop propagation if we're in the review display area
            const reviewDisplay = this.container.querySelector('.review-display');
            if (reviewDisplay && reviewDisplay.contains(e.target)) {
                // Don't stop propagation - let the addTouchSupport method handle it
                return;
            }
        }, { passive: true });
        
        // Ensure navigation buttons work properly on touch devices
        const navButtons = this.container.querySelectorAll('.nav-btn');
        navButtons.forEach(button => {
            button.addEventListener('touchstart', (e) => {
                e.stopPropagation();
            }, { passive: true });
            
            button.addEventListener('touchend', (e) => {
                e.stopPropagation();
            }, { passive: true });
        });
        
        // Ensure dot indicators work properly on touch devices
        const dots = this.container.querySelectorAll('.dot');
        dots.forEach(dot => {
            dot.addEventListener('touchstart', (e) => {
                e.stopPropagation();
            }, { passive: true });
            
            dot.addEventListener('touchend', (e) => {
                e.stopPropagation();
            }, { passive: true });
        });
    }
    
    nextReview() {
        try {
            // Error handling: Check if navigation is possible
            if (!this.reviews || this.reviews.length <= 1) {
                console.warn('ReviewsCarousel: Cannot navigate - insufficient reviews');
                return;
            }
            
            // Performance optimization: Prevent rapid navigation
            if (this.isTransitioning) {
                return;
            }
            
            this.cleanupAnimations();
            
            // Boundary condition: Circular navigation (wrap to beginning)
            this.currentIndex = (this.currentIndex + 1) % this.reviews.length;
            
            this.renderCurrentReview();
            
        } catch (error) {
            console.error('ReviewsCarousel: Error navigating to next review:', error);
            // Attempt to recover by staying at current position
            this.renderCurrentReview();
        }
    }
    
    prevReview() {
        try {
            // Error handling: Check if navigation is possible
            if (!this.reviews || this.reviews.length <= 1) {
                console.warn('ReviewsCarousel: Cannot navigate - insufficient reviews');
                return;
            }
            
            // Performance optimization: Prevent rapid navigation
            if (this.isTransitioning) {
                return;
            }
            
            this.cleanupAnimations();
            
            // Boundary condition: Circular navigation (wrap to end)
            this.currentIndex = this.currentIndex === 0 ? this.reviews.length - 1 : this.currentIndex - 1;
            
            this.renderCurrentReview();
            
        } catch (error) {
            console.error('ReviewsCarousel: Error navigating to previous review:', error);
            // Attempt to recover by staying at current position
            this.renderCurrentReview();
        }
    }
    
    goToReview(index) {
        try {
            // Error handling: Validate index bounds
            if (!this.reviews || this.reviews.length === 0) {
                console.warn('ReviewsCarousel: Cannot navigate - no reviews available');
                return;
            }
            
            if (typeof index !== 'number' || index < 0 || index >= this.reviews.length) {
                console.warn(`ReviewsCarousel: Invalid index ${index}, must be between 0 and ${this.reviews.length - 1}`);
                return;
            }
            
            if (index === this.currentIndex) {
                // Already at target index, no need to navigate
                return;
            }
            
            // Performance optimization: Prevent rapid navigation
            if (this.isTransitioning) {
                return;
            }
            
            this.cleanupAnimations();
            this.currentIndex = index;
            this.renderCurrentReview();
            
        } catch (error) {
            console.error('ReviewsCarousel: Error navigating to specific review:', error);
            // Attempt to recover by staying at current position
            this.renderCurrentReview();
        }
    }
    
    cleanupAnimations() {
        try {
            // Performance optimization: Cancel any pending animation frames
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
            
        } catch (error) {
            console.error('ReviewsCarousel: Error cleaning up animations:', error);
        }
    }
    
    // Performance optimization: Add cleanup method for memory management
    destroy() {
        try {
            // Cancel any pending animations
            this.cleanupAnimations();
            
            // Clear all timers
            this.pauseAutoRotation();
            this.clearInactivityTimer();
            
            // Remove all event listeners to prevent memory leaks
            this.eventListeners.forEach((listeners, element) => {
                listeners.forEach(({ event, handler, options }) => {
                    element.removeEventListener(event, handler, options);
                });
            });
            this.eventListeners.clear();
            
            // Clear cached elements
            this.cachedElements = {};
            
            // Reset will-change properties to free up GPU resources
            const elementsWithWillChange = this.container.querySelectorAll('[style*="will-change"]');
            elementsWithWillChange.forEach(element => {
                element.style.willChange = 'auto';
            });
            
            console.log('ReviewsCarousel: Successfully destroyed and cleaned up resources');
            
        } catch (error) {
            console.error('ReviewsCarousel: Error during cleanup:', error);
        }
    }
    
    startAutoRotation() {
        try {
            // Error handling: Only start if we have multiple reviews and user is not interacting
            if (!this.reviews || this.reviews.length <= 1 || this.isUserInteracting) {
                return;
            }
            
            this.pauseAutoRotation();
            this.autoRotateInterval = setInterval(() => {
                try {
                    // Only advance if user is not interacting and we still have reviews
                    if (!this.isUserInteracting && this.reviews && this.reviews.length > 1) {
                        this.nextReview();
                    }
                } catch (intervalError) {
                    console.error('ReviewsCarousel: Error during auto-rotation:', intervalError);
                    this.pauseAutoRotation(); // Stop auto-rotation on error
                }
            }, this.autoRotateDelay);
            
        } catch (error) {
            console.error('ReviewsCarousel: Error starting auto-rotation:', error);
        }
    }
    
    stopAutoRotation() {
        try {
            this.pauseAutoRotation();
            this.clearInactivityTimer();
        } catch (error) {
            console.error('ReviewsCarousel: Error stopping auto-rotation:', error);
        }
    }
    
    restartAutoRotation() {
        try {
            this.pauseAutoRotation();
            if (!this.isUserInteracting && this.reviews && this.reviews.length > 1) {
                this.startAutoRotation();
            }
        } catch (error) {
            console.error('ReviewsCarousel: Error restarting auto-rotation:', error);
        }
    }
}

// Initialize Reviews Carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the reviews carousel
    const reviewsCarousel = new ReviewsCarousel('#customer-reviews');
    
    // Performance optimization: Clean up resources when page unloads
    window.addEventListener('beforeunload', () => {
        if (reviewsCarousel && typeof reviewsCarousel.destroy === 'function') {
            reviewsCarousel.destroy();
        }
    });
    
    // Performance optimization: Clean up on page visibility change (mobile optimization)
    document.addEventListener('visibilitychange', () => {
        if (reviewsCarousel) {
            if (document.hidden) {
                // Page is hidden, pause auto-rotation to save resources
                reviewsCarousel.pauseAutoRotation();
            } else {
                // Page is visible again, resume auto-rotation if appropriate
                reviewsCarousel.resumeAutoRotation();
            }
        }
    });
});