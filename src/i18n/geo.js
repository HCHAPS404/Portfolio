/**
 * Idioma según el país del visitante.
 *
 * El sitio es estático, así que el país se deduce en el propio navegador, sin
 * enviar datos a ningún servicio: primero por la zona horaria del sistema (que
 * dice dónde está el equipo) y, si no alcanza, por la región configurada en el
 * navegador (p. ej. «es-CO»). Devuelve un código de idioma o `null`.
 */

/** País (ISO 3166) → idioma del sitio. */
const COUNTRY_LANG = {
  // Español
  CO: 'es', MX: 'es', ES: 'es', AR: 'es', PE: 'es', CL: 'es', VE: 'es', EC: 'es', BO: 'es', PY: 'es',
  UY: 'es', PA: 'es', CR: 'es', GT: 'es', SV: 'es', HN: 'es', NI: 'es', CU: 'es', DO: 'es', PR: 'es', GQ: 'es',
  // Alemán
  DE: 'de', AT: 'de', CH: 'de', LI: 'de',
  // Francés
  FR: 'fr', MC: 'fr', BE: 'fr', LU: 'fr', SN: 'fr', CI: 'fr', CM: 'fr', MG: 'fr', ML: 'fr', BF: 'fr', NE: 'fr',
  TG: 'fr', BJ: 'fr', GA: 'fr', CG: 'fr', CD: 'fr', HT: 'fr', GP: 'fr', MQ: 'fr', GF: 'fr', RE: 'fr', NC: 'fr', PF: 'fr',
  // Ruso
  RU: 'ru', BY: 'ru', KZ: 'ru', KG: 'ru',
  // Chino
  CN: 'zh', HK: 'zh', MO: 'zh', TW: 'zh', SG: 'zh',
  // Japonés
  JP: 'ja',
  // Italiano
  IT: 'it', SM: 'it', VA: 'it',
  // Inglés
  US: 'en', GB: 'en', IE: 'en', CA: 'en', AU: 'en', NZ: 'en', IN: 'en', ZA: 'en', NG: 'en', KE: 'en', GH: 'en',
  PH: 'en', PK: 'en', JM: 'en', TT: 'en',
};

/** Zona horaria → país. Solo las zonas de los países de la tabla anterior. */
const ZONES = {
  CO: 'America/Bogota',
  MX: 'America/Mexico_City America/Cancun America/Merida America/Monterrey America/Matamoros America/Chihuahua America/Ciudad_Juarez America/Ojinaga America/Mazatlan America/Bahia_Banderas America/Hermosillo America/Tijuana',
  ES: 'Europe/Madrid Africa/Ceuta Atlantic/Canary',
  AR: 'America/Buenos_Aires America/Argentina/Buenos_Aires America/Argentina/Cordoba America/Argentina/Salta America/Argentina/Jujuy America/Argentina/Tucuman America/Argentina/Catamarca America/Argentina/La_Rioja America/Argentina/San_Juan America/Argentina/Mendoza America/Argentina/San_Luis America/Argentina/Rio_Gallegos America/Argentina/Ushuaia America/Cordoba America/Mendoza',
  PE: 'America/Lima',
  CL: 'America/Santiago America/Punta_Arenas America/Coyhaique Pacific/Easter',
  VE: 'America/Caracas',
  EC: 'America/Guayaquil Pacific/Galapagos',
  BO: 'America/La_Paz',
  PY: 'America/Asuncion',
  UY: 'America/Montevideo',
  PA: 'America/Panama',
  CR: 'America/Costa_Rica',
  GT: 'America/Guatemala',
  SV: 'America/El_Salvador',
  HN: 'America/Tegucigalpa',
  NI: 'America/Managua',
  CU: 'America/Havana',
  DO: 'America/Santo_Domingo',
  PR: 'America/Puerto_Rico',
  GQ: 'Africa/Malabo',
  DE: 'Europe/Berlin Europe/Busingen',
  AT: 'Europe/Vienna',
  CH: 'Europe/Zurich',
  LI: 'Europe/Vaduz',
  FR: 'Europe/Paris',
  MC: 'Europe/Monaco',
  BE: 'Europe/Brussels',
  LU: 'Europe/Luxembourg',
  SN: 'Africa/Dakar',
  CI: 'Africa/Abidjan',
  CM: 'Africa/Douala',
  MG: 'Indian/Antananarivo',
  ML: 'Africa/Bamako',
  BF: 'Africa/Ouagadougou',
  NE: 'Africa/Niamey',
  TG: 'Africa/Lome',
  BJ: 'Africa/Porto-Novo',
  GA: 'Africa/Libreville',
  CG: 'Africa/Brazzaville',
  CD: 'Africa/Kinshasa Africa/Lubumbashi',
  HT: 'America/Port-au-Prince',
  GP: 'America/Guadeloupe',
  MQ: 'America/Martinique',
  GF: 'America/Cayenne',
  RE: 'Indian/Reunion',
  NC: 'Pacific/Noumea',
  PF: 'Pacific/Tahiti Pacific/Marquesas Pacific/Gambier',
  RU: 'Europe/Moscow Europe/Kaliningrad Europe/Samara Europe/Volgograd Europe/Saratov Europe/Ulyanovsk Europe/Astrakhan Europe/Kirov Asia/Yekaterinburg Asia/Omsk Asia/Novosibirsk Asia/Barnaul Asia/Tomsk Asia/Novokuznetsk Asia/Krasnoyarsk Asia/Irkutsk Asia/Chita Asia/Yakutsk Asia/Khandyga Asia/Vladivostok Asia/Ust-Nera Asia/Magadan Asia/Sakhalin Asia/Srednekolymsk Asia/Kamchatka Asia/Anadyr',
  BY: 'Europe/Minsk',
  KZ: 'Asia/Almaty Asia/Qyzylorda Asia/Qostanay Asia/Aqtobe Asia/Aqtau Asia/Atyrau Asia/Oral',
  KG: 'Asia/Bishkek',
  CN: 'Asia/Shanghai Asia/Urumqi Asia/Chongqing Asia/Harbin Asia/Kashgar',
  HK: 'Asia/Hong_Kong',
  MO: 'Asia/Macau',
  TW: 'Asia/Taipei',
  SG: 'Asia/Singapore',
  JP: 'Asia/Tokyo',
  IT: 'Europe/Rome',
  SM: 'Europe/San_Marino',
  VA: 'Europe/Vatican',
  US: 'America/New_York America/Chicago America/Denver America/Los_Angeles America/Phoenix America/Anchorage America/Detroit America/Boise America/Juneau America/Indiana/Indianapolis America/Indianapolis America/Kentucky/Louisville America/Louisville Pacific/Honolulu',
  GB: 'Europe/London Europe/Belfast',
  IE: 'Europe/Dublin',
  CA: 'America/Toronto America/Vancouver America/Edmonton America/Winnipeg America/Halifax America/St_Johns America/Regina America/Montreal',
  AU: 'Australia/Sydney Australia/Melbourne Australia/Brisbane Australia/Perth Australia/Adelaide Australia/Hobart Australia/Darwin',
  NZ: 'Pacific/Auckland',
  IN: 'Asia/Kolkata Asia/Calcutta',
  ZA: 'Africa/Johannesburg',
  NG: 'Africa/Lagos',
  KE: 'Africa/Nairobi',
  GH: 'Africa/Accra',
  PH: 'Asia/Manila',
  PK: 'Asia/Karachi',
  JM: 'America/Jamaica',
  TT: 'America/Port_of_Spain',
};

const ZONE_COUNTRY = {};
for (const [country, zones] of Object.entries(ZONES)) {
  for (const zone of zones.split(' ')) ZONE_COUNTRY[zone] = country;
}

/** País del visitante según su zona horaria, o `null` si no se reconoce. */
export function countryFromTimeZone() {
  try {
    return ZONE_COUNTRY[Intl.DateTimeFormat().resolvedOptions().timeZone] ?? null;
  } catch {
    return null;
  }
}

/** País según la región de los idiomas del navegador («es-CO» → CO). */
export function countryFromLocale() {
  for (const tag of navigator.languages ?? [navigator.language]) {
    const region = /[-_]([A-Za-z]{2})\b/.exec(String(tag))?.[1]?.toUpperCase();
    if (region && COUNTRY_LANG[region]) return region;
  }
  return null;
}

/** Idioma que corresponde al país del visitante, o `null` si no se pudo deducir. */
export function langFromCountry() {
  const country = countryFromTimeZone() ?? countryFromLocale();
  return country ? COUNTRY_LANG[country] : null;
}
