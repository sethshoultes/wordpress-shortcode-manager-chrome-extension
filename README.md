# WordPress Shortcode Manager

A Chrome extension that helps you manage, store, and quickly insert WordPress shortcodes. This extension allows you to build a personal library of shortcodes that can be easily accessed and inserted into any WordPress editor.

## Features

- 📝 Save and organize WordPress shortcodes
- 🔍 Quick search functionality
- 📁 Category-based organization
- 📋 One-click copy and insert
- 💾 Import/Export capabilities
- 🔒 Local storage for privacy
- 🎯 Direct insertion into WordPress editors
- 📱 Responsive popup interface

## Installation

1. Clone this repository or download the ZIP file
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory

## Usage

### Adding New Shortcodes

1. Click the extension icon in your Chrome toolbar
2. Click "Add New Shortcode"
3. Fill in the following fields:
   - Title: A name for your shortcode
   - Shortcode: The actual WordPress shortcode
   - Description: Optional details about the shortcode
   - Category: Select or create a category

### Inserting Shortcodes

1. Navigate to your WordPress editor
2. Click the extension icon
3. Find your desired shortcode
4. Click "Insert" to add it to your editor

### Managing Shortcodes

- **Search**: Use the search bar to filter shortcodes
- **Edit**: Click the edit icon to modify existing shortcodes
- **Delete**: Remove unwanted shortcodes with the delete button
- **Copy**: Quick copy shortcodes to clipboard

### Import/Export

- **Export**: Back up your shortcode collection
- **Import**: Restore previously exported shortcodes
- Compatible with JSON format

## Development

### Project Structure

```
wordpress-shortcode-manager/
├── manifest.json
├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── styles.css
├── background.js
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

### Building from Source

1. Install dependencies:
   ```bash
   npm install
   ```

2. Make your modifications to the source files

3. Build the extension:
   ```bash
   npm run build
   ```

### Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Submit a pull request

## Browser Support

- Chrome: v88 or later
- Edge: v88 or later (Chromium-based)
- Other Chromium-based browsers should work but are not officially supported

## Privacy

This extension:
- Stores all data locally in your browser
- Does not collect any personal information
- Does not send data to external servers
- Requires only necessary permissions

## License

This project is licensed under the GNU General Public License v2.0 - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have suggestions:
1. Check the [Issues](https://github.com/yourusername/wordpress-shortcode-manager/issues) page
2. Submit a new issue if needed
3. Include your browser version and steps to reproduce the problem

## Acknowledgments

- Built using Chrome Extension Manifest V3
- Icons from [Material Design Icons](https://material.io/icons/)
