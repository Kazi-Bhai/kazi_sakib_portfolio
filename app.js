// ========================================
// THEME TOGGLE
// ========================================
const themeToggle = document.getElementById('theme-toggle');
const htmlEl = document.documentElement;

const savedTheme = localStorage.getItem('rh-theme') || 'dark';
htmlEl.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const current = htmlEl.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  htmlEl.setAttribute('data-theme', next);
  localStorage.setItem('rh-theme', next);
});

// ========================================
// HAMBURGER MENU
// ========================================
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  hamburger.classList.toggle('open');
});

// Close menu on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
  });
});

// ========================================
// HAMBURGER ANIMATION STYLES
// ========================================
const hamStyle = document.createElement('style');
hamStyle.textContent = `
.hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.hamburger.open span:nth-child(2) { opacity: 0; }
.hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
`;
document.head.appendChild(hamStyle);

// ========================================
// SCROLL PROGRESS BAR
// ========================================
const progressBar = document.getElementById('scroll-progress');

window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const progress = (scrollTop / docHeight) * 100;
  progressBar.style.width = progress + '%';
});

// ========================================
// SCROLL REVEAL
// ========================================
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const siblings = entry.target.parentElement.querySelectorAll('.reveal');
      let idx = 0;
      siblings.forEach((el, i) => { if (el === entry.target) idx = i; });
      entry.target.style.transitionDelay = (idx * 60) + 'ms';
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ========================================
// SKILL BAR ANIMATION
// ========================================
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.skill-fill').forEach((bar, i) => {
        const targetWidth = bar.getAttribute('data-width') + '%';
        setTimeout(() => {
          bar.style.width = targetWidth;
        }, i * 120);
      });
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.skill-category').forEach(cat => skillObserver.observe(cat));

// ========================================
// TYPING ANIMATION
// ========================================
const phrases = [
  'Aspiring Full Stack Developer',
  'JavaScript Learner',
  'Node.js Explorer',
  'Cyber Security Curious',
  'Building Real Projects'
];

let phraseIdx = 0;
let charIdx = 0;
let isDeleting = false;
const typedEl = document.getElementById('typed-text');

function typeLoop() {
  const currentPhrase = phrases[phraseIdx];

  if (isDeleting) {
    charIdx--;
    typedEl.textContent = currentPhrase.substring(0, charIdx);
  } else {
    charIdx++;
    typedEl.textContent = currentPhrase.substring(0, charIdx);
  }

  let delay = isDeleting ? 60 : 100;

  if (!isDeleting && charIdx === currentPhrase.length) {
    delay = 2200;
    isDeleting = true;
  } else if (isDeleting && charIdx === 0) {
    isDeleting = false;
    phraseIdx = (phraseIdx + 1) % phrases.length;
    delay = 400;
  }

  setTimeout(typeLoop, delay);
}

typeLoop();

// ========================================
// GITHUB — LIVE DATA
// ========================================
const GH_USERNAME = 'Kazi-Bhai'; // ← Replace with your GitHub username

async function loadGithubSection() {
  try {
    // --- Fetch user profile ---
    const userRes = await fetch(`https://api.github.com/users/${GH_USERNAME}`);
    if (!userRes.ok) throw new Error('GitHub user not found');
    const user = await userRes.json();

    // Real avatar image
    const avatarEl = document.querySelector('.gh-avatar');
    if (avatarEl) {
      avatarEl.innerHTML = `<img
        src="${user.avatar_url}"
        alt="${user.login}"
        style="width:100%;height:100%;border-radius:50%;object-fit:cover;display:block;"
      >`;
    }

    // Name
    const nameEl = document.querySelector('.gh-info h3');
    if (nameEl) nameEl.textContent = user.name || user.login;

    // Bio
    const bioEl = document.querySelector('.gh-info p');
    if (bioEl) bioEl.textContent = user.bio || (user.login + ' on GitHub');

    // Profile link
    const ghBtn = document.querySelector('.gh-btn');
    if (ghBtn) ghBtn.href = user.html_url;

    // Stats — repos, following (3rd stays as ⭐ Open Source)
    const nums = document.querySelectorAll('.gh-num');
    if (nums[0]) nums[0].textContent = user.public_repos + '+';
    if (nums[1]) nums[1].textContent = user.following + '+';

    // --- Fetch real contribution grid ---
    const contribRes = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${GH_USERNAME}?y=last`
    );
    if (!contribRes.ok) throw new Error('Contributions unavailable');
    const data = await contribRes.json();

    buildContribGrid(data.contributions.slice(-364));

  } catch (err) {
    console.warn('GitHub load failed, using fallback grid:', err.message);
    generateFallbackGrid();
  }
}

function buildContribGrid(days) {
  const grid = document.getElementById('gh-grid');
  if (!grid) return;
  grid.innerHTML = '';

  // Pad empty cells so the first day aligns to its real weekday
  const firstDayOfWeek = new Date(days[0].date).getDay(); // 0 = Sunday
  for (let i = 0; i < firstDayOfWeek; i++) {
    const empty = document.createElement('div');
    empty.className = 'gh-sq lv0';
    grid.appendChild(empty);
  }

  // Render each day as a square
  days.forEach(day => {
    const sq = document.createElement('div');
    sq.className = `gh-sq lv${levelClass(day.count)}`;
    sq.title = `${day.count} contribution${day.count !== 1 ? 's' : ''} on ${day.date}`;
    grid.appendChild(sq);
  });
}

function levelClass(count) {
  if (count === 0) return 0;
  if (count <= 3)  return 1;
  if (count <= 6)  return 2;
  if (count <= 9)  return 3;
  return 4;
}

// Fallback: random beginner-pattern grid if API fails
function generateFallbackGrid() {
  const grid = document.getElementById('gh-grid');
  if (!grid) return;
  grid.innerHTML = '';
  for (let i = 0; i < 364; i++) {
    const sq = document.createElement('div');
    const r = Math.random();
    const lv = r < 0.52 ? 0 : r < 0.75 ? 1 : r < 0.90 ? 2 : r < 0.97 ? 3 : 4;
    sq.className = `gh-sq lv${lv}`;
    grid.appendChild(sq);
  }
}

loadGithubSection();

// ========================================
// CONTACT FORM
// ========================================
const contactForm = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = contactForm.querySelector('button[type="submit"]');
    btn.textContent = 'Sending...';
    btn.disabled = true;

    try {
      const formData = new FormData(contactForm);
      formData.append("access_key", "34671a20-83f5-4e0d-b1b8-38e243ddb86a");

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        formSuccess.classList.remove('hidden');
        contactForm.reset();
        setTimeout(() => {
          formSuccess.classList.add('hidden');
        }, 5000);
      } else {
        alert("Error: " + data.message);
      }

    } catch (error) {
      alert("Something went wrong. Please try again.");
    } finally {
      btn.textContent = 'Send Message 🚀';
      btn.disabled = false;
    }
  });
}

// ========================================
// SMOOTH ACTIVE NAV HIGHLIGHT
// ========================================
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => navObserver.observe(s));

// Active nav style
const style = document.createElement('style');
style.textContent = `.nav-links a.active { color: var(--accent) !important; background: var(--tag-bg); }`;
document.head.appendChild(style);
