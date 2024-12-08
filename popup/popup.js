// popup.js
document.addEventListener('DOMContentLoaded', () => {
  // Initialize variables
  const saveForm = document.getElementById('save-form');
  const browseTab = document.getElementById('browse-tab');
  const shortcodesList = document.getElementById('shortcodes-list');
  const searchInput = document.getElementById('search-input');
  let currentCategory = 'all';
  let editingId = null;

  // Initialize collapsible sections with state persistence
  const collapsibles = document.querySelectorAll('.collapsible');
  
  // Load saved states
  chrome.storage.local.get('collapsibleStates', (data) => {
      const savedStates = data.collapsibleStates || {};
      
      collapsibles.forEach(collapsible => {
          const header = collapsible.querySelector('.section-header');
          const content = collapsible.querySelector('.section-content');
          const sectionId = header.querySelector('h3').textContent.trim();
          
          // Apply saved state if it exists
          if (savedStates[sectionId] === true) {
              collapsible.classList.add('collapsed');
              content.style.maxHeight = '0';
          } else {
              content.style.maxHeight = content.scrollHeight + 'px';
          }
          
          header.addEventListener('click', () => {
              collapsible.classList.toggle('collapsed');
              
              if (collapsible.classList.contains('collapsed')) {
                  content.style.maxHeight = '0';
              } else {
                  content.style.maxHeight = content.scrollHeight + 'px';
              }
              
              // Save new states
              const newStates = {};
              collapsibles.forEach(c => {
                  const h = c.querySelector('.section-header h3');
                  const id = h.textContent.trim();
                  newStates[id] = c.classList.contains('collapsed');
              });
              
              chrome.storage.local.set({ collapsibleStates: newStates });
          });
      });
  });

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
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          
          await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: (shortcodeText) => {
                  const activeElement = document.activeElement;
                  
                  if (activeElement.tagName === 'TEXTAREA' || 
                      activeElement.tagName === 'INPUT' ||
                      activeElement.getAttribute('contenteditable') === 'true') {
                      
                      if (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT') {
                          const start = activeElement.selectionStart;
                          const end = activeElement.selectionEnd;
                          const value = activeElement.value;
                          
                          activeElement.value = value.substring(0, start) + 
                                              shortcodeText + 
                                              value.substring(end);
                                              
                          activeElement.selectionStart = activeElement.selectionEnd = start + shortcodeText.length;
                      } else {
                          const selection = window.getSelection();
                          const range = selection.getRangeAt(0);
                          range.deleteContents();
                          
                          const textNode = document.createTextNode(shortcodeText);
                          range.insertNode(textNode);
                          
                          range.setStartAfter(textNode);
                          range.setEndAfter(textNode);
                          selection.removeAllRanges();
                          selection.addRange(range);
                      }
                      
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
                  <button class="edit-btn" data-id="${shortcode.id}">
                      Edit
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

      document.querySelectorAll('.edit-btn').forEach(btn => {
          btn.addEventListener('click', () => {
              editShortcode(parseInt(btn.dataset.id));
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

  // Function to edit shortcode
  function editShortcode(id) {
      chrome.storage.local.get('shortcodes', (data) => {
          const shortcode = data.shortcodes.find(s => s.id === id);
          if (shortcode) {
              document.getElementById('title').value = shortcode.title;
              document.getElementById('shortcode').value = shortcode.shortcode;
              document.getElementById('description').value = shortcode.description;
              document.getElementById('category').value = shortcode.category;
              
              const submitButton = saveForm.querySelector('button[type="submit"]');
              submitButton.textContent = 'Update Shortcode';
              
              editingId = id;
              
              document.getElementById('save-tab').style.display = 'block';
              document.getElementById('browse-tab').style.display = 'none';
          }
      });
  }

  // Save shortcode form handler
  saveForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('title').value;
      const shortcode = document.getElementById('shortcode').value;
      const description = document.getElementById('description').value;
      const category = document.getElementById('category').value;

      chrome.storage.local.get('shortcodes', (data) => {
          const shortcodes = data.shortcodes || [];
          
          if (editingId) {
              const index = shortcodes.findIndex(s => s.id === editingId);
              if (index !== -1) {
                  shortcodes[index] = {
                      ...shortcodes[index],
                      title,
                      shortcode,
                      description,
                      category,
                      timestamp: new Date().toISOString()
                  };
              }
          } else {
              shortcodes.push({
                  id: Date.now(),
                  title,
                  shortcode,
                  description,
                  category,
                  timestamp: new Date().toISOString()
              });
          }

          chrome.storage.local.set({ shortcodes }, () => {
              showNotification(editingId ? 'Shortcode updated successfully!' : 'Shortcode saved successfully!');
              saveForm.reset();
              
              const submitButton = saveForm.querySelector('button[type="submit"]');
              submitButton.textContent = 'Save Shortcode';
              editingId = null;
              
              loadShortcodes();
          });
      });
  });

  // Search functionality
  searchInput.addEventListener('input', (e) => {
      loadShortcodes(e.target.value);
  });

  // Export functionality
  document.getElementById('export-btn').addEventListener('click', async () => {
      try {
          const { shortcodes, categories } = await new Promise(resolve => {
              chrome.storage.local.get(['shortcodes', 'categories'], resolve);
          });

          const exportData = {
              shortcodes: shortcodes || [],
              categories: categories || [],
              exportDate: new Date().toISOString(),
              version: '1.0'
          };

          const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `wordpress-shortcodes-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          showNotification('Shortcodes exported successfully!');
      } catch (error) {
          console.error('Export error:', error);
          showNotification('Failed to export shortcodes');
      }
  });

  // Import functionality
  document.getElementById('import-btn').addEventListener('click', () => {
      document.getElementById('import-file').click();
  });

  document.getElementById('import-file').addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      try {
          const text = await file.text();
          const importData = JSON.parse(text);

          if (!importData.shortcodes || !Array.isArray(importData.shortcodes)) {
              throw new Error('Invalid import file format');
          }

          chrome.storage.local.get(['shortcodes', 'categories'], (data) => {
              const existingShortcodes = data.shortcodes || [];
              const existingCategories = new Set(data.categories || []);

              importData.categories?.forEach(category => existingCategories.add(category));

              const shortcodesMap = new Map(existingShortcodes.map(s => [s.id, s]));
              importData.shortcodes.forEach(shortcode => {
                  if (!shortcodesMap.has(shortcode.id)) {
                      shortcodesMap.set(shortcode.id, shortcode);
                  }
              });

              const mergedData = {
                  shortcodes: Array.from(shortcodesMap.values()),
                  categories: Array.from(existingCategories)
              };

              chrome.storage.local.set(mergedData, () => {
                  showNotification('Shortcodes imported successfully!');
                  loadShortcodes();
                  event.target.value = '';
              });
          });
      } catch (error) {
          console.error('Import error:', error);
          showNotification('Failed to import shortcodes: ' + error.message);
          event.target.value = '';
      }
  });

  // Initial load
  loadShortcodes();
});