/**
 * Amplify – Tab Volume Control - Popup Script
 * Works with both Firefox and Chromium browsers
 */

// Browser API polyfill - use chrome.* for Chromium, browser.* for Firefox
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

let currentTabId = null;
// Store references to tab items by tabId for syncing updates
const tabItemRefs = new Map();

/**
 * Initialize the popup
 */
async function init() {
  // Load theme preference
  loadTheme();
  
  // Set up theme toggle
  document.getElementById('themeToggle').addEventListener('change', toggleTheme);
  
  // Get current tab
  const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
  if (tabs[0]) {
    currentTabId = tabs[0].id;
    // Display favicon for current tab
    displayCurrentTabFavicon(tabs[0]);
  }
  
  // Load current volume
  await loadVolume();
  
  // Set up slider
  const slider = document.getElementById('volumeSlider');
  const display = document.getElementById('volumeValue');
  
  slider.addEventListener('input', (e) => {
    const percent = parseInt(e.target.value);
    display.textContent = percent + '%';
    setVolume(percent);
    // Update corresponding tab item in audio tabs list if it exists
    updateTabItemInList(currentTabId, percent);
  });
  
  // Set up preset buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const percent = parseInt(e.target.dataset.volume);
      slider.value = percent;
      display.textContent = percent + '%';
      setVolume(percent);
      // Update corresponding tab item in audio tabs list if it exists
      updateTabItemInList(currentTabId, percent);
    });
  });
  
  // Load audio tabs
  loadAudioTabs();
}

/**
 * Load theme preference
 */
function loadTheme() {
  browserAPI.storage.local.get('theme').then(result => {
    const theme = result.theme || 'dark';
    applyTheme(theme);
  }).catch(() => {
    applyTheme('dark');
  });
}

/**
 * Apply theme
 */
function applyTheme(theme) {
  const body = document.body;
  const toggle = document.getElementById('themeToggle');
  
  if (theme === 'light') {
    body.classList.add('light-theme');
    toggle.checked = true;
  } else {
    body.classList.remove('light-theme');
    toggle.checked = false;
  }
}

/**
 * Toggle theme
 */
function toggleTheme() {
  const toggle = document.getElementById('themeToggle');
  const newTheme = toggle.checked ? 'light' : 'dark';
  
  if (newTheme === 'light') {
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
  }
  
  browserAPI.storage.local.set({ theme: newTheme });
}

/**
 * Display favicon for current tab
 */
function displayCurrentTabFavicon(tab) {
  const faviconEl = document.getElementById('currentTabFavicon');
  if (tab.favIconUrl) {
    faviconEl.src = tab.favIconUrl;
    faviconEl.style.display = 'block';
    faviconEl.alt = tab.title || 'Tab favicon';
  } else {
    faviconEl.style.display = 'none';
  }
}

/**
 * Load current volume
 */
async function loadVolume() {
  if (!currentTabId) return;
  
  try {
    const response = await browserAPI.runtime.sendMessage({
      action: 'getTabVolume',
      tabId: currentTabId
    });
    
    const volume = response.volume || 1.0;
    const percent = Math.round(volume * 100);
    
    document.getElementById('volumeSlider').value = percent;
    document.getElementById('volumeValue').textContent = percent + '%';
  } catch (e) {
    console.error('Error loading volume:', e);
  }
}

/**
 * Set volume
 */
async function setVolume(percent) {
  if (!currentTabId) return;
  
  const volume = percent / 100;
  
  try {
    await browserAPI.runtime.sendMessage({
      action: 'setTabVolume',
      tabId: currentTabId,
      volume: volume
    });
  } catch (e) {
    console.error('Error setting volume:', e);
  }
}

/**
 * Update tab item in the audio tabs list when current tab volume changes
 */
function updateTabItemInList(tabId, percent) {
  if (!tabId) return;
  
  const tabItemData = tabItemRefs.get(tabId);
  if (tabItemData) {
    // Update slider value
    if (tabItemData.slider) {
      tabItemData.slider.value = percent;
    }
    // Update volume display
    if (tabItemData.volumeDisplay) {
      tabItemData.volumeDisplay.textContent = percent + '%';
    }
  }
}

/**
 * Load audio tabs
 */
async function loadAudioTabs() {
  const container = document.getElementById('audioTabsList');
  
  try {
    const response = await browserAPI.runtime.sendMessage({ action: 'getAudioTabs' });
    const tabs = response.tabs || [];
    
    if (tabs.length === 0) {
      container.textContent = '';
      tabItemRefs.clear(); // Clear old references
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      emptyState.textContent = 'No tabs playing audio';
      container.appendChild(emptyState);
      return;
    }
    
    container.textContent = '';
    tabItemRefs.clear(); // Clear old references before rebuilding
    
    for (const tab of tabs) {
      const volumeResponse = await browserAPI.runtime.sendMessage({
        action: 'getTabVolume',
        tabId: tab.id
      });
      const volumePercent = Math.round((volumeResponse.volume || 1.0) *100);
      
      const item = document.createElement('div');
      item.className = 'tab-item';
      
      // Create tab info section
      const tabInfo = document.createElement('div');
      tabInfo.className = 'tab-info';
      
      // Create title container with favicon
      const titleContainer = document.createElement('div');
      titleContainer.style.display = 'flex';
      titleContainer.style.alignItems = 'center';
      titleContainer.style.gap = '8px';
      titleContainer.style.minWidth = '0';
      titleContainer.style.flex = '1';
      
      // Add favicon if available
      if (tab.favIconUrl) {
        const favicon = document.createElement('img');
        favicon.src = tab.favIconUrl;
        favicon.className = 'tab-favicon-small';
        favicon.alt = '';
        titleContainer.appendChild(favicon);
      }
      
      const tabTitle = document.createElement('div');
      tabTitle.className = 'tab-title';
      tabTitle.title = tab.title;
      tabTitle.textContent = tab.title;
      titleContainer.appendChild(tabTitle);
      
      const tabVolume = document.createElement('div');
      tabVolume.className = 'tab-volume';
      tabVolume.textContent = volumePercent + '%';
      
      tabInfo.appendChild(titleContainer);
      tabInfo.appendChild(tabVolume);
      
      // Create tab actions section
      const tabActions = document.createElement('div');
      tabActions.className = 'tab-actions';
      
      const slider = document.createElement('input');
      slider.type = 'range';
      slider.className = 'tab-slider';
      slider.min = '0';
      slider.max = '600';
      slider.value = volumePercent;
      slider.step = '10';
      slider.dataset.tabId = tab.id;
      
      const switchBtn = document.createElement('button');
      switchBtn.className = 'switch-btn';
      switchBtn.dataset.tabId = tab.id;
      switchBtn.textContent = 'Switch';
      
      tabActions.appendChild(slider);
      tabActions.appendChild(switchBtn);
      
      // Create preset buttons container (hidden by default, shown on hover)
      const presetButtonsContainer = document.createElement('div');
      presetButtonsContainer.className = 'tab-preset-buttons';
      
      // Store reference to this tab item for syncing updates
      tabItemRefs.set(tab.id, {
        slider: slider,
        volumeDisplay: tabVolume,
        presetButtons: presetButtonsContainer
      });
      
      const presetValues = [0, 50, 100, 200, 600];
      const presetLabels = ['0%', '50%', '100%', '200%', 'Max'];
      
      presetValues.forEach((value, index) => {
        const presetBtn = document.createElement('button');
        presetBtn.className = 'tab-preset-btn';
        presetBtn.dataset.volume = value;
        presetBtn.dataset.tabId = tab.id;
        presetBtn.textContent = presetLabels[index];
        
        presetBtn.addEventListener('click', async (e) => {
          const percent = parseInt(e.target.dataset.volume);
          slider.value = percent;
          tabVolume.textContent = percent + '%';
          
          await browserAPI.runtime.sendMessage({
            action: 'setTabVolume',
            tabId: tab.id,
            volume: percent / 100
          });
          
          // If this is the current tab, also update the current tab section
          if (tab.id === currentTabId) {
            const currentSlider = document.getElementById('volumeSlider');
            const currentDisplay = document.getElementById('volumeValue');
            if (currentSlider) currentSlider.value = percent;
            if (currentDisplay) currentDisplay.textContent = percent + '%';
          }
        });
        
        presetButtonsContainer.appendChild(presetBtn);
      });
      
      item.appendChild(tabInfo);
      item.appendChild(tabActions);
      item.appendChild(presetButtonsContainer);
      
      container.appendChild(item);
      
      // Set up slider event
      slider.addEventListener('input', async (e) => {
        const percent = parseInt(e.target.value);
        tabVolume.textContent = percent + '%';
        
        await browserAPI.runtime.sendMessage({
          action: 'setTabVolume',
          tabId: tab.id,
          volume: percent / 100
        });
        
        // If this is the current tab, also update the current tab section
        if (tab.id === currentTabId) {
          const currentSlider = document.getElementById('volumeSlider');
          const currentDisplay = document.getElementById('volumeValue');
          if (currentSlider) currentSlider.value = percent;
          if (currentDisplay) currentDisplay.textContent = percent + '%';
        }
      });
      
      // Set up switch button event
      switchBtn.addEventListener('click', () => {
        browserAPI.runtime.sendMessage({
          action: 'switchToTab',
          tabId: tab.id
        });
        window.close();
      });
    }
  } catch (e) {
    console.error('Error loading audio tabs:', e);
    container.textContent = '';
    const errorState = document.createElement('div');
    errorState.className = 'empty-state';
    errorState.textContent = 'Error loading tabs';
    container.appendChild(errorState);
  }
}

// Initialize
init();
