import { useTranslation } from "../context/LanguageContext.jsx";

export function T({ k, as: Tag = "span", className, ...props }) {
  const { t } = useTranslation();
  return (
    <Tag className={className} {...props}>
      {t(k)}
    </Tag>
  );
}
