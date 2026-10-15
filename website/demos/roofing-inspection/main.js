// Demo form: never sends anything.
const form = document.getElementById('lead-form');
const note = document.getElementById('form-note');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    form.reset();
    note.textContent =
      'This is a demo form on a spec page. Nothing was sent. On a real page, this would go to the agency\'s CRM.';
  });
}

// Hero background loop: phone cut on narrow screens, wide cut otherwise.
// Reduced motion keeps the still poster.
const heroBg = document.querySelector('.hero-bg-video');
if (heroBg && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const tall = window.matchMedia('(max-width: 759px)').matches;
  heroBg.src = tall ? heroBg.dataset.srcTall : heroBg.dataset.srcWide;
  heroBg.addEventListener('playing', () => heroBg.classList.add('is-playing'), { once: true });
  heroBg.play().catch(() => {}); // blocked autoplay leaves the poster showing
}

// Smooth scroll for the CTA buttons.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('a[href="#lead-form"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('lead-form').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  });
});
