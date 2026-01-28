/**
 * Amplify – Tab Volume Control - Chromium Extension (MV3)
 * Uses injected page context script to access page's AudioContext
 */

console.log('Amplify: Content script starting...');

let currentVolume = 1.0;
const MAX_VOLUME = 6.0;
const processedElements = new WeakMap();
let elementIdCounter = 0;
const elementIdMap = new WeakMap();

// Inject page context script
(function() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('page-context.js');
  script.onload = function() {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);
})();

// Listen for messages from page context script
window.addEventListener('message', function(event) {
  if (event.source !== window || !event.data || event.data.source !== 'amplify-page') {
    return;
  }
  
  const message = event.data;
  if (message.action === 'setupBoostResponse') {
    // Handle response if needed
    console.log('Amplify: Page context setup response:', message);
  }
});

/**
 * Get or assign ID for element
 */
function getElementId(element) {
  if (!elementIdMap.has(element)) {
    const id = 'amplify-' + (++elementIdCounter);
    elementIdMap.set(element, id);
    element.setAttribute('data-amplify-id', id);
  }
  return elementIdMap.get(element);
}

/**
 * Set up volume boost for a media element using page's AudioContext
 */
function setupBoost(element) {
  if (processedElements.has(element)) {
    return processedElements.get(element);
  }
  
  try {
    const elementId = getElementId(element);
    
    // Send message to page context script to set up boost
    window.postMessage({
      source: 'amplify-content',
      action: 'setupBoost',
      elementId: elementId,
      volume: currentVolume
    }, '*');
    
    const data = { elementId, setup: true };
    processedElements.set(element, data);
    
    console.log('Amplify: ✓ Boost setup requested for', element.tagName);
    return data;
  } catch (e) {
    console.log('Amplify: Setup failed:', e.message);
    processedElements.set(element, { error: e.message });
    return null;
  }
}

/**
 * Apply volume to element
 */
function applyVolume(element) {
  // Always set native volume (works for 0-100%)
  const nativeVol = Math.min(1.0, Math.max(0, currentVolume));
  element.volume = nativeVol;
  
  // For boost > 100%, try to set up gain node
  if (currentVolume > 1.0) {
    let data = processedElements.get(element);
    
    if (!data || data.error) {
      data = setupBoost(element);
    }
    
    if (data && data.elementId) {
      try {
        // Set element to full volume, use gain for boost
        element.volume = 1.0;
        
        // Update gain via page context
        window.postMessage({
          source: 'amplify-content',
          action: 'updateGain',
          elementId: data.elementId,
          volume: currentVolume
        }, '*');
      } catch (e) {
        console.log('Amplify: Could not update gain:', e.message);
      }
    }
  } else {
    // For 0-100%, disable gain boost
    const data = processedElements.get(element);
    if (data && data.elementId) {
      try {
        // Reset gain to 1.0 via page context
        window.postMessage({
          source: 'amplify-content',
          action: 'updateGain',
          elementId: data.elementId,
          volume: 1.0
        }, '*');
      } catch (e) {}
    }
  }
}

/**
 * Set volume globally
 */
function setVolume(volume) {
  currentVolume = Math.max(0, Math.min(MAX_VOLUME, volume));
  console.log('Amplify: Setting volume to', Math.round(currentVolume * 100) + '%');
  
  document.querySelectorAll('video, audio').forEach(el => {
    applyVolume(el);
  });
}

// Listen for messages from service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'setVolume') {
    setVolume(message.volume);
    sendResponse({ success: true, volume: currentVolume });
    return true;
  }
  if (message.action === 'getVolume') {
    sendResponse({ volume: currentVolume });
    return true;
  }
  if (message.action === 'ping') {
    sendResponse({ success: true });
    return true;
  }
});

// Watch for new elements
const observer = new MutationObserver(() => {
  document.querySelectorAll('video, audio').forEach(el => {
    if (!processedElements.has(el) && currentVolume > 1.0) {
      applyVolume(el);
    }
  });
});

// Initialize
function init() {
  console.log('Amplify: Initializing...');
  
  observer.observe(document.documentElement, { childList: true, subtree: true });
  
  chrome.storage.local.get('volume').then(result => {
    if (result.volume !== undefined) {
      setVolume(result.volume);
    }
  }).catch(() => {});
  
  setTimeout(() => {
    document.querySelectorAll('video, audio').forEach(el => applyVolume(el));
  }, 1500);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

console.log('Amplify: Ready!');
