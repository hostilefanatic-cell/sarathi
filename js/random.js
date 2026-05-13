// Random Word Generator

let currentWord = null;
let isFlipped = false;
let currentChapterRange = { from: 1, to: 18 };

document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('generateBtn');
  const flashCard = document.getElementById('flashCard');

  // Set up event listeners
  if (generateBtn) {
    generateBtn.addEventListener('click', generateRandomWord);
  }

  if (flashCard) {
    flashCard.addEventListener('click', handleCardClick);
  }

  // Listen for data load event
  window.addEventListener('dataLoaded', onDataLoaded);
});

function onDataLoaded() {
  // Data is loaded, ready to generate words
}

function generateRandomWord() {
  // Get the selected filters
  const filterDropdown = document.getElementById('occurrenceFilter');
  const filter = filterDropdown ? filterDropdown.value : 'all';

  const chapterFromDropdown = document.getElementById('chapterFrom');
  const chapterToDropdown = document.getElementById('chapterTo');
  const chapterFrom = chapterFromDropdown ? parseInt(chapterFromDropdown.value) : 1;
  const chapterTo = chapterToDropdown ? parseInt(chapterToDropdown.value) : 18;

  // Validate chapter range
  if (chapterFrom > chapterTo) {
    alert('Invalid chapter range: "From" chapter cannot be greater than "To" chapter.');
    return;
  }

  // Store the current chapter range
  currentChapterRange = { from: chapterFrom, to: chapterTo };

  const wordData = window.SarathiApp.getRandomWord(filter, chapterFrom, chapterTo);

  if (!wordData) {
    let filterText = '';
    if (filter !== 'all') {
      filterText = ` matching the "${filterDropdown.options[filterDropdown.selectedIndex].text}" filter`;
    }
    if (chapterFrom !== 1 || chapterTo !== 18) {
      filterText += ` in chapters ${chapterFrom}-${chapterTo}`;
    }
    alert(`No words found${filterText}. Try adjusting your filters or changing the language.`);
    return;
  }

  currentWord = wordData;
  isFlipped = false;

  // Filter verses by chapter range
  const filteredVerses = wordData.data.verses.filter(verse =>
    verse.chapter >= chapterFrom && verse.chapter <= chapterTo
  );

  // Display the word on the front of the card with filtered occurrence count
  displayWord(wordData.word, filteredVerses.length);

  // Reset card to front
  resetCard();
}

function displayWord(word, occurrences) {
  const wordDisplay = document.getElementById('wordDisplay');
  const wordInfo = document.getElementById('wordInfo');

  if (!wordDisplay || !wordInfo) return;

  // Clear initial message and show word
  wordDisplay.innerHTML = `<p class="word-text">${word}</p>`;
  wordInfo.style.display = 'block';

  // Update occurrence count
  const occurrenceText = occurrences === 1 ? 'verse' : 'verses';
  wordInfo.querySelector('.occurrence-count').textContent =
    `(Found in ${occurrences} ${occurrenceText})`;

  // Change button text
  const generateBtn = document.getElementById('generateBtn');
  if (generateBtn) {
    generateBtn.textContent = 'Generate Another Word';
  }
}

function handleCardClick(event) {
  if (!currentWord) {
    return;
  }

  if (isFlipped) {
    return;
  }

  flipCard();
}

function flipCard() {
  if (!currentWord) {
    return;
  }

  const flashCard = document.getElementById('flashCard');
  const versesDisplay = document.getElementById('versesDisplay');

  if (!flashCard || !versesDisplay) {
    return;
  }

  // Display verses first
  displayVerses(currentWord.word, currentWord.data.verses);

  // Then flip the card (CSS handles the animation)
  flashCard.classList.add('flipped');
  isFlipped = true;
}

function displayVerses(word, verses) {
  const versesDisplay = document.getElementById('versesDisplay');

  if (!versesDisplay) return;

  // Filter verses by current chapter range
  const filteredVerses = verses.filter(verse =>
    verse.chapter >= currentChapterRange.from &&
    verse.chapter <= currentChapterRange.to
  );

  // Create header
  const versesCount = filteredVerses.length;
  const versesText = versesCount === 1 ? 'verse' : 'verses';

  let rangeText = '';
  if (currentChapterRange.from !== 1 || currentChapterRange.to !== 18) {
    rangeText = ` (in chapters ${currentChapterRange.from}-${currentChapterRange.to})`;
  }

  let html = `
    <div class="verses-header">
      "${word}" appears in ${versesCount} ${versesText}${rangeText}:
    </div>
  `;

  // Add each verse
  filteredVerses.forEach(verse => {
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

  versesDisplay.innerHTML = html;
}

function resetCard() {
  const flashCard = document.getElementById('flashCard');

  if (!flashCard) {
    return;
  }

  // Remove flipped class (CSS handles the animation)
  flashCard.classList.remove('flipped');
  isFlipped = false;
}

// Make resetCard available globally for the flip back button
window.flipToFront = resetCard;
