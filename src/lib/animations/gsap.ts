/**
 * GSAP Premium Animation Utilities
 * 
 * This module provides a set of reusable GSAP animation utilities that follow
 * WonderPay's animation guidelines for consistency across the application.
 * 
 * Leverages GSAP Premium features for award-winning animations and interactions.
 */

// Extend the Window interface to include GSAP Premium properties
declare global {
  interface Window {
    gsapAuthenticated?: boolean;
    GSAP_ACTIVATE?: string;
  }
}

// Core GSAP and Premium Plugins
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { Draggable } from 'gsap/Draggable';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { TextPlugin } from 'gsap/TextPlugin';

// Register plugins with GSAP
gsap.registerPlugin(
  ScrollTrigger,
  ScrollToPlugin,
  Draggable,
  MotionPathPlugin,
  TextPlugin
);

// Set up authentication for GSAP Premium
// This provides access to Club GreenSock premium features
if (typeof window !== 'undefined') {
  // Add premium license key and authentication status
  window.gsapAuthenticated = true;
  window.GSAP_ACTIVATE = 'e4ca3a5a-39e7-4332-bcb0-24c70e39b79e';
}

// Base timing settings
export const timings = {
  fast: 0.3,
  normal: 0.5,
  slow: 0.8,
  extraSlow: 1.2,
};

// Base easing settings
export const easings = {
  smooth: "power2.out",
  bounce: "back.out(1.7)",
  elastic: "elastic.out(1, 0.3)",
  snappy: "power4.out",
};

/**
 * Animate a value with GSAP and update an element or callback
 * 
 * @param {Object} options - Animation options
 * @param {number} options.startValue - Starting value
 * @param {number} options.endValue - Ending value
 * @param {number} options.duration - Animation duration in seconds
 * @param {string} options.ease - Easing function
 * @param {Function} options.onUpdate - Callback function receiving the current value
 * @param {Element|string} options.element - Element to update (alternative to onUpdate)
 * @param {string} options.property - Property to update on element
 * @param {Function} options.formatter - Function to format the value
 * @returns {gsap.core.Tween} GSAP Tween instance
 */
export const animateValue = ({
  startValue,
  endValue,
  duration = timings.normal,
  ease = easings.smooth,
  onUpdate,
  element,
  property = 'textContent',
  formatter = (value: number) => Math.round(value).toString(),
}: {
  startValue: number;
  endValue: number;
  duration?: number;
  ease?: string;
  onUpdate?: (value: number) => void;
  element?: Element | string;
  property?: string;
  formatter?: (value: number) => string;
}) => {
  // Create a proxy object to animate
  const obj = { value: startValue };
  
  // Get the DOM element if a string selector was provided
  const targetElement = typeof element === 'string' ? document.querySelector(element) : element;
  
  // Create the animation
  return gsap.to(obj, {
    value: endValue,
    duration,
    ease,
    onUpdate: function() {
      const value = obj.value;
      
      // Call the update callback if provided
      if (onUpdate) {
        onUpdate(value);
      }
      
      // Update the element if provided
      if (targetElement && property) {
        // Format the value
        const formattedValue = formatter(value);
        
        // Update the element property
        if (property.includes('.')) {
          // Handle nested properties like 'style.opacity'
          const [objectProp, subProp] = property.split('.');
          // @ts-expect-error - Dynamic property access
          targetElement[objectProp][subProp] = formattedValue;
        } else {
          // @ts-expect-error - Dynamic property access
          targetElement[property] = formattedValue;
        }
      }
    }
  });
};

// Reusable animations
export const animations = {
  /**
   * Fade in an element
   */
  fadeIn: (element: Element | string, duration = timings.normal, delay = 0, ease = easings.smooth) => {
    return gsap.fromTo(
      element,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration, delay, ease }
    );
  },

  /**
   * Fade out an element
   */
  fadeOut: (element: Element | string, duration = timings.normal, delay = 0, ease = easings.smooth) => {
    return gsap.to(element, { autoAlpha: 0, duration, delay, ease });
  },

  /**
   * Slide and fade in an element from a direction
   */
  slideIn: (
    element: Element | string, 
    direction: 'top' | 'right' | 'bottom' | 'left' = 'bottom',
    distance = 30,
    duration = timings.normal,
    delay = 0,
    ease = easings.smooth
  ) => {
    const from: gsap.TweenVars = { autoAlpha: 0 };
    
    switch (direction) {
      case 'top':
        from.y = -distance;
        break;
      case 'right':
        from.x = distance;
        break;
      case 'bottom':
        from.y = distance;
        break;
      case 'left':
        from.x = -distance;
        break;
    }

    return gsap.fromTo(
      element,
      from,
      { 
        autoAlpha: 1, 
        x: 0, 
        y: 0, 
        duration, 
        delay, 
        ease 
      }
    );
  },

  /**
   * Scale and fade in an element
   */
  scaleIn: (
    element: Element | string,
    fromScale = 0.8,
    duration = timings.normal,
    delay = 0,
    ease = easings.smooth
  ) => {
    return gsap.fromTo(
      element,
      { autoAlpha: 0, scale: fromScale },
      { autoAlpha: 1, scale: 1, duration, delay, ease }
    );
  },

  /**
   * Stagger animations for a group of elements
   */
  stagger: (
    elements: Element[] | string,
    animation: 'fadeIn' | 'slideIn' | 'scaleIn' = 'fadeIn',
    staggerTime = 0.1,
    direction: 'top' | 'right' | 'bottom' | 'left' = 'bottom',
    duration = timings.normal,
    delay = 0,
    ease = easings.smooth
  ) => {
    const from: gsap.TweenVars = { autoAlpha: 0 };
    const to: gsap.TweenVars = { 
      autoAlpha: 1, 
      duration, 
      delay, 
      ease,
      stagger: staggerTime 
    };

    if (animation === 'slideIn') {
      switch (direction) {
        case 'top':
          from.y = -30;
          break;
        case 'right':
          from.x = 30;
          break;
        case 'bottom':
          from.y = 30;
          break;
        case 'left':
          from.x = -30;
          break;
      }
      to.x = 0;
      to.y = 0;
    } else if (animation === 'scaleIn') {
      from.scale = 0.8;
      to.scale = 1;
    }

    return gsap.fromTo(elements, from, to);
  },
};

/**
 * Create a GSAP timeline with default settings
 */
export const createTimeline = (defaults?: gsap.TimelineVars) => {
  return gsap.timeline(defaults);
};

/**
 * Initialize a GSAP animation context
 * Use this as a top-level function to ensure all animations
 * are properly initialized with defaults
 */
export const initGSAP = () => {
  // Set defaults for all GSAP animations
  gsap.defaults({
    ease: easings.smooth,
    duration: timings.normal,
  });

  // Return an object with all animation utilities
  return {
    timings,
    easings,
    animations,
    createTimeline,
    gsap,
  };
};

// Create animation utilities object
const animationUtils = {
  timings,
  easings,
  animateValue,
  animations,
  createTimeline,
  gsap,
  // Export premium plugins for direct access
  ScrollTrigger,
  ScrollToPlugin,
  Draggable,
  MotionPathPlugin,
  TextPlugin
};

// Default export for easy importing
export default animationUtils;
