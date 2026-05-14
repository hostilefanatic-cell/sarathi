// Sarathi — app entry

function App() {
  const [tweaks, setTweak] = window.useTweaks
    ? window.useTweaks(window.__TWEAK_DEFAULTS__)
    : [window.__TWEAK_DEFAULTS__, () => {}];

  const [view, setView] = useState('home');
  const [lang, setLang] = useState(() => localStorage.getItem('sarathi_lang') || 'sanskrit');
  const [data, setData] = useState(null);
  const [index, setIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  // load + index whenever language changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setData(null);
    setIndex(null);
    fetch(LANGUAGES[lang].file)
      .then(r => r.json())
      .then(j => {
        if (cancelled) return;
        setData(j);
        // build index off the main thread-ish (microtask)
        Promise.resolve().then(() => {
          if (cancelled) return;
          const idx = buildIndex(j, lang);
          setIndex(idx);
          setLoading(false);
        });
      })
      .catch(err => {
        console.error('load failed', err);
        if (!cancelled) setLoading(false);
      });
    localStorage.setItem('sarathi_lang', lang);
    return () => { cancelled = true; };
  }, [lang]);

  // dark theme + density on body — ink is the only palette
  useEffect(() => {
    document.body.setAttribute('data-theme', 'ink');
    document.body.setAttribute('data-density', tweaks.density || 'comfortable');
  }, [tweaks.density]);

  return (
    <div className="app">
      <TopBar view={view} setView={setView} lang={lang} setLang={setLang} />

      {loading && <Loading label={`Loading ${LANGUAGES[lang].name}`} />}

      {!loading && view === 'home' && (
        <HomeView setView={setView} lang={lang} index={index} data={data} ornament={tweaks.showOrnament} />
      )}
      {!loading && view === 'explore' && (
        <ExploreView index={index} lang={lang} />
      )}
      {!loading && view === 'search' && (
        <SearchView index={index} lang={lang} />
      )}

      <Footer />

      {window.TweaksPanel && (
        <window.TweaksPanel title="Tweaks">
          <window.TweakSection label="Layout">
            <window.TweakRadio
              label="Density"
              value={tweaks.density}
              options={[
                { value: 'comfortable', label: 'Comfortable' },
                { value: 'compact', label: 'Compact' }
              ]}
              onChange={v => setTweak('density', v)}
            />
          </window.TweakSection>
          <window.TweakSection label="Home page">
            <window.TweakToggle
              label="Show featured verse ornament"
              value={!!tweaks.showOrnament}
              onChange={v => setTweak('showOrnament', v)}
            />
          </window.TweakSection>
        </window.TweaksPanel>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
