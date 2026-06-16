/**
 * HOK QuickRef — Shared UI (footer, mobile menu, nav, scroll-top)
 * Load by all pages. Edit this ONE file to update all footers.
 */
(function () {
  'use strict';

  // ============================================================
  // 1. FOOTER — unified across all pages
  // ============================================================
  var footerHTML =
    '<div class="container">' +
    '  <div class="footer-grid">' +
    '    <div class="footer-brand">' +
    '      <h3>⚔ HOK QuickRef</h3>' +
    '      <p><strong style="color:var(--gold);">⚠ Unofficial fan site.</strong> A collection of player-discovered tips, tricks, and strategies. Not affiliated with Tencent, TiMi Studios, or Level Infinite. All content contributed by the player community.</p>' +
    '    </div>' +
    '    <div class="footer-col">' +
    '      <h4>Browse</h4>' +
    '      <ul>' +
    '        <li><a href="heroes.html">Hero Gallery</a></li>' +
    '        <li><a href="tips.html">Tips & Tech</a></li>' +
    '        <li><a href="items.html">Items</a></li>' +
    '        <li><a href="strategy.html">Strategy</a></li>' +
    '      </ul>' +
    '    </div>' +
    '    <div class="footer-col">' +
    '      <h4>Community</h4>' +
    '      <ul>' +
    '        <li><a href="https://discord.gg/honorofkings" target="_blank" rel="noopener">Discord</a></li>' +
    '        <li><a href="https://www.reddit.com/u/Easy-Picture-6930" target="_blank" rel="noopener">Reddit</a></li>' +
    '        <li><a href="https://github.com/chenzhanyi/hok-quickref" target="_blank" rel="noopener">GitHub (Contribute)</a></li>' +
    '      </ul>' +
    '    </div>' +
    '  </div>' +
    '  <div class="footer-bottom">' +
    '    <p>&copy; 2026 HOK QuickRef. Unofficial fan site. Honor of Kings is a trademark of Tencent / TiMi Studios.</p>' +
    '  </div>' +
    '</div>';

  // ============================================================
  // 2. SCROLL-TO-TOP button
  // ============================================================
  var scrollBtnHTML = '<button class="scroll-top" id="scrollTopBtn" aria-label="Scroll to top">↑</button>';

  // ============================================================
  // INIT
  // ============================================================
  function init() {
    // -- Footer --
    var footer = document.querySelector('footer.footer');
    if (footer) {
      footer.innerHTML = footerHTML;
    }

    // -- Scroll-to-top button --
    // Insert after footer if not already present
    if (!document.getElementById('scrollTopBtn')) {
      if (footer) {
        footer.insertAdjacentHTML('afterend', scrollBtnHTML);
      }
    }

    // -- Mobile menu --
    var btn = document.getElementById('mobileMenuBtn');
    var nav = document.getElementById('navLinks');
    if (btn && nav) {
      btn.addEventListener('click', function () {
        btn.classList.toggle('active');
        nav.classList.toggle('active');
      });
      nav.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          btn.classList.remove('active');
          nav.classList.remove('active');
        });
      });
      document.addEventListener('click', function (e) {
        if (!nav.contains(e.target) && !btn.contains(e.target)) {
          btn.classList.remove('active');
          nav.classList.remove('active');
        }
      });
    }

    // -- Navbar scroll --
    var navbar = document.getElementById('navbar');
    if (navbar) {
      window.addEventListener('scroll', function () {
        navbar.classList.toggle('scrolled', window.pageYOffset > 50);
      }, { passive: true });
    }

    // -- Scroll-to-top logic --
    var st = document.getElementById('scrollTopBtn');
    if (st) {
      window.addEventListener('scroll', function () {
        st.classList.toggle('visible', window.pageYOffset > 500);
      }, { passive: true });
      st.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
