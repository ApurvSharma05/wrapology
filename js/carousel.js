/**
 * Professional Product Carousel Implementation
 */
document.addEventListener('DOMContentLoaded', function() {
  // Initialize the carousel when the DOM is loaded
  initProductCarousel();
});

function initProductCarousel() {
  // Elements
  const track = document.querySelector('.carousel-track');
  const carouselContainer = document.querySelector('.carousel-container');
  const prevButton = document.querySelector('.carousel-arrow.prev');
  const nextButton = document.querySelector('.carousel-arrow.next');
  const navContainer = document.querySelector('.carousel-nav');
  
  // Show loading state
  const loader = document.createElement('div');
  loader.className = 'loader';
  carouselContainer.appendChild(loader);
  
  // Configuration
  let currentSlide = 0;
  let isDragging = false;
  let startPos = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let animationID = 0;
  let cardWidth = 0;
  let gap = 30; // Gap between cards in px
  let visibleCards = getVisibleCardCount();
  let autoplayTimer = null;
  let cards = [];
  
  // To prevent race conditions, initialize cards after a short delay
  setTimeout(() => {
    initializeCarousel();
  }, 100);
  
  function initializeCarousel() {
    // Generate cards from product data
    productData.forEach(product => {
      const card = createProductCard(product);
      track.appendChild(card);
    });
    
    // Remove loader after cards are added
    if (loader.parentElement) {
      loader.parentElement.removeChild(loader);
    }
    
    // Get all cards and set initial opacity
    cards = Array.from(track.querySelectorAll('.product-card'));
    
    // Calculate dimensions
    updateDimensions();
    
    // Generate navigation dots
    generateNavDots();
    
    // Set up touch and click events
    setupEvents();
    
    // Update controls state
    updateControls();
    
    // Start autoplay after a delay
    startAutoplay();
    
    // Show initial slide
    goToSlide(0, false);
  }
  
  function updateDimensions() {
    // Get current viewport width to determine visible cards
    visibleCards = getVisibleCardCount();
    
    // Get single card width including gap
    const cardRect = cards[0].getBoundingClientRect();
    cardWidth = cardRect.width;
    
    // Update carousel track width
    const totalWidth = cards.length * (cardWidth + gap) - gap;
    track.style.width = `${totalWidth}px`;
  }
  
  function generateNavDots() {
    // Clear existing dots
    navContainer.innerHTML = '';
    
    // Calculate number of pages (dots)
    const maxSlides = Math.max(0, cards.length - visibleCards);
    const pageCount = maxSlides + 1;
    
    // Create dots
    for (let i = 0; i < pageCount; i++) {
      const dot = document.createElement('div');
      dot.className = 'carousel-dot';
      if (i === 0) dot.classList.add('active');
      
      // Add accessibility attributes
      dot.setAttribute('role', 'button');
      dot.setAttribute('tabindex', '0');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      
      // Add event listeners
      dot.addEventListener('click', () => {
        goToSlide(i);
      });
      
      // Keyboard navigation
      dot.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goToSlide(i);
        }
      });
      
      navContainer.appendChild(dot);
    }
  }
  
  function setupEvents() {
    // Arrow button click events
    prevButton.addEventListener('click', () => {
      goToSlide(currentSlide - 1);
    });
    
    nextButton.addEventListener('click', () => {
      goToSlide(currentSlide + 1);
    });
    
    // Touch events for mobile swiping
    addPassiveEventListener(track, 'touchstart', touchStart);
    addPassiveEventListener(track, 'touchmove', touchMove);
    addPassiveEventListener(track, 'touchend', touchEnd);
    
    // Mouse events for desktop dragging
    track.addEventListener('mousedown', touchStart);
    track.addEventListener('mousemove', touchMove);
    track.addEventListener('mouseup', touchEnd);
    track.addEventListener('mouseleave', touchEnd);
    
    // Prevent context menu on right click during drag
    track.addEventListener('contextmenu', e => {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    });
    
    // Keyboard navigation
    carouselContainer.setAttribute('tabindex', '0');
    carouselContainer.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        goToSlide(currentSlide - 1);
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        goToSlide(currentSlide + 1);
        e.preventDefault();
      }
    });
    
    // Pause autoplay on interaction
    carouselContainer.addEventListener('mouseenter', stopAutoplay);
    carouselContainer.addEventListener('mouseleave', startAutoplay);
    carouselContainer.addEventListener('focusin', stopAutoplay);
    carouselContainer.addEventListener('focusout', startAutoplay);
    
    // Window resize event
    window.addEventListener('resize', debounce(() => {
      // Update dimensions and visible cards
      const oldVisibleCards = visibleCards;
      
      updateDimensions();
      
      // If visible cards count changed, regenerate dots
      if (oldVisibleCards !== visibleCards) {
        generateNavDots();
        
        // Make sure current slide is still valid
        const maxSlides = Math.max(0, cards.length - visibleCards);
        if (currentSlide > maxSlides) {
          currentSlide = maxSlides;
        }
      }
      
      // Update slide position
      goToSlide(currentSlide, false);
    }, 200));
  }
  
  function updateControls() {
    // Calculate the max slide index
    const maxSlides = Math.max(0, cards.length - visibleCards);
    
    // Update previous button state
    if (currentSlide <= 0) {
      prevButton.classList.add('disabled');
      prevButton.setAttribute('aria-disabled', 'true');
    } else {
      prevButton.classList.remove('disabled');
      prevButton.setAttribute('aria-disabled', 'false');
    }
    
    // Update next button state
    if (currentSlide >= maxSlides) {
      nextButton.classList.add('disabled');
      nextButton.setAttribute('aria-disabled', 'true');
    } else {
      nextButton.classList.remove('disabled');
      nextButton.setAttribute('aria-disabled', 'false');
    }
    
    // Update active dot
    const dots = navContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
      if (index === currentSlide) {
        dot.classList.add('active');
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.classList.remove('active');
        dot.setAttribute('aria-current', 'false');
      }
    });
  }
  
  function goToSlide(index, animate = true) {
    // Pause autoplay when manually navigating
    if (animate) {
      stopAutoplay();
      setTimeout(startAutoplay, 5000);
    }
    
    // Calculate the max slide index
    const maxSlides = Math.max(0, cards.length - visibleCards);
    
    // Ensure index is in bounds
    if (index < 0) index = 0;
    if (index > maxSlides) index = maxSlides;
    
    // Update current slide
    currentSlide = index;
    
    // Calculate translation value
    const translateX = -currentSlide * (cardWidth + gap);
    
    // Apply transition
    if (animate) {
      track.style.transition = 'transform var(--transition-normal)';
    } else {
      track.style.transition = 'none';
    }
    
    // Set transform
    track.style.transform = `translateX(${translateX}px)`;
    prevTranslate = translateX;
    
    // Update controls
    updateControls();
    
    // Update track position after transition
    if (animate) {
      setTimeout(() => {
        track.style.transition = '';
      }, 300);
    }
  }
  
  // Touch and mouse events
  function touchStart(e) {
    // Stop autoplay during interaction
    stopAutoplay();
    
    // Get initial position
    startPos = getPositionX(e);
    isDragging = true;
    
    // Cancel any existing animation
    cancelAnimationFrame(animationID);
    
    // Add dragging class
    track.classList.add('dragging');
    
    // Start animation
    animation();
  }
  
  function touchMove(e) {
    if (!isDragging) return;
    
    // Get current position
    const currentPosition = getPositionX(e);
    
    // Calculate movement
    currentTranslate = prevTranslate + currentPosition - startPos;
    
    // Add some resistance at the edges
    const maxTranslate = 0;
    const minTranslate = -(cards.length - visibleCards) * (cardWidth + gap);
    
    if (currentTranslate > maxTranslate) {
      currentTranslate = maxTranslate + (currentTranslate - maxTranslate) * 0.3;
    } else if (currentTranslate < minTranslate) {
      currentTranslate = minTranslate + (currentTranslate - minTranslate) * 0.3;
    }
    
    // Prevent page scrolling on touch devices
    if (e.type === 'touchmove') {
      e.preventDefault();
    }
  }
  
  function touchEnd(e) {
    // End dragging
    isDragging = false;
    
    // Remove dragging class
    track.classList.remove('dragging');
    
    // Calculate the movement
    const moveDistance = currentTranslate - prevTranslate;
    
    // Determine if we should change slide
    const threshold = cardWidth * 0.2; // 20% of card width
    
    if (Math.abs(moveDistance) > threshold) {
      // Direction
      const direction = moveDistance > 0 ? -1 : 1;
      
      // Calculate new index
      let newIndex = currentSlide + direction;
      
      // Ensure in bounds
      const maxSlides = Math.max(0, cards.length - visibleCards);
      if (newIndex < 0) newIndex = 0;
      if (newIndex > maxSlides) newIndex = maxSlides;
      
      // Go to new slide with momentum animation
      track.classList.add('momentum');
      goToSlide(newIndex, true);
      
      setTimeout(() => {
        track.classList.remove('momentum');
      }, 800);
    } else {
      // Stay on current slide
      goToSlide(currentSlide, true);
    }
    
    // Cancel animation
    cancelAnimationFrame(animationID);
    
    // Restart autoplay after a delay
    setTimeout(startAutoplay, 4000);
  }
  
  function animation() {
    // Apply transform during dragging
    if (isDragging) {
      track.style.transform = `translateX(${currentTranslate}px)`;
      animationID = requestAnimationFrame(animation);
    }
  }
  
  function getPositionX(e) {
    // Get touch or mouse position
    return e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
  }
  
  function startAutoplay() {
    // Clear any existing autoplay
    stopAutoplay();
    
    // Start autoplay
    autoplayTimer = setInterval(() => {
      const maxSlides = Math.max(0, cards.length - visibleCards);
      
      // Go to next slide or loop back to first
      if (currentSlide < maxSlides) {
        goToSlide(currentSlide + 1);
      } else {
        goToSlide(0);
      }
    }, 5000);
  }
  
  function stopAutoplay() {
    // Clear autoplay timer
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }
}