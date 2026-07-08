/*
 * Portfolio — interactions and i18n.
 * Language follows the browser (Spanish -> es) and falls back to English.
 * The EN/ES switch in the header persists the choice in localStorage.
 */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Optional Formspree endpoint (https://formspree.io/f/xxxx). When empty, the
  // form opens the visitor's mail client pre-addressed to helmut.chs@gmail.com.
  var FORM_ENDPOINT = "";
  var CONTACT_EMAIL = "helmut.chs@gmail.com";

  var translations = {
    en: {
      "meta.title": "Helmut Chaparro Sandoval — Electronics Engineer & Full-Stack Developer",
      "nav.profile": "Profile",
      "nav.education": "Education",
      "nav.domains": "Expertise",
      "nav.skills": "Skills",
      "nav.experience": "Experience",
      "nav.awards": "Awards",
      "nav.projects": "Projects",
      "nav.contact": "Contact",

      "hero.kicker": "Portfolio",
      "hero.role": "Electronics Engineer · Full-Stack Developer · Entrepreneur",
      "hero.r1": "Electronics Engineer",
      "hero.r2": "Full-Stack Developer",
      "hero.r3": "Entrepreneur",
      "hero.r4": "Embedded systems",
      "hero.r5": "PCB designer",
      "hero.r6": "Robotics engineer",
      "hero.r7": "EDGE AI",
      "hero.r8": "AI Engineer",
      "hero.r9": "Data analyst",
      "hero.r10": "Data engineer",
      "hero.r11": "STEM educator",
      "hero.summary": "Six years turning ideas into working systems, from PCB traces and embedded firmware to cloud platforms and edge AI, with impact in education, agriculture and disaster resilience.",
      "hero.cv": "Download CV",
      "hero.available": "Open to work",
      "lang.native": "Native",
      "lang.es": "Spanish",
      "lang.en": "English",
      "lang.fr": "French",
      "lang.zh": "Mandarin",

      "metric.years": "Years of experience",
      "metric.certs": "Certifications",
      "metric.langs": "Languages",
      "metric.hack": "National hackathon",
      "metric.hack_v": "1st place",

      "sec1.title": "Profile",
      "sec1.note": "Who I am",
      "about.lead": "Electronics Engineer and Full-Stack Developer with over six years leading high-impact technological projects. I combine deep expertise in programming (.NET, Python, C/C++), advanced embedded systems (ARM/RTOS), PCB design (EMI/EMC) and FPGA development (Xilinx/Intel) — from enterprise logistics platforms for international trade to Edge AI and neural networks on hardware for aerospace, defense and applied bioengineering.",
      "about.t1": "Company founder",
      "about.t2": "IEEE branch president",
      "about.t3": "Strategic leadership",
      "about.t4": "Technical consulting",
      "fact.location": "Location",
      "fact.phone": "Phone",
      "fact.email": "Email",
      "fact.web": "Website",

      "sec2.title": "Education",
      "sec2.note": "Studies & training",
      "edu.label": "Academic education",
      "edu.d1": "Electronics Engineering",
      "cert.label": "Certifications",
      "cert.pcb": "Professional PCB Design & Assembly",
      "cert.altium": "Altium Global Scholarship Program",
      "cert.esri": "Remote Sensing & Drones",

      "sec3.title": "Fields of expertise",
      "sec3.note": "Technical domains",
      "dom.a": "Embedded systems",
      "dom.b": "Hardware & PCB design",
      "dom.c": "Electrical & power systems",
      "dom.d": "Full-stack & software",
      "dom.e": "Data engineering & analytics",
      "dom.f": "AI & machine learning",
      "dom.g": "Digital design & FPGA",
      "dom.h": "Robotics & automation",
      "dom.i": "Bioengineering",
      "dom.j": "Cloud, DevOps & systems",

      "sec4.title": "Skills & tools",
      "sec4.note": "Daily stack",
      "tools.label": "Everyday tools",
      "soft.label": "Soft skills",
      "soft.s1": "Strategic leadership",
      "soft.s2": "Bilingual communication",
      "soft.s3": "Creative problem-solving",
      "soft.s4": "Analytical thinking",
      "soft.s5": "Multidisciplinary teams",
      "soft.s6": "Data-driven decisions",
      "soft.s7": "Adaptability",
      "soft.s8": "Project management",
      "soft.s9": "Technical mentoring",
      "soft.s10": "Public speaking",
      "soft.s11": "Critical thinking",
      "soft.s12": "Negotiation",
      "soft.s13": "Entrepreneurship",
      "soft.s14": "Teaching & training",
      "soft.s15": "Systems thinking",

      "sec5.title": "Experience",
      "sec5.note": "Professional journey",
      "xpdk.date": "2024 — Present",
      "xpdk.meta": "Founder",
      "xpdk.role": "Founder & General Manager",
      "xpdk.lead": "An education company that turns engineering, science and STEM into hands-on learning experiences.",
      "xpdk.b1": "Founded and lead a company with two years of experience in specialized education in engineering, science and STEM for children, youth, university students and professionals.",
      "xpdk.b2": "Design engineering solutions for educational contexts, from curriculum to hardware and lab equipment.",
      "xpdk.b3": "Grew the team and built a portfolio of courses, kits and lab equipment now used by schools and universities.",
      "xppo.date": "2025 — Present",
      "xppo.meta": "Founder",
      "xppo.role": "Founder & General Manager",
      "xppo.lead": "Engineering brought to Colombian agriculture — automation, sensing and data working in the field.",
      "xppo.b1": "Founded a company delivering agricultural solutions built on engineering across Colombia.",
      "xppo.b2": "Bring automation, electronics and data to the field to improve productivity and decision-making.",
      "xppo.b3": "Design low-cost sensing and monitoring systems adapted to real rural conditions and connectivity.",
      "xp1.date": "May 2024 — Apr 2025",
      "xp1.meta": "Full-time · Remote",
      "xp1.role": "Junior Full-Stack Developer",
      "xp1.lead": "Enterprise software for international trade, customs and logistics operations.",
      "xp1.b1": "Designed .NET solutions for customer management, customs processes, imports, DIAN compliance, logistics and integrations.",
      "xp1.b2": "Built robust solutions for high-volume clients, optimizing international trade workflows with scalability, security and performance.",
      "xp1.b3": "Worked across the full stack — from SQL Server data models to APIs and front-end — in an agile, remote team.",
      "xp2.date": "Jul 2025 — Dec 2025",
      "xp2.meta": "On-site",
      "xp2.role": "Robotics & Electronics Teacher",
      "xp2.lead": "Teaching robotics and embedded AI to help close the STEAM education gap.",
      "xp2.b1": "Led STEAM initiatives focused on reducing the educational gap in public schools, promoting science and technology.",
      "xp2.b2": "Designed specialized courses in robotics, automation and embedded systems with AI, integrated into UCOMPENSAR's curricular projects.",
      "xp2.b3": "Mentored students through hands-on projects, from first circuit to a working autonomous prototype.",
      "xp3.meta": "Full-time · Hybrid",
      "xp3.role": "Software Developer & Educational Robotics Consultant",
      "xp3.lead": "Educational robotics taken from circuit to classroom, ready for the market.",
      "xp3.b1": "Managed educational robotics projects for commercialization to district and educational institutions.",
      "xp3.b2": "Programmed educational robots, developed electronic circuits and provided on-the-job consulting.",
      "xp3.b3": "Bridged engineering and sales, translating technical capabilities into products institutions could adopt.",
      "xp4.date": "Mar 2021 — Nov 2023",
      "xp4.meta": "Full-time · Hybrid",
      "xp4.role": "Engineering & Educational Robotics Consultant",
      "xp4.lead": "Mechatronic prototypes and STEAM programs reaching vulnerable communities nationwide.",
      "xp4.b1": "Led the complete design and development cycle of innovative mechatronic prototypes, implementing STEAM methodology.",
      "xp4.b2": "Applied PCB design, 3D modeling, robotics and programming (Python, C/C++) to solutions for education and vulnerable populations.",
      "xp4.b3": "Delivered training so teachers and communities could sustain the technology on their own.",
      "xp5.date": "Jun 2022 — Present",
      "xp5.meta": "Part-time · Hybrid",
      "xp5.role": "Presidency & Staff Positions",
      "xp5.lead": "Leading student communities across robotics, biomedical and humanitarian technology.",
      "xp5.b1": "Presidential positions in the IEEE student branch, the Robotics and Automation Society, EMBS and the Humanitarian Technologies chapter.",
      "xp5.b2": "Currently president of the RAS, SIGHT and CIS student chapters.",
      "xp5.b3": "Organize technical events, workshops and outreach that connect students with real-world engineering.",

      "sec6.title": "Awards & competitions",
      "sec6.note": "Recognitions",
      "aw1.title": "Early warning system for landslides",
      "aw1.org": "National hackathon — UNGRD × UNDP",
      "aw1.desc": "Winner of the national hackathon organized by Colombia's National Disaster Risk Management Unit (UNGRD) and the United Nations Development Programme (UNDP), designing an early warning system for landslides and mass-movement events.",
      "aw1.flag": "1st place",
      "aw2.desc": "Global scholarship granted by Altium for excellence in professional PCB design.",
      "aw2.flag": "Scholarship",
      "aw3.title": "IEEE presidencies & student chapters",
      "aw3.desc": "Elected president of the IEEE student branch and the RAS, SIGHT and CIS chapters, leading robotics, humanitarian technology and computational intelligence initiatives.",
      "aw3.flag": "Leadership",

      "sec7.title": "Projects",
      "sec7.note": "From the repository",
      "folders.hint": "Drag to browse · hover for quick actions · click to open",
      "folders.open": "Open project",
      "folders.repo": "Repository",
      "folders.wip": "Work in progress",
      "folders.close": "Close",

      "navira.flag": "Winner",
      "navira.desc": "Early warning system for landslides and mass movements. Winner of the UNGRD × UNDP national hackathon.",
      "navira.more": "Built during the national hackathon organized by UNGRD and UNDP. The system pairs low-power sensor nodes with edge inference and an alerting pipeline so communities get early warning of mass-movement events. It took first place among teams from across the country.",
      "wip.desc": "One of my active repositories. The full write-up is on its way.",
      "wip.more": "This project lives in my GitHub. Open the repository to see the code, commits and current progress while I finish documenting it here.",

      "contact.kicker": "Available for projects and roles",
      "contact.title": "Have a problem worth engineering?",
      "contact.sub": "Tell me what you're building. I read every message.",
      "form.name": "Name",
      "form.email": "Email",
      "form.subject": "Subject",
      "form.message": "Message",
      "form.send": "Send message",
      "form.sending": "Sending…",
      "form.invalid": "Please fill in your name, a valid email and a message.",
      "form.mail": "Opening your email app…",
      "form.ok": "Thanks — I'll get back to you soon.",
      "form.error": "Something went wrong. Write me directly at " + CONTACT_EMAIL + ".",
    },

    es: {
      "meta.title": "Helmut Chaparro Sandoval — Ingeniero Electrónico y Desarrollador Full-Stack",
      "nav.profile": "Perfil",
      "nav.education": "Formación",
      "nav.domains": "Afinidad",
      "nav.skills": "Habilidades",
      "nav.experience": "Experiencia",
      "nav.awards": "Premios",
      "nav.projects": "Proyectos",
      "nav.contact": "Contacto",

      "hero.kicker": "Portafolio",
      "hero.role": "Ingeniero Electrónico · Desarrollador Full-Stack · Emprendedor",
      "hero.r1": "Ingeniero Electrónico",
      "hero.r2": "Desarrollador Full-Stack",
      "hero.r3": "Emprendedor",
      "hero.r4": "Sistemas embebidos",
      "hero.r5": "Diseñador de PCB",
      "hero.r6": "Ingeniero en robótica",
      "hero.r7": "EDGE AI",
      "hero.r8": "Ingeniero de IA",
      "hero.r9": "Analista de datos",
      "hero.r10": "Ingeniero de datos",
      "hero.r11": "Educador STEM",
      "hero.summary": "Seis años convirtiendo ideas en sistemas que funcionan, desde trazas de PCB y firmware embebido hasta plataformas en la nube e IA en el borde, con impacto en educación, agro y resiliencia ante desastres.",
      "hero.cv": "Descargar CV",
      "hero.available": "Disponible",
      "lang.native": "Nativo",
      "lang.es": "Español",
      "lang.en": "Inglés",
      "lang.fr": "Francés",
      "lang.zh": "Mandarín",

      "metric.years": "Años de experiencia",
      "metric.certs": "Certificaciones",
      "metric.langs": "Idiomas",
      "metric.hack": "Hackatón nacional",
      "metric.hack_v": "1er puesto",

      "sec1.title": "Perfil",
      "sec1.note": "Quién soy",
      "about.lead": "Ingeniero Electrónico y Desarrollador Full-Stack con más de seis años liderando proyectos tecnológicos de alto impacto. Combino experiencia profunda en programación (.NET, Python, C/C++), sistemas embebidos avanzados (ARM/RTOS), diseño de PCB (EMI/EMC) y desarrollo FPGA (Xilinx/Intel) — desde plataformas logísticas empresariales para comercio internacional hasta Edge AI y redes neuronales en hardware para aeroespacial, defensa y bioingeniería aplicada.",
      "about.t1": "Fundador de empresas",
      "about.t2": "Presidente de rama IEEE",
      "about.t3": "Liderazgo estratégico",
      "about.t4": "Consultoría técnica",
      "fact.location": "Ubicación",
      "fact.phone": "Teléfono",
      "fact.email": "Correo",
      "fact.web": "Sitio web",

      "sec2.title": "Formación",
      "sec2.note": "Estudios y capacitación",
      "edu.label": "Educación académica",
      "edu.d1": "Ingeniería Electrónica",
      "cert.label": "Certificaciones",
      "cert.pcb": "Diseño y Ensamble Profesional de PCB",
      "cert.altium": "Altium Global Scholarship Program",
      "cert.esri": "Teledetección y Drones",

      "sec3.title": "Campos de afinidad",
      "sec3.note": "Dominios técnicos",
      "dom.a": "Sistemas embebidos",
      "dom.b": "Hardware y diseño de PCB",
      "dom.c": "Sistemas eléctricos y potencia",
      "dom.d": "Full-stack y software",
      "dom.e": "Ingeniería y análisis de datos",
      "dom.f": "IA y aprendizaje automático",
      "dom.g": "Diseño digital y FPGA",
      "dom.h": "Robótica y automatización",
      "dom.i": "Bioingeniería",
      "dom.j": "Cloud, DevOps y sistemas",

      "sec4.title": "Habilidades y herramientas",
      "sec4.note": "Stack diario",
      "tools.label": "Herramientas diarias",
      "soft.label": "Habilidades blandas",
      "soft.s1": "Liderazgo estratégico",
      "soft.s2": "Comunicación bilingüe",
      "soft.s3": "Resolución creativa de problemas",
      "soft.s4": "Pensamiento analítico",
      "soft.s5": "Equipos multidisciplinarios",
      "soft.s6": "Decisiones basadas en datos",
      "soft.s7": "Adaptabilidad",
      "soft.s8": "Gestión de proyectos",
      "soft.s9": "Mentoría técnica",
      "soft.s10": "Comunicación pública",
      "soft.s11": "Pensamiento crítico",
      "soft.s12": "Negociación",
      "soft.s13": "Emprendimiento",
      "soft.s14": "Docencia y formación",
      "soft.s15": "Pensamiento sistémico",

      "sec5.title": "Experiencia",
      "sec5.note": "Recorrido profesional",
      "xpdk.date": "2024 — Actualidad",
      "xpdk.meta": "Fundador",
      "xpdk.role": "Fundador y Gerente General",
      "xpdk.lead": "Una empresa de educación que convierte la ingeniería, la ciencia y el STEM en experiencias de aprendizaje prácticas.",
      "xpdk.b1": "Fundé y dirijo una empresa con dos años de trayectoria en educación especializada en ingeniería, ciencias y STEM para niños, jóvenes, universitarios y profesionales.",
      "xpdk.b2": "Diseño soluciones de ingeniería para contextos educativos, desde el currículo hasta el hardware y equipos de laboratorio.",
      "xpdk.b3": "Hice crecer el equipo y construí un portafolio de cursos, kits y equipos de laboratorio usados hoy por colegios y universidades.",
      "xppo.date": "2025 — Actualidad",
      "xppo.meta": "Fundador",
      "xppo.role": "Fundador y Gerente General",
      "xppo.lead": "Ingeniería llevada al agro colombiano — automatización, sensado y datos trabajando en el campo.",
      "xppo.b1": "Fundé una empresa de soluciones agrícolas basadas en ingeniería en Colombia.",
      "xppo.b2": "Llevo automatización, electrónica y datos al campo para mejorar la productividad y la toma de decisiones.",
      "xppo.b3": "Diseño sistemas de sensado y monitoreo de bajo costo adaptados a las condiciones y la conectividad rurales reales.",
      "xp1.date": "May 2024 — Abr 2025",
      "xp1.meta": "Tiempo completo · Remoto",
      "xp1.role": "Desarrollador Full-Stack Junior",
      "xp1.lead": "Software empresarial para comercio internacional, aduanas y operaciones logísticas.",
      "xp1.b1": "Diseñé soluciones .NET para gestión de clientes, procesos aduaneros, importaciones, cumplimiento DIAN, logística e integraciones.",
      "xp1.b2": "Desarrollé soluciones robustas para clientes de alto volumen, optimizando flujos de comercio internacional con escalabilidad, seguridad y rendimiento.",
      "xp1.b3": "Trabajé en todo el stack — desde modelos de datos en SQL Server hasta APIs y front-end — en un equipo ágil y remoto.",
      "xp2.date": "Jul 2025 — Dic 2025",
      "xp2.meta": "Presencial",
      "xp2.role": "Docente de Robótica y Electrónica",
      "xp2.lead": "Enseñar robótica e IA embebida para ayudar a cerrar la brecha educativa en STEAM.",
      "xp2.b1": "Lideré iniciativas STEAM enfocadas en reducir la brecha educativa en instituciones públicas, promoviendo ciencia y tecnología.",
      "xp2.b2": "Diseñé cursos especializados en robótica, automatización y sistemas embebidos con IA, integrados a los proyectos curriculares de UCOMPENSAR.",
      "xp2.b3": "Acompañé a estudiantes en proyectos prácticos, desde el primer circuito hasta un prototipo autónomo funcional.",
      "xp3.meta": "Tiempo completo · Híbrido",
      "xp3.role": "Desarrollador de Software y Consultor en Robótica Educativa",
      "xp3.lead": "Robótica educativa llevada del circuito al aula, lista para el mercado.",
      "xp3.b1": "Gestioné proyectos de robótica educativa para su comercialización a instituciones distritales y educativas.",
      "xp3.b2": "Programé robots educativos, desarrollé circuitos electrónicos y brindé consultoría en sitio.",
      "xp3.b3": "Conecté ingeniería y ventas, traduciendo capacidades técnicas en productos que las instituciones podían adoptar.",
      "xp4.date": "Mar 2021 — Nov 2023",
      "xp4.meta": "Tiempo completo · Híbrido",
      "xp4.role": "Consultor en Ingeniería y Robótica Educativa",
      "xp4.lead": "Prototipos mecatrónicos y programas STEAM que llegaron a comunidades vulnerables en todo el país.",
      "xp4.b1": "Lideré el ciclo completo de diseño y desarrollo de prototipos mecatrónicos innovadores, implementando metodología STEAM.",
      "xp4.b2": "Apliqué diseño de PCB, modelado 3D, robótica y programación (Python, C/C++) en soluciones para educación y poblaciones vulnerables.",
      "xp4.b3": "Brindé formación para que docentes y comunidades pudieran sostener la tecnología por sí mismos.",
      "xp5.date": "Jun 2022 — Actualidad",
      "xp5.meta": "Medio tiempo · Híbrido",
      "xp5.role": "Cargos de Presidencia y Staff",
      "xp5.lead": "Liderar comunidades estudiantiles en robótica, tecnología biomédica y humanitaria.",
      "xp5.b1": "Cargos presidenciales en la rama estudiantil IEEE, la Robotics and Automation Society, EMBS y el capítulo de Tecnologías Humanitarias.",
      "xp5.b2": "Actualmente presido los capítulos estudiantiles RAS, SIGHT y CIS.",
      "xp5.b3": "Organizo eventos técnicos, talleres y actividades que conectan a los estudiantes con la ingeniería real.",

      "sec6.title": "Premios y competencias",
      "sec6.note": "Reconocimientos",
      "aw1.title": "Sistema de alerta temprana para deslizamientos",
      "aw1.org": "Hackatón nacional — UNGRD × PNUD",
      "aw1.desc": "Ganador de la hackatón nacional organizada por la Unidad Nacional para la Gestión del Riesgo de Desastres (UNGRD) y el Programa de las Naciones Unidas para el Desarrollo (PNUD), diseñando un sistema de alerta temprana para derrumbes y deslizamientos.",
      "aw1.flag": "1er puesto",
      "aw2.desc": "Beca global otorgada por Altium por excelencia en diseño profesional de PCB.",
      "aw2.flag": "Beca",
      "aw3.title": "Presidencias IEEE y capítulos estudiantiles",
      "aw3.desc": "Presidente electo de la rama estudiantil IEEE y de los capítulos RAS, SIGHT y CIS, liderando iniciativas de robótica, tecnología humanitaria e inteligencia computacional.",
      "aw3.flag": "Liderazgo",

      "sec7.title": "Proyectos",
      "sec7.note": "Del repositorio",
      "folders.hint": "Arrastra para explorar · pasa el mouse para acciones · haz clic para abrir",
      "folders.open": "Abrir proyecto",
      "folders.repo": "Repositorio",
      "folders.wip": "En desarrollo",
      "folders.close": "Cerrar",

      "navira.flag": "Ganador",
      "navira.desc": "Sistema de alerta temprana para derrumbes y deslizamientos. Ganador de la hackatón nacional UNGRD × PNUD.",
      "navira.more": "Construido durante la hackatón nacional organizada por la UNGRD y el PNUD. El sistema combina nodos de sensores de bajo consumo con inferencia en el borde y una cadena de alertas para dar aviso temprano a las comunidades ante eventos de remoción en masa. Obtuvo el primer puesto entre equipos de todo el país.",
      "wip.desc": "Uno de mis repositorios activos. La descripción completa está en camino.",
      "wip.more": "Este proyecto vive en mi GitHub. Abre el repositorio para ver el código, los commits y el avance actual mientras termino de documentarlo aquí.",

      "contact.kicker": "Disponible para proyectos y vinculación",
      "contact.title": "¿Tienes un problema que valga la pena resolver con ingeniería?",
      "contact.sub": "Cuéntame qué estás construyendo. Leo cada mensaje.",
      "form.name": "Nombre",
      "form.email": "Correo",
      "form.subject": "Asunto",
      "form.message": "Mensaje",
      "form.send": "Enviar mensaje",
      "form.sending": "Enviando…",
      "form.invalid": "Escribe tu nombre, un correo válido y un mensaje.",
      "form.mail": "Abriendo tu aplicación de correo…",
      "form.ok": "Gracias — te responderé pronto.",
      "form.error": "Algo salió mal. Escríbeme directamente a " + CONTACT_EMAIL + ".",
    },
  };

  var lang = "en";

  function t(key) {
    return translations[lang][key] || key;
  }

  function resolveLanguage() {
    var saved = localStorage.getItem("lang");
    if (saved && translations[saved]) return saved;
    var browser = (navigator.language || "en").slice(0, 2).toLowerCase();
    return translations[browser] ? browser : "en";
  }

  function setLanguage(next) {
    lang = next;
    document.documentElement.lang = next;
    document.title = t("meta.title");

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.dataset.i18n);
    });

    document.querySelectorAll(".lang-switch button").forEach(function (btn) {
      btn.classList.toggle("active", btn.dataset.lang === next);
    });

    var close = document.querySelector(".dialog-close");
    if (close) close.setAttribute("aria-label", t("folders.close"));

    if (dialog && dialog.open && openId) fillDialog(openId);
  }

  document.querySelectorAll(".lang-switch button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      localStorage.setItem("lang", btn.dataset.lang);
      setLanguage(btn.dataset.lang);
    });
  });

  // Reveal blocks as they scroll into view
  var reveals = document.querySelectorAll(
    ".sec-header, .hero-text, .hero-photo, .profile-lead, .col-label, .domains-panel, .skills-foot, .formation, .xp, .folder-hint, .contact > *"
  );
  reveals.forEach(function (el) {
    el.classList.add("reveal");
  });

  var revealIO = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealIO.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  reveals.forEach(function (el) {
    revealIO.observe(el);
  });

  // Staggered reveal for grouped items, driven by timeouts so it never fights
  // the hover transitions on the same elements
  function stagger(containerSelector, itemSelector, step) {
    var container = document.querySelector(containerSelector);
    if (!container) return;
    var items = container.querySelectorAll(itemSelector);
    var io = new IntersectionObserver(
      function (entries) {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        items.forEach(function (item, i) {
          setTimeout(function () {
            item.classList.add("in-view");
          }, reduceMotion ? 0 : i * step);
        });
      },
      { threshold: 0.12 }
    );
    io.observe(container);
  }

  stagger(".award-list", ".award-row", 140);
  stagger(".folder-strip", ".folder", 90);
  stagger(".domains", ".domain", 75);
  stagger(".metrics", ".metric", 90);
  stagger(".tag-row", "li", 70);
  stagger(".facts", ".fact", 80);
  stagger(".edu-list", "li", 100);
  stagger(".cert-grid", ".cert-card", 60);

  // Staggered reveal for chip clouds (there can be several on the page)
  function staggerNodes(container, items, step) {
    if (!container || !items.length) return;
    var io = new IntersectionObserver(
      function (entries) {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        items.forEach(function (item, i) {
          setTimeout(function () {
            item.classList.add("in-view");
          }, reduceMotion ? 0 : i * step);
        });
      },
      { threshold: 0.12 }
    );
    io.observe(container);
  }

  document.querySelectorAll(".chip-cloud").forEach(function (cloud) {
    staggerNodes(cloud, cloud.querySelectorAll("li"), 55);
  });

  // Copy to clipboard for contact facts
  var copyLabel = { en: "Copied", es: "Copiado" };
  document.querySelectorAll(".copyable").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var value = btn.getAttribute("data-copy") || btn.textContent.trim();
      var done = function () {
        btn.setAttribute("data-hint", copyLabel[lang] || copyLabel.en);
        btn.classList.add("copied");
        setTimeout(function () {
          btn.classList.remove("copied");
        }, 1400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(done, done);
      } else {
        done();
      }
    });
  });

  // Active section in the nav
  var navLinks = document.querySelectorAll(".site-nav a");
  var navIO = new IntersectionObserver(
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
  document.querySelectorAll("section[id]").forEach(function (s) {
    navIO.observe(s);
  });

  // Count-up metrics, zero-padded for the technical look
  function countUp(el) {
    var target = parseInt(el.dataset.count, 10);
    var pad = parseInt(el.dataset.pad, 10) || 0;
    var render = function (v) {
      el.textContent = String(v).padStart(pad, "0");
    };
    if (reduceMotion) {
      render(target);
      return;
    }
    var duration = 1200;
    var start = performance.now();
    (function tick(now) {
      var p = Math.min((now - start) / duration, 1);
      render(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }

  var countIO = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          countUp(entry.target);
          countIO.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll("[data-count]").forEach(function (el) {
    countIO.observe(el);
  });

  // --- Project folders ---

  var repo = "https://github.com/HCHAPS404/";

  var projects = {
    navira: { no: "01", name: "NAVIRA-SATViRe", meta: "2026 · IoT · Edge AI · Embedded", url: repo + "NAVIRA-SATViRe", desc: "navira.desc", more: "navira.more" },
    statum: { no: "02", name: "STATUM", url: repo + "STATUM", desc: "wip.desc", more: "wip.more" },
    inzerm: { no: "03", name: "INZERM", url: repo + "INZERM", desc: "wip.desc", more: "wip.more" },
    nuren: { no: "04", name: "NUREN", url: repo + "NUREN", desc: "wip.desc", more: "wip.more" },
    prora: { no: "05", name: "PRORA", url: repo + "PRORA", desc: "wip.desc", more: "wip.more" },
    soul: { no: "06", name: "SOUL", url: repo + "SOUL", desc: "wip.desc", more: "wip.more" },
    verik: { no: "07", name: "VERIK", url: repo + "VERIK", desc: "wip.desc", more: "wip.more" },
    vak: { no: "08", name: "VAK", url: repo + "VAK", desc: "wip.desc", more: "wip.more" },
    niru: { no: "09", name: "NIRU", url: repo + "NIRU", desc: "wip.desc", more: "wip.more" },
    protobot: { no: "10", name: "PROTOBOT", url: repo + "PROTOBOT", desc: "wip.desc", more: "wip.more" },
    redact: { no: "11", name: "REDACT", url: repo + "REDACT", desc: "wip.desc", more: "wip.more" },
    voxlu: { no: "12", name: "VOXLU", url: repo + "VOXLU", desc: "wip.desc", more: "wip.more" },
  };

  var dialog = document.querySelector(".project-dialog");
  var openId = null;
  var returnFocusTo = null;

  function fillDialog(id) {
    var p = projects[id];
    dialog.querySelector(".dialog-no").textContent = p.no + " · REPO";
    dialog.querySelector(".dialog-title").textContent = p.name;
    dialog.querySelector(".dialog-meta").textContent = p.meta || "github.com/HCHAPS404/" + p.name;
    dialog.querySelector(".dialog-desc").textContent = t(p.desc);
    dialog.querySelector(".dialog-more").textContent = t(p.more);

    var links = dialog.querySelector(".dialog-links");
    links.innerHTML = "";
    var a = document.createElement("a");
    a.href = p.url;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = t("folders.repo");
    links.appendChild(a);
  }

  function openDialog(id, opener) {
    if (!projects[id] || !dialog) return;
    openId = id;
    returnFocusTo = opener || null;
    fillDialog(id);
    dialog.showModal();
  }

  if (dialog) {
    dialog.querySelector(".dialog-close").addEventListener("click", function () {
      dialog.close();
    });
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", function () {
      openId = null;
      if (returnFocusTo) returnFocusTo.focus();
    });
  }

  // Drag-to-scroll the folder strip. A real drag must not fire a click.
  var strip = document.querySelector(".folder-strip");
  var down = false;
  var moved = false;
  var startX = 0;
  var startScroll = 0;

  if (strip) {
    strip.addEventListener("pointerdown", function (e) {
      down = true;
      moved = false;
      startX = e.clientX;
      startScroll = strip.scrollLeft;
    });
    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 6) {
        moved = true;
        strip.classList.add("dragging");
      }
      strip.scrollLeft = startScroll - dx;
    });
    window.addEventListener("pointerup", function () {
      down = false;
      strip.classList.remove("dragging");
    });
  }

  document.querySelectorAll(".folder").forEach(function (folder) {
    var id = folder.dataset.project;
    folder.addEventListener("click", function (e) {
      if (moved || e.target.closest("a")) return;
      openDialog(id, folder);
    });
    folder.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openDialog(id, folder);
      }
    });
  });

  // --- Contact form ---

  var form = document.getElementById("contact-form");
  var note = document.getElementById("form-note");

  function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function say(message, tone) {
    note.textContent = message;
    note.dataset.tone = tone || "";
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var subject = form.subject.value.trim();
      var message = form.message.value.trim();

      if (!name || !isEmail(email) || !message) {
        say(t("form.invalid"), "error");
        return;
      }

      var fullSubject = subject || "Portfolio — " + name;

      if (FORM_ENDPOINT) {
        say(t("form.sending"), "");
        fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({ name: name, email: email, subject: fullSubject, message: message }),
        })
          .then(function (res) {
            if (!res.ok) throw new Error("bad response");
            form.reset();
            say(t("form.ok"), "ok");
          })
          .catch(function () {
            say(t("form.error"), "error");
          });
        return;
      }

      // No backend configured: hand off to the visitor's mail client.
      var body = message + "\n\n— " + name + " (" + email + ")";
      var mailto =
        "mailto:" + CONTACT_EMAIL +
        "?subject=" + encodeURIComponent(fullSubject) +
        "&body=" + encodeURIComponent(body);
      window.location.href = mailto;
      say(t("form.mail"), "ok");
    });
  }

  setLanguage(resolveLanguage());
})();
