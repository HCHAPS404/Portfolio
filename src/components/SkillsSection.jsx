import { useRef } from "react";
import { softSkills, toolCategories } from "../data/skills.js";
import { useReveal, useStagger } from "../hooks/useInteractions.js";
import { SectionHeader } from "./ui.jsx";
import { T } from "./T.jsx";

function ToolGroups() {
  const groupsRef = useRef(null);
  useStagger(groupsRef, ".tool-group", 70);

  return (
    <div ref={groupsRef} className="tool-groups">
      {toolCategories.map((group) => (
        <div key={group.labelKey} className="tool-group">
          <h4 className="tool-group-label">
            <T k={group.labelKey} />
          </h4>
          <ul className="chip-cloud chip-cloud--tools" aria-label={group.labelKey}>
            {group.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function SoftSkills() {
  const softRef = useRef(null);
  useStagger(softRef, "li", 45);

  return (
    <ul
      ref={softRef}
      className="chip-cloud chip-cloud--soft"
      aria-label="Soft skills"
    >
      {softSkills.map((key) => (
        <li key={key}>
          <T k={key} />
        </li>
      ))}
    </ul>
  );
}

export function SkillsSection() {
  const panelRef = useRef(null);
  const toolsLabelRef = useRef(null);
  const softLabelRef = useRef(null);

  useReveal(panelRef);
  useReveal(toolsLabelRef);
  useReveal(softLabelRef);

  return (
    <section className="section" id="habilidades">
      <SectionHeader no="03" titleKey="sec4.title" noteKey="sec4.note" />

      <div ref={panelRef} className="skills-panel glass reveal">
        <div className="skills-block">
          <h3 ref={toolsLabelRef} className="col-label reveal">
            <T k="tools.label" />
          </h3>
          <ToolGroups />
        </div>

        <div className="skills-divider" aria-hidden="true" />

        <div className="skills-block skills-block--soft">
          <h3 ref={softLabelRef} className="col-label reveal">
            <T k="soft.label" />
          </h3>
          <SoftSkills />
        </div>
      </div>
    </section>
  );
}
