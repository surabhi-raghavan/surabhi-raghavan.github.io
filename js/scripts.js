window.addEventListener('DOMContentLoaded', () => {

  // Scrollspy on sidebar nav
  const sideNav = document.querySelector('#sideNav');
  if (sideNav) {
    new bootstrap.ScrollSpy(document.body, {
      target: '#sideNav',
      rootMargin: '0px 0px -40%',
    });
  }

  // Smooth scroll + close mobile nav on link click
  document.querySelectorAll('.js-scroll-trigger').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Typed.js
  const typedEl = document.querySelector('.typed');
  if (typedEl) {
    const items = typedEl.getAttribute('data-typed-items').split(',');
    new Typed('.typed', {
      strings: items,
      loop: true,
      typeSpeed: 80,
      backSpeed: 40,
      backDelay: 2000,
    });
  }

  // AOS
  AOS.init({ once: true, duration: 600, offset: 60 });
});
