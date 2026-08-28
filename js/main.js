/* ============================================================
   Trakinagem Pet Shop — Animations & interactions
   GSAP 3.12 · ScrollTrigger · reduced-motion safe
   ============================================================ */

(() => {
  'use strict';

  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Year stamp ----
  const yearEl = qs('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- Header scroll state ----
  const header = qs('[data-header]');
  let ticking = false;
  const onScroll = () => {
    if (!header) return;
    if (window.scrollY > 12) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => { onScroll(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  // ---- Mobile menu ----
  const navToggle = qs('[data-nav-toggle]');
  const mobileNav = qs('[data-mobile-nav]');
  if (navToggle && mobileNav) {
    const closeMenu = () => {
      navToggle.setAttribute('aria-expanded', 'false');
      mobileNav.hidden = true;
    };
    navToggle.addEventListener('click', () => {
      const open = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!open));
      mobileNav.hidden = open;
    });
    qsa('[data-mobile-link]', mobileNav).forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  // ---- Care Guide Tabs ----
  const care = qs('[data-care]');
  if (care) {
    const tabs = qsa('[data-care-tab]', care);
    const panels = qsa('[data-care-panel]', care);
    const activate = (key, focus) => {
      tabs.forEach(t => {
        const on = t.dataset.careTab === key;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        if (on && focus) t.focus();
      });
      panels.forEach(p => {
        const on = p.dataset.carePanel === key;
        p.hidden = !on;
        p.classList.toggle('is-active', on);
      });
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => activate(tab.dataset.careTab));
      tab.addEventListener('keydown', e => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        const dir = e.key === 'ArrowRight' ? 1 : -1;
        const next = (i + dir + tabs.length) % tabs.length;
        activate(tabs[next].dataset.careTab, true);
      });
    });
  }

  // ============================================================
  // GSAP Animations
  // ============================================================
  if (typeof gsap === 'undefined') {
    qsa('[data-reveal]').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  gsap.defaults({ ease: 'power3.out', duration: 0.7 });
  gsap.ticker.lagSmoothing(false);
  gsap.ticker.wake();

  if (reduced()) {
    gsap.set('[data-reveal]', { opacity: 1, y: 0, clearProps: 'opacity,transform' });
  } else {
    // ---- Hero Entrance ----
    const heroTl = gsap.timeline();
    heroTl
      .fromTo('.hero .eyebrow', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo('.hero h1.display', { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.85 }, '-=0.35')
      .fromTo('.hero .lede', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.5')
      .fromTo('.hero .hero-actions', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.45')
      .fromTo('.hero .hero-tags li', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, '-=0.4')
      .fromTo('.hero-figure', { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 1, ease: 'power2.out' }, '-=0.7')
      .fromTo('.hero-badge', { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');

    if (qs('.hero-stroke')) {
      gsap.fromTo('.hero-stroke',
        { strokeDasharray: 800, strokeDashoffset: 800 },
        { strokeDashoffset: 0, duration: 1.6, ease: 'power2.out', stagger: 0.05, delay: 0.3 }
      );
    }

    // ---- ScrollTrigger Reveals ----
    if (typeof ScrollTrigger !== 'undefined') {
      const reveal = (selector, opts = {}) => {
        gsap.fromTo(selector,
          { opacity: 0, y: 28 },
          {
            opacity: 1, y: 0,
            duration: 0.7,
            stagger: opts.stagger ?? 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: opts.trigger || selector,
              start: opts.start || 'top 88%',
              once: true,
            },
            clearProps: 'opacity,transform',
          }
        );
      };

      reveal('#servicos .section-head');
      reveal('.service-card', { trigger: '.services-grid', stagger: 0.08 });
      reveal('#diferenciais .section-head');
      reveal('#diferenciais .about-copy > *', { trigger: '#diferenciais', stagger: 0.08 });
      reveal('.about-card', { trigger: '.about-side' });
      reveal('#cuidados .section-head');
      reveal('.care-tabs-wrapper', { trigger: '#cuidados' });
      reveal('#avaliacoes .section-head');
      reveal('.review', { trigger: '.reviews', stagger: 0.12 });
      reveal('#contato .contact-copy > *', { trigger: '#contato', stagger: 0.06 });
      reveal('.contact-map', { trigger: '.contact-map' });

      // KPI Counter
      qsa('.kpi strong').forEach(el => {
        const decimals = parseInt(el.dataset.decimals || '0', 10);
        const suffix = el.dataset.suffix || '';
        el.textContent = (0).toFixed(decimals) + suffix;
        const target = parseFloat(el.dataset.count);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
          onUpdate() {
            el.textContent = obj.v.toFixed(decimals) + suffix;
          },
        });
      });
    }

    // ---- Hover Lift on Cards ----
    qsa('.service-card, .review, .kpi').forEach(card => {
      const enter = () => gsap.to(card, { y: -6, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
      const leave = () => gsap.to(card, { y: 0, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
      card.addEventListener('mouseenter', enter);
      card.addEventListener('mouseleave', leave);
      card.addEventListener('focusin', enter);
      card.addEventListener('focusout', leave);
    });

    // ---- WhatsApp FAB Pulse ----
    const fab = qs('[data-wa-fab]');
    if (fab) {
      const fabPulse = gsap.to(fab, {
        scale: 1.07,
        duration: 1.2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) fabPulse.pause();
        else fabPulse.play();
      });
    }

    // ---- Parallax on Hero Decorative Elements ----
    if (typeof ScrollTrigger !== 'undefined' && qsa('.paw-deco').length) {
      qsa('.paw-deco').forEach((p, i) => {
        gsap.to(p, {
          y: -30 * (i % 2 === 0 ? 1 : -1),
          scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        });
      });
    }
  }

  if (document.fonts && typeof ScrollTrigger !== 'undefined') {
    document.fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
  }
  window.addEventListener('load', () => {
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
  });

  if (typeof gsap !== 'undefined') {
    if (document.hidden) gsap.ticker.wake();
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) gsap.ticker.wake();
    });
  }
})();
