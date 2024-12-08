// popup.js
document.addEventListener('DOMContentLoaded', () => {
  const saveForm = document.getElementById('save-form');
  const browseTab = document.getElementById('browse-tab');
  const shortcodesList = document.getElementById('shortcodes-list');
  const searchInput = document.getElementById('search-input');
  let currentCategory = 'all';

  // Load categories for dropdown
  chrome.storage.local.get('categories', (data) => {
    const categorySelect = document.getElementById('category');
    data.categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.toLowerCase();
      option.textContent = category;
      categorySelect.appendChild(option);
    });
  });

  // Save shortcode
  saveForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const shortcode = document.getElementById('shortcode').value;
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;

    chrome.storage.local.get('shortcodes', (data) => {
      const shortcodes = data.shortcodes || [];
      shortcodes.push({
        id: Date.now(),
        title,
        shortcode,
        description,
        category,
        timestamp: new Date().toISOString()
      });

      chrome.storage.local.set({ shortcodes }, () => {
        showNotification('Shortcode saved successfully!');
        saveForm.reset();
        loadShortcodes();
      });
    });
  });

  // Load and display shortcodes
  function loadShortcodes(searchTerm = '') {
    chrome.storage.local.get('shortcodes', (data) => {
      const shortcodes = data.shortcodes || [];
      let filteredShortcodes = shortcodes;

      if (searchTerm) {
        filteredShortcodes = shortcodes.filter(s => 
          s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.shortcode.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (currentCategory !== 'all') {
        filteredShortcodes = filteredShortcodes.filter(s => 
          s.category === currentCategory
        );
      }

      displayShortcodes(filteredShortcodes);
    });
  }

  // Display shortcodes in the list
  function displayShortcodes(shortcodes) {
    shortcodesList.innerHTML = '';
    
    shortcodes.forEach(shortcode => {
      const shortcodeElement = document.createElement('div');
      shortcodeElement.className = 'shortcode-item';
      shortcodeElement.innerHTML = `
        <div class="shortcode-header">
          <h3>${shortcode.title}</h3>
          <span class="category-tag">${shortcode.category}</span>
        </div>
        <pre class="shortcode-content">${shortcode.shortcode}</pre>
        <p class="description">${shortcode.description}</p>
        <div class="actions">
          <button class="copy-btn" data-shortcode="${shortcode.shortcode}">
            Copy Shortcode
          </button>
          <button class="delete-btn" data-id="${shortcode.id}">
            Delete
          </button>
        </div>
      `;

      shortcodesList.appendChild(shortcodeElement);
    });

    // Add event listeners for copy and delete buttons
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(btn.dataset.shortcode);
        showNotification('Shortcode copied to clipboard!');
      });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        deleteShortcode(parseInt(btn.dataset.id));
      });
    });
  }

  // Delete shortcode
  function deleteShortcode(id) {
    chrome.storage.local.get('shortcodes', (data) => {
      const shortcodes = data.shortcodes.filter(s => s.id !== id);
      chrome.storage.local.set({ shortcodes }, () => {
        showNotification('Shortcode deleted');
        loadShortcodes();
      });
    });
  }

  // Show notification
  function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
      notification.style.display = 'none';
    }, 2000);
  }

  // Search functionality
  searchInput.addEventListener('input', (e) => {
    loadShortcodes(e.target.value);
  });

  // Initial load
  loadShortcodes();
});
