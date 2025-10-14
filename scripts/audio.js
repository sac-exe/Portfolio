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
