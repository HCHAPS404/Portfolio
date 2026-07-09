import { navigation } from "../data/navigation.js";
import { useTranslation } from "../context/LanguageContext.jsx";
import { asset } from "../lib/assets.js";
import { T } from "./T.jsx";

export function SiteHeader({ scrolled = false }) {
  const { lang, setLang } = useTranslation();

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
      <a href="#top" className="brand" aria-label="Helmut Chaparro Sandoval">
        <img
          src={asset("assets/logo.png")}
          className="brand-logo"
          width="38"
          height="45"
          alt=""
        />
      </a>
      <nav className="site-nav" aria-label="Sections">
        {navigation.map((item) => (
          <a key={item.href} href={item.href}>
            <T k={item.key} />
          </a>
        ))}
      </nav>
      <div className="lang-switch" role="group" aria-label="Language" data-lang={lang}>
        <span className="lang-switch__indicator" aria-hidden="true" />
        <button
          type="button"
          className={lang === "en" ? "active" : ""}
          aria-pressed={lang === "en"}
          onClick={() => setLang("en")}
        >
          EN
        </button>
        <button
          type="button"
          className={lang === "es" ? "active" : ""}
          aria-pressed={lang === "es"}
          onClick={() => setLang("es")}
        >
          ES
        </button>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <span>© 2026 Helmut Chaparro Sandoval</span>
      <span>Bogotá D.C., Colombia</span>
    </footer>
  );
}
