//animation.js
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



//audio.js
const AudioEngine = (() => {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  const ctx = new Ctx();
  const mainGain = ctx.createGain();
  mainGain.gain.value = 0.9;
  mainGain.connect(ctx.destination);

  const buffers = new Map();
  let unlocked = false;

  async function load(url){
    if (buffers.has(url)) return buffers.get(url);
    const res = await fetch(url);
    const arr = await res.arrayBuffer();
    const buf = await ctx.decodeAudioData(arr);
    buffers.set(url, buf);
    return buf;
  }

  function play(url, { volume=0.55, rate=1 } = {}){
    if (!unlocked || ctx.state !== 'running') return;
    const buf = buffers.get(url);
    if (!buf) return;
    const src = ctx.createBufferSource();
    src.buffer = buf; src.playbackRate.value = rate;
    const g = ctx.createGain(); g.gain.value = volume;
    src.connect(g).connect(mainGain); src.start(0);
  }

  function unlock(){
    if (ctx.state === 'suspended') ctx.resume();
    unlocked = true;
    document.removeEventListener('pointerdown', unlock);
    document.removeEventListener('keydown', unlock);
  }
  document.addEventListener('pointerdown', unlock, { once:true, passive:true });
  document.addEventListener('keydown', unlock, { once:true });

  document.addEventListener('barba:after', () => { if (ctx.state === 'suspended') ctx.resume(); });

  return { load, play, ctx };
})();



//cursor.js
(() => {
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  let x = 0, y = 0, tx = 0, ty = 0;
  const ease = 0.22;
  let isDown = false, isHover = false;

  function raf() {
    tx += (x - tx) * ease;
    ty += (y - ty) * ease;

    dot.style.transform = `translate(${x - 3}px, ${y - 3}px) scale(${isDown ? 1.8 : isHover ? 1.3 : 1})`;
    ring.style.transform = `translate(${tx - 16}px, ${ty - 16}px) scale(${isDown ? 1.3 : isHover ? 1.1 : 1})`;
    ring.style.filter = isHover ? 'blur(2px)' : 'blur(0.5px)';
    requestAnimationFrame(raf);
  }

  window.addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; }, { passive: true });

  window.addEventListener('mousedown', () => {
    isDown = true;
    ring.style.borderColor = '#FF6B6B';
    dot.style.background = '#FFDD00';
  });
  window.addEventListener('mouseup', () => {
    isDown = false;
    ring.style.borderColor = isHover ? '#56CCF2' : '#00000066';
    dot.style.background = '#000';
  });

  function magnet(el) {
    const strength = 0.22;
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width / 2);
      const my = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${mx * strength}px, ${my * strength}px)`;
      ring.style.width = '44px'; ring.style.height = '44px';
      ring.style.borderColor = '#56CCF2';
      isHover = true;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
      ring.style.width = '32px'; ring.style.height = '32px';
      ring.style.borderColor = '#00000066';
      isHover = false;
    });
  }
  function bindTargets() { document.querySelectorAll('a,button,.card').forEach(magnet); }

  document.addEventListener('DOMContentLoaded', bindTargets);
  document.addEventListener('barba:after', bindTargets);
  raf();
})();


//sfx.js
const SFX = (() => {
  const MAP = {
    click: 'assets/sfx/click1.mp3',
    click2: 'assets/sfx/click2.mp3',
    hover: 'assets/sfx/hover.mp3',
    submit: 'assets/sfx/submit.mp3',
    card: 'assets/sfx/card.mp3'
  };

  async function preload(){ await Promise.all(Object.values(MAP).map(u => AudioEngine.load(u))); }

  function bind(){
    document.querySelectorAll('.sfx-click').forEach(el => el.addEventListener('click', () => AudioEngine.play(MAP.click, { volume:.55, rate:1+Math.random()*0.04 })));
    document.querySelectorAll('.sfx-hover').forEach(el => el.addEventListener('mouseenter', () => AudioEngine.play(MAP.hover, { volume:.35 }), { passive:true }));
    document.querySelectorAll('.sfx-card').forEach(el => {
      el.addEventListener('mouseenter', () => AudioEngine.play(MAP.card, { volume:.3 }), { passive:true });
      el.addEventListener('click', () => AudioEngine.play(MAP.click2, { volume:.55, rate:.98 }));
    });
    const form = document.querySelector('form.sfx-form');
    if (form) form.addEventListener('submit', () => AudioEngine.play(MAP.submit, { volume:.6 }));
  }

  document.addEventListener('DOMContentLoaded', async () => { await preload(); bind(); });
  document.addEventListener('barba:after', bind);
  return { preload, bind };
})();


//transitions.js
(() => {
  const loader = document.querySelector('.loader');
  const blocks = document.querySelectorAll('.loader-block');
  const mark = document.querySelector('.loader-mark');

  const show = async () => {
    loader.classList.add('active');
    const tl = gsap.timeline();
    tl.set(loader, { autoAlpha:1 })
      .to(blocks, { yPercent:-100, duration:0.45, ease:'power4.inOut', stagger:0.06 })
      .fromTo(mark, { autoAlpha:0, y:10 }, { autoAlpha:1, y:0, duration:0.3 }, '-=0.2');
    return tl;
  };

  const hide = async () => {
    const tl = gsap.timeline();
    tl.to(mark, { autoAlpha:0, y:-8, duration:0.25 })
      .to(blocks, { yPercent:0, duration:0.45, ease:'power4.inOut', stagger:0.05 }, 0)
      .set(loader, { autoAlpha:0, onComplete: () => loader.classList.remove('active') });
    return tl;
  };

  const enter = (container) => {
    gsap.from(container.querySelectorAll('h1,h2,.card,.button,.proj'), {
      y:16, opacity:0, duration:0.5, ease:'power3.out', stagger:0.05
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    if (!window.barba) return;
    barba.init({
      transitions: [{
        name:'blocks',
        async leave(){ await show(); },
        async enter({ next }){
          await hide(); enter(next.container);
          if (AudioEngine?.ctx?.state === 'suspended') AudioEngine.ctx.resume();
        }
      }]
    });
  });
})();
