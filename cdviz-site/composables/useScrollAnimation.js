import { ref, onMounted, onUnmounted } from 'vue';

/**
 * Professional scroll-triggered animation composable
 * Provides sophisticated intersection observer-based animations
 */
export function useScrollAnimation(options = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    once = true,
    stagger = 0,
    animationClass = 'animate-in',
    duration = 600
  } = options;

  const elements = ref(new Map());
  const observer = ref(null);
  const isVisible = ref(false);

  // Animation configurations - only keep used animations
  const animationTypes = {
    'fade-in': {
      class: 'animate-fade-in'
    },
    'slide-up': {
      class: 'animate-slide-up'
    }
  };

  // Create intersection observer
  const createObserver = () => {
    if (typeof window === 'undefined') return;

    observer.value = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        const element = entry.target;
        const animationType = element.dataset.animation || 'fade-in';
        const staggerDelay = stagger * index;

        if (entry.isIntersecting) {
          // Add animation class with stagger delay
          setTimeout(() => {
            element.classList.add('animate-in');
            element.classList.add(animationTypes[animationType]?.class || 'animate-fade-in');
            
            // Mark as visible
            if (elements.value.has(element)) {
              elements.value.set(element, { ...elements.value.get(element), visible: true });
            }
          }, staggerDelay);

          // Remove from observer if once is true
          if (once) {
            observer.value.unobserve(element);
          }
        } else if (!once) {
          // Remove animation classes if not once
          element.classList.remove('animate-in');
          Object.values(animationTypes).forEach(type => {
            element.classList.remove(type.class);
          });

          if (elements.value.has(element)) {
            elements.value.set(element, { ...elements.value.get(element), visible: false });
          }
        }
      });
    }, {
      threshold,
      rootMargin
    });
  };

  // Add element to observe
  const observe = (element, animationType = 'fade-in') => {
    if (!element || !observer.value) return;

    // Set animation type as data attribute
    element.dataset.animation = animationType;
    
    // Apply initial styles using CSS classes instead of direct style manipulation
    const config = animationTypes[animationType];
    if (config) {
      // Add initial state class instead of direct style manipulation
      element.classList.add('animate-initial', `animate-${animationType}-initial`);
      element.setAttribute('data-animation-duration', duration);
    }

    // Store element reference
    elements.value.set(element, { animationType, visible: false });
    
    // Start observing
    observer.value.observe(element);
  };

  // Remove element from observation
  const unobserve = (element) => {
    if (element && observer.value) {
      observer.value.unobserve(element);
      elements.value.delete(element);
    }
  };

  // Manual trigger animation
  const triggerAnimation = (element, animationType = 'fade-in') => {
    if (!element) return;

    const config = animationTypes[animationType];
    if (config) {
      element.classList.add('animate-in');
      element.classList.add(config.class);
    }
  };

  // Batch observe elements
  const observeMultiple = (elementsArray, animationType = 'fade-in') => {
    elementsArray.forEach((element, index) => {
      if (element) {
        // Add stagger delay using CSS custom property instead of direct style manipulation
        element.style.setProperty('--animation-delay', `${stagger * index}ms`);
        observe(element, animationType);
      }
    });
  };

  // Get animation progress
  const getProgress = (element) => {
    return elements.value.get(element)?.visible || false;
  };

  // Lifecycle
  onMounted(() => {
    createObserver();
  });

  onUnmounted(() => {
    if (observer.value) {
      observer.value.disconnect();
    }
    elements.value.clear();
  });

  return {
    observe,
    unobserve,
    observeMultiple,
    triggerAnimation,
    getProgress,
    isVisible,
    animationTypes
  };
}

/**
 * Specialized composable for number counting animations
 */
export function useCountAnimation() {
  const animate = (element, { start = 0, end, duration = 2000, formatter = (n) => n }) => {
    if (!element) return;

    const startTime = performance.now();
    const difference = end - start;

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Use easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = start + (difference * easeOutQuart);
      
      element.textContent = formatter(Math.floor(current));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = formatter(end);
      }
    };

    requestAnimationFrame(step);
  };

  return { animate };
}