// Theme preference: saved choice wins; otherwise the system preference is used.
(() => {
  const storageKey = 'portfolio-theme';
  const root = document.documentElement;
  function applyTheme(theme) {
    root.dataset.theme = theme;
    const toggle = document.querySelector('.theme-toggle');
    const isDark = theme === 'dark';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark ? '#151515' : '#fafafa');
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(isDark));
      toggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} theme`);
      toggle.innerHTML = `<i class="fa-solid fa-${isDark ? 'sun' : 'moon'}" aria-hidden="true"></i>`;
    }
  }
  function initThemeToggle() {
    const toggle = document.querySelector('.theme-toggle');
    if (!toggle || toggle.dataset.themeBound) return;
    applyTheme(root.dataset.theme || 'light');
    toggle.dataset.themeBound = 'true';
    toggle.addEventListener('click', () => {
      const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem(storageKey, theme);
      applyTheme(theme);
    });
  }
  document.addEventListener('DOMContentLoaded', initThemeToggle);
  document.addEventListener('barba:after', initThemeToggle);
})();

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.avatar').forEach((avatar) => {
    avatar.addEventListener('error', () => avatar.classList.add('is-fallback'), { once: true });
  });
});

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

//audio.js + sfx.js (single definition)
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
    if (!unlocked) return;
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

const SFX = (() => {
  const MAP = {
    click: 'assets/sfx/click1.mp3',
    click2: 'assets/sfx/click2.mp3',
    hover: 'assets/sfx/hover.mp3',
    submit: 'assets/sfx/submit.mp3'
    // Removed card sound
  };

  async function preload(){ await Promise.all(Object.values(MAP).map(u => AudioEngine.load(u))); }

  function bind(){
    document.querySelectorAll('.sfx-click').forEach(el => el.addEventListener('click', () => AudioEngine.play(MAP.click, { volume:.55, rate:1+Math.random()*0.04 })));
    document.querySelectorAll('.sfx-hover').forEach(el => el.addEventListener('mouseenter', () => AudioEngine.play(MAP.hover, { volume:.35 }), { passive:true }));
    // Removed .sfx-card event listeners
    const form = document.querySelector('form.sfx-form');
    if (form) form.addEventListener('submit', () => AudioEngine.play(MAP.submit, { volume:.6 }));
  }

  document.addEventListener('DOMContentLoaded', async () => { await preload(); bind(); });
  document.addEventListener('barba:after', bind);
  return { preload, bind };
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
  });
  window.addEventListener('mouseup', () => {
    isDown = false;
  });

  function magnet(el) {
    const strength = 0.22;
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
      ring.style.width = '32px'; ring.style.height = '32px';
      ring.style.borderColor = 'var(--ring-color)';
      isHover = false;
    });
  }
  function bindTargets() { document.querySelectorAll('a,button,.card').forEach(magnet); }

  document.addEventListener('DOMContentLoaded', bindTargets);
  document.addEventListener('barba:after', bindTargets);
  raf();
})();

(() => { // Avatar 3D tilt + cursor-follow glow
  if (!window.gsap) return;
  const wrap = document.querySelector('.avatar-wrap');
  const img = wrap?.querySelector('.avatar');
  if (!wrap || !img) return;
  // disable on touch devices
  if (matchMedia && matchMedia('(pointer: coarse)').matches) return;

  function onMove(e){
    const rect = wrap.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = (x / rect.width) - 0.5; // -0.5 .. 0.5
    const py = (y / rect.height) - 0.5;
    const rotY = px * 12; // horizontal => rotateY
    const rotX = -py * 10; // vertical => rotateX

    gsap.to(img, { rotationY: rotY, rotationX: rotX, scale: 1.035, duration: 0.45, ease: 'power3.out' });
    // update glow position
    wrap.style.setProperty('--mx', `${x}px`);
    wrap.style.setProperty('--my', `${y}px`);
  }

  function onLeave(){
    gsap.to(img, { rotationY: 0, rotationX: 0, scale: 1, duration: 0.6, ease: 'power3.out' });
    wrap.style.setProperty('--mx', '50%');
    wrap.style.setProperty('--my', '50%');
  }

  wrap.addEventListener('pointermove', onMove, { passive: true });
  wrap.addEventListener('pointerleave', onLeave);
  wrap.addEventListener('pointercancel', onLeave);
})();

(() => {
  // Block common copy/paste and devtools key + context menu
  document.addEventListener('keydown', e => {
    const key = e.key?.toLowerCase();
    const ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && (key === 'c' || key === 'v')) e.preventDefault();
    if (e.key === 'F12') e.preventDefault();
  }, false);

  // Prevent copy / paste events
  document.addEventListener('copy', e => e.preventDefault());
  document.addEventListener('paste', e => e.preventDefault());

  // Optional: block right-click menu
  document.addEventListener('contextmenu', e => e.preventDefault());

  // Prevent dragging images (delegated) and mark existing imgs non-draggable
  document.addEventListener('dragstart', e => {
    const t = e.target;
    if (!t) return;
    if (t.tagName === 'IMG' || t.closest && t.closest('img')) e.preventDefault();
  }, false);

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('img').forEach(img => img.setAttribute('draggable', 'false'));
  });
})();

(() => { //info-card
  const icon = document.getElementById('infoskill');
  const card = document.getElementById('infoskill-card');
  if (!icon || !card) return;

  let hideTimeout = 0;
  const isCoarse = matchMedia && matchMedia('(pointer: coarse)').matches;

  function show() {
    window.clearTimeout(hideTimeout);
    card.classList.add('visible');
    card.setAttribute('aria-hidden', 'false');
  }
  function hide() {
    window.clearTimeout(hideTimeout);
    card.classList.remove('visible');
    card.setAttribute('aria-hidden', 'true');
  }
  function delayedHide() {
    hideTimeout = window.setTimeout(hide, 200);
  }

  // Pointer devices: hover
  icon.addEventListener('mouseenter', () => { if (!isCoarse) show(); });
  icon.addEventListener('mouseleave', () => { if (!isCoarse) delayedHide(); });
  card.addEventListener('mouseenter', () => { if (!isCoarse) show(); });
  card.addEventListener('mouseleave', () => { if (!isCoarse) delayedHide(); });

  // Click toggles (useful for touch)
  icon.addEventListener('click', e => { e.stopPropagation(); card.classList.toggle('visible'); card.setAttribute('aria-hidden', card.classList.contains('visible') ? 'false' : 'true'); });
  card.querySelector('.info-card-close')?.addEventListener('click', () => hide());

  // Keyboard
  icon.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.classList.toggle('visible'); card.setAttribute('aria-hidden', card.classList.contains('visible') ? 'false' : 'true'); }
    if (e.key === 'Escape') hide();
  });

  // Close when clicking/tapping outside
  document.addEventListener('click', (e) => {
    if (!icon.contains(e.target) && !card.contains(e.target)) hide();
  });

  // ESC globally
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
})();

//custom loader animation for nav-link scroll
document.querySelectorAll('.nav-link[href^="/#"]').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href').replace('/#', '');
    const target = document.getElementById(targetId);
    const loader = document.querySelector('.loader');
    const lb1 = document.querySelector('.loader-block.lb1');
    const lb2 = document.querySelector('.loader-block.lb2');
    const lb3 = document.querySelector('.loader-block.lb3');
    const mark = document.querySelector('.loader-mark');
    if (!target || !loader || !lb1 || !lb2 || !lb3 || !mark) return;

    // Reset positions: lb1 is visible, lb2/lb3 are below the screen
    gsap.set(lb1, { y: 0 });
    gsap.set(lb2, { y: '100%' });
    gsap.set(lb3, { y: '100%' });

    loader.classList.add('active');

    // Animate: lb1 appears, then lb2 slides up over lb1, then lb3 slides up over lb2
    const tl = gsap.timeline();
    tl.set(loader, { autoAlpha: 1 })
      .to(lb2, { y: 0, duration: 0.15, ease: 'power2.inOut' }, "+=0.18")
      .to(lb3, { y: 0, duration: 0.15, ease: 'power2.inOut' }, "+=0.18")
      .to(loader, { autoAlpha: 0, duration: 0.18, onComplete: () => loader.classList.remove('active') }, "+=0.22");

    // Wait for loader animation, then scroll
    setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth' });
    }, 500); // Match total GSAP timeline duration
  });
});


//terminal
const input = document.getElementById('terminal-input');
const output = document.getElementById('terminal-output');

// Define your links here
const SOCIAL_LINKS = {
  instagram: "https://instagram.com/your_username",
  linkedin: "https://linkedin.com/in/your_username",
  github: "https://github.com/your_username",
  email: "mailto:your.email@example.com",
  resume: "/assets/docs/Sachin_Resume.pdf" // Path to your PDF file
};

const commands = {
  help: `Available commands: 
    <br>• <b>instagram</b> - Open Instagram profile
    <br>• <b>linkedin</b> - Open LinkedIn profile
    <br>• <b>github</b> - Open GitHub profile
    <br>• <b>email</b> / <b>mail</b> - Send an email
    <br>• <b>resume</b> / <b>download resume</b> - Download PDF resume
    <br>• <b>whoami</b> - About me
    <br>• <b>skills</b> - View tech stack
    <br>• <b>clear</b> - Clear terminal screen`,
    
  whoami: "Sachin — Pentester & Red Teamer. BCA Student passionate about UI/UX and Security.",
  skills: "HTML5, CSS3, JS, Node.js, MongoDB, React, Linux, Penetration Testing",
  flag: "FLAG{byp4ss3d_th3_m4tr1x}"
};

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const rawCmd = input.value.trim();
    const cmd = rawCmd.toLowerCase();
    
    // Clear command line
    input.value = '';

    if (!cmd) return;

    // Handle 'clear' command
    if (cmd === 'clear') {
      output.innerHTML = '';
      return;
    }

    let response = '';

    // 1. Handle Social Link Redirects
    if (cmd === 'instagram' || cmd === 'linkedin' || cmd === 'github') {
      const url = SOCIAL_LINKS[cmd];
      window.open(url, '_blank');
      response = `Opening ${cmd.toUpperCase()} in a new tab... <a href="${url}" target="_blank" style="color:var(--p2);">${url}</a>`;
    } 
    
    // 2. Handle Mail Redirection
    else if (cmd === 'email' || cmd === 'mail') {
      window.location.href = SOCIAL_LINKS.email;
      response = `Opening your default mail client (${SOCIAL_LINKS.email.replace('mailto:', '')})...`;
    } 
    
    // 3. Handle Resume Download
    else if (cmd === 'resume' || cmd === 'download resume') {
      const link = document.createElement('a');
      link.href = SOCIAL_LINKS.resume;
      link.download = 'Sachin_Resume.pdf'; // File name when downloaded
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      response = `Downloading resume... If the download doesn't start automatically, <a href="${SOCIAL_LINKS.resume}" download style="color:var(--p2);">click here</a>.`;
    } 
    
    // 4. Handle Text Commands (help, whoami, skills, etc.)
    else if (commands[cmd]) {
      response = commands[cmd];
    } 
    
    // 5. Handle Unknown Commands
    else {
      response = `Command not found: <b>${rawCmd}</b>. Type <b>'help'</b> to see available options.`;
    }

    // Append command and response to terminal screen
    output.innerHTML += `
      <div style="margin-top: 8px;"><span class="prompt">> ${rawCmd}</span></div>
      <div style="margin-bottom: 8px;">${response}</div>
    `;
    
    // Auto-scroll to the bottom
    output.scrollTop = output.scrollHeight;
  }
});


//game-bug

const holes = document.querySelectorAll('.hole');
const scoreBoard = document.getElementById('bug-score');
const timerDisplay = document.getElementById('bug-timer');
const toggleBtn = document.getElementById('toggle-bug-game');
const diffBtns = document.querySelectorAll('.btn-diff');

let lastHole;
let isPlaying = false;
let score = 0;
let countdown;
let peepTimeout;
let timeLeft = 30;

// Default Speed (Easy Mode)
let minSpeed = 800;
let maxSpeed = 1200;

// Helper: Random time within active difficulty range
function randomTime(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

// Helper: Select random hole without repeating previous
function randomHole(holes) {
  const idx = Math.floor(Math.random() * holes.length);
  const hole = holes[idx];
  if (hole === lastHole) return randomHole(holes);
  lastHole = hole;
  return hole;
}

// Pop up bugs recursively
function peep() {
  if (!isPlaying) return;
  
  const speed = randomTime(minSpeed, maxSpeed);
  const hole = randomHole(holes);
  hole.classList.add('up');
  
  peepTimeout = setTimeout(() => {
    hole.classList.remove('up');
    if (isPlaying) peep();
  }, speed);
}

// Start Game
function startGame() {
  isPlaying = true;
  score = 0;
  timeLeft = 30;
  
  scoreBoard.textContent = 0;
  timerDisplay.textContent = 30;
  
  // UI Button Updates
  toggleBtn.textContent = 'Stop Game';
  toggleBtn.classList.add('btn-stop');
  
  // Disable difficulty changes while playing
  diffBtns.forEach(btn => btn.disabled = true);

  peep();

  countdown = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    if (timeLeft <= 0) {
      stopGame(true); // Game finished naturally
    }
  }, 1000);
}

// Stop Game (Manual or Time Expired)
function stopGame(timeExpired = false) {
  isPlaying = false;
  clearInterval(countdown);
  clearTimeout(peepTimeout);
  
  // Reset all holes
  holes.forEach(hole => hole.classList.remove('up'));
  
  // UI Button Resets
  toggleBtn.textContent = 'Start Game';
  toggleBtn.classList.remove('btn-stop');
  
  // Re-enable difficulty buttons
  diffBtns.forEach(btn => btn.disabled = false);

  if (timeExpired) {
    alert(`Game Over! You patched ${score} bugs!`);
  }
}

// Toggle Button Click Handler
toggleBtn.addEventListener('click', () => {
  if (isPlaying) {
    stopGame(false);
  } else {
    startGame();
  }
});

// Bug Click Handler
holes.forEach(hole => {
  hole.addEventListener('click', () => {
    if (hole.classList.contains('up') && isPlaying) {
      score++;
      scoreBoard.textContent = score;
      hole.classList.remove('up');
    }
  });
});

// Difficulty Mode Selector Handler
diffBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    if (isPlaying) return; // Prevent switching mid-game

    // Update Highlighted Active Class
    diffBtns.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');

    // Update Speed Parameters
    minSpeed = parseInt(e.target.getAttribute('data-speed-min'));
    maxSpeed = parseInt(e.target.getAttribute('data-speed-max'));
  });
});