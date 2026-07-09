import { useRef } from "react";
import { domains } from "../data/domains.js";
import { useReveal, useStagger } from "../hooks/useInteractions.js";
import { SectionHeader } from "./ui.jsx";
import { T } from "./T.jsx";

export function DomainsSection() {
  const panelRef = useRef(null);
  const listRef = useRef(null);

  useReveal(panelRef);
  useStagger(listRef, ".domain", 75);

  return (
    <section className="section" id="afinidad">
      <SectionHeader no="02" titleKey="sec3.title" noteKey="sec3.note" />

      <div ref={panelRef} className="domains-panel glass reveal">
        <ul ref={listRef} className="domains">
          {domains.map((domain) => (
            <li key={domain.no} className="domain">
              <span className="domain-no">{domain.no}</span>
              <h3>
                <T k={domain.titleKey} />
              </h3>
              <p>{domain.tech}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
