import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const language = i18n.language.startsWith("en") ? "en" : "de";

  async function changeLanguage(nextLanguage: "de" | "en") {
    localStorage.setItem("aether-language", nextLanguage);

    await i18n.changeLanguage(nextLanguage);

    document.documentElement.lang = nextLanguage;
  }

  return (
    <div
      className="flex h-10 items-center rounded-xl border border-border bg-background p-1"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => void changeLanguage("de")}
        aria-pressed={language === "de"}
        className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
          language === "de"
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        DE
      </button>

      <button
        type="button"
        onClick={() => void changeLanguage("en")}
        aria-pressed={language === "en"}
        className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
          language === "en"
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        EN
      </button>
    </div>
  );
}
