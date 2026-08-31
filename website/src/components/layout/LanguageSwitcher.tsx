import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const language =
    i18n.language.startsWith("en")
      ? "en"
      : "de";

  async function changeLanguage(
    nextLanguage: "de" | "en",
  ) {
    localStorage.setItem(
      "aether-language",
      nextLanguage,
    );

    await i18n.changeLanguage(
      nextLanguage,
    );

    document.documentElement.lang =
      nextLanguage;
  }

  return (
    <div
      aria-label="Language"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "2px",
        padding: "3px",
        border: "1px solid rgba(0,0,0,0.12)",
        borderRadius: "10px",
        background: "rgba(255,255,255,0.8)",
      }}
    >
      <button
        type="button"
        onClick={() =>
          void changeLanguage("de")
        }
        aria-pressed={language === "de"}
        style={{
          border: "none",
          borderRadius: "7px",
          padding: "6px 9px",
          cursor: "pointer",
          fontSize: "12px",
          fontWeight: 700,
          background:
            language === "de"
              ? "#111"
              : "transparent",
          color:
            language === "de"
              ? "#fff"
              : "#666",
        }}
      >
        DE
      </button>

      <button
        type="button"
        onClick={() =>
          void changeLanguage("en")
        }
        aria-pressed={language === "en"}
        style={{
          border: "none",
          borderRadius: "7px",
          padding: "6px 9px",
          cursor: "pointer",
          fontSize: "12px",
          fontWeight: 700,
          background:
            language === "en"
              ? "#111"
              : "transparent",
          color:
            language === "en"
              ? "#fff"
              : "#666",
        }}
      >
        EN
      </button>
    </div>
  );
}
