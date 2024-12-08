// popup.js
document.addEventListener('DOMContentLoaded', () => {
  const saveForm = document.getElementById('save-form');
  const browseTab = document.getElementById('browse-tab');
  const shortcodesList = document.getElementById('shortcodes-list');
  const searchInput = document.getElementById('search-input');
  let currentCategory = 'all';

  // Function to show notification
  function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
      notification.style.display = 'none';
    }, 2000);
  }

  // Function to insert shortcode into active element
  async function insertShortcode(shortcode) {
    try {
      // Inject the content script
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (shortcodeText) => {
          const activeElement = document.activeElement;
          
          // Check if the active element is an input, textarea, or contenteditable
          if (activeElement.tagName === 'TEXTAREA' || 
              activeElement.tagName === 'INPUT' ||
              activeElement.getAttribute('contenteditable') === 'true') {
            
            // Handle standard input/textarea elements
            if (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT') {
              const start = activeElement.selectionStart;
              const end = activeElement.selectionEnd;
              const value = activeElement.value;
              
              activeElement.value = value.substring(0, start) + 
                                  shortcodeText + 
                                  value.substring(end);
                                  
              // Set cursor position after the inserted text
              activeElement.selectionStart = activeElement.selectionEnd = start + shortcodeText.length;
            }
            // Handle contenteditable elements
            else {
              const selection = window.getSelection();
              const range = selection.getRangeAt(0);
              range.deleteContents();
              
              const textNode = document.createTextNode(shortcodeText);
              range.insertNode(textNode);
              
              // Move cursor to end of inserted text
              range.setStartAfter(textNode);
              range.setEndAfter(textNode);
              selection.removeAllRanges();
              selection.addRange(range);
            }
            
            // Focus the element
            activeElement.focus();
            return true;
          }
          return false;
        },
        args: [shortcode]
      });
      
      showNotification('Shortcode inserted successfully!');
    } catch (error) {
      console.error('Error inserting shortcode:', error);
      showNotification('Failed to insert shortcode');
    }
  }

  // Function to delete shortcode
  function deleteShortcode(id) {
    chrome.storage.local.get('shortcodes', (data) => {
      const shortcodes = data.shortcodes.filter(s => s.id !== id);
      chrome.storage.local.set({ shortcodes }, () => {
        showNotification('Shortcode deleted');
        loadShortcodes();
      });
    });
  }

  // Function to display shortcodes in the list
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
            Copy
          </button>
          <button class="insert-btn" data-shortcode="${shortcode.shortcode}">
            Insert
          </button>
          <button class="delete-btn" data-id="${shortcode.id}">
            Delete
          </button>
        </div>
      `;

      shortcodesList.appendChild(shortcodeElement);
    });

    // Add event listeners for buttons
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(btn.dataset.shortcode);
        showNotification('Shortcode copied to clipboard!');
      });
    });

    document.querySelectorAll('.insert-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        insertShortcode(btn.dataset.shortcode);
      });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        deleteShortcode(parseInt(btn.dataset.id));
      });
    });
  }

  // Function to load and display shortcodes
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

  // Save shortcode form handler
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

  // Search functionality
  searchInput.addEventListener('input', (e) => {
    loadShortcodes(e.target.value);
  });

  // Initial load
  loadShortcodes();
});