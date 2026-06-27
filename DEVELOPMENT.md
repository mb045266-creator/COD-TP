# COD TP - Installation & Development Guide

## Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Visual Studio Code (optional but recommended)
- Git (for version control)

## Installation Steps

### 1. Clone or Download
```bash
git clone https://github.com/mb045266-creator/COD-TP.git
cd COD-TP
```

### 2. Open in VS Code
```bash
code .
```

### 3. Start Development Server
```bash
# Using Python
python -m http.server 8000

# Or using Node.js http-server
npx http-server
```

### 4. Access the Application
- Web App: http://localhost:8000
- Mobile App: http://localhost:8000/mobile.html

## Project Structure

```
COD-TP/
├── index.html              # Main web application
├── mobile.html             # Mobile app interface
├── manifest.json           # PWA configuration
├── service-worker.js       # Offline support
├── GUIDE.md                # Arabic user guide
├── README.md               # Project overview
│
├── css/
│   ├── styles.css         # Main styles
│   ├── responsive.css     # Responsive design
│   └── mobile.css         # Mobile styles
│
└── js/
    ├── utils.js           # Helper functions
    ├── database.js        # Data management
    ├── app.js             # Main application
    ├── orders.js          # Order management
    ├── agents.js          # Agent management
    ├── statistics.js      # Statistics
    ├── integrations.js    # Store integrations
    └── mobile.js          # Mobile app logic
```

## Configuration

### Environment Variables
Create `.env` file (optional):
```
API_URL=http://localhost:3000
API_KEY=your_api_key
```

### Database Setup
Data is stored in LocalStorage by default:
```javascript
// In browser console
localStorage.getItem('COD_TP')  // View all data
localStorage.clear()             // Reset data
```

## Development Workflow

### Creating a New Feature

1. Create feature branch:
```bash
git checkout -b feature/new-feature
```

2. Make changes

3. Commit:
```bash
git add .
git commit -m "feat: description of changes"
```

4. Push:
```bash
git push origin feature/new-feature
```

### File Naming Conventions
- CSS files: `kebab-case.css`
- JS files: `camelCase.js`
- HTML files: `kebab-case.html`
- Classes: `PascalCase`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`

## Testing

### Manual Testing
1. Test on desktop browser
2. Test on mobile browser
3. Test on different screen sizes
4. Test offline functionality

### Browser DevTools
- **F12**: Open DevTools
- **Ctrl+Shift+I**: Alternative
- **Mobile Emulation**: Ctrl+Shift+M
- **Console**: Check for errors
- **Application**: View stored data

## Performance Optimization

### CSS Optimization
```bash
# Minify CSS
csso-cli styles.css -o styles.min.css
```

### JavaScript Optimization
```bash
# Minify JS
terser app.js -o app.min.js
```

### Caching Strategy
- Static files: Cache busting with version numbers
- Data: IndexedDB for large datasets
- Service Worker: Cache-first strategy for assets

## Deployment

### Vercel
```bash
npm i -g vercel
vercel
```

### GitHub Pages
```bash
# Push to gh-pages branch
git subtree push --prefix . origin gh-pages
```

### Custom Server
1. Upload files to server
2. Configure web server
3. Enable HTTPS
4. Set up SSL certificate

## Troubleshooting

### Service Worker Issues
```javascript
// Unregister service worker
navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => reg.unregister());
});
```

### Cache Issues
```javascript
// Clear cache
caches.keys().then(names => {
    names.forEach(name => caches.delete(name));
});
```

### Storage Issues
```javascript
// Check storage quota
navigator.storage.estimate().then(estimate => {
    console.log(estimate.usage / estimate.quota);
});
```

## Security Best Practices

1. **Input Validation**
   - Sanitize user inputs
   - Validate email and phone formats
   - Check password strength

2. **Data Protection**
   - Encrypt sensitive data
   - Use secure storage
   - Implement CORS policies

3. **Authentication**
   - Use JWT tokens (recommended)
   - Implement session timeout
   - Store tokens securely

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| ES6     | ✓      | ✓       | ✓      | ✓    |
| Service Worker | ✓ | ✓    | ✓(11.1+) | ✓ |
| IndexedDB | ✓    | ✓       | ✓      | ✓    |
| PWA     | ✓      | ✓       | ✓(16.1+) | ✓   |

## Performance Metrics

### Target Metrics
- First Contentful Paint: < 1.8s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- First Input Delay: < 100ms

### Measuring Performance
```javascript
// In browser console
performance.getEntriesByType('navigation')[0]
performance.getEntriesByType('resource')
```

## License

All rights reserved © 2026 COD TP

For commercial use, contact: support@codtp.dz

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

- 📧 Email: support@codtp.dz
- 📱 WhatsApp: +213 XXX XXX XXX
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions

---

**Happy Coding!** 🚀
