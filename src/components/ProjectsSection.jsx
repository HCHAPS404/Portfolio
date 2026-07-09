import { useCallback, useRef, useState } from "react";
import { projects } from "../data/projects.js";
import { useDragScroll, useReveal, useStagger } from "../hooks/useInteractions.js";
import { useTranslation } from "../context/LanguageContext.jsx";
import { SectionHeader } from "./ui.jsx";
import { T } from "./T.jsx";
import { ProjectDialog } from "./ProjectDialog.jsx";

export function ProjectsSection() {
  const hintRef = useRef(null);
  const stripRef = useRef(null);
  const { ref: scrollRef, movedRef } = useDragScroll();
  const [openId, setOpenId] = useState(null);
  const [returnFocus, setReturnFocus] = useState(null);
  const { t } = useTranslation();

  useReveal(hintRef);
  useStagger(stripRef, ".folder", 90);

  const openDialog = useCallback((id, opener) => {
    setOpenId(id);
    setReturnFocus(opener);
  }, []);

  const closeDialog = useCallback(() => {
    setOpenId(null);
    if (returnFocus) {
      returnFocus.focus();
      setReturnFocus(null);
    }
  }, [returnFocus]);

  const handleFolderClick = (e, project, folderEl) => {
    if (movedRef.current || e.target.closest("a")) return;
    openDialog(project.id, folderEl);
  };

  return (
    <section className="section" id="proyectos">
      <SectionHeader no="06" titleKey="sec7.title" noteKey="sec7.note" />

      <p ref={hintRef} className="folder-hint reveal">
        <T k="folders.hint" />
      </p>

      <div className="folder-stage">
        <div ref={scrollRef} className="folder-scroll">
          <ul ref={stripRef} className="folder-strip" aria-label="Projects">
            {projects.map((project) => (
              <li
                key={project.id}
                className="folder"
                tabIndex={0}
                data-project={project.id}
                onMouseEnter={(e) => {
                  if (!scrollRef.current?.classList.contains("dragging")) {
                    e.currentTarget.classList.add("is-active");
                  }
                }}
                onMouseLeave={(e) => e.currentTarget.classList.remove("is-active")}
                onClick={(e) => handleFolderClick(e, project, e.currentTarget)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openDialog(project.id, e.currentTarget);
                  }
                }}
              >
                <div className="folder-papers" aria-hidden="true">
                  <span />
                  <span />
                </div>
                <span className="folder-tab">{project.no} · REPO</span>
                <div className="folder-body">
                  {project.flagKey && (
                    <span className="folder-flag">
                      <T k={project.flagKey} />
                    </span>
                  )}
                  <h3>{project.name}</h3>
                  <p className="folder-meta">
                    {project.wip ? (
                      <T k="folders.wip" />
                    ) : (
                      project.meta
                    )}
                  </p>
                </div>
                <div className="folder-menu">
                  <button
                    type="button"
                    className="menu-open"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDialog(project.id, e.currentTarget.closest(".folder"));
                    }}
                  >
                    {t("folders.open")}
                  </button>
                  <a href={project.url} target="_blank" rel="noopener">
                    {t("folders.repo")}
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ProjectDialog
        projectId={openId}
        onClose={closeDialog}
      />
    </section>
  );
}
