/* Light/dark switch. The <head> already set data-theme before the page drew, so there's no flash.
   This wires up the button, remembers the choice, and follows the device setting until you pick one. */
(function () {
  var KEY = 'vnua-theme';
  var root = document.documentElement;
  var btn = document.querySelector('.theme-toggle');
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function saved() {
    try { var v = localStorage.getItem(KEY); return v === 'light' || v === 'dark' ? v : null; } catch (e) { return null; }
  }
  function current() {
    return root.getAttribute('data-theme') || (mq && mq.matches ? 'dark' : 'light');
  }
  function apply(theme) {
    root.setAttribute('data-theme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#1d2024' : '#f4f4f4');
    if (btn) {
      var next = theme === 'dark' ? 'light' : 'dark';
      btn.setAttribute('aria-label', 'Switch to ' + next + ' mode');
      btn.setAttribute('title', 'Switch to ' + next + ' mode');
      btn.querySelector('.label').textContent = next === 'dark' ? 'Dark' : 'Light';
    }
  }

  apply(current());
  if (btn) {
    btn.hidden = false;
    btn.addEventListener('click', function () {
      var theme = current() === 'dark' ? 'light' : 'dark';
      apply(theme);
      try { localStorage.setItem(KEY, theme); } catch (e) {}
    });
  }
  if (mq) {
    var follow = function (e) { if (!saved()) apply(e.matches ? 'dark' : 'light'); };
    if (mq.addEventListener) mq.addEventListener('change', follow); else if (mq.addListener) mq.addListener(follow);
  }
})();
