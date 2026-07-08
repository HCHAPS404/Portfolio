/*
 * Portfolio — interactions and i18n.
 * Language: follows the browser (Spanish -> es), falls back to English.
 * The manual switch in the header persists the choice in localStorage.
 */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var translations = {
    en: {
      "meta.title": "Helmut Chaparro Sandoval — Electronics Engineer & Full-Stack Developer",
      "nav.profile": "Profile",
      "nav.education": "Education",
      "nav.skills": "Skills",
      "nav.experience": "Experience",
      "nav.awards": "Awards",
      "nav.projects": "Projects",
      "nav.contact": "Contact",

      "hero.kicker": "Portfolio",
      "hero.role": "Electronics Engineer · Full-Stack Developer",
      "hero.summary": "Six years building technology from the circuit to the cloud — embedded systems, PCB design, enterprise platforms and AI on hardware, applied to problems that matter.",
      "hero.cv": "Download CV",
      "hero.available": "Open to work",

      "metric.years": "Years of experience",
      "metric.certs": "Certifications",
      "metric.langs": "Languages",
      "metric.hack": "National hackathon",
      "metric.hack_v": "1st place",

      "sec1.title": "Profile",
      "sec1.note": "Who I am",
      "about.lead": "Electronics Engineer and Full-Stack Developer with over six years leading high-impact technological projects. I combine deep expertise in programming (.NET, Python, C/C++), advanced embedded systems (ARM/RTOS), PCB design (EMI/EMC) and FPGA development (Xilinx/Intel) — from enterprise logistics platforms for international trade to Edge AI and neural networks on hardware for aerospace, defense and applied bioengineering.",
      "about.t1": "Strategic leadership",
      "about.t2": "IEEE branch president",
      "about.t3": "Agile methodologies",
      "about.t4": "Technical consulting",
      "fact.location": "Location",
      "fact.phone": "Phone",
      "fact.email": "Email",
      "fact.web": "Website",

      "sec2.title": "Education & languages",
      "sec2.note": "Studies, training, languages",
      "edu.label": "Education",
      "edu.d1": "Electronics Engineering",
      "edu.d2": "Professional PCB Design & Assembly",
      "cert.label": "Certifications",
      "cert.esri": "Remote Sensing & Drones",
      "lang.label": "Languages",
      "lang.es": "Spanish",
      "lang.en": "English",
      "lang.fr": "French",
      "lang.zh": "Mandarin",
      "lang.native": "Native",

      "sec3.title": "Skills & tools",
      "sec3.note": "What I work with",
      "dom.a": "Embedded systems",
      "dom.b": "Hardware & PCB design",
      "dom.c": "Full-stack development",
      "dom.d": "Data & AI",
      "dom.e": "Digital design & robotics",
      "tools.label": "Everyday tools",
      "soft.label": "Soft skills",
      "soft.s1": "Strategic leadership",
      "soft.s2": "Bilingual communication",
      "soft.s3": "Creative problem-solving",
      "soft.s4": "Analytical thinking",
      "soft.s5": "Multidisciplinary teams",
      "soft.s6": "Data-driven decisions",
      "soft.s7": "Adaptability",

      "sec4.title": "Experience",
      "sec4.note": "Professional journey",
      "xp1.date": "May 2024 — Apr 2025",
      "xp1.meta": "Full-time · Remote",
      "xp1.role": "Junior Full-Stack Developer",
      "xp1.b1": "Designed .NET solutions for customer management, customs processes, imports, DIAN compliance, logistics and integrations.",
      "xp1.b2": "Built robust solutions for high-volume clients, optimizing international trade workflows with scalability, security and performance.",
      "xp2.date": "Jul 2025 — Dec 2025",
      "xp2.meta": "On-site",
      "xp2.role": "Robotics & Electronics Teacher",
      "xp2.b1": "Led STEAM initiatives focused on reducing the educational gap in public schools, promoting science and technology.",
      "xp2.b2": "Designed specialized courses in robotics, automation and embedded systems with AI, integrated into UCOMPENSAR's curricular projects.",
      "xp3.meta": "Full-time · Hybrid",
      "xp3.role": "Software Developer & Educational Robotics Consultant",
      "xp3.b1": "Managed educational robotics projects for commercialization to district and educational institutions.",
      "xp3.b2": "Programmed educational robots, developed electronic circuits and provided on-the-job consulting.",
      "xp4.date": "Mar 2021 — Nov 2023",
      "xp4.meta": "Full-time · Hybrid",
      "xp4.role": "Engineering & Educational Robotics Consultant",
      "xp4.b1": "Led the complete design and development cycle of innovative mechatronic prototypes, implementing STEAM methodology.",
      "xp4.b2": "Applied PCB design, 3D modeling, robotics and programming (Python, C/C++) to solutions for education and vulnerable populations.",
      "xp5.date": "Jun 2022 — Present",
      "xp5.meta": "Part-time · Hybrid",
      "xp5.role": "Presidency & Staff Positions",
      "xp5.b1": "Presidential positions in the IEEE student branch, the Robotics and Automation Society, EMBS and the Humanitarian Technologies chapter.",
      "xp5.b2": "Currently president of the RAS, SIGHT and CIS student chapters.",

      "sec5.title": "Awards & competitions",
      "sec5.note": "Recognitions",
      "aw1.title": "Early warning system for landslides",
      "aw1.org": "National hackathon — UNGRD × UNDP",
      "aw1.desc": "Winner of the national hackathon organized by Colombia's National Disaster Risk Management Unit (UNGRD) and the United Nations Development Programme (UNDP), designing an early warning system for landslides and mass-movement events.",
      "aw1.flag": "1st place",
      "aw2.desc": "Global scholarship granted by Altium for excellence in professional PCB design.",
      "aw2.flag": "Scholarship",
      "aw3.title": "IEEE presidencies & student chapters",
      "aw3.desc": "Elected president of the IEEE student branch and the RAS, SIGHT and CIS chapters, leading robotics, humanitarian technology and computational intelligence initiatives.",
      "aw3.flag": "Leadership",

      "sec6.title": "Projects",
      "sec6.note": "From the repository",
      "folders.hint": "Drag to browse · hover for quick actions · click to open",
      "folders.open": "Open project",
      "folders.repo": "Repository",
      "folders.close": "Close",

      "p1.title": "Landslide early warning system",
      "p1.flag": "Winner",
      "p1.desc": "Early warning system for landslides and mass movements. Winner of the UNGRD × UNDP national hackathon.",
      "p1.more": "Designed during the national hackathon organized by UNGRD and UNDP. The system combines low-power sensor nodes, edge inference and an alert pipeline to give communities early warning of mass-movement events. First place among teams from across the country.",
      "p2.title": "International trade logistics platform",
      "p2.desc": "Enterprise .NET solutions for customs, imports, DIAN compliance and logistics at scale.",
      "p2.more": "Enterprise platform supporting customs operations, imports and DIAN compliance for high-volume international trade clients — built with .NET, C# and SQL Server, focused on scalability, security and performance.",
      "p3.title": "Edge AI on hardware",
      "p3.desc": "Neural networks deployed on FPGA and embedded hardware for aerospace, defense and bioengineering.",
      "p3.more": "Neural networks deployed directly on FPGAs and embedded targets for aerospace, defense and bioengineering applications, optimizing models to run within tight power and latency budgets.",
      "p4.title": "Educational robotics prototypes",
      "p4.desc": "Mechatronic prototypes and STEAM solutions for education programs across the country.",
      "p4.more": "Mechatronic prototypes for Computadores para Educar and the Ministry of Education: PCB design, 3D modeling and programming applied to STEAM education for vulnerable populations.",
      "p5.title": "Personal portfolio",
      "p5.desc": "This site — a dependency-free portfolio built with plain HTML, CSS and JavaScript.",
      "p5.more": "Custom internationalization, scroll-driven animations and an interactive folder-based project browser, with no frameworks and no build step.",

      "contact.kicker": "Available for projects and roles",
      "contact.title": "Let's build something real.",
    },

    es: {
      "meta.title": "Helmut Chaparro Sandoval — Ingeniero Electrónico y Desarrollador Full-Stack",
      "nav.profile": "Perfil",
      "nav.education": "Formación",
      "nav.skills": "Habilidades",
      "nav.experience": "Experiencia",
      "nav.awards": "Premios",
      "nav.projects": "Proyectos",
      "nav.contact": "Contacto",

      "hero.kicker": "Portafolio",
      "hero.role": "Ingeniero Electrónico · Desarrollador Full-Stack",
      "hero.summary": "Seis años construyendo tecnología del circuito a la nube: sistemas embebidos, diseño de PCB, plataformas empresariales e IA en hardware, aplicados a problemas que importan.",
      "hero.cv": "Descargar CV",
      "hero.available": "Disponible",

      "metric.years": "Años de experiencia",
      "metric.certs": "Certificaciones",
      "metric.langs": "Idiomas",
      "metric.hack": "Hackatón nacional",
      "metric.hack_v": "1er puesto",

      "sec1.title": "Perfil",
      "sec1.note": "Quién soy",
      "about.lead": "Ingeniero Electrónico y Desarrollador Full-Stack con más de seis años liderando proyectos tecnológicos de alto impacto. Combino experiencia profunda en programación (.NET, Python, C/C++), sistemas embebidos avanzados (ARM/RTOS), diseño de PCB (EMI/EMC) y desarrollo FPGA (Xilinx/Intel) — desde plataformas logísticas empresariales para comercio internacional hasta Edge AI y redes neuronales en hardware para aeroespacial, defensa y bioingeniería aplicada.",
      "about.t1": "Liderazgo estratégico",
      "about.t2": "Presidente de rama IEEE",
      "about.t3": "Metodologías ágiles",
      "about.t4": "Consultoría técnica",
      "fact.location": "Ubicación",
      "fact.phone": "Teléfono",
      "fact.email": "Correo",
      "fact.web": "Sitio web",

      "sec2.title": "Formación e idiomas",
      "sec2.note": "Estudios, capacitación, idiomas",
      "edu.label": "Estudios",
      "edu.d1": "Ingeniería Electrónica",
      "edu.d2": "Diseño y Ensamble Profesional de PCB",
      "cert.label": "Certificaciones",
      "cert.esri": "Teledetección y Drones",
      "lang.label": "Idiomas",
      "lang.es": "Español",
      "lang.en": "Inglés",
      "lang.fr": "Francés",
      "lang.zh": "Mandarín",
      "lang.native": "Nativo",

      "sec3.title": "Habilidades y herramientas",
      "sec3.note": "Con qué trabajo",
      "dom.a": "Sistemas embebidos",
      "dom.b": "Hardware y diseño de PCB",
      "dom.c": "Desarrollo full-stack",
      "dom.d": "Datos e IA",
      "dom.e": "Diseño digital y robótica",
      "tools.label": "Herramientas diarias",
      "soft.label": "Habilidades blandas",
      "soft.s1": "Liderazgo estratégico",
      "soft.s2": "Comunicación bilingüe",
      "soft.s3": "Resolución creativa de problemas",
      "soft.s4": "Pensamiento analítico",
      "soft.s5": "Equipos multidisciplinarios",
      "soft.s6": "Decisiones basadas en datos",
      "soft.s7": "Adaptabilidad",

      "sec4.title": "Experiencia",
      "sec4.note": "Recorrido profesional",
      "xp1.date": "May 2024 — Abr 2025",
      "xp1.meta": "Tiempo completo · Remoto",
      "xp1.role": "Desarrollador Full-Stack Junior",
      "xp1.b1": "Diseñé soluciones .NET para gestión de clientes, procesos aduaneros, importaciones, cumplimiento DIAN, logística e integraciones.",
      "xp1.b2": "Desarrollé soluciones robustas para clientes de alto volumen, optimizando flujos de comercio internacional con escalabilidad, seguridad y rendimiento.",
      "xp2.date": "Jul 2025 — Dic 2025",
      "xp2.meta": "Presencial",
      "xp2.role": "Docente de Robótica y Electrónica",
      "xp2.b1": "Lideré iniciativas STEAM enfocadas en reducir la brecha educativa en instituciones públicas, promoviendo ciencia y tecnología.",
      "xp2.b2": "Diseñé cursos especializados en robótica, automatización y sistemas embebidos con IA, integrados a los proyectos curriculares de UCOMPENSAR.",
      "xp3.meta": "Tiempo completo · Híbrido",
      "xp3.role": "Desarrollador de Software y Consultor en Robótica Educativa",
      "xp3.b1": "Gestioné proyectos de robótica educativa para su comercialización a instituciones distritales y educativas.",
      "xp3.b2": "Programé robots educativos, desarrollé circuitos electrónicos y brindé consultoría en sitio.",
      "xp4.date": "Mar 2021 — Nov 2023",
      "xp4.meta": "Tiempo completo · Híbrido",
      "xp4.role": "Consultor en Ingeniería y Robótica Educativa",
      "xp4.b1": "Lideré el ciclo completo de diseño y desarrollo de prototipos mecatrónicos innovadores, implementando metodología STEAM.",
      "xp4.b2": "Apliqué diseño de PCB, modelado 3D, robótica y programación (Python, C/C++) en soluciones para educación y poblaciones vulnerables.",
      "xp5.date": "Jun 2022 — Actualidad",
      "xp5.meta": "Medio tiempo · Híbrido",
      "xp5.role": "Cargos de Presidencia y Staff",
      "xp5.b1": "Cargos presidenciales en la rama estudiantil IEEE, la Robotics and Automation Society, EMBS y el capítulo de Tecnologías Humanitarias.",
      "xp5.b2": "Actualmente presido los capítulos estudiantiles RAS, SIGHT y CIS.",

      "sec5.title": "Premios y competencias",
      "sec5.note": "Reconocimientos",
      "aw1.title": "Sistema de alerta temprana para deslizamientos",
      "aw1.org": "Hackatón nacional — UNGRD × PNUD",
      "aw1.desc": "Ganador de la hackatón nacional organizada por la Unidad Nacional para la Gestión del Riesgo de Desastres (UNGRD) y el Programa de las Naciones Unidas para el Desarrollo (PNUD), diseñando un sistema de alerta temprana para derrumbes y deslizamientos.",
      "aw1.flag": "1er puesto",
      "aw2.desc": "Beca global otorgada por Altium por excelencia en diseño profesional de PCB.",
      "aw2.flag": "Beca",
      "aw3.title": "Presidencias IEEE y capítulos estudiantiles",
      "aw3.desc": "Presidente electo de la rama estudiantil IEEE y de los capítulos RAS, SIGHT y CIS, liderando iniciativas de robótica, tecnología humanitaria e inteligencia computacional.",
      "aw3.flag": "Liderazgo",

      "sec6.title": "Proyectos",
      "sec6.note": "Del repositorio",
      "folders.hint": "Arrastra para explorar · pasa el mouse para acciones · haz clic para abrir",
      "folders.open": "Abrir proyecto",
      "folders.repo": "Repositorio",
      "folders.close": "Cerrar",

      "p1.title": "Sistema de alerta temprana de deslizamientos",
      "p1.flag": "Ganador",
      "p1.desc": "Sistema de alerta temprana para derrumbes y deslizamientos. Ganador de la hackatón nacional UNGRD × PNUD.",
      "p1.more": "Diseñado durante la hackatón nacional organizada por la UNGRD y el PNUD. El sistema combina nodos de sensores de bajo consumo, inferencia en el borde y una cadena de alertas para dar aviso temprano a las comunidades ante eventos de remoción en masa. Primer puesto entre equipos de todo el país.",
      "p2.title": "Plataforma logística de comercio internacional",
      "p2.desc": "Soluciones empresariales .NET para aduanas, importaciones, cumplimiento DIAN y logística a escala.",
      "p2.more": "Plataforma empresarial que soporta operaciones aduaneras, importaciones y cumplimiento DIAN para clientes de comercio internacional de alto volumen — construida con .NET, C# y SQL Server, enfocada en escalabilidad, seguridad y rendimiento.",
      "p3.title": "Edge AI en hardware",
      "p3.desc": "Redes neuronales desplegadas en FPGA y hardware embebido para aeroespacial, defensa y bioingeniería.",
      "p3.more": "Redes neuronales desplegadas directamente en FPGAs y plataformas embebidas para aplicaciones aeroespaciales, de defensa y bioingeniería, optimizando los modelos para presupuestos estrictos de potencia y latencia.",
      "p4.title": "Prototipos de robótica educativa",
      "p4.desc": "Prototipos mecatrónicos y soluciones STEAM para programas educativos en todo el país.",
      "p4.more": "Prototipos mecatrónicos para Computadores para Educar y el Ministerio de Educación: diseño de PCB, modelado 3D y programación aplicados a educación STEAM para poblaciones vulnerables.",
      "p5.title": "Portafolio personal",
      "p5.desc": "Este sitio — un portafolio sin dependencias construido con HTML, CSS y JavaScript puros.",
      "p5.more": "Internacionalización propia, animaciones al hacer scroll y un explorador de proyectos con carpetas interactivas, sin frameworks ni proceso de build.",

      "contact.kicker": "Disponible para proyectos y vinculación",
      "contact.title": "Construyamos algo real.",
    },
  };

  var currentLang = "en";

  function resolveLanguage() {
    var saved = localStorage.getItem("lang");
    if (saved && translations[saved]) return saved;
    var browser = (navigator.language || "en").slice(0, 2).toLowerCase();
    return translations[browser] ? browser : "en";
  }

  function setLanguage(lang) {
    currentLang = lang;
    var dict = translations[lang];
    document.documentElement.lang = lang;
    document.title = dict["meta.title"];

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var value = dict[el.dataset.i18n];
      if (value) el.textContent = value;
    });

    document.querySelectorAll(".lang-switch button").forEach(function (btn) {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });

    var closeBtn = document.querySelector(".dialog-close");
    if (closeBtn) closeBtn.setAttribute("aria-label", dict["folders.close"]);

    if (dialog && dialog.open && openProjectId) fillDialog(openProjectId);
  }

  document.querySelectorAll(".lang-switch button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      localStorage.setItem("lang", btn.dataset.lang);
      setLanguage(btn.dataset.lang);
    });
  });

  // Language level dots (5-step scale)
  document.querySelectorAll(".dots").forEach(function (el) {
    var level = parseInt(el.dataset.level, 10) || 0;
    for (var i = 0; i < 5; i++) {
      var dot = document.createElement("i");
      if (i < level) dot.className = "on";
      el.appendChild(dot);
    }
  });

  // Fade-in blocks as they enter the viewport
  var revealTargets = document.querySelectorAll(
    ".sec-header, .hero-text, .hero-photo, .metrics, .profile-lead, .facts, .edu-col, .domain, .skills-foot, .xp, .folder-hint, .contact > *"
  );

  revealTargets.forEach(function (el) {
    el.classList.add("reveal");
  });

  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  revealTargets.forEach(function (el) {
    revealObserver.observe(el);
  });

  // Staggered reveal for grouped items (award rows, project folders).
  // Delays are applied with timeouts so they never interfere with hover transitions.
  function staggerReveal(containerSelector, itemSelector, step) {
    var container = document.querySelector(containerSelector);
    if (!container) return;

    var items = container.querySelectorAll(itemSelector);

    var observer = new IntersectionObserver(
      function (entries) {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        items.forEach(function (item, i) {
          var delay = prefersReducedMotion ? 0 : i * step;
          setTimeout(function () {
            item.classList.add("in-view");
          }, delay);
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(container);
  }

  staggerReveal(".award-list", ".award-row", 140);
  staggerReveal(".folder-strip", ".folder", 110);

  // Highlight the section currently in view
  var navLinks = document.querySelectorAll(".site-nav a");

  var sectionObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var href = "#" + entry.target.id;
        navLinks.forEach(function (link) {
          link.classList.toggle("active", link.getAttribute("href") === href);
        });
      });
    },
    { rootMargin: "-30% 0px -60% 0px" }
  );

  document.querySelectorAll("section[id]").forEach(function (section) {
    sectionObserver.observe(section);
  });

  // Count-up metrics, padded to keep the technical look (06, 10, 04)
  function countUp(el) {
    var target = parseInt(el.dataset.count, 10);
    var pad = parseInt(el.dataset.pad, 10) || 0;

    function format(value) {
      return String(value).padStart(pad, "0");
    }

    if (prefersReducedMotion) {
      el.textContent = format(target);
      return;
    }

    var duration = 1200;
    var start = performance.now();

    function tick(now) {
      var progress = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = format(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  var countObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          countUp(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  document.querySelectorAll("[data-count]").forEach(function (el) {
    countObserver.observe(el);
  });

  // --- Project folders ---

  var projectData = {
    p1: { no: "P-01", year: "2026", stack: "IoT · Edge AI · Embedded", repo: "https://github.com/HCHAPS404" },
    p2: { no: "P-02", year: "2024 — 2025", stack: ".NET · C# · SQL Server", repo: "https://github.com/HCHAPS404" },
    p3: { no: "P-03", year: "2025", stack: "FPGA · Python · ARM", repo: "https://github.com/HCHAPS404" },
    p4: { no: "P-04", year: "2021 — 2023", stack: "PCB · 3D · Python · C/C++", repo: "https://github.com/HCHAPS404" },
    p5: { no: "P-05", year: "2026", stack: "HTML · CSS · JavaScript", repo: "https://github.com/HCHAPS404/Portfolio" },
  };

  var dialog = document.querySelector(".project-dialog");
  var openProjectId = null;
  var lastFocused = null;

  function fillDialog(id) {
    var data = projectData[id];
    var dict = translations[currentLang];

    dialog.querySelector(".dialog-no").textContent = data.no;
    dialog.querySelector(".dialog-title").textContent = dict[id + ".title"];
    dialog.querySelector(".dialog-meta").textContent = data.year + " · " + data.stack;
    dialog.querySelector(".dialog-desc").textContent = dict[id + ".desc"];
    dialog.querySelector(".dialog-more").textContent = dict[id + ".more"];

    var links = dialog.querySelector(".dialog-links");
    links.innerHTML = "";
    var repo = document.createElement("a");
    repo.href = data.repo;
    repo.target = "_blank";
    repo.rel = "noopener";
    repo.textContent = dict["folders.repo"];
    links.appendChild(repo);
  }

  function openDialog(id, opener) {
    openProjectId = id;
    lastFocused = opener || null;
    fillDialog(id);
    dialog.showModal();
  }

  if (dialog) {
    dialog.querySelector(".dialog-close").addEventListener("click", function () {
      dialog.close();
    });

    // Close when clicking the backdrop
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) dialog.close();
    });

    dialog.addEventListener("close", function () {
      openProjectId = null;
      if (lastFocused) lastFocused.focus();
    });
  }

  // Drag-to-scroll for the folder strip; a real drag must not trigger a click
  var strip = document.querySelector(".folder-strip");
  var dragging = false;
  var dragMoved = false;
  var dragStartX = 0;
  var dragStartScroll = 0;

  if (strip) {
    strip.addEventListener("pointerdown", function (e) {
      dragging = true;
      dragMoved = false;
      dragStartX = e.clientX;
      dragStartScroll = strip.scrollLeft;
    });

    window.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - dragStartX;
      if (Math.abs(dx) > 6) {
        dragMoved = true;
        strip.classList.add("dragging");
      }
      strip.scrollLeft = dragStartScroll - dx;
    });

    window.addEventListener("pointerup", function () {
      dragging = false;
      strip.classList.remove("dragging");
    });
  }

  document.querySelectorAll(".folder").forEach(function (folder) {
    var id = folder.dataset.project;

    folder.addEventListener("click", function (e) {
      if (dragMoved) return;
      if (e.target.closest("a")) return;
      openDialog(id, folder);
    });

    folder.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openDialog(id, folder);
      }
    });
  });

  setLanguage(resolveLanguage());
})();
