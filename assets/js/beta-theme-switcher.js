/* ScanApp Beta — Theme Switcher
 * Reads / writes 'scanapp-theme' in localStorage.
 * Sets CSS custom properties on <html> to drive beta-dark-theme.css.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'scanapp-theme';
  var DEFAULT     = 'graphite';

  var themes = {
    graphite: {
      accent:          '#10b981',
      accentText:      '#ffffff',
      bgDeep:          '#0d0d0f',
      bgPanel:         '#141518',
      bgCard:          '#1d1f24',
      bgElevated:      '#252830',
      glassBg:         'rgba(20,21,24,0.88)',
      textPrimary:     '#eaecf0',
      textSecondary:   'rgba(234,236,240,0.42)',
      separator:       'rgba(255,255,255,0.06)',
      separatorSolid:  '#1d1f24',
    },
    midnight: {
      accent:          '#5b9cf8',
      accentText:      '#ffffff',
      bgDeep:          '#06091f',
      bgPanel:         '#0f1836',
      bgCard:          '#1a2548',
      bgElevated:      '#22305a',
      glassBg:         'rgba(15,24,54,0.90)',
      textPrimary:     '#dce8ff',
      textSecondary:   'rgba(220,232,255,0.42)',
      separator:       'rgba(91,156,248,0.10)',
      separatorSolid:  '#1a2548',
    },
    obsidian: {
      accent:          '#9d6ef8',
      accentText:      '#ffffff',
      bgDeep:          '#0c0b10',
      bgPanel:         '#17151e',
      bgCard:          '#22202b',
      bgElevated:      '#2a2736',
      glassBg:         'rgba(23,21,30,0.90)',
      textPrimary:     '#f0ecff',
      textSecondary:   'rgba(240,236,255,0.42)',
      separator:       'rgba(157,110,248,0.10)',
      separatorSolid:  '#22202b',
    },
    dusk: {
      accent:          '#f59e0b',
      accentText:      '#0e0a06',
      bgDeep:          '#0e0a06',
      bgPanel:         '#1c1409',
      bgCard:          '#261c0e',
      bgElevated:      '#312414',
      glassBg:         'rgba(28,20,9,0.90)',
      textPrimary:     '#fdf4e3',
      textSecondary:   'rgba(253,244,227,0.42)',
      separator:       'rgba(245,158,11,0.09)',
      separatorSolid:  '#261c0e',
    },
  };

  function applyTheme(name) {
    var t = themes[name] || themes[DEFAULT];
    var r = document.documentElement.style;

    r.setProperty('--t-accent',          t.accent);
    r.setProperty('--t-accent-text',     t.accentText);
    r.setProperty('--bg-primary',        t.bgDeep);
    r.setProperty('--bg-secondary',      t.bgPanel);
    r.setProperty('--bg-tertiary',       t.bgCard);
    r.setProperty('--bg-quaternary',     t.bgElevated);
    r.setProperty('--glass-bg',          t.glassBg);
    r.setProperty('--label-primary',     t.textPrimary);
    r.setProperty('--label-secondary',   t.textSecondary);
    r.setProperty('--separator',         t.separator);
    r.setProperty('--separator-solid',   t.separatorSolid);

    if (document.body) {
      document.body.style.background = t.bgDeep;
    }

    document.querySelectorAll('.theme-dot').forEach(function (dot) {
      dot.classList.toggle('theme-active', dot.dataset.theme === name);
    });
  }

  function save(name) {
    try { localStorage.setItem(STORAGE_KEY, name); } catch (e) { /* private mode */ }
  }

  function load() {
    try {
      var n = localStorage.getItem(STORAGE_KEY);
      return themes[n] ? n : DEFAULT;
    } catch (e) {
      return DEFAULT;
    }
  }

  /* Apply immediately (before DOMContentLoaded) so there is no colour flash */
  applyTheme(load());

  document.addEventListener('DOMContentLoaded', function () {
    /* Re-run to update dot active states once elements exist */
    applyTheme(load());

    document.querySelectorAll('.theme-dot').forEach(function (dot) {
      dot.addEventListener('click', function () {
        var name = dot.dataset.theme;
        applyTheme(name);
        save(name);
      });
    });
  });

  /* Public API */
  window.ScanAppTheme = {
    apply:  applyTheme,
    themes: Object.keys(themes),
  };
}());
