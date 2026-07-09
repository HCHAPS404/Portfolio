import { useRef } from "react";
import {
  heroLinks,
  heroRoles,
  heroTags,
  metrics,
  spokenLanguages,
} from "../data/profile.js";
import { CONTACT_EMAIL } from "../data/config.js";
import { asset } from "../lib/assets.js";
import { useCountUp, useReveal, useStagger } from "../hooks/useInteractions.js";
import { Copyable, Reveal } from "./ui.jsx";
import { T } from "./T.jsx";

function MetricValue({ count, pad, suffix }) {
  const ref = useRef(null);
  useCountUp(ref, { count, pad });
  return (
    <dd>
      <span ref={ref}>{"0".repeat(pad)}</span>
      {suffix}
    </dd>
  );
}

export function HeroSection() {
  const textRef = useRef(null);
  const mainRef = useRef(null);
  const footRef = useRef(null);
  const photoRef = useRef(null);
  const tagsRef = useRef(null);
  const metricsRef = useRef(null);

  useReveal(textRef);
  useReveal(mainRef);
  useReveal(footRef);
  useReveal(photoRef);
  useStagger(tagsRef, "li", 70);
  useStagger(metricsRef, ".metric", 90);

  return (
    <section className="hero" id="perfil">
      <p className="kicker">
        <T k="hero.kicker" /> — Bogotá D.C., Colombia · 4.71° N, 74.07° W
      </p>

      <div className="hero-body">
        <div ref={textRef} className="hero-text reveal">
          <h1 className="hero-name">
            <span className="hn-line">
              <span>Helmut</span>
            </span>
            <span className="hn-line">
              <span>Chaparro</span>
            </span>
            <span className="hn-line">
              <span className="thin">Sandoval</span>
            </span>
          </h1>
          <ul className="hero-roles" aria-label="Roles">
            {heroRoles.map((key) => (
              <li key={key}>
                <T k={key} />
              </li>
            ))}
          </ul>
          <ul ref={tagsRef} className="tag-row hero-tags">
            {heroTags.map((key) => (
              <li key={key}>
                <T k={key} />
              </li>
            ))}
          </ul>
        </div>

        <div ref={mainRef} className="hero-main reveal">
          <div className="hero-intro glass">
            <p className="hero-summary">
              <T k="hero.summary" />
            </p>
          </div>

          <figure ref={photoRef} className="hero-photo reveal">
            <span className="status">
              <span className="status-dot" />
              <T k="hero.available" />
            </span>
            <img
              src={asset("assets/photo.png")}
              alt="Helmut Chaparro Sandoval"
              width="400"
              height="400"
            />
            <figcaption>Fig. 01 — Helmut Chaparro S.</figcaption>
          </figure>
        </div>

        <div ref={footRef} className="hero-foot reveal">
          <div className="hero-actions">
            <a
              href={asset("assets/cv.pdf")}
              download="Helmut-Chaparro-Sandoval-CV.pdf"
              className="button"
            >
              <T k="hero.cv" />
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-link">
              {CONTACT_EMAIL}
            </a>
            <Copyable value="+573008723290">(+57) 300 872 32 90</Copyable>
          </div>
          <ul className="hero-links">
            {heroLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noopener">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <ul className="hero-langs" aria-label="Languages">
            {spokenLanguages.map((lang) => (
              <li
                key={lang.code}
                className="lang-chip"
                style={{ "--fill": `${lang.fill}%` }}
              >
                <span className="lang-code">{lang.code}</span>
                <span className="lang-info">
                  <span className="lang-name">
                    <T k={lang.nameKey} />
                  </span>
                  <span className="lang-tag">
                    {lang.tagKey ? <T k={lang.tagKey} /> : lang.tag}
                  </span>
                </span>
                <span className="lang-meter">
                  <i />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <dl ref={metricsRef} className="metrics">
        {metrics.map((metric) => (
          <div key={metric.key} className="metric">
            <dt>
              <T k={metric.key} />
            </dt>
            {metric.textKey ? (
              <dd className={metric.accent ? "accent" : ""}>
                <T k={metric.textKey} />
              </dd>
            ) : (
              <MetricValue
                count={metric.count}
                pad={metric.pad}
                suffix={metric.suffix}
              />
            )}
          </div>
        ))}
      </dl>
    </section>
  );
}
