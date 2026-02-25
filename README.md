# Excel Filter Pro

A modern, responsive web application for uploading, filtering, and exporting Excel data with an intuitive user interface.

## 🎯 Features

### Core Functionality
- **Drag & Drop Upload**: Easily upload Excel (.xlsx, .xls) or CSV files by dragging them into the designated area
- **Global Search**: Search across all columns simultaneously for quick data discovery
- **Email Filtering**: Filter records by email addresses or email patterns
- **Column-Specific Filtering**: Filter data by selecting a specific column and entering a value
- **Live Statistics**: Real-time display of total rows and filtered rows
- **Data Preview**: Clean, responsive table view with hover effects and smooth scrolling
- **Export Functionality**: Download filtered data as Excel, CSV, or JSON files with timestamps

### Advanced Filtering
- **Date Range Filters**: Filter by preset ranges (today, last 7 days, this month) or custom date ranges
- **Numeric Range Filters**: Filter numeric columns by min/max values
- **Regex Support**: Use regular expressions for powerful pattern matching
- **Case Sensitive Search**: Toggle case sensitivity for precise filtering
- **Filter Presets**: Save and load your favorite filter configurations

### Data Cleaning & Transformation
- **Remove Duplicates**: Automatically detect and remove duplicate rows
- **Remove Empty Rows**: Clean up your dataset by removing rows with no data
- **Trim Whitespace**: Remove leading and trailing spaces from all cells
- **Email Validation**: Identify and highlight invalid email addresses
- **Case Transformation**: Convert text to UPPERCASE or lowercase
- **Find & Replace**: Bulk find and replace across columns with preview

### Data Visualization
- **Bar Charts**: Visualize value distribution across your data
- **Pie Charts**: See proportional breakdowns with interactive legends
- **Line Charts**: Track trends and patterns
- **Histograms**: Analyze numeric data distribution

### Column Management
- **Column Visibility**: Show/hide specific columns for focused analysis
- **Column Sorting**: Click headers to sort ascending/descending
- **Column Statistics**: Right-click headers for detailed stats (min, max, avg, unique values)

### User Experience
- **Dark Mode**: Toggle between light and dark themes
- **Keyboard Shortcuts**: Fast navigation and actions
- **Copy to Clipboard**: Quickly copy filtered data
- **Toast Notifications**: Clear feedback for all actions
- **Responsive Design**: Fully optimized for desktop and mobile devices
- **PWA Support**: Install as a standalone app on any device

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server or installation required - runs entirely in the browser!

### Usage

1. **Open the Application**: Open `index.html` in your web browser
2. **Upload File**: 
   - Drag and drop an Excel or CSV file onto the upload area
   - OR click "Browse Files" to select a file from your device
3. **Filter Data**:
   - Use the global search to find any text across all columns
   - Filter by email patterns in the Email field
   - Select a specific column and enter a value for precise filtering
   - Click "Reset" to clear all filters
4. **View Results**: The data preview table updates in real-time as you filter
5. **Export Data**: Click "Download Configured Data" to export filtered results as an Excel file

## 📁 File Structure

```
EXCEL PRO/
├── index.html         # Main HTML structure
├── style.css          # Modern styling with gradients and animations
├── script.js          # Core functionality and logic
└── README.md          # Documentation (this file)
```

## 🛠️ Technical Stack

- **HTML5**: Semantic markup for accessibility
- **CSS3**: Modern styling with CSS variables, gradients, and animations
- **JavaScript (ES6+)**: Dynamic filtering and data manipulation
- **SheetJS (XLSX.js)**: Excel file parsing and generation
- **Phosphor Icons**: Beautiful icon library for UI elements
- **Google Fonts (Inter)**: Clean, professional typography

## 📋 Key Dependencies

- **XLSX.js** (SheetJS): For reading and writing Excel files
- **Phosphor Icons**: Modern icon system for UI elements
- **Inter Font**: Professional typography from Google Fonts

All dependencies are loaded from CDN, so no installation is required.

## 🎨 UI/UX Enhancements

### Color Scheme
- **Primary**: Indigo gradient (#6366f1 to #8b5cf6)
- **Background**: Soft blue gradient
- **Text**: Dark gray with high contrast
- **Accents**: Purple, green, red, and orange for status indicators

### Animations
- **Smooth Transitions**: 0.2s ease-in-out for interactive elements
- **Bounce Animation**: Upload icon gently bounces
- **Float Animation**: Background gradient subtly moves
- **Slide-in Effect**: Toast notifications slide in from the right
- **Scale Effects**: Hover states with subtle scaling

### Visual Effects
- **Gradient Backgrounds**: Modern gradient overlays and text
- **Box Shadows**: Layered shadows for depth
- **Hover Effects**: Cards and buttons respond to user interaction
- **Focus States**: Enhanced focus indicators for accessibility

## 🔧 Features in Detail

### Upload Section
- Drag-and-drop support with visual feedback
- Beautiful gradient background with animated floating effects
- Displays filename and processing status
- Supports multiple file formats (.xlsx, .xls, .csv)

### Filter Panel
- **Global Search**: Full-text search across all data
- **Email Filter**: Pattern-based email filtering
- **Column Filter**: Select specific columns and filter by values
- **Statistics Card**: Shows total and filtered row counts
- **Download Button**: Export filtered data with gradient styling

### Data Preview
- **Sticky Headers**: Column headers remain visible while scrolling
- **Row Highlighting**: Rows highlight on hover for better readability
- **Empty State**: Clear message when no records match filters
- **Pagination**: Displays first 100 rows with notification of additional data

### Toast Notifications
- Success and error messages
- Gradient styling with left border accent
- Auto-dismiss after 3 seconds
- Smooth slide-in animation

## 💡 How It Works

1. **File Upload**: Files are read as binary data using FileReader API
2. **Parsing**: SheetJS converts Excel/CSV to JSON format
3. **Filtering**: JavaScript filters data based on user input
4. **Display**: Filtered data is rendered in real-time to the table
5. **Export**: Filtered data is converted back to Excel format and downloaded

## 📊 Supported File Formats

- **Excel**: .xlsx, .xls
- **CSV**: .csv (comma-separated values)

## ⚙️ Performance

- **Render Limit**: First 100 rows are displayed in preview to maintain performance
- **Full Download**: Complete filtered dataset available for download
- **Optimized Animations**: Uses CSS animations for smooth 60fps performance
- **Event Delegation**: Efficient event handling for large datasets

## 🎯 Use Cases

- **Data Cleaning**: Remove and filter out invalid records
- **Email List Management**: Filter and organize email lists
- **Bulk Data Export**: Download filtered results from large datasets
- **Quick Analysis**: Search and preview data patterns
- **Batch Processing**: Prepare data for further processing

## 🔒 Security & Privacy

- **No Data Storage**: All processing happens locally in your browser
- **No Server Upload**: Files never leave your device
- **No Tracking**: No analytics or data collection
- **Privacy-First**: Fully offline operation after page load

## 💻 Browser Compatibility

- ✅ Chrome/Chromium 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🚀 Performance Tips

1. **Large Files**: Browsers may take a moment to process files larger than 50MB
2. **Filtering**: Faster filtering on columns with fewer unique values
3. **Export**: Downloaded files are compressed for optimal file size

## ⌨️ Keyboard Shortcuts

- **Ctrl/Cmd + F**: Focus global search
- **Ctrl/Cmd + E**: Export to Excel
- **Ctrl/Cmd + Shift + E**: Export to CSV
- **Ctrl/Cmd + R**: Reset all filters
- **Ctrl/Cmd + K**: Show/hide keyboard shortcuts
- **Ctrl/Cmd + D**: Toggle dark mode
- **Ctrl/Cmd + H**: Open find & replace
- **Ctrl/Cmd + Shift + C**: Copy filtered data to clipboard

## 🐛 Known Limitations

- Files larger than 100MB may experience slower performance
- Complex Excel formulas are not preserved during export
- Only the first sheet of multi-sheet workbooks is processed

## 🎓 Future Enhancements

- Multi-sheet support with sheet selector
- PDF export with custom formatting
- Advanced chart export (PNG, SVG)
- Collaborative filtering with shareable URLs
- Custom formula builder
- Batch file processing
- Cloud storage integration
- Real-time collaboration features

## 📧 Support

For issues or questions, please check:
1. Browser console for error messages (F12)
2. Ensure files are valid Excel/CSV format
3. Try with a smaller sample file first

## 📄 License

This project is open source and available for personal and commercial use.

## 🙏 Acknowledgments

- **SheetJS**: Powerful spreadsheet library
- **Phosphor Icons**: Beautiful icon set
- **Google Fonts**: Typography excellence
- **Modern CSS**: Latest CSS features for beautiful design

---

**Version**: 3.0  
**Last Updated**: February 2026  
**Status**: Production Ready ✅

Enjoy filtering your data efficiently with powerful new features! 🚀
