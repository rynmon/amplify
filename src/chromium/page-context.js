/**
 * Amplify - Page Context Script (Chromium)
 * This script runs in the page's context, not the content script context
 * It can access the page's AudioContext directly
 */

(function() {
  'use strict';
  
  // Listen for messages from content script
  window.addEventListener('message', function(event) {
    // Only accept messages from our extension
    if (event.source !== window || !event.data || event.data.source !== 'amplify-content') {
      return;
    }
    
    const message = event.data;
    
    if (message.action === 'setupBoost') {
      const elementId = message.elementId;
      const element = document.querySelector(`[data-amplify-id="${elementId}"]`);
      
      if (!element) {
        window.postMessage({
          source: 'amplify-page',
          action: 'setupBoostResponse',
          elementId: elementId,
          success: false,
          error: 'Element not found'
        }, '*');
        return;
      }
      
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) {
          throw new Error('AudioContext not available');
        }
        
        const ctx = new AudioContext();
        const source = ctx.createMediaElementSource(element);
        const gainNode = ctx.createGain();
        
        gainNode.gain.value = message.volume || 1.0;
        
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        
        // Store reference for later updates
        if (!element._amplifyData) {
          element._amplifyData = {};
        }
        element._amplifyData.ctx = ctx;
        element._amplifyData.gainNode = gainNode;
        element._amplifyData.source = source;
        
        window.postMessage({
          source: 'amplify-page',
          action: 'setupBoostResponse',
          elementId: elementId,
          success: true
        }, '*');
      } catch (e) {
        window.postMessage({
          source: 'amplify-page',
          action: 'setupBoostResponse',
          elementId: elementId,
          success: false,
          error: e.message
        }, '*');
      }
    }
    
    if (message.action === 'updateGain') {
      const elementId = message.elementId;
      const element = document.querySelector(`[data-amplify-id="${elementId}"]`);
      
      if (!element || !element._amplifyData || !element._amplifyData.gainNode) {
        return;
      }
      
      try {
        element._amplifyData.gainNode.gain.value = message.volume || 1.0;
        
        if (element._amplifyData.ctx && element._amplifyData.ctx.state === 'suspended') {
          element._amplifyData.ctx.resume();
        }
      } catch (e) {
        console.error('Amplify: Error updating gain:', e);
      }
    }
  });
})();
