/* ==========================================================================
   Nakul Chandra — site behaviour
   Ported from the DCLogic component in "Nakul Chandra.dc.html".

   Original component props, now module-level config:
     logoMotion    'float' | 'tilt' | 'none'          (was: enum, default float)
     scrollReveals true | false                        (was: boolean, default true)
   The `headingStyle` prop is expressed statically as data-headfx in the markup.
   ========================================================================== */

(function () {
  'use strict';

  var CONFIG = {
    logoMotion: 'float',
    scrollReveals: true,
    autoplayMs: 6000
  };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ----------------------------------------------------------- logos ---- */

  function applyLogoMotion() {
    var mode = reduceMotion.matches ? 'none' : CONFIG.logoMotion;
    var name = mode === 'tilt' ? 'ncTilt' : 'ncFloat';

    document.querySelectorAll('[data-logo-anim]').forEach(function (el, i) {
      el.style.animation = mode === 'none'
        ? ''
        : name + ' ' + (6 + i * 1.5) + 's ease-in-out infinite';
    });
  }

  /* --------------------------------------------------------- reveals ---- */

  function setupReveals() {
    if (!CONFIG.scrollReveals || reduceMotion.matches) return;

    // Only hide what starts below the fold, so above-the-fold content is
    // never dependent on JS having run.
    var pending = [];
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      if (el.getBoundingClientRect().top <= window.innerHeight) return;
      el.style.opacity = '0';
      el.style.transform = 'translateY(26px)';
      el.style.transition =
        'opacity .7s cubic-bezier(.2,.6,.2,1), transform .7s cubic-bezier(.2,.6,.2,1)';
      pending.push(el);
    });
    if (pending.length === 0) return;

    function show(el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
      var i = pending.indexOf(el);
      if (i > -1) pending.splice(i, 1);
    }

    function showAll() {
      pending.slice().forEach(show);
    }

    // Primary path: reveal each element as it scrolls into view.
    var io = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          show(entry.target);
          io.unobserve(entry.target);
        });
      }, { threshold: 0.06, rootMargin: '0px 0px -50px 0px' });
      pending.forEach(function (el) { io.observe(el); });
    }

    // Safety net. IntersectionObserver callbacks can be withheld entirely in
    // some rendering contexts (offscreen/throttled tabs, embedded previews,
    // older engines). Without this, anything below the fold would stay at
    // opacity 0 forever — content silently invisible. A cheap scroll check
    // guarantees the reveal happens even when the observer never fires.
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var limit = window.innerHeight;
        pending.slice().forEach(function (el) {
          if (el.getBoundingClientRect().top <= limit) show(el);
        });
        if (pending.length === 0) teardown();
      });
    }

    function teardown() {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (io) io.disconnect();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    // Last resort: if neither path has run by the time the page is fully
    // loaded and settled, just show everything rather than hide content.
    window.addEventListener('load', function () {
      setTimeout(function () {
        if (pending.length) { showAll(); teardown(); }
      }, 3000);
    });

    onScroll();
  }

  /* -------------------------------------------------------- carousel ---- */

  function setupCarousel(root) {
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-slide]'));
    if (slides.length === 0) return;

    var dotsWrap = root.querySelector('.carousel__dots');
    var prevBtn = root.querySelector('[data-prev]');
    var nextBtn = root.querySelector('[data-next]');
    var index = 0;
    var timer = null;

    var dots = slides.map(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel__dot';
      dot.setAttribute('aria-label', 'Testimonial ' + (i + 1));
      dot.addEventListener('click', function () { go(i); restart(); });
      dotsWrap.appendChild(dot);
      return dot;
    });

    function render() {
      slides.forEach(function (slide, i) {
        var on = i === index;
        slide.toggleAttribute('data-active', on);
        slide.setAttribute('aria-hidden', on ? 'false' : 'true');
      });
      dots.forEach(function (dot, i) {
        var on = i === index;
        dot.toggleAttribute('data-active', on);
        dot.setAttribute('aria-current', on ? 'true' : 'false');
      });
    }

    function go(i) {
      index = (i + slides.length) % slides.length;
      render();
    }

    function next() { go(index + 1); }
    function prev() { go(index - 1); }

    function start() {
      if (reduceMotion.matches) return;
      stop();
      timer = setInterval(next, CONFIG.autoplayMs);
    }
    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
    }
    function restart() { stop(); start(); }

    nextBtn.addEventListener('click', function () { next(); restart(); });
    prevBtn.addEventListener('click', function () { prev(); restart(); });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', function (e) {
      if (!root.contains(e.relatedTarget)) start();
    });

    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); next(); restart(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); restart(); }
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { stop(); } else { start(); }
    });

    render();
    start();
  }

  /* ----------------------------------------------------------- video ---- */

  function setupVideo(frame) {
    var trigger = frame.querySelector('[data-video-play]');
    var videoId = frame.getAttribute('data-video-id');
    if (!trigger || !videoId) return;

    trigger.addEventListener('click', function () {
      var iframe = document.createElement('iframe');
      iframe.src =
        'https://www.youtube.com/embed/' + videoId + '?autoplay=1';
      iframe.title = 'YouTube video player';
      iframe.allow =
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.allowFullscreen = true;

      trigger.remove();
      frame.appendChild(iframe);
      iframe.focus();
    });
  }

  /* ------------------------------------------------------------ init ---- */

  function init() {
    applyLogoMotion();
    setupReveals();

    document.querySelectorAll('[data-carousel]').forEach(setupCarousel);
    document.querySelectorAll('[data-video]').forEach(setupVideo);

    if (reduceMotion.addEventListener) {
      reduceMotion.addEventListener('change', applyLogoMotion);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
