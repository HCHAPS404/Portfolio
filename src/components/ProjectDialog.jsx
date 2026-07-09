import { useEffect, useRef } from "react";
import { projectsById } from "../data/projects.js";
import { useTranslation } from "../context/LanguageContext.jsx";

export function ProjectDialog({ projectId, onClose }) {
  const dialogRef = useRef(null);
  const { t } = useTranslation();
  const project = projectId ? projectsById[projectId] : null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (projectId && project) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [projectId, project]);

  if (!project) {
    return (
      <dialog ref={dialogRef} className="project-dialog" aria-labelledby="dialog-title" />
    );
  }

  const meta =
    project.meta ||
    `github.com/HCHAPS404/${project.name}`;

  return (
    <dialog
      ref={dialogRef}
      className="project-dialog"
      aria-labelledby="dialog-title"
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      onClose={onClose}
    >
      <div className="dialog-head">
        <span className="dialog-no">{project.no} · REPO</span>
        <button
          type="button"
          className="dialog-close"
          aria-label={t("folders.close")}
          onClick={onClose}
        >
          &times;
        </button>
      </div>
      <h3 id="dialog-title" className="dialog-title">
        {project.name}
      </h3>
      <p className="dialog-meta">{meta}</p>
      <p className="dialog-desc">{t(project.descKey)}</p>
      <p className="dialog-more">{t(project.moreKey)}</p>
      <div className="dialog-links">
        <a href={project.url} target="_blank" rel="noopener">
          {t("folders.repo")}
        </a>
      </div>
    </dialog>
  );
}
