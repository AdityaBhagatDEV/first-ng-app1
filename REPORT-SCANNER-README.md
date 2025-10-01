# Report Scanner & Validator

A comprehensive Angular application for importing, scanning, and validating report data. The application can detect missing data, incorrect formats, data inconsistencies, and other quality issues in your reports.

## Features

### 🔍 **Multi-Format Support**
- **CSV files** - Comma-separated values with automatic delimiter detection
- **JSON files** - Both array of objects and single object formats
- **TSV files** - Tab-separated values
- **TXT files** - Text files with automatic delimiter detection

### 📊 **Comprehensive Validation**
- **Missing Data Detection** - Identifies empty cells and null values
- **Data Type Validation** - Ensures numeric, boolean, and text fields contain appropriate data
- **Format Validation** - Validates emails, dates, phone numbers, and other formatted data
- **Range Validation** - Checks text length and numeric value ranges
- **Duplicate Detection** - Finds duplicate rows in your dataset
- **Consistency Checks** - Identifies inconsistent formatting patterns

### 🎯 **Smart Issue Classification**
- **Errors** - Critical issues that must be fixed
- **Warnings** - Issues that should be reviewed
- **Info** - Suggestions for improvement

### 📈 **Quality Metrics**
- **Data Quality Score** - Overall assessment of data quality (0-100%)
- **Completion Percentage** - How much of your data is complete
- **Issue Breakdown** - Detailed count of errors, warnings, and info items
- **Row-by-Row Analysis** - Identify which rows have issues

### 🔧 **User-Friendly Interface**
- **Drag & Drop Upload** - Easy file import
- **Progress Tracking** - Real-time import and scanning progress
- **Data Preview** - View your data with highlighted issues
- **Export Results** - Save validation reports as JSON
- **Responsive Design** - Works on desktop and mobile devices

## How to Use

### 1. **Upload Your Report**
- Click the upload area or drag and drop your file
- Supported formats: CSV, JSON, TXT, TSV
- Maximum file size: 10MB

### 2. **Review File Overview**
- View basic statistics about your file
- See row count, column count, and file type
- Preview the data structure

### 3. **Scan for Issues**
- Click "Scan Report" to analyze your data
- Watch the progress as validation rules are applied
- Get real-time feedback on scanning progress

### 4. **Review Results**
- **Summary Cards**: Quick overview of data quality
- **Issue Breakdown**: Count of errors, warnings, and info items  
- **Detailed Issues**: Complete list with descriptions and locations
- **Data Quality Score**: Overall assessment of your data

### 5. **Explore Issues**
- Filter by severity (Errors, Warnings, Info)
- View specific row and column locations
- See current values and suggested fixes
- Get detailed descriptions for each issue

### 6. **Preview Data**
- View your data in a table format
- See highlighted cells with issues
- Tooltip information for problematic cells

### 7. **Export Results**
- Download validation report as JSON
- Includes summary, detailed issues, and metadata
- Perfect for sharing with team members

## Validation Rules

### **Required Field Validation**
- Detects empty cells, null values, and blank strings
- Severity: Warning
- Helps identify incomplete data

### **Data Type Validation**
- **Numeric columns**: Validates that numeric fields contain valid numbers
- **Boolean columns**: Ensures boolean fields contain true/false, yes/no, or 1/0
- Severity: Error
- Column detection based on header names

### **Format Validation**
- **Email**: Validates email address format (user@domain.com)
- **Date**: Ensures dates are in valid formats
- **Phone**: Validates phone number patterns
- Severity: Error
- Automatic column type detection

### **Range Validation**
- **Text Length**: Checks minimum and maximum character limits
- **Numeric Ranges**: Validates numeric values within specified bounds
- Severity: Warning
- Configurable parameters

### **Custom Rules**
- **Duplicate Rows**: Identifies identical rows in the dataset
- **Data Consistency**: Checks for formatting inconsistencies within columns
- Severity: Warning/Info
- Advanced pattern detection

## Sample Data

The application includes sample data files for testing:

### `employees.csv`
Employee data with various issues:
- Missing names and ages
- Invalid email formats  
- Invalid phone numbers
- Inconsistent date formats
- Missing salary values

### `products.json`
Product inventory with problems:
- Empty product names
- Invalid price formats
- Negative quantities
- Duplicate entries
- Missing category information

### `customers.tsv`
Customer data with inconsistencies:
- Missing customer names
- Invalid email formats
- Inconsistent date formats
- Mixed case status values
- Missing order counts

## Technical Details

### **Built With**
- Angular 19 (Standalone Components)
- TypeScript
- RxJS for reactive programming
- Modern CSS with Flexbox/Grid
- Responsive design principles

### **Architecture**
- **Service-based**: Separation of import and validation logic
- **Reactive**: Progress tracking with Observables
- **Modular**: Reusable components and services
- **Type-safe**: Full TypeScript implementation

### **Performance**
- Efficient file parsing for large datasets
- Progress tracking for long operations
- Memory-conscious data processing
- Optimized rendering for large result sets

## Development

### **Prerequisites**
- Node.js 18+ 
- Angular CLI 19+
- Modern web browser

### **Getting Started**
```bash
# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

### **Project Structure**
```
src/app/
├── components/
│   └── report-scanner.component.ts    # Main UI component
├── services/
│   ├── report-import.service.ts       # File import logic
│   └── report-validation.service.ts   # Validation rules
└── app.component.ts                   # Root component

sample-data/
├── employees.csv                      # Sample CSV with issues
├── products.json                      # Sample JSON with problems
└── customers.tsv                      # Sample TSV with inconsistencies
```

## Browser Support

- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Need Help?** Check the sample data files to see examples of data issues the application can detect!