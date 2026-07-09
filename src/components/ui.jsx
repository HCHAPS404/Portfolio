import { useRef } from "react";
import { useTranslation } from "../context/LanguageContext.jsx";
import { useReveal } from "../hooks/useInteractions.js";
import { T } from "./T.jsx";

export function Copyable({ value, children, className = "copyable text-link" }) {
  const { lang } = useTranslation();
  const ref = useRef(null);

  const copyLabel = { en: "Copied", es: "Copiado" };

  const handleClick = () => {
    const btn = ref.current;
    if (!btn) return;

    const done = () => {
      btn.setAttribute("data-hint", copyLabel[lang] || copyLabel.en);
      btn.classList.add("copied");
      setTimeout(() => btn.classList.remove("copied"), 1400);
    };

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(value).then(done, done);
    } else {
      done();
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      className={className}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}

export function Reveal({ as: Tag = "div", className = "", children, ...props }) {
  const ref = useRef(null);
  useReveal(ref);
  return (
    <Tag ref={ref} className={className} {...props}>
      {children}
    </Tag>
  );
}

export function SectionHeader({ no, titleKey, noteKey }) {
  const ref = useRef(null);
  useReveal(ref);

  return (
    <header ref={ref} className="sec-header reveal">
      <span className="sec-no">{no}</span>
      <T k={titleKey} as="h2" />
      <T k={noteKey} as="span" className="sec-note" />
    </header>
  );
}
