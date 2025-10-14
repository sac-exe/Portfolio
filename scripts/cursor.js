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