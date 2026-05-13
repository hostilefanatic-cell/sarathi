// Sarathi App - Core Functionality

// Language configuration
const LANGUAGES = {
  sanskrit: {
    name: 'Sanskrit',
    code: 'hi',
    fileName: 'sanskrit_raw.json'
  },
  kannada: {
    name: 'Kannada',
    code: 'kn',
    fileName: 'kannada_raw.json'
  },
  tamil: {
    name: 'Tamil',
    code: 'ta',
    fileName: 'tamil_raw.json'
  },
  english: {
    name: 'English',
    code: 'en',
    fileName: 'english_raw.json'
  }
};

// Global state
let currentLanguage = 'sanskrit';
let gitaData = null;
let wordIndex = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  // Load saved language preference
  const savedLanguage = localStorage.getItem('sarathi_language');
  if (savedLanguage && LANGUAGES[savedLanguage]) {
    currentLanguage = savedLanguage;
  }

  // Set up language selector
  const languageSelector = document.getElementById('language');
  if (languageSelector) {
    languageSelector.value = currentLanguage;
    languageSelector.addEventListener('change', handleLanguageChange);
  }

  // Apply language to body
  document.body.setAttribute('data-language', currentLanguage);

  // Load data for current language
  loadLanguageData();
});

// Handle language change
function handleLanguageChange(event) {
  const newLanguage = event.target.value;
  if (newLanguage !== currentLanguage) {
    currentLanguage = newLanguage;
    localStorage.setItem('sarathi_language', newLanguage);
    document.body.setAttribute('data-language', newLanguage);

    // Reload data
    loadLanguageData();
  }
}

// Load language data
async function loadLanguageData() {
  try {
    const fileName = LANGUAGES[currentLanguage].fileName;
    const response = await fetch(`data/${fileName}`);

    if (!response.ok) {
      throw new Error(`Failed to load ${fileName}`);
    }

    gitaData = await response.json();

    // Build word index from the raw data
    buildWordIndex();

    // Notify other scripts that data is loaded
    window.dispatchEvent(new Event('dataLoaded'));
  } catch (error) {
    console.error('Error loading language data:', error);
    showError('Failed to load data. Please try again.');
  }
}

// Build word index from raw chapter/verse data
function buildWordIndex() {
  if (!gitaData || !gitaData.chapters) {
    return;
  }

  wordIndex = {};
  const chapters = gitaData.chapters;

  chapters.forEach((chapter, chapterIdx) => {
    const chapterNumber = chapterIdx + 1;

    chapter.verses.forEach(verse => {
      const verseText = verse.full_text || '';

      // Tokenize the verse text into words
      const words = tokenizeText(verseText);

      words.forEach(word => {
        if (word.length > 0) {
          // Normalize the word (trim, lowercase for English)
          let normalizedWord = word.trim();

          // For English, make it case-insensitive
          if (currentLanguage === 'english') {
            normalizedWord = normalizedWord.toLowerCase();
          }

          // Initialize word entry if it doesn't exist
          if (!wordIndex[normalizedWord]) {
            wordIndex[normalizedWord] = {
              occurrences: 0,
              verses: []
            };
          }

          // Check if this verse is already added for this word
          const existingVerse = wordIndex[normalizedWord].verses.find(
            v => v.chapter === chapterNumber && v.verse === verse.verse_number
          );

          if (!existingVerse) {
            wordIndex[normalizedWord].occurrences++;
            wordIndex[normalizedWord].verses.push({
              chapter: chapterNumber,
              verse: verse.verse_number,
              speaker: verse.speaker,
              verse_text: verse.full_text,
              chapter_title: chapter.chapter_title
            });
          }
        }
      });
    });
  });
}

// Tokenize text into words
function tokenizeText(text) {
  // Remove speaker info (lines ending with "uvāca" or similar)
  text = text.replace(/^.*?(उवाच|ಉವಾಚ|உவாச|ఉవాచ|uvāca)[^\n]*\n/gim, '');

  // Remove verse numbers (|| N ||, || ೧ ||, etc.)
  text = text.replace(/\|\|[^\|]*\|\|/g, '');

  // Remove any remaining || markers
  text = text.replace(/\|\|/g, ' ');

  // Remove punctuation marks
  text = text.replace(/[।|॥|।।]/g, ' ');
  text = text.replace(/[|]/g, ' ');

  // Split by whitespace and line breaks
  const words = text.split(/[\s\n]+/);

  // Filter out:
  // - Empty strings
  // - Very short words (likely punctuation)
  // - Pure numbers
  // - Words that are just punctuation/symbols
  return words.filter(word => {
    if (word.length <= 1) return false;

    // Skip if it's just a number (any script)
    if (/^[\d०-९೦-೯௦-௯౦-౯]+$/.test(word)) return false;

    // Skip if it contains only punctuation or symbols
    if (/^[^\p{L}\p{N}]+$/u.test(word)) return false;

    return true;
  });
}

// Get random word from index
function getRandomWord(filter = 'all', chapterFrom = 1, chapterTo = 18) {
  if (!wordIndex) {
    return null;
  }

  let words = Object.keys(wordIndex);
  if (words.length === 0) {
    return null;
  }

  // Apply chapter range filter
  if (chapterFrom !== 1 || chapterTo !== 18) {
    words = words.filter(word => {
      // Check if the word appears in any verse within the chapter range
      return wordIndex[word].verses.some(verse =>
        verse.chapter >= chapterFrom && verse.chapter <= chapterTo
      );
    });
  }

  // Apply occurrence filter
  if (filter !== 'all') {
    words = words.filter(word => {
      const occurrences = wordIndex[word].occurrences;

      switch(filter) {
        case '1-2':
          return occurrences >= 1 && occurrences <= 2;
        case '3-5':
          return occurrences >= 3 && occurrences <= 5;
        case '6-10':
          return occurrences >= 6 && occurrences <= 10;
        case '10+':
          return occurrences > 10;
        default:
          return true;
      }
    });
  }

  // Return null if no words match the filter
  if (words.length === 0) {
    return null;
  }

  const randomWord = words[Math.floor(Math.random() * words.length)];
  return {
    word: randomWord,
    data: wordIndex[randomWord]
  };
}

// Search for a word
function searchWord(searchTerm) {
  if (!wordIndex) {
    return null;
  }

  // Normalize search term
  let normalizedSearch = searchTerm.trim();
  if (currentLanguage === 'english') {
    normalizedSearch = normalizedSearch.toLowerCase();
  }

  // Exact match
  if (wordIndex[normalizedSearch]) {
    return {
      word: normalizedSearch,
      data: wordIndex[normalizedSearch]
    };
  }

  // Partial match (search for words containing the search term)
  const matchingWords = Object.keys(wordIndex).filter(word =>
    word.includes(normalizedSearch)
  );

  if (matchingWords.length > 0) {
    // Return all matching words
    return matchingWords.map(word => ({
      word: word,
      data: wordIndex[word]
    }));
  }

  return null;
}

// Get popular words (most frequent)
function getPopularWords(limit = 10) {
  if (!wordIndex) {
    return [];
  }

  const words = Object.keys(wordIndex)
    .map(word => ({
      word: word,
      occurrences: wordIndex[word].occurrences
    }))
    .sort((a, b) => b.occurrences - a.occurrences)
    .slice(0, limit);

  return words;
}

// Highlight word in text
function highlightWordInText(text, word) {
  if (!text || !word) {
    return text;
  }

  // Create a case-insensitive regex for the word
  const regex = new RegExp(`(${escapeRegExp(word)})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
}

// Escape special regex characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Show error message
function showError(message) {
  alert(message);
}

// Format chapter and verse reference
function formatVerseReference(chapter, verse) {
  return `📖 Chapter ${chapter}, Verse ${verse}`;
}

// Export functions to global scope
window.SarathiApp = {
  getRandomWord,
  searchWord,
  getPopularWords,
  highlightWordInText,
  formatVerseReference,
  getCurrentLanguage: () => currentLanguage,
  getGitaData: () => gitaData,
  getWordIndex: () => wordIndex
};
