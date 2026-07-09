import { useRef } from "react";
import { certifications, education } from "../data/education.js";
import { useReveal, useStagger } from "../hooks/useInteractions.js";
import { SectionHeader } from "./ui.jsx";
import { T } from "./T.jsx";

export function EducationSection() {
  const formationRef = useRef(null);
  const eduRef = useRef(null);
  const certRef = useRef(null);
  const labelRef = useRef(null);
  const certLabelRef = useRef(null);

  useReveal(formationRef);
  useReveal(labelRef);
  useReveal(certLabelRef);
  useStagger(eduRef, "li", 100);
  useStagger(certRef, ".cert-card", 60);

  return (
    <section className="section" id="formacion">
      <SectionHeader no="01" titleKey="sec2.title" noteKey="sec2.note" />

      <div ref={formationRef} className="formation glass reveal">
        <div className="fm-block">
          <h3 ref={labelRef} className="col-label reveal">
            <T k="edu.label" />
          </h3>
          <ol ref={eduRef} className="edu-list">
            {education.map((item) => (
              <li key={item.years}>
                <span className="edu-years">{item.years}</span>
                <div>
                  <h4>
                    <T k={item.titleKey} />
                  </h4>
                  <p>{item.institution}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="fm-divider" aria-hidden="true" />

        <div className="fm-block">
          <h3 ref={certLabelRef} className="col-label reveal">
            <T k="cert.label" />
          </h3>
          <ul ref={certRef} className="cert-grid">
            {certifications.map((cert) => (
              <li key={cert.meta + (cert.name || cert.nameKey)} className="cert-card">
                <span className="cert-name">
                  {cert.nameKey ? <T k={cert.nameKey} /> : cert.name}
                </span>
                <span className="cert-meta">{cert.meta}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
