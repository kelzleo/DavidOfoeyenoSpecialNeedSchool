(function () {
  'use strict';

  // Mobile navigation
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');

  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setMenu(false);
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1100) setMenu(false);
    });
  }

  // Confirm before submitting forms that declare data-confirm
  document.addEventListener('submit', function (event) {
    var message = event.target.getAttribute('data-confirm');
    if (message && !window.confirm(message)) event.preventDefault();
  });

  // Fall back to a placeholder when an image fails to load
  document.addEventListener('error', function (event) {
    var img = event.target;
    if (img.tagName === 'IMG' && !img.dataset.fallback) {
      img.dataset.fallback = 'true';
      img.src = '/img/placeholder.svg';
    }
  }, true);
})();
