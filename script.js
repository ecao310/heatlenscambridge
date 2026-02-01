document.addEventListener('DOMContentLoaded', () => {
    initComponentLoading();
    initSmoothScroll();
    initBeforeAfterSlider();
    initReviewCarousel();
});

// Component Loading
async function initComponentLoading() {
    const placeholders = [
        { id: 'header-placeholder', url: 'components/header.html' },
        { id: 'contact-placeholder', url: 'components/contact.html' },
        { id: 'footer-placeholder', url: 'components/footer.html' }
    ];

    for (const p of placeholders) {
        const el = document.getElementById(p.id);
        if (el) {
            try {
                const response = await fetch(p.url);
                const html = await response.text();
                el.outerHTML = html;
            } catch (err) {
                console.error(`Failed to load ${p.url}:`, err);
            }
        }
    }
}

// Smooth Scrolling
function initSmoothScroll() {
    document.addEventListener('click', (e) => {
        const anchor = e.target.closest('a[href^="#"]');
        if (anchor) {
            e.preventDefault();
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
}

// Before/After Slider
function initBeforeAfterSlider() {
    const slider = document.querySelector('.image-slider');
    const afterImage = document.querySelector('.after-image');
    const handle = document.querySelector('.slider-handle');

    if (!slider || !afterImage || !handle) return;

    const move = (e) => {
        const x = e.pageX || (e.touches ? e.touches[0].pageX : 0);
        const rect = slider.getBoundingClientRect();
        const position = Math.max(0, Math.min(rect.width, x - rect.left));
        const percentage = (position / rect.width) * 100;

        afterImage.style.clipPath = `polygon(${percentage}% 0, 100% 0, 100% 100%, ${percentage}% 100%)`;
        handle.style.left = `${percentage}%`;
    };

    slider.addEventListener('mousemove', move);
    slider.addEventListener('touchmove', move, { passive: true });
}

// Review Carousel
function initReviewCarousel() {
    const reviews = [
        {
            quote: "I found an air leak around some of my window frames. The thermal images showed exactly where to add sealing.",
            author: "Eric C.",
            context: "Cambridge Resident"
        },
        {
            quote: "This service is incredible. Found a major cold spot in my attic that I never would have noticed otherwise.",
            author: "Sarah L.",
            context: "Somerville Resident"
        },
        {
            quote: "Professional, friendly, and free! Highly recommend for anyone looking to save on heating bills.",
            author: "David M.",
            context: "Boston Homeowner"
        }
    ];

    let currentIndex = 0;
    const quoteEl = document.querySelector('.review-quote');
    const authorEl = document.querySelector('.review-author');
    const contextEl = document.querySelector('.review-context');
    const prevBtn = document.querySelector('.nav-btn.prev');
    const nextBtn = document.querySelector('.nav-btn.next');

    if (!quoteEl || !authorEl || !contextEl) return;

    function updateReview() {
        const r = reviews[currentIndex];
        quoteEl.style.opacity = 0;
        setTimeout(() => {
            quoteEl.textContent = r.quote;
            authorEl.textContent = r.author;
            contextEl.textContent = r.context;
            quoteEl.style.opacity = 1;
        }, 200);
    }

    prevBtn?.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + reviews.length) % reviews.length;
        updateReview();
    });

    nextBtn?.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % reviews.length;
        updateReview();
    });

    // Initial load
    updateReview();
    
    // Auto rotation
    setInterval(() => {
        currentIndex = (currentIndex + 1) % reviews.length;
        updateReview();
    }, 8000);
}