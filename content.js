/**
 * Amplify – Tab Volume Control - Firefox Extension
 * Uses page's AudioContext via wrappedJSObject
 */

console.log('Amplify: Starting...');

let currentVolume = 1.0;
const MAX_VOLUME = 6.0;
const processedElements = new WeakMap();

// Get page's AudioContext constructor
const pageWindow = window.wrappedJSObject;
const PageAudioContext = pageWindow && (pageWindow.AudioContext || pageWindow.webkitAudioContext);

/**
 * Set up volume boost for a media element using page's AudioContext
 */
function setupBoost(element) {
  if (processedElements.has(element)) {
    return processedElements.get(element);
  }
  
  if (!PageAudioContext) {
    console.log('Amplify: No page AudioContext available');
    processedElements.set(element, { error: 'no context' });
    return null;
  }
  
  try {
    // Create AudioContext in PAGE's world
    const ctx = new PageAudioContext();
    
    // Wrap element for page context access
    const wrappedElement = element.wrappedJSObject || element;
    
    // Create media source from element
    const source = ctx.createMediaElementSource(wrappedElement);
    const gainNode = ctx.createGain();
    
    // Use cloneInto to pass value to page context
    gainNode.gain.value = currentVolume;
    
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const data = { ctx, source, gainNode };
    processedElements.set(element, data);
    
    console.log('Amplify: ✓ Boost enabled for', element.tagName);
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
    
    if (data && data.gainNode) {
      try {
        // Set element to full volume, use gain for boost
        element.volume = 1.0;
        data.gainNode.gain.value = currentVolume;
        
        if (data.ctx && data.ctx.state === 'suspended') {
          data.ctx.resume();
        }
      } catch (e) {
        console.log('Amplify: Could not update gain:', e.message);
      }
    }
  } else {
    // For 0-100%, disable gain boost
    const data = processedElements.get(element);
    if (data && data.gainNode) {
      try {
        data.gainNode.gain.value = 1.0; // Passthrough
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

// Listen for messages
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
  
  browser.storage.local.get('volume').then(result => {
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
