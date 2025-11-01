/* LifeCard 2.0 — Animated + APIs + GSAP
   Features added:
   - Numbers API (date fact)
   - Agify (name-based age guess)
   - Split header animation
   - Scramble reveal for numbers
   - ScrollTrigger waves parallax
   - Confetti particle engine with GSAP
*/

gsap.registerPlugin(gsap.plugins?.scrollTrigger ? gsap.plugins.ScrollTrigger : window.ScrollTrigger || {});

const nameInput = document.getElementById('name');
const dateInput = document.getElementById('date-input');
const lifeRange = document.getElementById('life-expectancy');
const lifeExpValue = document.getElementById('life-exp-value');
const themeSelect = document.getElementById('theme-select');

const avatarInput = document.getElementById('avatar-input');
const avatarPreview = document.getElementById('avatar-preview');
const cardAvatar = document.getElementById('avatar-in-card');

const generateBtn = document.getElementById('generate');
const generateTopBtn = document.getElementById('generate-top');
const resetBtn = document.getElementById('reset');

const lifecard = document.getElementById('lifecard');
const cardName = document.getElementById('card-name');
const cardBorn = document.getElementById('card-born');
const zodiacEl = document.getElementById('zodiac');
const generationEl = document.getElementById('generation');

const scrYears = document.getElementById('scr-years');
const scrDays = document.getElementById('scr-days');
const scrPercent = document.getElementById('scr-percent');

const nextBday = document.getElementById('next-bday');
const milestonesEl = document.getElementById('milestones');
const funFacts = document.getElementById('fun-facts');

const fg = document.querySelector('.progress-ring .fg');
const R = 50;
const CIRC = 2 * Math.PI * R;
fg.style.strokeDasharray = `${CIRC}`;
fg.style.strokeDashoffset = `${CIRC}`;

const splitTitle = document.getElementById('split-title');
const wavePath = document.getElementById('wavePath');

const confettiCanvas = document.getElementById('confetti-canvas');
const ctx = confettiCanvas.getContext('2d');

// responsive canvas
function resizeCanvas() {
  confettiCanvas.width = confettiCanvas.offsetWidth * devicePixelRatio;
  confettiCanvas.height = confettiCanvas.offsetHeight * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);
}
window.addEventListener('resize', resizeCanvas);
setTimeout(resizeCanvas, 50);

// helpers
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmt = n => n.toLocaleString();

// simple zodiac & generation
function getZodiac(m, d){
  const z = [
    ["Capricorn",20],["Aquarius",19],["Pisces",21],["Aries",20],
    ["Taurus",21],["Gemini",21],["Cancer",23],["Leo",23],
    ["Virgo",23],["Libra",23],["Scorpio",22],["Sagittarius",22],["Capricorn",32]
  ];
  return d < z[m-1][1] ? z[m-2<0?11:m-2][0] : z[m-1][0];
}
function getGeneration(y){
  if (y >= 2010) return 'Gen Alpha';
  if (y >= 1997) return 'Gen Z';
  if (y >= 1981) return 'Millennial';
  if (y >= 1965) return 'Gen X';
  if (y >= 1946) return 'Boomer';
  return 'Silent Gen';
}
function calcAge(b, now = new Date()){
  let y = now.getFullYear() - b.getFullYear();
  let m = now.getMonth() - b.getMonth();
  let d = now.getDate() - b.getDate();
  if (d < 0) { const pm = new Date(now.getFullYear(), now.getMonth(), 0); d += pm.getDate(); m -= 1; }
  if (m < 0) { m += 12; y -= 1; }
  return { years: y, months: m, days: d };
}
function daysBetween(a,b){ return Math.floor((b - a) / (1000*60*60*24)); }

// text scramble reveal util
function scrambleReveal(el, finalStr, duration = 0.9){
  const chars = '!<>-_\\/[]{}—=+*^?#________';
  const len = finalStr.length;
  let frame = 0;
  const totalFrames = Math.max(10, Math.floor(60 * duration));
  const update = () => {
    let out = '';
    for (let i = 0; i < len; i++) {
      if (frame / totalFrames > i / len) {
        out += finalStr[i];
      } else {
        out += chars[Math.floor(Math.random() * chars.length)];
      }
    }
    el.textContent = out;
    frame++;
    if (frame <= totalFrames) requestAnimationFrame(update);
    else el.textContent = finalStr;
  };
  update();
}

// animated split header (wrap letters)
function splitHeader() {
  const text = splitTitle.textContent.trim();
  splitTitle.innerHTML = text.split('').map(ch => `<span class="letter">${ch}</span>`).join('');
  gsap.fromTo('#split-title .letter', { y: 20, opacity: 0, rotationX: -20 }, { y:0, opacity:1, rotationX:0, duration:0.7, stagger:0.03, ease:'back.out(1.6)' });
}
splitHeader();

// animate waves with ScrollTrigger
function waveGenerator() {
  // build a curvy path using sin noise
  const w = 1440;
  const h = 180;
  const points = [];
  const segments = 8;
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * w;
    const y = h * (0.4 + 0.15 * Math.sin(i * 1.2));
    points.push([x, y]);
  }
  // make path string
  let d = `M 0 ${h} L 0 ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const cpx = (points[i][0] + points[i+1][0]) / 2;
    const cpy = (points[i][1] + points[i+1][1]) / 2;
    d += ` Q ${points[i][0]} ${points[i][1]} ${cpx} ${cpy}`;
  }
  d += ` L ${w} ${h} L 0 ${h} Z`;
  wavePath.setAttribute('d', d);
  // animate wave translateX on scroll
  if (window.ScrollTrigger) {
    gsap.to('#waves', { x: -120, ease: 'none', scrollTrigger: { trigger: '.main', start: 'top top', scrub: 0.6 } });
  } else {
    gsap.to('#waves', { x: -80, duration: 12, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  }
}
waveGenerator();

// confetti particles engine (lightweight)
let particles = [];
function spawnConfetti(x, y, count=90, theme='aqua') {
  const colors = {
    aqua: ['#6EE7B7','#60A5FA','#A78BFA','#FDE68A'],
    sunset: ['#FFB86B','#FF6B6B','#FFD166','#FED7AA'],
    violet: ['#C084FC','#7C3AED','#60A5FA','#FF7AB6']
  }[theme] || ['#6EE7B7','#60A5FA','#A78BFA','#FDE68A'];

  for (let i = 0; i < count; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 3.5) - Math.random() * 6,
      r: 4 + Math.random() * 6,
      rot: Math.random() * 360,
      color: colors[Math.floor(Math.random()*colors.length)],
      life: 1 + Math.random() * 1.6
    });
  }
  animateConfetti();
}
let confettiRAF = null;
function animateConfetti() {
  if (confettiRAF) return;
  let last = performance.now();
  function loop(now) {
    const dt = (now - last) / 1000; last = now;
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    // draw & update
    for (let i = particles.length-1; i >=0; i--) {
      const p = particles[i];
      p.vy += 10 * dt; // gravity
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vx * 7;
      p.life -= dt * 0.8;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r/2, -p.r/2, p.r, p.r*0.6);
      ctx.restore();
      if (p.y > confettiCanvas.offsetHeight + 60 || p.life <= 0) particles.splice(i,1);
    }
    if (particles.length > 0) confettiRAF = requestAnimationFrame(loop);
    else { cancelAnimationFrame(confettiRAF); confettiRAF = null; ctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height); }
  }
  confettiRAF = requestAnimationFrame(loop);
}

// split reveal for numbers (scramble -> count)
function revealStats(years, days, percent) {
  scrambleReveal(scrYears, `${years}y`);
  scrambleReveal(scrDays, `${fmt(days)}`);
  scrambleReveal(scrPercent, `${Math.round(percent)}%`);
}

// API helpers (no api key used)
async function fetchDateFact(month, day) {
  try {
    const res = await fetch(`https://numbersapi.com/${month}/${day}/date?json`);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) { return null; }
}
async function fetchAgify(name) {
  try {
    const res = await fetch(`https://api.agify.io?name=${encodeURIComponent(name)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch(e) { return null; }
}

// main generate logic
async function generateCard() {
  const name = (nameInput.value || 'Anonymous').trim();
  const dobStr = dateInput.value;
  if (!dobStr) { gsap.fromTo(dateInput, { x:-6 }, { x:6, duration:0.06, repeat:4, yoyo:true, clearProps:'x' }); return; }
  const dob = new Date(dobStr);
  const now = new Date();
  if (dob > now) { alert('Future DOB?'); return; }

  // set card basic
  cardName.textContent = name;
  cardBorn.textContent = `Born ${dob.toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' })}`;

  // avatar preview -> card avatar
  if (avatarPreview.style.backgroundImage) {
    cardAvatar.style.backgroundImage = avatarPreview.style.backgroundImage;
    cardAvatar.textContent = '';
  } else {
    cardAvatar.style.backgroundImage = '';
    cardAvatar.textContent = name.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase();
  }

  // derived stats
  const age = calcAge(dob, now);
  const totalDays = daysBetween(dob, now);
  const lifeExp = parseInt(lifeRange.value,10);
  const percent = clamp(((age.years + age.months / 12 + age.days / 365.25) / lifeExp) * 100, 0, 999);

  zodiacEl.textContent = getZodiac(dob.getMonth()+1, dob.getDate());
  generationEl.textContent = getGeneration(dob.getFullYear());

  // animated reveal
  revealStats(age.years, totalDays, percent);
  const offset = CIRC - (CIRC * (percent / 100));
  gsap.fromTo(fg, { strokeDashoffset: CIRC }, { strokeDashoffset: offset, duration: 1.2, ease: 'power3.out' });

  // fetch fun facts from Numbers API & Agify
  funFacts.innerHTML = '';
  const [fact, agify] = await Promise.all([fetchDateFact(dob.getMonth()+1, dob.getDate()), fetchAgify(name.split(' ')[0])]);
  if (fact && fact.text) {
    funFacts.appendChild(makeFact('📜', fact.text));
  }
  if (agify && agify.age) {
    const txt = `Name-based guess: people named "${agify.name}" average ${agify.age} yrs old (count: ${agify.count}).`;
    funFacts.appendChild(makeFact('🧠', txt));
  }

  // interesting derived estimates
  funFacts.appendChild(makeFact('⏱️', `Approx hours lived: ${fmt(Math.round(totalDays * 24))}`));
  funFacts.appendChild(makeFact('❤️', `Estimated heartbeats: ${fmt(Math.round(totalDays * 24 * 60 * 80))}`));

  // milestones
  const milestones = [];
  if (totalDays >= 10000) milestones.push('10,000 days passed 🎯'); else {
    const date10000 = new Date(dob.getTime() + 10000 * 24*60*60*1000);
    const left = daysBetween(now, date10000);
    milestones.push(`10,000 days in ${left} days`);
  }
  milestones.push(age.years >= 40 ? '40 yrs passed' : `${40 - age.years} yrs to 40`);
  milestonesEl.textContent = milestones.join(' • ');

  // next birthday
  let next = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
  if (next <= now) next = new Date(now.getFullYear()+1, dob.getMonth(), dob.getDate());
  const daysTo = daysBetween(now, next);
  nextBday.textContent = `Next birthday: ${next.toLocaleDateString()} — in ${daysTo} day${daysTo!==1?'s':''}`;

  // animate card & parallax micro
  const tl = gsap.timeline();
  tl.fromTo(lifecard, { y: 18, rotationX: 6, opacity: 0 }, { y:0, rotationX:0, opacity:1, duration: 0.7, ease: 'expo.out' });
  tl.from('.fact', { y: 10, opacity: 0, stagger: 0.06, duration: 0.45 }, '-=0.45');

  // confetti on milestones (celebrate 10k)
  const theme = themeSelect.value || 'aqua';
  if (totalDays >= 10000 && totalDays < 10000 + 7) { // celebrate shortly after hitting
    const rect = lifecard.getBoundingClientRect();
    spawnConfetti(rect.width/2, rect.top + 60, 120, theme);
  } else if (totalDays < 10000 && daysBetween(new Date(dob.getTime() + 10000*24*60*60*1000), now) < 3) {
    // if soon, gentle burst
    const rect = lifecard.getBoundingClientRect();
    spawnConfetti(rect.width/2, rect.top + 60, 60, theme);
  }

  // theme color morph for fg gradient
  applyTheme(themeSelect.value);
}

// create a fact element
function makeFact(icon, text) {
  const el = document.createElement('div');
  el.className = 'fact';
  el.innerHTML = `<strong style="margin-right:8px">${icon}</strong>${text}`;
  return el;
}

// apply theme to stroke & card glow
function applyTheme(name) {
  const map = {
    aqua: ['#6EE7B7','#60A5FA'],
    sunset: ['#FFB86B','#FF6B6B'],
    violet: ['#C084FC','#7C3AED']
  }[name] || ['#6EE7B7','#60A5FA'];
  const stops = document.querySelectorAll('#g1 stop');
  if (stops && stops.length >= 2) {
    stops[0].setAttribute('stop-color', map[0]);
    stops[1].setAttribute('stop-color', map[1]);
  }
  // card avatar glow
  cardAvatar.style.boxShadow = `0 10px 30px ${map[0]}33`;
}

// avatar preview handling
avatarInput.addEventListener('change', (e) => {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  const reader = new FileReader();
  reader.onload = () => {
    avatarPreview.style.backgroundImage = `url(${reader.result})`;
    avatarPreview.textContent = '';
    cardAvatar.style.backgroundImage = `url(${reader.result})`;
    cardAvatar.textContent = '';
  };
  reader.readAsDataURL(f);
});

// share/export & copy link
const shareBtn = document.getElementById('share-btn');
shareBtn.addEventListener('click', async () => {
  shareBtn.disabled = true; shareBtn.textContent = 'Rendering...';
  try {
    const canvas = await html2canvas(lifecard, { scale: 2, backgroundColor: null });
    const data = canvas.toDataURL('image/png');
    const a = document.createElement('a'); a.href = data; a.download = `lifecard-${(nameInput.value||'user').replace(/\s+/g,'_')}.png`; a.click();
  } catch(e){ alert('Export failed'); console.error(e); }
  finally { shareBtn.disabled = false; shareBtn.textContent = '📤 Share'; }
});

const copyBtn = document.getElementById('copy-btn');
copyBtn.addEventListener('click', () => {
  const payload = { name: nameInput.value || 'Anon', dob: dateInput.value || '', life: lifeRange.value, theme: themeSelect.value };
  const url = `${location.origin}${location.pathname}#${btoa(JSON.stringify(payload))}`;
  navigator.clipboard?.writeText(url).then(()=> {
    gsap.fromTo(copyBtn, { scale:1 }, { scale:1.06, duration:0.12, yoyo:true, repeat:1 });
    copyBtn.textContent = '✅ Copied'; setTimeout(()=> copyBtn.textContent = '🔗 Copy Link', 1200);
  }).catch(()=> alert('Copy failed'));
});

// small UI wiring
lifeRange.addEventListener('input', ()=> lifeExpValue.textContent = lifeRange.value);
generateBtn.addEventListener('click', generateCard);
generateTopBtn.addEventListener('click', generateCard);
resetBtn.addEventListener('click', () => window.location.reload());
themeSelect.addEventListener('change', ()=> applyTheme(themeSelect.value));

// initial sample prefill
(function prefill(){
  nameInput.value = 'Kartik';
  const d = new Date(); d.setFullYear(d.getFullYear() - 27); d.setMonth(4); d.setDate(14);
  dateInput.valueAsDate = d;
  lifeRange.value = 80; lifeExpValue.textContent = 80;
  applyTheme('aqua');
})();

// small scroll parallax on card (scale + rotateX)
if (window.ScrollTrigger) {
  ScrollTrigger.create({
    trigger: '.preview',
    start: 'top center',
    end: 'bottom top',
    scrub: true,
    onUpdate: (st) => {
      const v = gsap.utils.clamp(1 - st.progress * 0.06, 0.94, 1.02);
      gsap.to(lifecard, { scale: v, duration: 0.6, ease: 'power1.out' });
    }
  });
}
