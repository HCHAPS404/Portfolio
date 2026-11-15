// Punto único de acceso al contenido. Los textos viven en data/*.json.
import profile from '../data/profile.json';
import experience from '../data/experience.json';
import educationData from '../data/education.json';
import skills from '../data/skills.json';
import projectsData from '../data/projects.json';
import awardsData from '../data/awards.json';

export { profile, experience, skills };
export const education = educationData.education;
export const certificates = educationData.certificates;
export const competitions = projectsData.competencias;
export const projects = projectsData.proyectos;
export const awards = awardsData.awards;

/** Resuelve una ruta de `public/` respetando el `base` de Vite (GitHub Pages). */
export const asset = (path) => `${import.meta.env.BASE_URL}${path}`;

/** Secciones del sitio: orden, ancla y etiqueta de navegación. */
export const sections = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'perfil', label: 'Perfil' },
  { id: 'formacion', label: 'Formación' },
  { id: 'experiencia', label: 'Experiencia' },
  { id: 'habilidades', label: 'Habilidades' },
  { id: 'competencias', label: 'Competencias' },
  { id: 'proyectos', label: 'Proyectos' },
  { id: 'premios', label: 'Premios' },
  { id: 'contacto', label: 'Contacto' },
];
