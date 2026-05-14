// Sarathi — view components

// ====== HOME ======
function HomeView({ setView, lang, index, data, ornament }) {
  const stats = useMemo(() => {
    if (!index || !data) return { words: 0, verses: 0, chapters: 18 };
    const verses = data.chapters.reduce((n, c) => n + c.verses.length, 0);
    return { words: Object.keys(index).length, verses, chapters: data.chapters.length };
  }, [index, data]);

  return (
    <section className="home view" data-screen-label="01 Home">
      <div className="hero">
        <div className="hero-num">Bhagavad Gītā · Śloka Recitation</div>
        <h1 className="hero-title">
          Train for your next <em>Gītā</em> <span className="word">स्पर्धा</span>, one word at a time.
        </h1>
        <p className="hero-lede">
          Sarathi is a study companion for Bhagavad Gītā recitation
          competitions. Drill your vocabulary, trace every verse a word touches,
          and rehearse chapter by chapter — in Sanskrit, Kannada, Tamil or English.
        </p>
        <div className="hero-cta">
          <button className="btn btn-primary" onClick={() => setView('explore')}>
            Surface a word <span className="arrow">→</span>
          </button>
          <button className="btn btn-ghost" onClick={() => setView('search')}>
            Search the corpus
          </button>
        </div>
        <div className="hero-stats">
          <div>
            <div className="stat-num">{stats.chapters}</div>
            <div className="stat-label">Chapters</div>
          </div>
          <div>
            <div className="stat-num">{stats.verses || '—'}</div>
            <div className="stat-label">Verses</div>
          </div>
          <div>
            <div className="stat-num"><em>{stats.words ? stats.words.toLocaleString() : '—'}</em></div>
            <div className="stat-label">Unique words</div>
          </div>
        </div>
      </div>

      {ornament && <HomeOrnament lang={lang} />}
    </section>
  );
}

function HomeOrnament({ lang }) {
  // featured verse — different per script
  const verses = {
    sanskrit: {
      lines: ['सर्वधर्मान्परित्यज्य', 'मामेकं शरणं व्रज ।'],
      ref: 'Bhagavad Gītā · 18.66',
      ak: 'ॐ'
    },
    kannada: {
      lines: ['ಸರ್ವಧರ್ಮಾನ್ ಪರಿತ್ಯಜ್ಯ', 'ಮಾಮೇಕಂ ಶರಣಂ ವ್ರಜ ।'],
      ref: 'Bhagavad Gītā · 18.66',
      ak: 'ಓಂ'
    },
    tamil: {
      lines: ['ஸர்வதர்மான் பரித்யஜ்ய', 'மாமேகம் சரணம் வ்ரஜ ।'],
      ref: 'Bhagavad Gītā · 18.66',
      ak: 'ஓம்'
    },
    english: {
      lines: ['sarvadharmān parityajya', 'mām ekaṁ śaraṇaṁ vraja ।'],
      ref: 'Bhagavad Gītā · 18.66',
      ak: 'oṁ'
    }
  };
  const v = verses[lang] || verses.sanskrit;
  const script = LANGUAGES[lang].script;
  const fontFamilyMap = {
    sanskrit: 'var(--font-devanagari)',
    kannada: 'var(--font-kannada)',
    tamil: 'var(--font-tamil)',
    english: 'var(--font-serif)'
  };
  const ornamentStyle = {
    fontFamily: fontFamilyMap[script],
    fontStyle: script === 'english' ? 'italic' : 'normal'
  };

  return (
    <div className="ornament">
      <span className="ornament-aksara" style={{ fontFamily: fontFamilyMap[script], fontStyle: script === 'english' ? 'italic' : 'normal' }}>{v.ak}</span>
      <span className="ornament-corner tl"></span>
      <span className="ornament-corner tr"></span>
      <span className="ornament-corner bl"></span>
      <span className="ornament-corner br"></span>
      <div className="ornament-verse" data-script={script} style={ornamentStyle}>
        {v.lines.map((line, i) => <span key={i} className="line">{line}</span>)}
      </div>
      <div className="ornament-citation">{v.ref}</div>
    </div>
  );
}

// ====== EXPLORE ======
function ExploreView({ index, lang }) {
  const [filter, setFilter] = useState('all');
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(18);
  const [current, setCurrent] = useState(null);
  const [revealed, setRevealed] = useState(false);

  // Pool of candidate words — scoped to the selected chapter range.
  // Frequency buckets are computed FROM the in-range verse count, not the
  // global count, so "Rare 1–2" really means "appears 1–2 times in chapters
  // {from}..{to}".
  const filteredKeys = useMemo(() => {
    if (!index) return [];
    const out = [];
    for (const k of Object.keys(index)) {
      // count verses in the selected range
      let inRange = 0;
      const verses = index[k].verses;
      for (let i = 0; i < verses.length; i++) {
        const c = verses[i].chapter;
        if (c >= from && c <= to) inRange++;
      }
      if (inRange === 0) continue;
      const inFilter =
        filter === 'all' ||
        (filter === 'rare' && inRange >= 1 && inRange <= 2) ||
        (filter === 'uncommon' && inRange >= 3 && inRange <= 5) ||
        (filter === 'common' && inRange >= 6 && inRange <= 10) ||
        (filter === 'frequent' && inRange > 10);
      if (inFilter) out.push(k);
    }
    return out;
  }, [index, filter, from, to]);

  const surface = useCallback(() => {
    if (!filteredKeys.length) return;
    setRevealed(false); // flip back first
    // small delay so the user sees the flip-back happen before the word changes
    setTimeout(() => {
      const word = filteredKeys[Math.floor(Math.random() * filteredKeys.length)];
      setCurrent({ word, data: index[word] });
    }, current ? 350 : 0);
  }, [filteredKeys, index, current]);

  // surface a first word as soon as index loads
  useEffect(() => {
    if (index && !current && filteredKeys.length) {
      surface();
    }
  }, [index, filteredKeys.length]);

  const toggleReveal = useCallback(() => {
    if (!current) return;
    setRevealed(r => !r);
  }, [current]);

  const script = LANGUAGES[lang].script;
  const versesInRange = current
    ? current.data.verses.filter(v => v.chapter >= from && v.chapter <= to)
    : [];

  return (
    <section className="explore view" data-screen-label="02 Explore">
      <div className="explore-grid">
        <aside className="controls">
          <div className="control-group">
            <div className="control-title">Frequency</div>
            <div className="seg">
              {[
                ['all', 'Any'],
                ['rare', 'Rare · 1–2'],
                ['uncommon', '3–5'],
                ['common', '6–10'],
                ['frequent', '10+']
              ].map(([v, lbl]) => (
                <button
                  key={v}
                  className={'seg-btn ' + (filter === v ? 'active' : '')}
                  onClick={() => setFilter(v)}
                >{lbl}</button>
              ))}
            </div>
          </div>

          <ChapterRange from={from} to={to} setFrom={setFrom} setTo={setTo} />

          <div className="control-group">
            <div className="control-title">Pool</div>
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 17,
              fontStyle: 'italic',
              color: 'var(--ink-2)'
            }}>
              <strong style={{ fontWeight: 500, fontStyle: 'normal', color: 'var(--ink)' }}>
                {filteredKeys.length.toLocaleString()}
              </strong> words match.
            </div>
          </div>

          <button className="btn btn-primary" onClick={surface} style={{ alignSelf: 'flex-start' }}>
            Surface another <span className="arrow">↻</span>
          </button>
        </aside>

        <div>
          <div className="specimen-stage">
            <div
              className={'specimen ' + (revealed ? 'flipped ' : '') + (!current ? 'empty' : '')}
              onClick={toggleReveal}
              role="button"
              aria-label={revealed ? 'Hide answer' : 'Reveal where it appears'}
            >
              {/* FRONT — the word */}
              <div className="specimen-face front">
                <div className="specimen-meta">
                  <span><span className="dot"></span>Specimen · {LANGUAGES[lang].name}</span>
                  <span>{current ? 'Frequency · ' + versesInRange.length + (versesInRange.length === current.data.occurrences ? '' : ' / ' + current.data.occurrences) : '—'}</span>
                </div>

                <div className="specimen-word-wrap">
                  {current ? (
                    <FitText className="specimen-word" dataScript={script} max={120} min={24}>
                      {current.word}
                    </FitText>
                  ) : (
                    <div className="specimen-empty">No words match these filters. Try widening your range.</div>
                  )}
                </div>

                {current && (
                  <div className="flip-hint">
                    <span className="pulse"></span>
                    <span>Tap to reveal where it appears</span>
                  </div>
                )}
              </div>

              {/* BACK — the concordance */}
              <div className="specimen-face back">
                <div className="specimen-meta">
                  <span><span className="dot"></span>Answer · Concordance</span>
                  <span>{current ? versesInRange.length + ' verse' + (versesInRange.length === 1 ? '' : 's') + ' in range' : '—'}</span>
                </div>

                {current && (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 16, paddingBottom: 16 }}>
                    <div style={{
                      fontFamily: 'var(--font-serif)',
                      fontStyle: 'italic',
                      color: 'var(--ink-2)',
                      fontSize: 16,
                      marginBottom: 24,
                      textAlign: 'center'
                    }}>
                      <span data-script={script} style={{
                        fontFamily: script === 'sanskrit' ? 'var(--font-devanagari)' : (script === 'kannada' ? 'var(--font-kannada)' : (script === 'tamil' ? 'var(--font-tamil)' : 'var(--font-serif)')),
                        fontStyle: script === 'english' ? 'italic' : 'normal',
                        fontSize: 'clamp(20px, 4vw, 30px)',
                        fontWeight: 500,
                        color: 'var(--ink)',
                        display: 'block',
                        marginBottom: 8,
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere'
                      }}>{current.word}</span>
                      appears in <strong style={{ fontWeight: 500, fontStyle: 'normal', color: 'var(--accent)' }}>{versesInRange.length}</strong> verse{versesInRange.length === 1 ? '' : 's'}{from === 1 && to === 18 ? ' across the Gītā' : ` in chapters ${from}–${to}`}{versesInRange.length !== current.data.occurrences ? ` · ${current.data.occurrences} total` : ''}.
                    </div>

                    <div className="concordance" style={{ marginTop: 0, paddingTop: 24 }}>
                      <div className="concordance-header">
                        <div className="concordance-label">Where it appears · Chapters 1 – 18</div>
                        <div className="concordance-count">
                          <strong>{current.data.occurrences}</strong> total
                        </div>
                      </div>
                      <ChapterStrip verses={current.data.verses} from={from} to={to} />
                    </div>
                  </div>
                )}

                <div className="flip-hint">
                  <span>Tap card to flip back · scroll for verses</span>
                </div>
              </div>
            </div>
          </div>

          {current && revealed && versesInRange.length > 0 && (
            <div className="verses fade-in">
              {versesInRange.map((v, i) => (
                <VerseItem key={i} verse={v} word={current.word} script={script} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ChapterRange({ from, to, setFrom, setTo }) {
  return (
    <div className="control-group">
      <div className="control-title">Chapters</div>
      <div className="range">
        <div className="range-labels">
          <span>From</span>
          <span>To</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <select
            value={from}
            onChange={e => {
              const v = parseInt(e.target.value);
              setFrom(v);
              if (v > to) setTo(v);
            }}
            style={selectStyle}
          >
            {Array.from({ length: 18 }, (_, i) => i + 1).map(n =>
              <option key={n} value={n}>{n}</option>
            )}
          </select>
          <div style={{ flex: 1, height: 1, background: 'var(--rule-strong)' }}></div>
          <select
            value={to}
            onChange={e => {
              const v = parseInt(e.target.value);
              setTo(v);
              if (v < from) setFrom(v);
            }}
            style={selectStyle}
          >
            {Array.from({ length: 18 }, (_, i) => i + 1).map(n =>
              <option key={n} value={n}>{n}</option>
            )}
          </select>
        </div>
      </div>
    </div>
  );
}

const selectStyle = {
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  fontWeight: 500,
  color: 'var(--ink)',
  background: 'var(--paper-3)',
  border: '1px solid var(--rule-strong)',
  borderRadius: 4,
  padding: '6px 8px',
  outline: 'none'
};

// ====== SEARCH ======
function SearchView({ index, lang }) {
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);

  const popular = useMemo(() => {
    if (!index) return [];
    return Object.keys(index)
      .map(w => ({ word: w, n: index[w].occurrences }))
      .sort((a, b) => b.n - a.n)
      .slice(0, 12);
  }, [index]);

  const results = useMemo(() => {
    if (!index || !debounced) return null;
    const norm = lang === 'english' ? debounced.toLowerCase() : debounced;
    if (index[norm]) {
      return { exact: true, items: [{ word: norm, data: index[norm] }] };
    }
    const matches = Object.keys(index)
      .filter(w => w.includes(norm))
      .map(w => ({ word: w, data: index[w] }))
      .sort((a, b) => b.data.occurrences - a.data.occurrences)
      .slice(0, 50);
    return { exact: false, items: matches };
  }, [index, debounced, lang]);

  const placeholders = {
    sanskrit: 'धर्म, कर्म, योग…',
    kannada: 'ಧರ್ಮ, ಕರ್ಮ…',
    tamil: 'தர்மம், கர்மம்…',
    english: 'dharma, karma, yoga…'
  };
  const script = LANGUAGES[lang].script;
  const totalVerses = results
    ? results.items.reduce((n, r) => n + r.data.verses.length, 0)
    : 0;

  return (
    <section className="search view" data-screen-label="03 Search">
      <div className="search-hero">
        <div className="search-eyebrow">Word Lookup</div>
        <h2 className="search-title">Find a <em>word</em> in the Gītā.</h2>

        <div className="search-box">
          <input
            className="search-input"
            data-script={script}
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder={placeholders[lang]}
            autoFocus
          />
          {q && <button className="search-clear" onClick={() => setQ('')}>Clear</button>}
        </div>
        <div className="search-hint">
          {q.length === 0
            ? '— or tap a word from the index below'
            : !results
              ? '…'
              : results.items.length === 0
                ? `No word in the corpus contains "${q}".`
                : results.exact
                  ? `Exact match — “${results.items[0].word}” found in ${results.items[0].data.occurrences} verse${results.items[0].data.occurrences === 1 ? '' : 's'}.`
                  : `${results.items.length} word${results.items.length === 1 ? '' : 's'} contain “${q}” · ${totalVerses} verse${totalVerses === 1 ? '' : 's'}.`}
        </div>
      </div>

      {!debounced && (
        <div className="search-suggest">
          <div className="suggest-label">An index of the most-spoken words</div>
          <div className="suggest-grid">
            {popular.map(p => (
              <button
                key={p.word}
                className="suggest-tile"
                onClick={() => setQ(p.word)}
              >
                <span className="suggest-word" data-script={script}>{p.word}</span>
                <span className="suggest-meta">{p.n} verse{p.n === 1 ? '' : 's'}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {debounced && results && results.items.length === 0 && (
        <div className="empty-state">
          <div className="empty-aksara">𑇃</div>
          <div className="empty-title">Nothing here.</div>
          <div className="empty-sub">No word containing "{q}" appears in the Gītā.</div>
        </div>
      )}

      {debounced && results && results.items.length > 0 && (
        <div className="results">
          <div className="results-summary">
            <div className="results-summary-text">
              {results.exact
                ? <>Found <strong>“{results.items[0].word}”</strong> in {results.items[0].data.occurrences} verse{results.items[0].data.occurrences === 1 ? '' : 's'}.</>
                : <>{results.items.length} word{results.items.length === 1 ? '' : 's'} contain <strong>“{q}”</strong></>
              }
            </div>
            <div className="results-summary-count">{totalVerses} verse{totalVerses === 1 ? '' : 's'}</div>
          </div>

          {results.items.map((r, i) => (
            <div key={r.word} className="match-group">
              {!results.exact && (
                <div className="match-head">
                  <span className="match-word" data-script={script}>{r.word}</span>
                  <span className="match-count">{r.data.occurrences} verse{r.data.occurrences === 1 ? '' : 's'}</span>
                </div>
              )}
              {r.data.verses.slice(0, results.exact ? 999 : 4).map((v, vi) => (
                <VerseItem key={vi} verse={v} word={r.word} script={script} />
              ))}
              {!results.exact && r.data.verses.length > 4 && (
                <div style={{
                  padding: '12px 0',
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                  fontSize: 14,
                  color: 'var(--ink-3)'
                }}>
                  + {r.data.verses.length - 4} more verse{r.data.verses.length - 4 === 1 ? '' : 's'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

Object.assign(window, { HomeView, ExploreView, SearchView });
