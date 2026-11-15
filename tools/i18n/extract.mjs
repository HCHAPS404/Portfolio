// Genera docs/i18n/source.es.json: la plantilla que se traduce a cada idioma.
// Contiene solo los campos de texto traducibles, con la misma forma que los datos.
import { readFileSync, writeFileSync } from 'node:fs';

const read = (p) => JSON.parse(readFileSync(p, 'utf8'));
const prof = read('data/profile.json');
const exp = read('data/experience.json');
const edu = read('data/education.json');
const sk = read('data/skills.json');
const pr = read('data/projects.json');
const aw = read('data/awards.json');
const ui = read('src/i18n/locales/es.json').ui;

const pick = (obj, keys) => Object.fromEntries(keys.filter((k) => obj[k] !== undefined && obj[k] !== null).map((k) => [k, obj[k]]));

const data = {
  profile: {
    ...pick(prof, ['availability', 'location', 'summary', 'about']),
    roles: prof.roles,
    tags: prof.tags,
    stats: prof.stats.map((s) => pick(s, ['label', 'text'])),
    languages: prof.languages.map((l) => pick(l, ['name', 'level'])),
  },
  experience: exp.map((e) => pick(e, ['period', 'role', 'org', 'type', 'summary', 'bullets', 'tags'])),
  education: {
    education: edu.education.map((e) => pick(e, ['degree', 'status'])),
    certificates: edu.certificates.map((c) => pick(c, ['name'])),
  },
  skills: {
    tools: sk.tools.map((c) => pick(c, ['category'])),
    domains: sk.domains.map((d) => pick(d, ['title', 'tech'])),
    softSkills: sk.softSkills,
  },
  projects: {
    competencias: pr.competencias.map((c) => pick(c, ['name', 'org', 'summary', 'detail', 'flag'])),
    proyectos: pr.proyectos.map((p) => pick(p, ['status'])),
  },
  awards: {
    awards: aw.awards.map((a) => pick(a, ['year', 'title', 'org', 'desc', 'flag'])),
  },
};

writeFileSync('docs/i18n/source.es.json', JSON.stringify({ ui, data }, null, 2) + '\n');
console.log('plantilla escrita: docs/i18n/source.es.json');
