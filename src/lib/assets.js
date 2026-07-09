const base = import.meta.env.BASE_URL;

export function asset(path) {
  const clean = path.startsWith("/") ? path.slice(1) : path;
  return `${base}${clean}`;
}
