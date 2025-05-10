/**
 * Utility functions for the carousel
 */

// Debounce function to limit how often a function can run
function debounce(func, wait = 20, immediate = true) {
  let timeout;
  return function() {
    const context = this, args = arguments;
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

// Get visible card count based on screen width
function getVisibleCardCount() {
  const width = window.innerWidth;
  if (width >= 1200) return 4;
  if (width >= 992) return 3;
  if (width >= 768) return 2;
  return 1;
}

// Add event listener with passive option when supported
function addPassiveEventListener(element, eventName, handler) {
  let passive = false;
  
  try {
    // Test if passive option is supported
    const options = {
      get passive() {
        passive = true;
        return true;
      }
    };
    
    window.addEventListener('test', null, options);
    window.removeEventListener('test', null, options);
  } catch (err) {
    passive = false;
  }
  
  element.addEventListener(eventName, handler, passive ? { passive: true } : false);
}

// Create card HTML from product data
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.setAttribute('data-id', product.id);
  
  // Create product image
  const imageDiv = document.createElement('div');
  imageDiv.className = 'product-image';
  
  const img = document.createElement('img');
  img.src = product.image;
  img.alt = product.name;
  img.loading = 'lazy'; // Use lazy loading for images
  
  // Add error handling for images
  img.onerror = function() {
    this.src = 'https://images.pexels.com/photos/4498218/pexels-photo-4498218.jpeg';
    this.alt = 'Placeholder image';
  };
  
  imageDiv.appendChild(img);
  
  // Create product info
  const infoDiv = document.createElement('div');
  infoDiv.className = 'product-info';
  
  const title = document.createElement('h3');
  title.textContent = product.name;
  
  const description = document.createElement('p');
  description.textContent = product.description;
  
  // Create product specs
  const specsDiv = document.createElement('div');
  specsDiv.className = 'product-specs';
  
  product.specs.forEach(spec => {
    const specSpan = document.createElement('span');
    
    const icon = document.createElement('i');
    icon.className = spec.icon;
    
    specSpan.appendChild(icon);
    specSpan.appendChild(document.createTextNode(' ' + spec.text));
    
    specsDiv.appendChild(specSpan);
  });
  
  // Create product actions
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'product-actions';
  
  const quoteLink = document.createElement('a');
  quoteLink.href = '#';
  quoteLink.className = 'btn-small';
  quoteLink.textContent = 'Get Quote';
  quoteLink.addEventListener('click', function(e) {
    e.preventDefault();
    alert(`Request quote for ${product.name}`);
  });
  
  actionsDiv.appendChild(quoteLink);
  
  // Assemble the card
  infoDiv.appendChild(title);
  infoDiv.appendChild(description);
  infoDiv.appendChild(specsDiv);
  infoDiv.appendChild(actionsDiv);
  
  card.appendChild(imageDiv);
  card.appendChild(infoDiv);
  
  return card;
}

// Animation utility - animate elements with CSS classes
function animateElement(element, animationClass, duration = 300) {
  element.classList.add(animationClass);
  
  setTimeout(() => {
    element.classList.remove(animationClass);
  }, duration);
}

// Check if an element is in viewport
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Get device type
function getDeviceType() {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

// Easing functions
const easingFunctions = {
  linear: t => t,
  easeInQuad: t => t * t,
  easeOutQuad: t => t * (2 - t),
  easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeOutBack: t => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }
};