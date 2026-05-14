// Sarathi — shared components

const { useState, useEffect, useRef, useMemo, useCallback } = React;

const LANGUAGES = {
  sanskrit: { name: 'Sanskrit', native: 'संस्कृतम्', code: 'sa', file: 'data/sanskrit_raw.json', chip: 'अ', script: 'sanskrit' },
  kannada:  { name: 'Kannada',  native: 'ಕನ್ನಡ',     code: 'kn', file: 'data/kannada_raw.json',  chip: 'ಅ', script: 'kannada' },
  tamil:    { name: 'Tamil',    native: 'தமிழ்',     code: 'ta', file: 'data/tamil_raw.json',    chip: 'அ', script: 'tamil' },
  english:  { name: 'English',  native: 'English',   code: 'en', file: 'data/english_raw.json',  chip: 'A',  script: 'english' }
};

const CHAPTER_NAMES = [
  "Arjuna-viṣāda", "Sāṅkhya", "Karma", "Jñāna", "Karma-sannyāsa",
  "Dhyāna", "Jñāna-vijñāna", "Akṣara-brahma", "Rāja-vidyā",
  "Vibhūti", "Viśvarūpa-darśana", "Bhakti", "Kṣetra-kṣetrajña",
  "Guṇa-traya", "Puruṣottama", "Daivāsura", "Śraddhā-traya", "Mokṣa-sannyāsa"
];

// ---- Top bar ----
function TopBar({ view, setView, lang, setLang }) {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">Sarathi</div>
        <div className="brand-sub">Bhagavad Gītā</div>
      </div>
      <nav className="nav">
        <button className={view === 'home' ? 'active' : ''} onClick={() => setView('home')}>Home</button>
        <button className={view === 'explore' ? 'active' : ''} onClick={() => setView('explore')}>Explore</button>
        <button className={view === 'search' ? 'active' : ''} onClick={() => setView('search')}>Search</button>
      </nav>
      <div className="lang-picker">
        <span className="lang-label">Script</span>
        {Object.keys(LANGUAGES).map(k => (
          <button
            key={k}
            className={'lang-chip ' + (lang === k ? 'active' : '')}
            data-script={LANGUAGES[k].script}
            onClick={() => setLang(k)}
            title={LANGUAGES[k].name}
          >
            {LANGUAGES[k].chip}
          </button>
        ))}
      </div>
    </header>
  );
}

// ---- Footer ----
function Footer() {
  return (
    <footer className="footer">
      <div>© Sarathi · Built for śloka students</div>
      <div>Source · <a href="https://stotranidhi.com" target="_blank" rel="noreferrer">StotraNidhi</a></div>
    </footer>
  );
}

// ---- Loading state ----
function Loading({ label = 'Loading the corpus' }) {
  return (
    <div className="loading-state">
      <span className="loading-dot" style={{ animationDelay: '0s' }}></span>
      <span className="loading-dot" style={{ animationDelay: '0.2s' }}></span>
      <span className="loading-dot" style={{ animationDelay: '0.4s' }}></span>
      <span style={{ marginLeft: 8 }}>{label}…</span>
    </div>
  );
}

// ---- Helpers ----
function tokenize(text) {
  if (!text) return [];
  text = text.replace(/^.*?(उवाच|ಉವಾಚ|உவாச|ఉవాచ|uvāca)[^\n]*\n/gim, '');
  text = text.replace(/\|\|[^\|]*\|\|/g, '');
  text = text.replace(/\|\|/g, ' ');
  text = text.replace(/[।|॥|।।]/g, ' ');
  text = text.replace(/[|]/g, ' ');
  const words = text.split(/[\s\n]+/);
  return words.filter(w => {
    if (w.length <= 1) return false;
    if (/^[\d०-९೦-೯௦-௯౦-౯]+$/.test(w)) return false;
    if (/^[^\p{L}\p{N}]+$/u.test(w)) return false;
    return true;
  });
}

function buildIndex(data, langKey) {
  const idx = {};
  if (!data || !data.chapters) return idx;
  data.chapters.forEach((ch, ci) => {
    const chapter = ci + 1;
    ch.verses.forEach(v => {
      const text = v.full_text || '';
      const words = tokenize(text);
      const seen = new Set();
      words.forEach(raw => {
        let w = raw.trim();
        if (langKey === 'english') w = w.toLowerCase();
        if (!w || seen.has(w)) return;
        seen.add(w);
        if (!idx[w]) idx[w] = { occurrences: 0, verses: [] };
        idx[w].occurrences++;
        idx[w].verses.push({
          chapter, verse: v.verse_number,
          speaker: v.speaker,
          verse_text: v.full_text,
          chapter_title: ch.chapter_title
        });
      });
    });
  });
  return idx;
}

function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function highlightVerse(text, word) {
  if (!text || !word) return text;
  // strip speaker line for separate render
  const lines = text.split('\n');
  let speaker = null;
  if (lines[0] && /(उवाच|ಉವಾಚ|உவாச|uvāca)/i.test(lines[0])) {
    speaker = lines.shift();
  }
  const body = lines.join('\n');
  const re = new RegExp('(' + escapeRegExp(word) + ')', 'gi');
  const parts = body.split(re);
  return (
    <React.Fragment>
      {speaker && <span className="speaker-line">{speaker.replace(/[।॥]/g, '').trim()}</span>}
      {parts.map((p, i) => re.test(p) && i % 2 === 1
        ? <span key={i} className="highlight">{p}</span>
        : <React.Fragment key={i}>{p}</React.Fragment>
      )}
    </React.Fragment>
  );
}

// Chapter concordance strip
function ChapterStrip({ verses, from, to }) {
  const counts = useMemo(() => {
    const c = new Array(18).fill(0);
    (verses || []).forEach(v => { c[v.chapter - 1]++; });
    return c;
  }, [verses]);
  const max = Math.max(1, ...counts);

  return (
    <div className="chapters">
      {counts.map((n, i) => {
        const chap = i + 1;
        const inRange = chap >= from && chap <= to;
        const h = n === 0 ? 4 : 8 + (n / max) * 44;
        return (
          <div key={i} className={'chap ' + (n > 0 ? 'has' : '') + (n > 0 && !inRange ? ' dim' : '')}>
            <div className="chap-tooltip">Ch {chap} · {CHAPTER_NAMES[i]} · {n} verse{n === 1 ? '' : 's'}</div>
            <div className="chap-bar" style={{ height: h + 'px' }}></div>
            <div className="chap-num">{chap}</div>
          </div>
        );
      })}
    </div>
  );
}

// Verse list item
function VerseItem({ verse, word, script }) {
  // pull speaker if encoded in the text
  return (
    <article className="verse">
      <div className="verse-ref">
        <div className="verse-chap">Ch. {verse.chapter}</div>
        <div className="verse-num">{String(verse.verse).padStart(2, '0')}</div>
      </div>
      <div className="verse-body" data-script={script}>
        {highlightVerse(verse.verse_text, word)}
      </div>
    </article>
  );
}

// Auto-fit text — measures natural width vs container, scales font down to fit.
// If still overflows at min size, falls back to wrapping rather than clipping.
function FitText({ children, max = 120, min = 28, className = '', dataScript, style }) {
  const ref = React.useRef(null);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !el.parentElement) return;

    const fit = () => {
      // reset: try max, single-line
      el.style.fontSize = max + 'px';
      el.style.whiteSpace = 'nowrap';
      el.style.wordBreak = '';
      el.style.overflowWrap = '';

      const available = el.parentElement.clientWidth;
      if (!available) return;
      let natural = el.scrollWidth;

      if (natural > available) {
        // shrink proportionally
        const ratio = (available / natural) * 0.94;
        const newSize = Math.max(min, Math.floor(max * ratio));
        el.style.fontSize = newSize + 'px';

        // if even at min size it still overflows on one line,
        // permit wrapping so the word stays inside the card
        if (el.scrollWidth > available) {
          el.style.whiteSpace = 'normal';
          el.style.wordBreak = 'break-word';
          el.style.overflowWrap = 'anywhere';
          el.style.fontSize = min + 'px';
        }
      }
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el.parentElement);
    return () => ro.disconnect();
  }, [children, max, min]);

  return (
    <div
      ref={ref}
      className={className}
      data-script={dataScript}
      style={{ whiteSpace: 'nowrap', maxWidth: '100%', ...(style || {}) }}
    >
      {children}
    </div>
  );
}

Object.assign(window, {
  LANGUAGES, CHAPTER_NAMES,
  TopBar, Footer, Loading,
  tokenize, buildIndex, escapeRegExp, highlightVerse,
  ChapterStrip, VerseItem, FitText
});
