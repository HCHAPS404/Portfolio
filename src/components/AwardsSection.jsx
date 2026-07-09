import { useRef } from "react";
import { awards } from "../data/awards.js";
import { useStagger } from "../hooks/useInteractions.js";
import { SectionHeader } from "./ui.jsx";
import { T } from "./T.jsx";

export function AwardsSection() {
  const listRef = useRef(null);
  useStagger(listRef, ".award-row", 140);

  return (
    <section className="section" id="premios">
      <SectionHeader no="05" titleKey="sec6.title" noteKey="sec6.note" />

      <ol ref={listRef} className="award-list">
        {awards.map((award) => (
          <li
            key={`${award.year}-${award.titleKey || award.title}`}
            className="award-row"
          >
            <span className="award-year">{award.year}</span>
            <div className="award-info">
              <h3>{award.titleKey ? <T k={award.titleKey} /> : award.title}</h3>
              <p className="award-org">
                {award.orgKey ? <T k={award.orgKey} /> : award.org}
              </p>
              <p className="award-desc">
                <T k={award.descKey} />
              </p>
            </div>
            <span className={`award-flag${award.shine ? " shine" : ""}`}>
              <T k={award.flagKey} />
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
