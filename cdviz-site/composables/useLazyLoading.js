import { ref, onMounted, onUnmounted } from 'vue';

/**
 * Progressive lazy loading composable
 * Optimizes resource loading for better Time to Interactive (TTI)
 */
export function useLazyLoading(options = {}) {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    loadDelay = 0
  } = options;

  const observer = ref(null);
  const loadedResources = ref(new Set());

  // Create intersection observer for progressive loading
  const createObserver = () => {
    if (typeof window === 'undefined') return;

    observer.value = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target;
          
          // Add loading delay to allow critical resources to finish
          setTimeout(() => {
            loadResource(element);
          }, loadDelay);

          // Stop observing once loaded
          observer.value.unobserve(element);
        }
      });
    }, {
      threshold,
      rootMargin
    });
  };

  // Load resource (image, iframe, etc.)
  const loadResource = (element) => {
    if (loadedResources.value.has(element)) return;

    if (element.tagName === 'IMG') {
      // Handle image loading
      const dataSrc = element.dataset.src;
      if (dataSrc) {
        // Add loading state
        element.classList.add('loading');
        
        // Create new image to preload
        const img = new Image();
        img.onload = () => {
          element.src = dataSrc;
          element.classList.remove('loading');
          element.classList.add('loaded');
          loadedResources.value.add(element);
        };
        img.onerror = () => {
          element.classList.remove('loading');
          element.classList.add('error');
        };
        img.src = dataSrc;
      }
    } else if (element.tagName === 'IFRAME') {
      // Handle iframe loading
      const dataSrc = element.dataset.src;
      if (dataSrc) {
        element.src = dataSrc;
        loadedResources.value.add(element);
      }
    }
  };

  // Observe element for lazy loading
  const observe = (element) => {
    if (!element || !observer.value) return;
    observer.value.observe(element);
  };

  // Observe multiple elements
  const observeMultiple = (elements) => {
    elements.forEach(element => observe(element));
  };

  // Load all remaining resources (e.g., after critical resources are done)
  const loadAll = () => {
    if (!observer.value) return;

    // Get all observed elements and load them
    const lazyElements = document.querySelectorAll('[data-src]:not(.loaded):not(.loading)');
    lazyElements.forEach(element => {
      loadResource(element);
      observer.value.unobserve(element);
    });
  };

  // Wait for critical resources then load deferred ones
  const loadAfterCritical = () => {
    // Wait for page load event
    if (document.readyState === 'complete') {
      // Add small delay to ensure critical resources are processed
      setTimeout(loadAll, 100);
    } else {
      window.addEventListener('load', () => {
        setTimeout(loadAll, 100);
      }, { once: true });
    }
  };

  // Lifecycle
  onMounted(() => {
    createObserver();
    
    // Auto-observe elements with data-lazy attribute
    const lazyElements = document.querySelectorAll('[data-lazy]');
    observeMultiple(Array.from(lazyElements));
  });

  onUnmounted(() => {
    if (observer.value) {
      observer.value.disconnect();
    }
    loadedResources.value.clear();
  });

  return {
    observe,
    observeMultiple,
    loadAll,
    loadAfterCritical,
    loadedResources
  };
}

/**
 * Smart image lazy loading with progressive enhancement
 */
export function useSmartImageLoading() {
  const lazyLoading = useLazyLoading({
    rootMargin: '100px', // Start loading 100px before entering viewport
    loadDelay: 50 // Small delay to prioritize critical resources
  });

  // Enhanced image loading with blur-up effect
  const loadImageWithBlurUp = (img) => {
    const dataSrc = img.dataset.src;
    const dataBlur = img.dataset.blur;
    
    if (!dataSrc) return;

    // Show blur placeholder if available
    if (dataBlur) {
      img.src = dataBlur;
      img.classList.add('blur-placeholder');
    }

    // Load full image
    const fullImg = new Image();
    fullImg.onload = () => {
      img.src = dataSrc;
      img.classList.remove('blur-placeholder', 'loading');
      img.classList.add('loaded');
    };
    fullImg.src = dataSrc;
  };

  return {
    ...lazyLoading,
    loadImageWithBlurUp
  };
}