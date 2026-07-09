import { useRef } from "react";
import { softSkills, tools } from "../data/skills.js";
import { useReveal, useStagger } from "../hooks/useInteractions.js";
import { SectionHeader } from "./ui.jsx";
import { T } from "./T.jsx";

function ChipCloud({ items, soft = false }) {
  const cloudRef = useRef(null);
  useStagger(cloudRef, "li", 55);

  return (
    <ul
      ref={cloudRef}
      className={`chip-cloud${soft ? " chip-cloud--soft" : ""}`}
      aria-label={soft ? "Soft skills" : "Tools"}
    >
      {items.map((item) => (
        <li key={item}>
          {soft ? <T k={item} /> : item}
        </li>
      ))}
    </ul>
  );
}

export function SkillsSection() {
  const footRef = useRef(null);
  const toolsLabelRef = useRef(null);
  const softLabelRef = useRef(null);

  useReveal(footRef);
  useReveal(toolsLabelRef);
  useReveal(softLabelRef);

  return (
    <section className="section" id="habilidades">
      <SectionHeader no="03" titleKey="sec4.title" noteKey="sec4.note" />

      <div ref={footRef} className="skills-foot reveal">
        <div className="skills-card glass">
          <h3 ref={toolsLabelRef} className="col-label reveal">
            <T k="tools.label" />
          </h3>
          <ChipCloud items={tools} />
        </div>
        <div className="skills-card glass">
          <h3 ref={softLabelRef} className="col-label reveal">
            <T k="soft.label" />
          </h3>
          <ChipCloud items={softSkills} soft />
        </div>
      </div>
    </section>
  );
}
