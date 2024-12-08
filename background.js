chrome.runtime.onInstalled.addListener(() => {
  // Initialize storage with default categories
  chrome.storage.local.get('shortcodes', (data) => {
    if (!data.shortcodes) {
      chrome.storage.local.set({
        shortcodes: [],
        categories: ['General', 'Layout', 'Content', 'Media', 'Custom']
      });
    }
  });
});