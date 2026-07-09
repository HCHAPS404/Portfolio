import { useRef } from "react";
import { experience } from "../data/experience.js";
import { useReveal } from "../hooks/useInteractions.js";
import { useXpTimelineFill } from "../hooks/useScrollEffects.js";
import { SectionHeader } from "./ui.jsx";
import { T } from "./T.jsx";

export function ExperienceSection() {
  const listRef = useRef(null);
  const { lineTop, lineHeight, fillHeight } = useXpTimelineFill(listRef);

  return (
    <section className="section" id="experiencia">
      <SectionHeader no="04" titleKey="sec5.title" noteKey="sec5.note" />

      <div className="xp-timeline">
        <div className="xp-rail" aria-hidden="true">
          <span
            className="xp-rail-line"
            style={{ top: `${lineTop}px`, height: `${lineHeight}px` }}
          />
          <span
            className="xp-rail-fill"
            style={{ top: `${lineTop}px`, height: `${fillHeight}px` }}
          />
        </div>

        <ol ref={listRef} className="xp-list">
          {experience.map((xp) => (
            <ExperienceItem key={xp.roleKey} xp={xp} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function ExperienceItem({ xp }) {
  const ref = useRef(null);
  useReveal(ref);

  return (
    <li ref={ref} className="xp-item reveal">
      <div className="xp-node-col">
        <span className="xp-node" aria-hidden="true" />
      </div>

      <article className="xp glass">
        <div className="xp-when">
          <span className={`xp-dates${xp.accent ? " accent" : ""}`}>
            {xp.dateKey ? <T k={xp.dateKey} /> : xp.date}
          </span>
          <span className="xp-meta">
            <T k={xp.metaKey} />
          </span>
        </div>
        <div className="xp-what">
          <h3>
            <T k={xp.roleKey} />
          </h3>
          <p className="xp-org">
            {xp.org}
            {xp.orgLink && (
              <>
                {" · "}
                <a
                  className="xp-link"
                  href={xp.orgLink.href}
                  target="_blank"
                  rel="noopener"
                >
                  {xp.orgLink.label}
                </a>
              </>
            )}
          </p>
          <p className="xp-lead">
            <T k={xp.leadKey} />
          </p>
          <ul>
            {xp.bullets.map((key) => (
              <li key={key}>
                <T k={key} />
              </li>
            ))}
          </ul>
          <ul className="xp-tags">
            {xp.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </div>
      </article>
    </li>
  );
}
