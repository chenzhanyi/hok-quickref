/**
 * HOK QuickRef — JavaScript Engine
 * Handles: search, MD rendering, hero detail page, tips browser
 * Uses marked.js CDN for Markdown rendering
 */
(function () {
  'use strict';

  // ============================================================
  // Config
  // ============================================================
  const CONFIG = {
    heroesDataUrl: 'data/heroes.json',
    heroesDir: 'heroes',
    tipsDir: 'tips',
    markedCdn: 'https://cdn.jsdelivr.net/npm/marked/marked.min.js'
  };

  let heroesData = null;
  let markedLoaded = false;

  // ============================================================
  // Marked.js Loader
  // ============================================================
  function loadMarked() {
    return new Promise((resolve) => {
      if (window.marked) { markedLoaded = true; resolve(); return; }
      const script = document.createElement('script');
      script.src = CONFIG.markedCdn;
      script.onload = () => { markedLoaded = true; resolve(); };
      script.onerror = () => { console.warn('marked.js failed to load, using plain text'); resolve(); };
      document.head.appendChild(script);
    });
  }

  // ============================================================
  // Heroes Data Loader
  // ============================================================
  async function loadHeroesData() {
    if (heroesData) return heroesData;
    try {
      const res = await fetch(CONFIG.heroesDataUrl);
      heroesData = await res.json();
      return heroesData;
    } catch (e) {
      console.error('Failed to load heroes data:', e);
      return null;
    }
  }

  // ============================================================
  // MD File Loader
  // ============================================================
  async function loadMdFile(path) {
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error('File not found');
      return await res.text();
    } catch (e) {
      return null;
    }
  }

  function renderMd(mdText) {
    if (!mdText) return '<p style="color:var(--text-muted)">Content not available yet.</p>';
    if (markedLoaded && window.marked) {
      return window.marked.parse(mdText);
    }
    // Fallback: basic rendering
    return mdText
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.+)$/gm, (m) => m.startsWith('<') ? m : `<p>${m}</p>`);
  }

  // ============================================================
  // Hero Data Helpers
  // ============================================================
  function findHero(slug) {
    if (!heroesData) return null;
    return heroesData.heroes.find(h => h.slug === slug);
  }

  function searchHeroes(query) {
    if (!heroesData || !query) return [];
    const q = query.toLowerCase();
    return heroesData.heroes.filter(h =>
      h.name.toLowerCase().includes(q) ||
      h.chinese.includes(q) ||
      h.role.toLowerCase().includes(q) ||
      h.lane.toLowerCase().includes(q) ||
      h.tags.some(t => t.includes(q)) ||
      h.description.toLowerCase().includes(q)
    );
  }

  // ============================================================
  // 1. MOBILE MENU
  // ============================================================
  function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const nav = document.getElementById('navLinks');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      nav.classList.toggle('active');
    });
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        btn.classList.remove('active');
        nav.classList.remove('active');
      });
    });
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !btn.contains(e.target)) {
        btn.classList.remove('active');
        nav.classList.remove('active');
      }
    });
  }

  // ============================================================
  // 2. NAVBAR SCROLL
  // ============================================================
  function initNavScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 50) navbar.classList.add('scrolled');
      else navbar.classList.remove('scrolled');
    }, { passive: true });
  }

  // ============================================================
  // 3. SCROLL TO TOP
  // ============================================================
  function initScrollTop() {
    const btn = document.getElementById('scrollTopBtn');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.pageYOffset > 500);
    }, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ============================================================
  // 4. HOMEPAGE SEARCH
  // ============================================================
  function initHomeSearch() {
    const input = document.getElementById('heroSearch');
    const results = document.getElementById('searchResults');
    if (!input || !results) return;

    let debounce;
    input.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(async () => {
        await loadHeroesData();
        const query = input.value.trim();
        if (!query) { results.classList.remove('active'); return; }
        const matches = searchHeroes(query).slice(0, 8);
        if (matches.length === 0) {
          results.innerHTML = '<div class="search-no-results">No heroes found — try a different search</div>';
        } else {
          results.innerHTML = matches.map(h => `
            <div class="search-result-item" onclick="location.href='hero.html?hero=${h.slug}'">
              <div class="search-result-emoji">${h.emoji}</div>
              <div class="search-result-info">
                <div class="search-result-name">${h.name} <span style="color:var(--text-muted);font-weight:400">${h.chinese}</span></div>
                <div class="search-result-role">${h.role} · ${h.lane} · ${'★'.repeat(h.difficulty)}${'☆'.repeat(5-h.difficulty)}</div>
              </div>
            </div>
          `).join('');
        }
        results.classList.add('active');
      }, 200);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!input.parentElement.contains(e.target)) results.classList.remove('active');
    });

    // Enter key → go to first result
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && results.classList.contains('active')) {
        const first = results.querySelector('.search-result-item');
        if (first) first.click();
      }
    });
  }

  // ============================================================
  // 5. HERO GALLERY (heroes.html)
  // ============================================================
  function initHeroGallery() {
    const grid = document.getElementById('heroGrid');
    if (!grid) return;

    loadHeroesData().then(data => {
      if (!data) return;
      renderGallery(data.heroes);
      initRoleFilters(data.roles);
    });

    function renderGallery(heroes) {
      grid.innerHTML = heroes.map(function(h) {
        var idAttr = h.image ? ' id="av-'+h.slug+'"' : '';
        return '<div class="hero-card" data-role="'+h.roleKey+'" onclick="location.href=\'hero.html?hero='+h.slug+'\'">'
          + '<div class="hero-card-avatar '+h.roleKey+'"'+idAttr+'>'+h.emoji+'</div>'
          + '<div class="hero-card-name">'+h.name+'</div>'
          + '<div class="hero-card-role">'+h.role+'</div>'
          + '<div class="hero-card-diff">'+'★'.repeat(h.difficulty)+'☆'.repeat(5-h.difficulty)+'</div>'
          + '</div>';
      }).join('');

      // Load avatars
      heroes.forEach(function(h){
        if (!h.image) return;
        var img = new Image();
        img.onload = function(){
          var el = document.getElementById('av-'+h.slug);
          if (el) { el.innerHTML = ''; el.appendChild(this); }
        };
        img.style.cssText = 'width:56px;height:56px;border-radius:50%;object-fit:cover';
        img.src = h.image + '?v=2';
      });
    }

    function initRoleFilters(roles) {
      const container = document.getElementById('roleFilters');
      if (!container) return;
      container.innerHTML = `
        <span class="role-pill active" data-role="all">All Roles</span>
        ${roles.map(r => `<span class="role-pill" data-role="${r.key}">${r.emoji} ${r.name}</span>`).join('')}
      `;
      container.querySelectorAll('.role-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          container.querySelectorAll('.role-pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          const role = pill.dataset.role;
          document.querySelectorAll('.hero-card').forEach(card => {
            if (role === 'all' || card.dataset.role === role) {
              card.classList.remove('hidden');
            } else {
              card.classList.add('hidden');
            }
          });
        });
      });
    }
  }

  // ============================================================
  // 6. HERO DETAIL PAGE (hero.html?hero=slug)
  // ============================================================
  function initHeroDetail() {
    const contentArea = document.getElementById('heroContent');
    if (!contentArea) return;

    const params = new URLSearchParams(window.location.search);
    const slug = params.get('hero');
    if (!slug) { window.location.href = 'heroes.html'; return; }

    // Start loading hero data immediately — don't wait for marked.js
    loadHeroesData().then(data => {
      if (!data) {
        document.getElementById('panel-overview').innerHTML = '<p style="color:var(--red)">Failed to load hero data.</p>';
        return;
      }
      const hero = findHero(slug);
      if (!hero) {
        document.getElementById('panel-overview').innerHTML = `<p style="color:var(--red)">Hero "${slug}" not found.</p>`;
        return;
      }
      renderHeroDetail(hero, slug);
      // Load marked in background while loading MD files
      Promise.all([loadMarked(), loadHeroTabs(hero, slug)]).catch(err => {
        console.error('Hero detail error:', err);
      });
    }).catch(err => {
      console.error('initHeroDetail failed:', err);
    });
  }

  function renderHeroDetail(hero, slug) {
    var header = document.getElementById('heroHeader');
    var breadcrumb = document.getElementById('breadcrumb');
    var tags = (hero.tags || []).slice(0, 3).join(', ');
    if (header) {
      header.innerHTML =
        '<div class="hero-detail-avatar '+hero.roleKey+'">'+hero.emoji+'</div>' +
        '<div class="hero-detail-info">' +
          '<h1>'+hero.name+'</h1>' +
          '<div class="hero-meta">' +
            '<span class="hero-detail-meta-item">'+hero.emoji+' '+hero.role+'</span>' +
            '<span class="hero-detail-meta-item">📍 '+hero.lane+'</span>' +
            '<span class="hero-detail-meta-item difficulty-stars">'+'★'.repeat(hero.difficulty)+'☆'.repeat(5-hero.difficulty)+'</span>' +
            (tags ? '<span class="hero-detail-meta-item">🏷 '+tags+'</span>' : '') +
          '</div>' +
        '</div>';
    }
    if (breadcrumb) {
      breadcrumb.innerHTML = '<div class="container"><a href="index.html">Home</a><span>/</span><a href="heroes.html">Heroes</a><span>/</span><strong>'+hero.name+'</strong></div>';
    }
    document.title = hero.name + ' Guide — HOK QuickRef';
  }

  async function loadHeroTabs(hero, slug) {
    const panels = {
      overview: document.getElementById('panel-overview'),
      tips: document.getElementById('panel-tips'),
      build: document.getElementById('panel-build')
    };

    // Load all three MD files
    const [overview, tips, build] = await Promise.all([
      loadMdFile(`${CONFIG.heroesDir}/${slug}/overview.md`),
      loadMdFile(`${CONFIG.heroesDir}/${slug}/tips.md`),
      loadMdFile(`${CONFIG.heroesDir}/${slug}/build.md`)
    ]);

    if (panels.overview) panels.overview.innerHTML = `<div class="md-content">${renderMd(overview)}</div>`;
    if (panels.tips) panels.tips.innerHTML = `<div class="md-content">${renderMd(tips)}</div>`;
    if (panels.build) panels.build.innerHTML = `<div class="md-content">${renderMd(build)}</div>`;

    // Tab switching
    document.querySelectorAll('.content-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.content-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.content-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const target = document.getElementById('panel-' + tab.dataset.tab);
        if (target) target.classList.add('active');
      });
    });
  }

  // ============================================================
  // 7. TIPS BROWSER (tips.html)
  // ============================================================
  function initTipsBrowser() {
    const container = document.getElementById('tipsContent');
    if (!container) return;
    loadMarked().then(() => loadTipsIndex());
  }

  async function loadTipsIndex() {
    const container = document.getElementById('tipsContent');
    const categories = [
      { key: 'settings', name: '⚙ Settings & Setup', desc: 'Graphics, controls, UI optimization', icon: '⚙' },
      { key: 'gameplay', name: '🎮 Gameplay Mechanics', desc: 'Last-hitting, wave management, rotations, vision', icon: '🎮' },
      { key: 'hero-tech', name: '⚡ Hero Tech', desc: 'Animation canceling, Flash combos, advanced mechanics', icon: '⚡' }
    ];

    container.innerHTML = `
      <div class="tips-categories">
        ${categories.map(c => `
          <div class="tips-cat" data-cat="${c.key}">
            <div class="cat-icon">${c.icon}</div>
            <div class="cat-name">${c.name}</div>
            <div class="cat-count">${c.desc}</div>
          </div>
        `).join('')}
      </div>
      <div id="tipsList"></div>
      <div id="tipsDetail" class="tips-detail"></div>
    `;

    document.querySelectorAll('.tips-cat').forEach(cat => {
      cat.addEventListener('click', () => loadTipsCategory(cat.dataset.cat));
    });
  }

  async function loadTipsCategory(catKey) {
    const list = document.getElementById('tipsList');
    const detail = document.getElementById('tipsDetail');
    detail.classList.remove('active');
    list.style.display = 'block';

    // Known tip files per category
    const tipFiles = {
      settings: [
        { file: 'best-graphics.md', title: 'Best Graphics Settings', desc: 'Maximize FPS and visibility for competitive play' },
        { file: 'control-layout.md', title: 'Control Layout Guide', desc: 'Optimal button placement and settings for each role' }
      ],
      gameplay: [
        { file: 'last-hitting.md', title: 'Last-Hitting Masterclass', desc: 'Never miss a minion — lane farming, tower farming, practice routines' },
        { file: 'wave-management.md', title: 'Wave Management Guide', desc: 'Freeze, slow push, fast push — master all three wave states' },
        { file: 'rotations.md', title: 'Rotation Guide', desc: 'When to rotate, when to stay, and the 4-man dive pattern' },
        { file: 'vision.md', title: 'Vision & Map Awareness', desc: 'Ward timing, placement, and reading the minimap' }
      ],
      'hero-tech': [
        { file: 'animation-canceling.md', title: 'Animation Canceling', desc: 'Cancel recovery frames to increase DPS and fluidity' },
        { file: 'flash-combos.md', title: 'Flash / Flicker Combos', desc: 'Flash during abilities for unreactable engages' }
      ]
    };

    const files = tipFiles[catKey] || [];
    list.innerHTML = `
      <button class="back-btn" onclick="location.reload()">← Back to categories</button>
      <h2 style="margin-bottom:1rem">${files.length} tips in this category</h2>
      ${files.map(f => `
        <div class="tips-list-item" data-file="${catKey}/${f.file}">
          <h3>${f.title}</h3>
          <p>${f.desc}</p>
        </div>
      `).join('')}
    `;

    list.querySelectorAll('.tips-list-item').forEach(item => {
      item.addEventListener('click', async () => {
        const md = await loadMdFile(`${CONFIG.tipsDir}/${item.dataset.file}`);
        detail.innerHTML = `
          <button class="back-btn" onclick="location.reload()">← Back</button>
          <div class="md-content">${renderMd(md)}</div>
        `;
        detail.classList.add('active');
        list.style.display = 'none';
      });
    });
  }

  // ============================================================
  // 8. INIT
  // ============================================================
  function init() {
    initMobileMenu();
    initNavScroll();
    initScrollTop();
    initHomeSearch();
    initHeroGallery();
    initHeroDetail();
    initTipsBrowser();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
