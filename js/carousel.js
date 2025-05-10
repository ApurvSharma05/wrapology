// Modern Carousel Implementation
class ProductCarousel {
  constructor(container) {
    this.container = container;
    this.track = container.querySelector('.carousel-track');
    this.cards = Array.from(this.track.children);
    this.nav = container.querySelector('.carousel-nav');
    this.prevButton = container.querySelector('.carousel-arrow.prev');
    this.nextButton = container.querySelector('.carousel-arrow.next');
    
    this.cardWidth = 0;
    this.currentIndex = 0;
    this.isDragging = false;
    this.startPos = 0;
    this.currentTranslate = 0;
    this.prevTranslate = 0;
    this.animationID = 0;
    
    this.init();
  }
  
  init() {
    this.setupCards();
    this.createNav();
    this.setupEvents();
    this.updateControls();
    this.startAutoplay();
  }
  
  setupCards() {
    this.cardWidth = this.cards[0].offsetWidth;
    const gap = 30;
    const totalWidth = this.cards.length * (this.cardWidth + gap) - gap;
    this.track.style.width = `${totalWidth}px`;
    
    // Add animation delay to cards
    this.cards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`;
    });
  }
  
  createNav() {
    const dotsCount = Math.ceil(this.cards.length / this.getVisibleCards());
    this.nav.innerHTML = '';
    
    for (let i = 0; i < dotsCount; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => this.goToSlide(i));
      this.nav.appendChild(dot);
    }
  }
  
  setupEvents() {
    // Button controls
    this.prevButton.addEventListener('click', () => this.navigate(-1));
    this.nextButton.addEventListener('click', () => this.navigate(1));
    
    // Touch events
    this.track.addEventListener('touchstart', this.touchStart.bind(this));
    this.track.addEventListener('touchmove', this.touchMove.bind(this));
    this.track.addEventListener('touchend', this.touchEnd.bind(this));
    
    // Mouse events
    this.track.addEventListener('mousedown', this.touchStart.bind(this));
    this.track.addEventListener('mousemove', this.touchMove.bind(this));
    this.track.addEventListener('mouseup', this.touchEnd.bind(this));
    this.track.addEventListener('mouseleave', this.touchEnd.bind(this));
    
    // Prevent context menu on right click during drag
    this.track.addEventListener('contextmenu', e => {
      if (this.isDragging) e.preventDefault();
    });
    
    // Window resize
    window.addEventListener('resize', this.handleResize.bind(this));
  }
  
  getVisibleCards() {
    const width = window.innerWidth;
    if (width >= 1200) return 3;
    if (width >= 768) return 2;
    return 1;
  }
  
  navigate(direction) {
    const visibleCards = this.getVisibleCards();
    const maxIndex = Math.ceil(this.cards.length / visibleCards) - 1;
    
    this.currentIndex = Math.max(0, Math.min(this.currentIndex + direction, maxIndex));
    this.goToSlide(this.currentIndex);
  }
  
  goToSlide(index) {
    const visibleCards = this.getVisibleCards();
    const offset = index * (this.cardWidth + 30) * visibleCards;
    
    this.track.style.transform = `translateX(-${offset}px)`;
    this.currentIndex = index;
    this.updateControls();
  }
  
  updateControls() {
    const visibleCards = this.getVisibleCards();
    const maxIndex = Math.ceil(this.cards.length / visibleCards) - 1;
    
    this.prevButton.disabled = this.currentIndex === 0;
    this.nextButton.disabled = this.currentIndex === maxIndex;
    
    Array.from(this.nav.children).forEach((dot, i) => {
      dot.classList.toggle('active', i === this.currentIndex);
    });
  }
  
  touchStart(e) {
    this.isDragging = true;
    this.startPos = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    this.animationID = requestAnimationFrame(this.animation.bind(this));
    this.track.style.cursor = 'grabbing';
  }
  
  touchMove(e) {
    if (!this.isDragging) return;
    
    const currentPosition = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    this.currentTranslate = this.prevTranslate + currentPosition - this.startPos;
  }
  
  touchEnd() {
    this.isDragging = false;
    cancelAnimationFrame(this.animationID);
    
    const movedBy = this.currentTranslate - this.prevTranslate;
    
    if (Math.abs(movedBy) > this.cardWidth / 4) {
      if (movedBy < 0) {
        this.navigate(1);
      } else {
        this.navigate(-1);
      }
    } else {
      this.goToSlide(this.currentIndex);
    }
    
    this.track.style.cursor = '';
  }
  
  animation() {
    if (this.isDragging) {
      this.track.style.transform = `translateX(${this.currentTranslate}px)`;
      requestAnimationFrame(this.animation.bind(this));
    }
  }
  
  handleResize() {
    const oldVisible = this.getVisibleCards();
    this.setupCards();
    
    if (oldVisible !== this.getVisibleCards()) {
      this.createNav();
      this.goToSlide(0);
    }
  }
  
  startAutoplay() {
    setInterval(() => {
      const visibleCards = this.getVisibleCards();
      const maxIndex = Math.ceil(this.cards.length / visibleCards) - 1;
      
      if (this.currentIndex < maxIndex) {
        this.navigate(1);
      } else {
        this.goToSlide(0);
      }
    }, 5000);
  }
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const carousels = document.querySelectorAll('.carousel-container');
  carousels.forEach(carousel => new ProductCarousel(carousel));
});