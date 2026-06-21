/* ============================================================
   Makai US Group LLC — Main JS
   ============================================================ */

// ── NAVBAR scroll effect ──────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ── SMOOTH SCROLL for nav links ───────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
  });
});

// ── INTERSECTION OBSERVER — fade-up / fade-in ─────────────
const observer = new IntersectionObserver(
  entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  }),
  { threshold: 0.12 }
);

document.querySelectorAll('.fade-up, .fade-in').forEach(el => observer.observe(el));

// ── COUNTER animation ─────────────────────────────────────
function animateCounter(el, target, suffix = '') {
  const duration = 1800;
  const start    = performance.now();
  const step = ts => {
    const progress = Math.min((ts - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 4);
    el.textContent = Math.floor(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver(
  entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el     = entry.target;
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    animateCounter(el, target, suffix);
    counterObserver.unobserve(el);
  }),
  { threshold: 0.5 }
);

document.querySelectorAll('[data-counter]').forEach(el => counterObserver.observe(el));

// ── MOBILE MENU ──────────────────────────────────────────
const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobile-menu');

hamburger?.addEventListener('click', () => {
  const isOpen = mobileMenu.style.display === 'flex';
  mobileMenu.style.display = isOpen ? 'none' : 'flex';
  hamburger.setAttribute('aria-expanded', String(!isOpen));
});

// Close mobile menu on nav link click
mobileMenu?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => { mobileMenu.style.display = 'none'; });
});

// ── CONTACT FORM ──────────────────────────────────────────
const contactForm = document.getElementById('contact-form');
contactForm?.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = contactForm.querySelector('.form-submit');
  const originalText = btn.textContent;
  btn.textContent = 'Sending...';
  btn.disabled = true;

  // Collect form data
  const data = Object.fromEntries(new FormData(contactForm));

  try {
    // For now — Netlify forms submission (add name="contact-form" netlify attribute)
    const res = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ 'form-name': 'contact', ...data }).toString(),
    });
    if (res.ok) {
      contactForm.innerHTML = `<div class="form-success">
        <div style="font-size:40px;margin-bottom:16px">✓</div>
        <h3 style="color:var(--white);margin-bottom:8px">Message Received</h3>
        <p>We'll be in touch within 24 hours.</p>
      </div>`;
    } else throw new Error('Form error');
  } catch {
    btn.textContent = originalText;
    btn.disabled = false;
    alert('Something went wrong. Please email us at info_terminal@makaiusgroup.com');
  }
});

// ── KAI CHAT ─────────────────────────────────────────────
const kaiBubble  = document.getElementById('kai-bubble');
const kaiChat    = document.getElementById('kai-chat');
const kaiClose   = document.getElementById('kai-close');
const kaiInput   = document.getElementById('kai-input');
const kaiSend    = document.getElementById('kai-send');
const kaiMsgs    = document.getElementById('kai-messages');

const KAI_GREETING = {
  en: "Hi! I'm Kai 👋 How can I help you today? Ask me about our services, pricing, or how to get started.",
  es: "¡Hola! Soy Kai 👋 ¿En qué puedo ayudarte hoy? Pregúntame sobre nuestros servicios, precios o cómo comenzar."
};

const KAI_RESPONSES = {
  en: {
    pricing:  "Our MBI Intelligence System starts at $69/mo (Basic · 5 projects), $149/mo (Pro · 20 projects), or $259/mo (Enterprise · unlimited). Would you like to see a full comparison?",
    terminal: "Terminal is our Executive Trading Suite — real-time journaling, AI-powered trade analytics, performance dashboards, and more. Visit terminal.makaiusgroup.com to try it.",
    mbi:      "MBI (Makai Budget Intelligence) is an AI-powered budgeting tool for construction professionals — estimates, phase tracking, QC checks, and PDF reports all in one platform.",
    contact:  "You can reach us at info_terminal@makaiusgroup.com or call 832.219.5408. We're based in Houston, TX.",
    default:  "Great question! For detailed information, please reach out to us at info_terminal@makaiusgroup.com or fill out the contact form on this page. We typically respond within 24 hours."
  },
  es: {
    pricing:  "Nuestro sistema MBI Intelligence comienza en $69/mes (Básico · 5 proyectos), $149/mes (Pro · 20 proyectos) o $259/mes (Empresarial · ilimitado). ¿Te gustaría ver una comparación completa?",
    terminal: "Terminal es nuestra Suite de Trading Ejecutivo — journaling en tiempo real, análisis de operaciones con IA, paneles de rendimiento y más. Visita terminal.makaiusgroup.com para probarlo.",
    mbi:      "MBI (Makai Budget Intelligence) es una herramienta de presupuesto impulsada por IA para profesionales de la construcción — estimados, seguimiento de fases, verificaciones de calidad e informes PDF en una sola plataforma.",
    contact:  "Puedes contactarnos en info_terminal@makaiusgroup.com o llamar al 832.219.5408. Estamos en Houston, TX.",
    default:  "¡Buena pregunta! Para información detallada, contáctanos en info_terminal@makaiusgroup.com o completa el formulario de contacto. Respondemos en menos de 24 horas."
  }
};

let kaiOpen = false;
let currentLang = 'en';

function kaiRespond(msg) {
  const lower = msg.toLowerCase();
  const r = KAI_RESPONSES[currentLang];
  if (lower.includes('pric') || lower.includes('cost') || lower.includes('plan') || lower.includes('precio'))
    return r.pricing;
  if (lower.includes('terminal') || lower.includes('trading'))
    return r.terminal;
  if (lower.includes('mbi') || lower.includes('budget') || lower.includes('construction') || lower.includes('presupuesto'))
    return r.mbi;
  if (lower.includes('contact') || lower.includes('email') || lower.includes('phone') || lower.includes('contacto'))
    return r.contact;
  return r.default;
}

function addKaiMsg(text, from = 'bot') {
  const div = document.createElement('div');
  div.className = `kai-msg ${from}`;
  div.innerHTML = `<div class="kai-msg-bubble">${text}</div>`;
  kaiMsgs.appendChild(div);
  kaiMsgs.scrollTop = kaiMsgs.scrollHeight;
}

kaiBubble?.addEventListener('click', () => {
  kaiOpen = !kaiOpen;
  kaiChat.classList.toggle('open', kaiOpen);
  if (kaiOpen && kaiMsgs.children.length === 0) {
    setTimeout(() => addKaiMsg(KAI_GREETING[currentLang]), 300);
  }
});

kaiClose?.addEventListener('click', () => {
  kaiOpen = false;
  kaiChat.classList.remove('open');
});

function sendKaiMessage() {
  const text = kaiInput.value.trim();
  if (!text) return;
  addKaiMsg(text, 'user');
  kaiInput.value = '';
  setTimeout(() => addKaiMsg(kaiRespond(text)), 600);
}

kaiSend?.addEventListener('click', sendKaiMessage);
kaiInput?.addEventListener('keypress', e => { if (e.key === 'Enter') sendKaiMessage(); });

// ── LANGUAGE TOGGLE ───────────────────────────────────────
window.setLang = function(lang) {
  currentLang = lang;
  document.querySelectorAll('[data-en]').forEach(el => {
    if (lang === 'es' && el.dataset.es) {
      el.innerHTML = el.dataset.es;
    } else {
      el.innerHTML = el.dataset.en;
    }
  });
  document.querySelectorAll('[data-en-placeholder]').forEach(el => {
    el.placeholder = lang === 'es' ? el.dataset.esPlaceholder : el.dataset.enPlaceholder;
  });
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  // Update greeting if chat is open
  if (kaiOpen && kaiMsgs.children.length === 0) {
    addKaiMsg(KAI_GREETING[lang]);
  }
};

// ── ACTIVE NAV on scroll ──────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-links a, .mobile-nav a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 120) current = section.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active-nav', link.getAttribute('href') === `#${current}`);
  });
}, { passive: true });
