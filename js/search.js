// Word Search Functionality

let searchTimeout = null;

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const clearBtn = document.getElementById('clearBtn');

  // Set up event listeners
  if (searchInput) {
    searchInput.addEventListener('input', handleSearchInput);
    searchInput.addEventListener('keypress', handleKeyPress);
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', performSearch);
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', clearSearch);
  }

  // Listen for data load event
  window.addEventListener('dataLoaded', onDataLoaded);
});

function onDataLoaded() {
  // Load popular words when data is ready
  loadPopularWords();
}

function handleSearchInput(event) {
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearBtn');

  if (!searchInput || !clearBtn) return;

  // Show/hide clear button
  if (searchInput.value.trim().length > 0) {
    clearBtn.style.display = 'block';
  } else {
    clearBtn.style.display = 'none';
  }

  // Clear previous timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  // Debounce search (300ms delay)
  searchTimeout = setTimeout(() => {
    if (searchInput.value.trim().length > 0) {
      performSearch();
    }
  }, 300);
}

function handleKeyPress(event) {
  if (event.key === 'Enter') {
    performSearch();
  }
}

function performSearch() {
  const searchInput = document.getElementById('searchInput');

  if (!searchInput) return;

  const searchTerm = searchInput.value.trim();

  if (searchTerm.length === 0) {
    showNoResults('Please enter a word to search');
    return;
  }

  // Show loading
  showLoading(true);

  // Hide previous results
  hideResults();

  // Perform search
  const results = window.SarathiApp.searchWord(searchTerm);

  // Hide loading
  showLoading(false);

  if (!results) {
    showNoResults(`No results found for "${searchTerm}"`);
    return;
  }

  // Display results
  if (Array.isArray(results)) {
    // Multiple words matched (partial match)
    displayMultipleResults(searchTerm, results);
  } else {
    // Single word matched (exact match)
    displayResults(results.word, results.data.verses);
  }
}

function displayResults(word, verses) {
  const resultsContainer = document.getElementById('resultsContainer');
  const resultsHeader = document.getElementById('resultsHeader');
  const resultsList = document.getElementById('resultsList');
  const popularWords = document.getElementById('popularWords');
  const noResults = document.getElementById('noResults');

  if (!resultsContainer || !resultsHeader || !resultsList) return;

  // Hide popular words and no results
  if (popularWords) popularWords.style.display = 'none';
  if (noResults) noResults.style.display = 'none';

  // Show results container
  resultsContainer.style.display = 'block';

  // Set header
  const versesCount = verses.length;
  const versesText = versesCount === 1 ? 'verse' : 'verses';
  resultsHeader.textContent = `Results for "${word}" (${versesCount} ${versesText} found)`;

  // Build results HTML
  let html = '';
  verses.forEach(verse => {
    const verseRef = window.SarathiApp.formatVerseReference(verse.chapter, verse.verse);
    const highlightedText = window.SarathiApp.highlightWordInText(verse.verse_text, word);

    html += `
      <div class="verse-card">
        <div class="verse-metadata">
          <span class="verse-location">${verseRef}</span>
          ${verse.speaker ? `<span class="verse-speaker">🗣️ ${verse.speaker}</span>` : ''}
        </div>
        <div class="verse-text">${highlightedText}</div>
      </div>
    `;
  });

  resultsList.innerHTML = html;

  // Scroll to results
  resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function displayMultipleResults(searchTerm, results) {
  const resultsContainer = document.getElementById('resultsContainer');
  const resultsHeader = document.getElementById('resultsHeader');
  const resultsList = document.getElementById('resultsList');
  const popularWords = document.getElementById('popularWords');
  const noResults = document.getElementById('noResults');

  if (!resultsContainer || !resultsHeader || !resultsList) return;

  // Hide popular words and no results
  if (popularWords) popularWords.style.display = 'none';
  if (noResults) noResults.style.display = 'none';

  // Show results container
  resultsContainer.style.display = 'block';

  // Set header
  resultsHeader.textContent = `Found ${results.length} word(s) matching "${searchTerm}"`;

  // Build results HTML - show all verses from all matching words
  let html = '';
  results.forEach(result => {
    result.data.verses.forEach(verse => {
      const verseRef = window.SarathiApp.formatVerseReference(verse.chapter, verse.verse);
      const highlightedText = window.SarathiApp.highlightWordInText(verse.verse_text, result.word);

      html += `
        <div class="verse-card">
          <div class="verse-metadata">
            <span class="verse-location">${verseRef}</span>
            ${verse.speaker ? `<span class="verse-speaker">🗣️ ${verse.speaker}</span>` : ''}
          </div>
          <div class="verse-text">${highlightedText}</div>
        </div>
      `;
    });
  });

  resultsList.innerHTML = html;

  // Scroll to results
  resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showNoResults(message) {
  const resultsContainer = document.getElementById('resultsContainer');
  const popularWords = document.getElementById('popularWords');
  const noResults = document.getElementById('noResults');
  const noResultsMessage = noResults ? noResults.querySelector('.no-results-message') : null;

  // Hide results
  if (resultsContainer) resultsContainer.style.display = 'none';
  if (popularWords) popularWords.style.display = 'none';

  // Show no results
  if (noResults) {
    noResults.style.display = 'block';
    if (noResultsMessage) {
      noResultsMessage.textContent = message || 'This word doesn\'t appear in the Bhagavad Gita';
    }
  }

  // Load suggested words
  loadSuggestedWords();
}

function hideResults() {
  const resultsContainer = document.getElementById('resultsContainer');
  const noResults = document.getElementById('noResults');

  if (resultsContainer) resultsContainer.style.display = 'none';
  if (noResults) noResults.style.display = 'none';
}

function clearSearch() {
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearBtn');
  const popularWords = document.getElementById('popularWords');

  if (searchInput) {
    searchInput.value = '';
    searchInput.focus();
  }

  if (clearBtn) {
    clearBtn.style.display = 'none';
  }

  // Hide results and show popular words
  hideResults();
  if (popularWords) {
    popularWords.style.display = 'block';
  }
}

function loadPopularWords() {
  const wordTags = document.getElementById('wordTags');

  if (!wordTags) return;

  const popularWords = window.SarathiApp.getPopularWords(8);

  let html = '';
  popularWords.forEach(wordData => {
    html += `<span class="word-tag" onclick="searchForWord('${wordData.word}')">${wordData.word}</span>`;
  });

  wordTags.innerHTML = html;
}

function loadSuggestedWords() {
  const suggestedWords = document.getElementById('suggestedWords');

  if (!suggestedWords) return;

  const popularWords = window.SarathiApp.getPopularWords(6);

  let html = '';
  popularWords.forEach(wordData => {
    html += `<span class="word-tag" onclick="searchForWord('${wordData.word}')">${wordData.word}</span>`;
  });

  suggestedWords.innerHTML = html;
}

function searchForWord(word) {
  const searchInput = document.getElementById('searchInput');

  if (searchInput) {
    searchInput.value = word;
    performSearch();
  }
}

function showLoading(show) {
  const loading = document.getElementById('loading');

  if (loading) {
    loading.style.display = show ? 'block' : 'none';
  }
}

// Update search input placeholder based on language
function updatePlaceholder() {
  const searchInput = document.getElementById('searchInput');
  const language = window.SarathiApp.getCurrentLanguage();

  if (!searchInput) return;

  const placeholders = {
    sanskrit: 'Enter word in Sanskrit',
    kannada: 'ಪದವನ್ನು ನಮೂದಿಸಿ',
    tamil: 'சொல்லை உள்ளிடவும்',
    english: 'Enter word in English'
  };

  searchInput.placeholder = placeholders[language] || 'Enter word';
}

// Listen for language changes
window.addEventListener('dataLoaded', () => {
  updatePlaceholder();
  loadPopularWords();
});

// Make searchForWord available globally
window.searchForWord = searchForWord;
