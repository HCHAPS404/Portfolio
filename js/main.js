/* ============================================================
   PORTAFOLIO · Interacciones
   - Animación de aparición al hacer scroll (IntersectionObserver)
   - Dot-nav activo según sección visible
   - Contadores animados
   - Efecto máquina de escribir en el rol
   ============================================================ */

// ---------- Aparición al hacer scroll ----------
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".reveal, .card, .stat").forEach((el) => {
  revealObserver.observe(el);
});

// ---------- Dot-nav activo ----------
const sections = document.querySelectorAll("section.stage");
const dots = document.querySelectorAll(".dot-nav .dot");

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        dots.forEach((dot) => {
          dot.classList.toggle("active", dot.getAttribute("href") === `#${id}`);
        });
      }
    });
  },
  { threshold: 0.5 }
);

sections.forEach((section) => sectionObserver.observe(section));

// ---------- Contadores animados ----------
function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const duration = 1600;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    // easing out-cubic para frenar suave al final
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(target * eased);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.6 }
);

document.querySelectorAll(".stat-num").forEach((el) => countObserver.observe(el));

// ---------- Efecto máquina de escribir ----------
const roles = [
  "Desarrollador Full Stack",
  "Diseñador de Interfaces",
  "Creador de Soluciones",
  "Apasionado por la Tecnología",
];

const typedEl = document.getElementById("typed-role");
let roleIndex = 0;
let charIndex = 0;
let deleting = false;

function typeLoop() {
  const current = roles[roleIndex];

  if (deleting) {
    charIndex--;
  } else {
    charIndex++;
  }

  typedEl.textContent = current.slice(0, charIndex);

  let delay = deleting ? 40 : 85;

  if (!deleting && charIndex === current.length) {
    delay = 2200; // pausa con la frase completa
    deleting = true;
  } else if (deleting && charIndex === 0) {
    deleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    delay = 400;
  }

  setTimeout(typeLoop, delay);
}

if (typedEl && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  typedEl.textContent = "";
  setTimeout(typeLoop, 800);
}
