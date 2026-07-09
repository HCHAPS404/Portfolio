import { useRef, useState } from "react";
import { contactLinks } from "../data/contactLinks.js";
import { CONTACT_EMAIL, FORM_ENDPOINT } from "../data/config.js";
import { useReveal } from "../hooks/useInteractions.js";
import { useTranslation } from "../context/LanguageContext.jsx";
import { T } from "./T.jsx";
import { ContactIcon } from "./ContactIcon.jsx";

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function ContactSection() {
  const { t } = useTranslation();
  const [note, setNote] = useState({ text: "", tone: "" });
  const kickerRef = useRef(null);
  const titleRef = useRef(null);
  const subRef = useRef(null);
  const formRef = useRef(null);
  const linksRef = useRef(null);

  useReveal(kickerRef);
  useReveal(titleRef);
  useReveal(subRef);
  useReveal(formRef);
  useReveal(linksRef);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const subject = form.subject.value.trim();
    const message = form.message.value.trim();

    if (!name || !isEmail(email) || !message) {
      setNote({ text: t("form.invalid"), tone: "error" });
      return;
    }

    const fullSubject = subject || `Portfolio · ${name}`;

    if (FORM_ENDPOINT) {
      setNote({ text: t("form.sending"), tone: "" });
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            subject: fullSubject,
            message,
          }),
        });
        if (!res.ok) throw new Error("bad response");
        form.reset();
        setNote({ text: t("form.ok"), tone: "ok" });
      } catch {
        setNote({ text: t("form.error"), tone: "error" });
      }
      return;
    }

    const body = `${message}\n\n${name} (${email})`;
    const mailto =
      `mailto:${CONTACT_EMAIL}` +
      `?subject=${encodeURIComponent(fullSubject)}` +
      `&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    setNote({ text: t("form.mail"), tone: "ok" });
  };

  return (
    <section className="section contact" id="contacto">
      <p ref={kickerRef} className="kicker reveal">
        <T k="contact.kicker" />
      </p>
      <h2 ref={titleRef} className="contact-title reveal">
        <T k="contact.title" />
      </h2>
      <p ref={subRef} className="contact-sub reveal">
        <T k="contact.sub" />
      </p>

      <form
        ref={formRef}
        className="contact-form reveal"
        noValidate
        onSubmit={handleSubmit}
      >
        <div className="field">
          <label htmlFor="cf-name">
            <T k="form.name" />
          </label>
          <input id="cf-name" name="name" type="text" required autoComplete="name" />
        </div>
        <div className="field">
          <label htmlFor="cf-email">
            <T k="form.email" />
          </label>
          <input
            id="cf-email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
        </div>
        <div className="field field-full">
          <label htmlFor="cf-subject">
            <T k="form.subject" />
          </label>
          <input id="cf-subject" name="subject" type="text" />
        </div>
        <div className="field field-full">
          <label htmlFor="cf-message">
            <T k="form.message" />
          </label>
          <textarea id="cf-message" name="message" rows="4" required />
        </div>
        <button type="submit" className="button">
          <T k="form.send" />
        </button>
        <p
          className="form-note"
          role="status"
          aria-live="polite"
          data-tone={note.tone || undefined}
        >
          {note.text}
        </p>
      </form>

      <div ref={linksRef} className="contact-links reveal">
        {contactLinks.map((link) => (
          <a
            key={link.href}
            className="contact-link"
            href={link.href}
            target={link.href.startsWith("mailto:") ? undefined : "_blank"}
            rel={link.href.startsWith("mailto:") ? undefined : "noopener"}
          >
            <ContactIcon name={link.icon} />
            <span>{link.label}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
