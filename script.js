// ===== LOADING SCREEN =====
window.addEventListener('load', () => {
    const bar     = document.getElementById('loadingBar');
    const percent = document.getElementById('loadingPercent');
    const screen  = document.getElementById('loading-screen');
    let p = 0;

    const interval = setInterval(() => {
        p += Math.random() * 4 + 1;
        if (p >= 100) { p = 100; clearInterval(interval); }
        bar.style.width   = p + '%';
        percent.textContent = Math.floor(p) + '%';
        if (p === 100) {
            setTimeout(() => {
                screen.style.transition = 'opacity 0.8s ease';
                screen.style.opacity    = '0';
                setTimeout(() => screen.style.display = 'none', 800);
            }, 400);
        }
    }, 40);
});

// ===== CUSTOM CURSOR =====
const cursorOuter = document.getElementById('cursor-outer');
const cursorInner = document.getElementById('cursor-inner');
let mouseX = 0, mouseY = 0;
let outerX = 0, outerY = 0;

document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorInner.style.left = mouseX + 'px';
    cursorInner.style.top  = mouseY + 'px';
});

function animateCursor() {
    outerX += (mouseX - outerX) * 0.12;
    outerY += (mouseY - outerY) * 0.12;
    cursorOuter.style.left = outerX + 'px';
    cursorOuter.style.top  = outerY + 'px';
    requestAnimationFrame(animateCursor);
}
animateCursor();

// تكبير الكيرسور على العناصر القابلة للضغط
document.querySelectorAll('a, button, .filter-btn, .social-item, .portfolio-item').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursorOuter.style.transform = 'translate(-50%,-50%) scale(1.6)';
        cursorOuter.style.borderColor = 'rgba(255,255,255,0.9)';
    });
    el.addEventListener('mouseleave', () => {
        cursorOuter.style.transform = 'translate(-50%,-50%) scale(1)';
        cursorOuter.style.borderColor = 'rgba(255,255,255,0.5)';
    });
});

// ===== TOAST =====
function showToast(msg, icon = '👑') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

// ===== DARK / LIGHT MODE =====
const themeBtn = document.getElementById('themeBtn');
let isLight = false;

themeBtn.addEventListener('click', () => {
    isLight = !isLight;
    document.body.classList.toggle('light-mode', isLight);
    themeBtn.textContent = isLight ? '🌙' : '☀️';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    showToast(
        currentLang === 'ar'
            ? (isLight ? 'تم التبديل للوضع الفاتح' : 'تم التبديل للوضع الداكن')
            : (isLight ? 'Switched to Light Mode' : 'Switched to Dark Mode'),
        isLight ? '☀️' : '🌙'
    );
});

// حفظ الثيم
if (localStorage.getItem('theme') === 'light') {
    isLight = true;
    document.body.classList.add('light-mode');
    themeBtn.textContent = '🌙';
}

// ===== القائمة الجانبية =====
const menuBtn  = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');
menuBtn.addEventListener('click', () => navLinks.classList.toggle('active'));

// ===== المودالز =====
const contactModal  = document.getElementById('contactModal');
const teamModal     = document.getElementById('teamModal');

document.querySelectorAll('.contact-trigger').forEach(t => t.addEventListener('click', e => {
    e.preventDefault();
    contactModal.classList.add('open');
    showToast(
        currentLang === 'ar' ? 'تواصل معنا الآن 👑' : 'Contact us now 👑'
    );
}));

document.querySelectorAll('.team-trigger').forEach(t => t.addEventListener('click', e => {
    e.preventDefault();
    teamModal.classList.add('open');
    showToast(
        currentLang === 'ar' ? 'انضم لطاقم الملوك 👑' : 'Join the royal team 👑'
    );
}));

document.getElementById('closeModal').addEventListener('click',     () => contactModal.classList.remove('open'));
document.getElementById('closeTeamModal').addEventListener('click', () => teamModal.classList.remove('open'));

window.addEventListener('click', e => {
    if (e.target === contactModal) contactModal.classList.remove('open');
    if (e.target === teamModal)    teamModal.classList.remove('open');
});

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, i * 80);
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ===== STATS COUNTER =====
function animateCounter(el, target, duration = 2000) {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
        start += step;
        if (start >= target) {
            start = target;
            clearInterval(timer);
        }
        el.textContent = Math.floor(start);
    }, 16);
}

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.stat-num').forEach(num => {
                animateCounter(num, parseInt(num.getAttribute('data-target')));
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

const statsRow = document.querySelector('.stats-row');
if (statsRow) statsObserver.observe(statsRow);

// ===== PAGE TRANSITIONS =====
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
        navLinks.classList.remove('active');
    });
});

// ===== الفلتر =====
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.getAttribute('data-filter');
        document.querySelectorAll('.portfolio-item').forEach(item => {
            item.style.display = (f === 'all' || item.classList.contains(f)) ? 'block' : 'none';
        });
        showToast(
            currentLang === 'ar'
                ? `تصفح: ${btn.getAttribute('data-ar')}`
                : `Browsing: ${btn.getAttribute('data-en')}`
        );
    });
});

// ===== الترجمة =====
let currentLang = 'ar';
document.getElementById('langBtn').addEventListener('click', () => {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    document.getElementById('langBtn').textContent = currentLang === 'ar' ? 'EN' : 'AR';
    document.documentElement.lang = currentLang;
    document.documentElement.dir  = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-ar][data-en]').forEach(el => {
        const val = el.getAttribute('data-' + currentLang);
        if (el.tagName === 'P' || el.classList.contains('subtitle')) {
            el.innerHTML = val;
        } else {
            el.textContent = val;
        }
    });
    showToast(
        currentLang === 'ar' ? 'تم التبديل للعربية 🌙' : 'Switched to English 🌟'
    );
});

// ===== SOUND EFFECT =====
function playRoyalSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            const osc  = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = freq;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.15);
            gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + i * 0.15 + 0.05);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.15 + 0.3);
            osc.start(ctx.currentTime + i * 0.15);
            osc.stop(ctx.currentTime + i * 0.15 + 0.3);
        });
    } catch(e) {}
}

// ===== الأمن السيبراني =====
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('selectstart', e => e.preventDefault());
document.addEventListener('copy',        e => e.preventDefault());
document.addEventListener('cut',         e => e.preventDefault());
document.addEventListener('dragstart',   e => e.preventDefault());

document.addEventListener('keydown', e => {
    if (e.key === 'F12') { e.preventDefault(); return false; }
    if (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key)) { e.preventDefault(); return false; }
    if (e.ctrlKey && ['u','s','a','c','p','v'].includes(e.key))   { e.preventDefault(); return false; }
});

(function detectDevTools() {
    const threshold = 160;
    setInterval(() => {
        if (
            window.outerWidth  - window.innerWidth  > threshold ||
            window.outerHeight - window.innerHeight > threshold
        ) {
            document.body.innerHTML = `
                <div style="position:fixed;top:0;left:0;width:100%;height:100%;
                    background:#000;color:#fff;display:flex;flex-direction:column;
                    align-items:center;justify-content:center;font-family:Cairo,sans-serif;z-index:99999;">
                    <svg viewBox="0 0 100 100" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10,80 L20,35 L40,50 L50,20 L60,50 L80,35 L90,80 Z"
                            fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.6)" stroke-width="1.5"/>
                        <circle cx="20" cy="35" r="2.5" fill="#fff"/>
                        <circle cx="50" cy="20" r="3" fill="#fff"/>
                        <circle cx="80" cy="35" r="2.5" fill="#fff"/>
                        <ellipse cx="50" cy="80" rx="40" ry="6" fill="none"
                            stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
                    </svg>
                    <h1 style="font-size:2rem;margin:25px 0 10px;letter-spacing:4px;font-weight:900;">
                        THE KING GAMING
                    </h1>
                    <p style="color:#555;font-size:1rem;">🔒 هذا الموقع محمي بالكامل</p>
                    <p style="color:#333;font-size:0.85rem;margin-top:5px;">This site is fully protected</p>
                </div>`;
        }
    }, 800);
})();

window.addEventListener('keyup', e => {
    if (e.key === 'PrintScreen') navigator.clipboard.writeText('').catch(() => {});
});

if (window.top !== window.self) window.top.location = window.self.location;

document.querySelectorAll('img, video').forEach(el => {
    el.style.userSelect    = 'none';
    el.style.pointerEvents = 'none';
    el.setAttribute('draggable', 'false');
    el.addEventListener('contextmenu', e => e.preventDefault());
});

setInterval(() => console.clear(), 100);
console.log('%c⛔ STOP!', 'color:red;font-size:60px;font-weight:900;');
console.log(
    '%c👑 THE KING GAMING\n\nهذا الموقع ملك حصري — كل محاولة سرقة أو نسخ محظورة قانونياً.\nThis site is exclusively owned. Any attempt to copy is legally prohibited.',
    'color:#fff;font-size:13px;background:#0a0a0a;padding:15px 20px;border-radius:8px;border-left:3px solid #fff;'
);

// ===== تشغيل الصوت بعد الانترو =====
document.addEventListener('click', function playOnce() {
    playRoyalSound();
    document.removeEventListener('click', playOnce);
}, { once: true });