# Sarathi - Bhagavad Gita Vocabulary Explorer

A static web application for exploring Bhagavad Gita vocabulary across multiple Indian languages.

## Features

- **Random Word Generator**: Discover random words from the Bhagavad Gita with a beautiful flip-card interface
- **Word Search**: Search for specific words and see all verses containing them
- **Multi-Language Support**: Sanskrit, Kannada, Tamil, and English
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Beautiful UI**: Clean, modern interface with proper Indic script rendering

## Quick Start

### Option 1: Python HTTP Server

```bash
cd sarathi-app
python -m http.server 8000
```

Then open your browser and navigate to:
```
http://localhost:8000
```

### Option 2: Node.js HTTP Server

```bash
cd sarathi-app
npx serve .
```

### Option 3: VS Code Live Server

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Project Structure

```
sarathi-app/
├── index.html          # Landing page with language selector
├── random.html         # Random word generator page
├── search.html         # Word search page
├── css/
│   ├── main.css       # Global styles and layout
│   ├── components.css # Reusable component styles
│   └── fonts.css      # Indic script font declarations
├── js/
│   ├── app.js         # Core functionality and language management
│   ├── random.js      # Random word generator logic
│   └── search.js      # Search functionality
└── data/
    ├── kannada_raw.json
    ├── tamil_raw.json
    ├── sanskrit_raw.json
    └── english_raw.json
```

## How It Works

### Data Processing

The app loads raw JSON data files containing all chapters and verses of the Bhagavad Gita. When a language is selected:

1. The corresponding JSON file is loaded
2. A word index is built in-memory by tokenizing all verses
3. Each word is mapped to all verses where it appears

### Random Word Generator

- Selects a random word from the word index
- Displays it on a flip card
- Click the card to see all verses containing that word
- Words are highlighted in the verse text

### Word Search

- Type a word in the search box
- Results appear automatically (with 300ms debounce)
- Supports both exact and partial matches
- Shows popular words for quick access

### Language Support

Fonts are loaded from Google Fonts CDN:
- Sanskrit/Hindi: Noto Sans Devanagari
- Kannada: Noto Sans Kannada
- Tamil: Noto Sans Tamil
- English: Inter

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Lazy loading: Only loads data for selected language
- Debounced search: 300ms delay to avoid excessive processing
- Efficient word indexing: In-memory hash map for instant lookups
- Responsive images and fonts loaded from CDN

## Customization

### Changing Colors

Edit `css/main.css` and modify the CSS variables:

```css
:root {
  --color-primary: #FF6B35;
  --color-secondary: #F7931E;
  --color-accent: #4ECDC4;
  --color-background: #FFF8F0;
  --color-text: #2D3142;
  --color-card: #FFFFFF;
  --color-border: #E0E0E0;
}
```

### Adding More Languages

1. Add the language data JSON file to `data/` directory
2. Update `LANGUAGES` object in `js/app.js`:

```javascript
const LANGUAGES = {
  newlanguage: {
    name: 'Language Name',
    code: 'xy',
    fileName: 'newlanguage_raw.json'
  }
};
```

3. Add font support in `css/fonts.css`
4. Update language selector in HTML files

## Data Format

The app expects JSON files in this format:

```json
{
  "language": "kannada",
  "scrape_date": "2025-11-18T...",
  "source_website": "https://stotranidhi.com",
  "total_chapters": 18,
  "chapters": [
    {
      "chapter_title": "Chapter title",
      "source_url": "https://...",
      "verses": [
        {
          "verse_number": 1,
          "speaker": "Speaker name",
          "lines": ["line 1", "line 2"],
          "full_text": "Complete verse text",
          "html": "Original HTML"
        }
      ]
    }
  ]
}
```

## Troubleshooting

### Fonts Not Rendering Properly

- Check internet connection (fonts load from Google Fonts CDN)
- Clear browser cache
- Ensure `fonts.css` is loaded in HTML files

### Data Not Loading

- Check browser console for errors
- Verify JSON files are in `data/` directory
- Ensure file names match those in `LANGUAGES` object in `app.js`

### Search Not Working

- Ensure data is fully loaded before searching
- Check that `app.js` is loaded before `search.js`
- Verify word tokenization is working for your language

## Credits

- **Data Source**: [StotraNidhi](https://stotranidhi.com)
- **Fonts**: [Google Fonts](https://fonts.google.com) - Noto Sans family
- **Design**: Based on the Sarathi App Design Document

## License

This project is for educational purposes. Please respect the source website's terms of service.

---

Made with ♥ for Sanskrit learners
