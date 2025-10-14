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
