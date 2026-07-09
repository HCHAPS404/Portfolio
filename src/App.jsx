import { useActiveNav } from "./hooks/useInteractions.js";
import { useScrollEffects } from "./hooks/useScrollEffects.js";
import { LanguageProvider } from "./context/LanguageContext.jsx";
import { SiteHeader, SiteFooter } from "./components/SiteChrome.jsx";
import { PageAmbient, ScrollProgress } from "./components/PageChrome.jsx";
import { HeroSection } from "./components/HeroSection.jsx";
import { EducationSection } from "./components/EducationSection.jsx";
import { DomainsSection } from "./components/DomainsSection.jsx";
import { SkillsSection } from "./components/SkillsSection.jsx";
import { ExperienceSection } from "./components/ExperienceSection.jsx";
import { AwardsSection } from "./components/AwardsSection.jsx";
import { ProjectsSection } from "./components/ProjectsSection.jsx";
import { ContactSection } from "./components/ContactSection.jsx";

const SECTION_IDS = [
  "perfil",
  "formacion",
  "afinidad",
  "habilidades",
  "experiencia",
  "premios",
  "proyectos",
  "contacto",
];

function Portfolio() {
  useActiveNav(SECTION_IDS);
  const { scrolled, progress } = useScrollEffects();

  return (
    <>
      <PageAmbient />
      <ScrollProgress progress={progress} />
      <SiteHeader scrolled={scrolled} />
      <main id="top">
        <HeroSection />
        <EducationSection />
        <DomainsSection />
        <SkillsSection />
        <ExperienceSection />
        <AwardsSection />
        <ProjectsSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <Portfolio />
    </LanguageProvider>
  );
}
