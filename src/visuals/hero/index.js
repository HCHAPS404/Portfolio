/**
 * Portada según el idioma: cada uno muestra una disciplina distinta.
 * Las escenas se cargan bajo demanda, así solo se descarga la que se ve.
 */
const SCENES = {
  es: () => import('../pcb.js').then((m) => m.createPcb),        // electrónica: placa multicapa
  en: () => import('./dna.js').then((m) => m.create),            // bioingeniería: doble hélice
  de: () => import('./robot.js').then((m) => m.create),          // robótica industrial: brazo de seis ejes
  fr: () => import('./orbit.js').then((m) => m.create),          // aeroespacial: satélites
  ru: () => import('./quantum.js').then((m) => m.create),        // computación cuántica: esfera de Bloch
  zh: () => import('./neural.js').then((m) => m.create),         // inteligencia artificial: red neuronal
  ja: () => import('./drone.js').then((m) => m.create),          // robótica aérea: dron con lidar
  it: () => import('./gears.js').then((m) => m.create),          // mecánica: engranajes y pistón
};

export async function createHeroScene(canvas, lang) {
  const create = await (SCENES[lang] ?? SCENES.es)();
  canvas.dataset.scene = lang in SCENES ? lang : 'es';
  return create(canvas);
}
