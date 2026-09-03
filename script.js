const glow = document.querySelector('.cursor-glow');
const placeholders = document.querySelectorAll('[data-placeholder]');
const reveals = document.querySelectorAll('.reveal');
const counters = document.querySelectorAll('[data-count]');
const magnetic = document.querySelectorAll('.magnetic');

// Soft cursor light — desktop only.
window.addEventListener('pointermove', (event) => {
  if (!glow) return;
  glow.animate(
    { left: `${event.clientX}px`, top: `${event.clientY}px` },
    { duration: 700, fill: 'forwards', easing: 'cubic-bezier(.16,1,.3,1)' }
  );
});

// Section reveal animations.
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

reveals.forEach((item) => revealObserver.observe(item));

// Animated stats.
const countUp = (element) => {
  const target = Number(element.dataset.count);
  if (!Number.isFinite(target)) return;
  const suffix = element.dataset.suffix || '';
  const start = performance.now();
  const duration = 1100;

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = `${Math.round(target * eased)}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    counters.forEach((counter) => countUp(counter));
    statObserver.disconnect();
  });
}, { threshold: 0.6 });

const stats = document.querySelector('.stats');
if (stats) statObserver.observe(stats);

// Small magnetic interaction on buttons / links.
magnetic.forEach((item) => {
  item.addEventListener('pointermove', (event) => {
    const rect = item.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * 0.08;
    const y = (event.clientY - rect.top - rect.height / 2) * 0.08;
    item.style.transform = `translate(${x}px, ${y}px)`;
  });
  item.addEventListener('pointerleave', () => {
    item.style.transform = '';
  });
});

// Placeholder projects stay decorative until real links are added.
placeholders.forEach((item) => {
  item.addEventListener('click', (event) => {
    event.preventDefault();
    item.animate([
      { transform: 'translateY(-7px) scale(1)' },
      { transform: 'translateY(-7px) scale(.985)' },
      { transform: 'translateY(-7px) scale(1)' }
    ], { duration: 220, easing: 'ease-out' });
  });
});

// Add a tiny active-state indicator to the navigation based on the visible section.
const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.nav a')];

const navObserver = new IntersectionObserver((entries) => {
  const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`));
}, { threshold: [0.15, 0.35, 0.6] });

sections.forEach((section) => navObserver.observe(section));

// Respect reduced-motion preferences.
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.style.scrollBehavior = 'auto';
  document.querySelectorAll('*').forEach((element) => {
    element.style.animationDuration = '0.001ms';
    element.style.animationIterationCount = '1';
    element.style.transitionDuration = '0.001ms';
  });
}
