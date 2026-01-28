/**
 * Amplify - Background Script (Firefox)
 * Handles communication between popup and content scripts
 */

console.log('Amplify: Background script loaded');

// Store volume settings per tab
const tabVolumes = new Map();

/**
 * Update the badge on the toolbar icon
 */
function updateBadge(tabId, volume) {
  const percent = Math.round(volume * 100);
  
  // Set badge text
  let badgeText = '';
  if (percent === 0) {
    badgeText = '0';
  } else if (percent === 100) {
    badgeText = ''; // No badge at default volume
  } else if (percent >= 100) {
    badgeText = percent.toString();
  } else {
    badgeText = percent.toString();
  }
  
  // Set badge color based on volume level
  let badgeColor = '#00d9ff'; // Default cyan
  if (percent === 0) {
    badgeColor = '#888888'; // Gray for muted
  } else if (percent > 100) {
    badgeColor = '#ce5959'; // Red for boost
  } else if (percent < 100) {
    badgeColor = '#00d9ff'; // Cyan for reduced
  }
  
  // Update badge for this tab
  browser.browserAction.setBadgeText({ text: badgeText, tabId: tabId });
  browser.browserAction.setBadgeBackgroundColor({ color: badgeColor, tabId: tabId });
}

/**
 * Set volume for a tab
 */
async function setTabVolume(tabId, volume) {
  // Store the volume
  tabVolumes.set(tabId, volume);
  
  // Update badge
  updateBadge(tabId, volume);
  
  // Also save to storage
  await browser.storage.local.set({ volume: volume });
  
  // Try to send to content script
  try {
    await browser.tabs.sendMessage(tabId, {
      action: 'setVolume',
      volume: volume
    });
    return { success: true };
  } catch (e) {
    console.log('Amplify: Could not send to tab', tabId, '-', e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Get volume for a tab
 */
async function getTabVolume(tabId) {
  // Check if we have a stored volume
  if (tabVolumes.has(tabId)) {
    return tabVolumes.get(tabId);
  }
  
  // Try to get from content script
  try {
    const response = await browser.tabs.sendMessage(tabId, { action: 'getVolume' });
    if (response && response.volume !== undefined) {
      return response.volume;
    }
  } catch (e) {
    // Content script may not be ready
  }
  
  // Try to get from storage
  try {
    const result = await browser.storage.local.get('volume');
    if (result.volume !== undefined) {
      return result.volume;
    }
  } catch (e) {
    // Storage may not be available
  }
  
  return 1.0; // Default volume
}

/**
 * Get tabs that are playing audio
 */
async function getAudioTabs() {
  const tabs = await browser.tabs.query({});
  return tabs.filter(tab => tab.audible);
}

// Listen for messages from popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Amplify: Background received', message);
  
  if (message.action === 'setTabVolume') {
    setTabVolume(message.tabId, message.volume).then(sendResponse);
    return true;
  }
  
  if (message.action === 'getTabVolume') {
    getTabVolume(message.tabId).then(volume => sendResponse({ volume }));
    return true;
  }
  
  if (message.action === 'getAudioTabs') {
    getAudioTabs().then(tabs => sendResponse({ tabs }));
    return true;
  }
  
  if (message.action === 'switchToTab') {
    browser.tabs.update(message.tabId, { active: true });
    sendResponse({ success: true });
  }
});

// Update badge when switching tabs
browser.tabs.onActivated.addListener(async (activeInfo) => {
  const volume = await getTabVolume(activeInfo.tabId);
  updateBadge(activeInfo.tabId, volume);
});

// Clean up when tabs are closed
browser.tabs.onRemoved.addListener(tabId => {
  tabVolumes.delete(tabId);
});

console.log('Amplify: Background ready');
