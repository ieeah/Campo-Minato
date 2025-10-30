/**
 * Translation Manager
 * Gestisce le traduzioni dell'applicazione
 */

import translations from "../translations.js";

class TranslationManager {
  constructor() {
    this.currentLocale = "it_IT";
    this.translations = translations;
  }

  /**
   * Ottiene la lingua corrente
   * @returns {string} Codice della lingua corrente
   */
  getCurrentLocale() {
    return this.currentLocale;
  }

  /**
   * Imposta la lingua corrente
   * @param {string} locale - Codice della lingua (es. "it_IT", "en_EN")
   */
  setLocale(locale) {
    if (this.translations[locale]) {
      this.currentLocale = locale;
    }
  }

  /**
   * Ottiene una traduzione usando una chiave dot-notation
   * @param {string} key - Chiave della traduzione (es. "menu.start")
   * @returns {string} Traduzione o chiave se non trovata
   */
  t(key) {
    const keys = key.split(".");
    let value = this.translations[this.currentLocale];

    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        return key; // Ritorna la chiave se traduzione non trovata
      }
    }

    return value;
  }

  /**
   * Ottiene tutte le lingue disponibili
   * @returns {Array<{code: string, name: string}>} Array di lingue disponibili
   */
  getAvailableLocales() {
    return Object.keys(this.translations).map((code) => ({
      code,
      name: this.getLocaleName(code),
    }));
  }

  /**
   * Ottiene il nome leggibile di una lingua
   * @param {string} code - Codice della lingua
   * @returns {string} Nome della lingua
   */
  getLocaleName(code) {
    const names = {
      it_IT: "🇮🇹 Italiano",
      en_EN: "🇬🇧 English",
      es_ES: "🇪🇸 Español",
    };
    return names[code] || code;
  }

  /**
   * Ottiene il percorso dell'immagine della bandiera
   * @param {string} code - Codice della lingua
   * @returns {string} Percorso dell'immagine
   */
  getFlagPath(code) {
    const flags = {
      it_IT: "./imgs/flags/it.svg",
      en_EN: "./imgs/flags/en.svg",
      es_ES: "./imgs/flags/es.svg",
    };
    return flags[code] || "";
  }
}

// Export singleton instance
export const translationManager = new TranslationManager();
