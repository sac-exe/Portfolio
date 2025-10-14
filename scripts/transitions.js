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
