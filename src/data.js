// Punto único de acceso al contenido. El texto base (español) vive en data/*.json y
// cada idioma lo sobrescribe desde src/i18n/locales. Llamar a `initData()` una vez,
// después de `setupLang()`, y antes de pintar nada.
import profileBase from '../data/profile.json';
import experienceBase from '../data/experience.json';
import educationBase from '../data/education.json';
import skillsBase from '../data/skills.json';
import projectsBase from '../data/projects.json';
import awardsBase from '../data/awards.json';
import { localize, t } from './i18n/index.js';

export let profile;
export let experience;
export let skills;
export let education;
export let certificates;
export let competitions;
export let projects;
export let awards;
export let sections;

/** Iniciales de la marca, tomadas del nombre en el idioma elegido. */
export let initials;

const SECTION_DEFS = [
  { id: 'inicio', key: 'nav.home' },
  { id: 'perfil', key: 'nav.profile' },
  { id: 'formacion', key: 'nav.education' },
  { id: 'experiencia', key: 'nav.experience' },
  { id: 'habilidades', key: 'nav.skills' },
  { id: 'competencias', key: 'nav.competitions' },
  { id: 'proyectos', key: 'nav.projects' },
  { id: 'premios', key: 'nav.awards' },
  { id: 'contacto', key: 'nav.contact' },
];

export function initData() {
  profile = localize(profileBase, 'profile');
  initials = profile.name
    .split(/[\s·・]+/)
    .map((w) => [...w][0])
    .join('');
  experience = localize(experienceBase, 'experience');
  skills = localize(skillsBase, 'skills');
  const edu = localize(educationBase, 'education');
  education = edu.education;
  certificates = edu.certificates;
  const proj = localize(projectsBase, 'projects');
  competitions = proj.competencias;
  projects = proj.proyectos;
  awards = localize(awardsBase, 'awards').awards;
  sections = SECTION_DEFS.map((s) => ({ id: s.id, label: t(s.key) }));
}

/** Resuelve una ruta de `public/` respetando el `base` de Vite (GitHub Pages). */
export const asset = (path) => `${import.meta.env.BASE_URL}${path}`;
