(() => {
  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);

  const splitLines = (el) => {
    const text = el.textContent;
    el.setAttribute('data-text', text);
    const words = text.split(' ');
    el.innerHTML = words.map(w => `<span class="word"><span class="char">${w}&nbsp;</span></span>`).join('');
  };

  function hero(){
    document.querySelectorAll('.split-lines').forEach(splitLines);
    const tl = gsap.timeline({ defaults:{ ease:'power3.out' }});
    tl.from('.hero .word .char', { yPercent:110, opacity:0, stagger:0.02, duration:0.75 }, 0)
      .from('.hero .button', { y:14, opacity:0, stagger:0.06, duration:0.45 }, 0.1)
      .from('.hero-card', { y:16, opacity:0, duration:0.5 }, 0.1)
      .from('.hero-sticker', { rotation:-12, scale:0.8, opacity:0, duration:0.4 }, 0.15);
  }

  function reveal(){
    document.querySelectorAll('.reveal-up').forEach(el => {
      gsap.from(el, {
        y:20, opacity:0, duration:0.6, ease:'power2.out',
        scrollTrigger:{ trigger:el, start:'top 85%', toggleActions:'play none none reverse' }
      });
    });
  }

  function responsive(){
    const mm = gsap.matchMedia();
    mm.add('(max-width: 900px)', () => {
      // Slightly reduce distances for mobile
    });
  }

  function init(){ hero(); reveal(); responsive(); }

  document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('barba:after', () => {
    ScrollTrigger.getAll().forEach(t => t.kill());
    init(); ScrollTrigger.refresh();
  });
})();
