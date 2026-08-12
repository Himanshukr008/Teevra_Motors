/* ===== Particle System ===== */
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let mouseX = 0;
let mouseY = 0;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createParticles() {
  particles = [];
  const count = Math.min(Math.floor(window.innerWidth / 12), 120);
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.8,
      speedY: (Math.random() - 0.5) * 0.8,
      opacity: Math.random() * 0.5 + 0.1,
    });
  }
}

function getParticleColor() {
  const color = getComputedStyle(document.documentElement).getPropertyValue('--particle-color').trim();
  return color || '255, 45, 45';
}

function drawParticles() {
  const particleColor = getParticleColor();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((p, i) => {
    p.x += p.speedX;
    p.y += p.speedY;

    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width) p.x = 0;
    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${particleColor}, ${p.opacity})`;
    ctx.fill();

    particles.slice(i + 1).forEach((p2) => {
      const dx = p.x - p2.x;
      const dy = p.y - p2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(${particleColor}, ${0.06 * (1 - dist / 120)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    });
  });

  requestAnimationFrame(drawParticles);
}

resizeCanvas();
createParticles();
drawParticles();
window.addEventListener('resize', () => {
  resizeCanvas();
  createParticles();
});

/* ===== Cursor Glow ===== */
const cursorGlow = document.getElementById('cursorGlow');

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorGlow.style.left = mouseX + 'px';
  cursorGlow.style.top = mouseY + 'px';
});

/* ===== Theme Toggle ===== */
const themeToggle = document.getElementById('themeToggle');
const root = document.documentElement;

function getPreferredTheme() {
  return localStorage.getItem('teevra-theme') || 'dark';
}

function applyTheme(theme) {
  root.setAttribute('data-theme', theme);
  localStorage.setItem('teevra-theme', theme);

  if (themeToggle) {
    themeToggle.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
    );
    themeToggle.setAttribute(
      'title',
      theme === 'dark' ? 'Light mode' : 'Dark mode'
    );
  }
}

applyTheme(getPreferredTheme());

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });
}

/* ===== Background Music ===== */
const BG_MUSIC_SRC = 'assets/kulakovka-racing-281126.mp3';
const audioToggle = document.getElementById('audioToggle');
let audioEnabled = false;
let bgMusicPlayer = null;

function updateAudioToggleUI() {
  if (!audioToggle) return;
  audioToggle.classList.toggle('enabled', audioEnabled);
  audioToggle.classList.remove('loading');
  audioToggle.setAttribute('aria-pressed', String(audioEnabled));
  audioToggle.setAttribute(
    'aria-label',
    audioEnabled ? 'Disable background music' : 'Enable background music'
  );
}

function ensureBgMusicPlayer() {
  if (bgMusicPlayer) return bgMusicPlayer;

  bgMusicPlayer = new Audio(BG_MUSIC_SRC);
  bgMusicPlayer.loop = true;
  bgMusicPlayer.preload = 'auto';
  bgMusicPlayer.volume = 0.5;
  return bgMusicPlayer;
}

function playBackgroundMusic() {
  const player = ensureBgMusicPlayer();
  player.volume = 0.5;

  if (player.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
    player.load();
  }

  return player.play();
}

function pauseBackgroundMusic() {
  if (!bgMusicPlayer) return;
  bgMusicPlayer.pause();
}

function toggleBackgroundMusic() {
  if (!audioToggle) return;

  if (audioEnabled) {
    pauseBackgroundMusic();
    audioEnabled = false;
    audioToggle.classList.remove('error');
    updateAudioToggleUI();
    try {
      localStorage.setItem('teevra-audio', 'off');
    } catch (_) {}
    return;
  }

  audioToggle.classList.add('loading');
  audioToggle.classList.remove('error');

  playBackgroundMusic()
    .then(() => {
      audioEnabled = true;
      audioToggle.classList.remove('error');
      updateAudioToggleUI();
      try {
        localStorage.setItem('teevra-audio', 'on');
      } catch (_) {}
    })
    .catch(() => {
      audioEnabled = false;
      pauseBackgroundMusic();
      audioToggle.classList.add('error');
      audioToggle.classList.remove('loading');
      audioToggle.setAttribute('aria-label', 'Enable background music (failed to load)');
      updateAudioToggleUI();
    });
}

if (audioToggle) {
  audioToggle.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleBackgroundMusic();
  });

  audioToggle.addEventListener('touchstart', (event) => {
    event.stopPropagation();
  }, { passive: true });

  updateAudioToggleUI();
}

document.addEventListener('visibilitychange', () => {
  if (!bgMusicPlayer || !audioEnabled) return;
  if (document.hidden) {
    bgMusicPlayer.pause();
  } else {
    bgMusicPlayer.play().catch(() => {});
  }
});

/* ===== Brand Marquee ===== */
const marqueeBrands = [
  { name: 'Porsche', url: 'https://www.porsche.com/' },
  { name: 'Ferrari', url: 'https://www.ferrari.com/' },
  { name: 'Lamborghini', url: 'https://www.lamborghini.com/' },
  { name: 'McLaren', url: 'https://www.mclaren.com/' },
  { name: 'BMW M', url: 'https://www.bmw-m.com/' },
  { name: 'Mercedes-AMG', url: 'https://www.mercedes-amg.com/' },
  { name: 'Audi RS', url: 'https://www.audi.com/en/sports.html' },
  { name: 'Tesla', url: 'https://www.tesla.com/' },
  { name: 'Bugatti', url: 'https://www.bugatti.com/' },
  { name: 'Koenigsegg', url: 'https://www.koenigsegg.com/' },
  { name: 'Aston Martin', url: 'https://www.astonmartin.com/' },
  { name: 'Maserati', url: 'https://www.maserati.com/' },
];

function buildMarquee() {
  const track = document.getElementById('marqueeTrack');
  if (!track) return;

  const brandLinks = marqueeBrands.map((brand, i) => {
    const dot = i > 0 ? '<span class="marquee-dot" aria-hidden="true"></span>' : '';
    return `${dot}<a
      href="${brand.url}"
      class="marquee-brand"
      target="_blank"
      rel="noopener noreferrer"
      title="Visit ${brand.name} official website"
    >${brand.name}</a>`;
  }).join('');

  track.innerHTML = `
    <div class="marquee-content">${brandLinks}</div>
    <div class="marquee-content" aria-hidden="true">${brandLinks}</div>
  `;
}

buildMarquee();

/* ===== Smooth Scroll ===== */
const navbar = document.getElementById('navbar');
const navLinks = document.getElementById('navLinks');
const hamburger = document.getElementById('hamburger');
const scrollProgress = document.getElementById('scrollProgress');
const backToTop = document.getElementById('backToTop');

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    navLinks.classList.remove('open');
    hamburger.classList.remove('active');
  });
});

/* ===== Scroll Handlers ===== */
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;

  navbar.classList.toggle('scrolled', scrollY > 50);
  scrollProgress.style.width = (scrollY / docHeight) * 100 + '%';
  backToTop.classList.toggle('visible', scrollY > 500);
  updateActiveNavLink();

  const scrollIndicator = document.getElementById('scrollIndicator');
  if (scrollIndicator) {
    const opacity = Math.max(0, 1 - scrollY / 300);
    scrollIndicator.style.opacity = opacity;
    scrollIndicator.style.pointerEvents = opacity > 0 ? 'auto' : 'none';
  }

  const heroCar = document.getElementById('heroCarImg');
  const heroCarWrap = document.querySelector('.hero-car-picture');
  if (heroCarWrap && scrollY < window.innerHeight) {
    heroCarWrap.style.transform = `translateY(${scrollY * 0.15}px)`;
  }
});

function updateActiveNavLink() {
  const scrollPos = window.scrollY + 120;
  document.querySelectorAll('section[id]').forEach((section) => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');
    if (scrollPos >= top && scrollPos < top + height) {
      document.querySelectorAll('.nav-link').forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
      });
    }
  });
}

/* ===== Mobile Menu ===== */
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('open');
});

document.addEventListener('click', (e) => {
  if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
  }
});

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ===== Scroll Reveal ===== */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach((el) => {
  revealObserver.observe(el);
});

/* ===== Counter Animation ===== */
let countersDone = false;

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !countersDone) {
        countersDone = true;
        document.querySelectorAll('.stat-number').forEach(animateCounter);
      }
    });
  },
  { threshold: 0.4 }
);

const statsBar = document.querySelector('.stats-bar');
if (statsBar) counterObserver.observe(statsBar);

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'), 10);
  const duration = 2200;
  const start = performance.now();

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }

  requestAnimationFrame(update);
}

/* ===== Feature Bar Animation ===== */
const barObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.feature-bar-fill').forEach((bar) => {
          const width = bar.getAttribute('data-width');
          bar.style.setProperty('--target-width', width + '%');
          bar.classList.add('animated');
          bar.style.width = width + '%';
        });
        barObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 }
);

document.querySelectorAll('.features-grid').forEach((grid) => barObserver.observe(grid));

/* ===== Hero Rotating Text ===== */
const heroWords = ['Future', 'Passion', 'Power', 'Freedom'];
let wordIndex = 0;
const heroRotatingText = document.getElementById('heroRotatingText');

setInterval(() => {
  if (!heroRotatingText) return;
  heroRotatingText.style.opacity = '0';
  heroRotatingText.style.transform = 'translateY(20px)';
  setTimeout(() => {
    wordIndex = (wordIndex + 1) % heroWords.length;
    heroRotatingText.textContent = heroWords[wordIndex];
    heroRotatingText.style.opacity = '1';
    heroRotatingText.style.transform = 'translateY(0)';
  }, 400);
}, 3000);

if (heroRotatingText) {
  heroRotatingText.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
}

/* ===== 3D Tilt Cards ===== */
document.querySelectorAll('[data-tilt]').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ===== Image Helpers ===== */
const CAR_ASSETS = 'assets/cars/';

function setupImageFallbacks() {
  document.querySelectorAll('img').forEach((img) => {
    if (img.complete && img.naturalWidth > 0) {
      img.classList.add('is-loaded');
    } else {
      img.classList.add('is-loading');
      img.addEventListener('load', () => {
        img.classList.remove('is-loading');
        img.classList.add('is-loaded');
      }, { once: true });
    }

    img.addEventListener('error', () => {
      if (img.dataset.fallbackApplied) return;
      img.dataset.fallbackApplied = 'true';
      const fallback = img.dataset.fallback || `${CAR_ASSETS}endurance-lambo.jpg`;
      img.src = fallback;
      img.classList.add('img-error');
      img.classList.remove('is-loading');
      img.classList.add('is-loaded');
    }, { once: true });
  });
}

/* ===== Racing Gallery — full spec data loaded from cars-data.js ===== */
const racingCars = window.RACING_CARS_DATA || [];

if (!racingCars.length) {
  console.warn('Racing fleet data not loaded. Ensure cars-data.js is included before script.js.');
}

const driveModeModifiers = {
  sport: { hp: 1, accel: 1, label: 'Sport — balanced race setup' },
  track: { hp: 1.06, accel: 0.92, label: 'Track — max power, sharper response' },
  efficiency: { hp: 0.88, accel: 1.08, label: 'Efficiency — fuel save & tire care' },
};

let selectedDriveMode = 'sport';

const carColors = [
  { id: 'red', name: 'Racing Red', hex: '#ff2d2d', filter: 'none' },
  { id: 'black', name: 'Midnight Black', hex: '#1a1a1a', filter: 'brightness(0.55) contrast(1.25) saturate(0.4)' },
  { id: 'white', name: 'Pearl White', hex: '#f0f0f0', filter: 'brightness(1.35) saturate(0.15) contrast(0.95)' },
  { id: 'blue', name: 'Electric Blue', hex: '#0066ff', filter: 'hue-rotate(190deg) saturate(1.4) brightness(0.95)' },
  { id: 'silver', name: 'Chrome Silver', hex: '#c0c0c0', filter: 'saturate(0.2) brightness(1.15) contrast(1.05)' },
  { id: 'yellow', name: 'Neon Yellow', hex: '#ffd700', filter: 'hue-rotate(35deg) saturate(1.6) brightness(1.05)' },
  { id: 'green', name: 'British Green', hex: '#006633', filter: 'hue-rotate(95deg) saturate(1.3) brightness(0.85)' },
  { id: 'orange', name: 'Sunset Orange', hex: '#ff6600', filter: 'hue-rotate(10deg) saturate(1.5) brightness(1.05)' },
];

let selectedCar = racingCars[0];
let selectedColor = carColors[0];

const configCarImg = document.getElementById('configCarImg');
const configBadge = document.getElementById('configBadge');
const configCategory = document.getElementById('configCategory');
const configCarName = document.getElementById('configCarName');
const configCarDesc = document.getElementById('configCarDesc');
const colorName = document.getElementById('colorName');
const specHp = document.getElementById('specHp');
const specSpeed = document.getElementById('specSpeed');
const specAccel = document.getElementById('specAccel');
const specTorque = document.getElementById('specTorque');
const specWeight = document.getElementById('specWeight');
const specDrivetrain = document.getElementById('specDrivetrain');
const specPowerWeight = document.getElementById('specPowerWeight');
const specRedline = document.getElementById('specRedline');
const specAccel200 = document.getElementById('specAccel200');
const configPedigree = document.getElementById('configPedigree');
const specSheet = document.getElementById('specSheet');
const configHighlights = document.getElementById('configHighlights');
const engineGrid = document.getElementById('engineGrid');
const chassisGrid = document.getElementById('chassisGrid');
const featureList = document.getElementById('featureList');
const techGrid = document.getElementById('techGrid');
const driveModeSelector = document.getElementById('driveModeSelector');
const configTabs = document.getElementById('configTabs');
const modelSelector = document.getElementById('modelSelector');
const colorSelector = document.getElementById('colorSelector');
const galleryGrid = document.getElementById('galleryGrid');

const categoryLabels = {
  f1: 'Formula 1',
  gt: 'GT Racing',
  rally: 'Rally',
  drag: 'Drag',
  endurance: 'Endurance',
  electric: 'Electric',
};

function applyColorFilter(imgEl, filter) {
  if (imgEl) imgEl.style.filter = filter;
}

function animateSpecNumber(el, value, decimals) {
  if (!el) return;
  const target = typeof value === 'number' ? value : parseFloat(value);
  if (Number.isNaN(target)) {
    el.textContent = value;
    return;
  }
  const start = parseFloat(el.textContent) || 0;
  const isFloat = decimals > 0;
  const duration = 500;
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + (target - start) * eased;
    el.textContent = isFloat ? current.toFixed(decimals) : Math.round(current);
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

function getAdjustedSpecs(car) {
  const mod = driveModeModifiers[selectedDriveMode] || driveModeModifiers.sport;
  return {
    hp: Math.round(car.hp * mod.hp),
    speed: car.speed,
    accel: +(car.accel * mod.accel).toFixed(1),
    torque: car.torque,
    weight: car.weight,
    drivetrain: car.drivetrain,
  };
}

function updatePerformanceBars(car) {
  const perf = car.performance || {};
  const keys = ['power', 'speed', 'handling', 'aero', 'braking', 'acceleration', 'durability', 'efficiency'];
  const valIds = {
    power: 'perfPowerVal', speed: 'perfSpeedVal', handling: 'perfHandlingVal',
    aero: 'perfAeroVal', braking: 'perfBrakingVal', acceleration: 'perfAccelVal',
    durability: 'perfDurabilityVal', efficiency: 'perfEfficiencyVal',
  };

  keys.forEach((key) => {
    const val = perf[key] || 0;
    const fill = document.querySelector(`.perf-bar-fill[data-key="${key}"]`);
    const label = document.getElementById(valIds[key]);
    if (fill) {
      fill.style.width = '0%';
      requestAnimationFrame(() => {
        fill.style.width = val + '%';
      });
    }
    if (label) label.textContent = val;
  });
}

function renderSpecGrid(container, specs, columns) {
  if (!container || !specs) return;
  container.innerHTML = Object.entries(specs).map(([key, val]) => {
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
    return `<div class="engine-item"><span>${label}</span><strong>${val}</strong></div>`;
  }).join('');
  container.classList.toggle('engine-grid--3col', columns === 3);
}

function renderEngineGrid(car) {
  if (!engineGrid) return;
  const e = car.engineSpecs || {};
  renderSpecGrid(engineGrid, {
    'Engine Layout': e.layout || car.engine,
    Displacement: e.displacement || '—',
    Cylinders: e.cylinders || '—',
    Compression: e.compression || '—',
    'Forced Induction': e.turbo || '—',
    Redline: e.redline || '—',
    'Power Output': e.powerOutput || `${car.hp} HP`,
    'Torque Peak': e.torquePeak || `${car.torque} Nm`,
    'Fuel System': e.fuelSystem || '—',
    Cooling: e.cooling || '—',
    'Hybrid / ERS': e.hybridSystem || 'None',
    Emissions: e.emissions || car.fuel,
    Transmission: car.transmission,
    'Fuel Type': car.fuel,
  });
}

function renderChassisGrid(car) {
  if (!chassisGrid) return;
  const c = car.chassisSpecs || {};
  renderSpecGrid(chassisGrid, {
    Chassis: c.frame || '—',
    Length: c.length || '—',
    Width: c.width || '—',
    Height: c.height || '—',
    Wheelbase: c.wheelbase || '—',
    'Track (F/R)': c.trackF ? `${c.trackF} / ${c.trackR}` : '—',
    Suspension: c.suspension || '—',
    Dampers: c.dampers || '—',
    Brakes: c.brakes || '—',
    Tires: c.tires || '—',
    Aerodynamics: c.aero || '—',
    'Weight Distribution': c.weightDist || '—',
    'Fuel / Range': c.fuelTank || '—',
    Safety: c.safety || '—',
    Drivetrain: car.drivetrain,
    'Curb Weight': `${car.weight} kg`,
  });
}

function renderFeatureList(car) {
  if (!featureList) return;
  const items = car.featuresDetailed || (car.features || []).map((name) => ({ name, desc: '' }));
  featureList.innerHTML = items.map((f) => `
    <article class="feature-detail-card">
      <h5>${f.name}</h5>
      <p>${f.desc || ''}</p>
    </article>
  `).join('');
}

function renderTechGrid(car) {
  if (!techGrid) return;
  const items = car.technology || [];
  techGrid.innerHTML = items.map((t) => `
    <article class="tech-card">
      <div class="tech-icon" aria-hidden="true">⚡</div>
      <div>
        <h5>${t.name}</h5>
        <p>${t.desc}</p>
      </div>
    </article>
  `).join('');
}

function renderSpecSheet(car) {
  if (!specSheet) return;
  specSheet.innerHTML = `
    <table class="spec-table">
      <tbody>
        <tr><th>Quarter Mile</th><td>${car.quarterMile || '—'} sec</td><th>0–200 km/h</th><td>${car.accel200 || '—'} sec</td></tr>
        <tr><th>Engine</th><td colspan="3">${car.engine}</td></tr>
        <tr><th>Transmission</th><td>${car.transmission}</td><th>Fuel</th><td>${car.fuel}</td></tr>
        <tr><th>Power / Weight</th><td>${(car.hp / (car.weight / 1000)).toFixed(0)} hp/t</td><th>Category</th><td>${categoryLabels[car.category] || car.category}</td></tr>
      </tbody>
    </table>
  `;
}

function renderHighlights(car) {
  if (!configHighlights) return;
  const mod = driveModeModifiers[selectedDriveMode];
  configHighlights.innerHTML = `
    <p class="drive-mode-note">${mod.label}</p>
    <div class="highlight-chips">${(car.highlights || []).map((h) => `<span class="highlight-chip">${h}</span>`).join('')}</div>
  `;
}

function updateConfigurator(car, animate) {
  selectedCar = car;

  if (animate && configCarImg) {
    configCarImg.classList.add('switching');
    setTimeout(() => {
      configCarImg.src = car.image;
      configCarImg.alt = car.name;
      configCarImg.classList.remove('switching');
      applyColorFilter(configCarImg, selectedColor.filter);
    }, 250);
  } else if (configCarImg) {
    configCarImg.src = car.image;
    configCarImg.alt = car.name;
    applyColorFilter(configCarImg, selectedColor.filter);
  }

  const specs = getAdjustedSpecs(car);

  if (configBadge) configBadge.textContent = car.badge;
  if (configCategory) configCategory.textContent = categoryLabels[car.category] || car.category;
  if (configCarName) configCarName.textContent = car.name;
  if (configCarDesc) configCarDesc.textContent = car.desc;

  animateSpecNumber(specHp, specs.hp, 0);
  animateSpecNumber(specSpeed, specs.speed, 0);
  animateSpecNumber(specAccel, specs.accel, 1);
  animateSpecNumber(specTorque, specs.torque, 0);
  animateSpecNumber(specWeight, specs.weight, 0);
  if (specDrivetrain) specDrivetrain.textContent = specs.drivetrain;

  if (specPowerWeight) {
    specPowerWeight.textContent = `${(specs.hp / (specs.weight / 1000)).toFixed(0)} hp/t`;
  }
  if (specRedline) {
    const redline = car.engineSpecs?.redline || '—';
    specRedline.textContent = typeof redline === 'string' ? redline.replace(' RPM', '') : redline;
  }
  if (specAccel200) animateSpecNumber(specAccel200, car.accel200 || 0, 1);
  if (configPedigree) configPedigree.textContent = car.pedigree || '';

  updatePerformanceBars(car);
  renderSpecSheet(car);
  renderEngineGrid(car);
  renderChassisGrid(car);
  renderFeatureList(car);
  renderTechGrid(car);
  renderHighlights(car);

  document.querySelectorAll('.model-option').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.id === car.id);
  });

  document.querySelectorAll('.gallery-item').forEach((item) => {
    item.classList.toggle('selected', item.dataset.id === car.id);
  });

  const activeModelBtn = document.querySelector(`.model-option[data-id="${car.id}"]`);
  if (activeModelBtn) {
    activeModelBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

function initConfigTabs() {
  if (!configTabs) return;
  configTabs.querySelectorAll('.config-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      configTabs.querySelectorAll('.config-tab').forEach((t) => {
        t.classList.toggle('active', t === tab);
        t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
      });
      document.querySelectorAll('.config-tab-panel').forEach((panel) => {
        panel.classList.toggle('active', panel.dataset.panel === target);
      });
    });
  });
}

function initDriveModeSelector() {
  if (!driveModeSelector) return;
  driveModeSelector.querySelectorAll('.drive-mode-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedDriveMode = btn.dataset.mode;
      driveModeSelector.querySelectorAll('.drive-mode-btn').forEach((b) => {
        b.classList.toggle('active', b === btn);
      });
      updateConfigurator(selectedCar, false);
    });
  });
}

function updateColor(color) {
  selectedColor = color;
  if (colorName) colorName.textContent = color.name;
  applyColorFilter(configCarImg, color.filter);

  document.querySelectorAll('.color-swatch').forEach((swatch) => {
    swatch.classList.toggle('active', swatch.dataset.id === color.id);
  });
}

function buildModelSelector() {
  if (!modelSelector) return;
  modelSelector.innerHTML = racingCars.map((car) => `
    <button class="model-option${car.id === selectedCar.id ? ' active' : ''}" data-id="${car.id}" type="button">
      <img src="${car.image}" alt="${car.name}" loading="lazy" data-fallback="${CAR_ASSETS}endurance-lambo.jpg" />
      <span>${car.name}<small>${car.badge}</small></span>
    </button>
  `).join('');

  modelSelector.querySelectorAll('.model-option').forEach((btn) => {
    btn.addEventListener('click', () => {
      const car = racingCars.find((c) => c.id === btn.dataset.id);
      if (car) updateConfigurator(car, true);
    });
  });
}

function buildColorSelector() {
  if (!colorSelector) return;
  colorSelector.innerHTML = carColors.map((color) => `
    <button
      class="color-swatch${color.id === selectedColor.id ? ' active' : ''}"
      data-id="${color.id}"
      type="button"
      style="background: ${color.hex}"
      aria-label="${color.name}"
      title="${color.name}"
    ></button>
  `).join('');

  colorSelector.querySelectorAll('.color-swatch').forEach((swatch) => {
    swatch.addEventListener('click', () => {
      const color = carColors.find((c) => c.id === swatch.dataset.id);
      if (color) updateColor(color);
    });
  });
}

function buildGalleryGrid() {
  if (!galleryGrid) return;
  galleryGrid.innerHTML = racingCars.map((car) => `
    <div class="gallery-item reveal-up" data-id="${car.id}" data-category="${car.category}">
      <span class="gallery-tag">${car.badge}</span>
      <img src="${car.image}" alt="${car.name}" loading="lazy" decoding="async" data-fallback="${car.image}" />
      <div class="gallery-overlay">
        <h4>${car.name}</h4>
        <p>${car.engine}</p>
        <div class="gallery-mini-specs">
          <span>${car.hp} HP</span>
          <span>${car.speed} km/h</span>
          <span>${car.torque} Nm</span>
          <span>${car.weight} kg</span>
          <span>${car.drivetrain}</span>
          <span>¼ mi ${car.quarterMile}s</span>
        </div>
        <button type="button" class="gallery-spec-btn" data-id="${car.id}">Full Spec Sheet</button>
      </div>
    </div>
  `).join('');

  galleryGrid.querySelectorAll('.gallery-item').forEach((item) => {
    item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    const openSpecs = () => {
      const car = racingCars.find((c) => c.id === item.dataset.id);
      if (car) {
        updateConfigurator(car, true);
        document.querySelector('.gallery-configurator')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    item.addEventListener('click', openSpecs);
    item.querySelector('.gallery-spec-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      openSpecs();
    });
    revealObserver.observe(item);
  });
}

buildModelSelector();
buildColorSelector();
buildGalleryGrid();
initConfigTabs();
initDriveModeSelector();
updateConfigurator(selectedCar, false);
updateColor(selectedColor);
setupImageFallbacks();

const filterBtns = document.querySelectorAll('.filter-btn');

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.getAttribute('data-filter');
    const items = galleryGrid.querySelectorAll('.gallery-item');

    items.forEach((item) => {
      const category = item.getAttribute('data-category');
      const show = filter === 'all' || category === filter;

      item.style.opacity = '0';
      item.style.transform = 'scale(0.92)';

      setTimeout(() => {
        item.classList.toggle('hidden', !show);
        if (show) {
          requestAnimationFrame(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          });
        }
      }, 200);
    });
  });
});

/* ===== Testimonial Slider ===== */
const testimonialTrack = document.getElementById('testimonialTrack');
const testimonialDots = document.getElementById('testimonialDots');
const testimonialCards = testimonialTrack.querySelectorAll('.testimonial-card');
let currentTestimonial = 0;
let testimonialInterval;

testimonialCards.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.classList.add('testimonial-dot');
  if (i === 0) dot.classList.add('active');
  dot.setAttribute('aria-label', 'Testimonial ' + (i + 1));
  dot.addEventListener('click', () => goToTestimonial(i));
  testimonialDots.appendChild(dot);
});

const dots = testimonialDots.querySelectorAll('.testimonial-dot');

function goToTestimonial(index) {
  testimonialCards[currentTestimonial].classList.remove('active');
  dots[currentTestimonial].classList.remove('active');
  currentTestimonial = index;
  testimonialCards[currentTestimonial].classList.add('active');
  dots[currentTestimonial].classList.add('active');
  resetTestimonialInterval();
}

function nextTestimonial() {
  goToTestimonial((currentTestimonial + 1) % testimonialCards.length);
}

function resetTestimonialInterval() {
  clearInterval(testimonialInterval);
  testimonialInterval = setInterval(nextTestimonial, 5000);
}

resetTestimonialInterval();

/* ===== Contact Form ===== */
document.getElementById('contactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const original = btn.innerHTML;

  btn.innerHTML = '✓ Test Drive Booked!';
  btn.style.background = 'linear-gradient(135deg, #00d4ff, #0066ff)';

  setTimeout(() => {
    btn.innerHTML = original;
    btn.style.background = '';
    e.target.reset();
  }, 3500);
});

/* ===== Magnetic Buttons ===== */
document.querySelectorAll('.magnetic-btn').forEach((btn) => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

/* ===== Hero Background Video ===== */
const heroVideo = document.getElementById('heroVideo');
let videoStarted = false;

function startHeroVideo() {
  if (!heroVideo) return;
  if (!heroVideo.paused && videoStarted) return;

  heroVideo.muted = true;
  heroVideo.defaultMuted = true;
  heroVideo.setAttribute('muted', '');
  heroVideo.playsInline = true;

  const playAttempt = heroVideo.play();
  if (playAttempt && typeof playAttempt.then === 'function') {
    playAttempt
      .then(() => {
        videoStarted = true;
      })
      .catch(() => {
        heroVideo.muted = true;
        heroVideo.play().then(() => {
          videoStarted = true;
        }).catch(() => {});
      });
  }
}

if (heroVideo) {
  heroVideo.addEventListener('loadeddata', startHeroVideo);
  heroVideo.addEventListener('canplay', startHeroVideo);

  if (heroVideo.readyState >= 2) {
    startHeroVideo();
  }

  document.addEventListener('visibilitychange', () => {
    if (!heroVideo) return;
    if (document.hidden) {
      heroVideo.pause();
    } else {
      startHeroVideo();
    }
  });

  ['click', 'touchstart', 'keydown', 'scroll'].forEach((eventName) => {
    document.addEventListener(eventName, startHeroVideo, { once: true, passive: true });
  });
}

/* ===== Page Load Animation ===== */
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.6s ease';
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });

  startHeroVideo();
  setupImageFallbacks();
});
