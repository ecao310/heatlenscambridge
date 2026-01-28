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
