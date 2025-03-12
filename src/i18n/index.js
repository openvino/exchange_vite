import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./en.json";
import es from "./es.json";

i18n
	.use(LanguageDetector) // Detecta el idioma del navegador
	.use(initReactI18next)
	.init({
		fallbackLng: "en", // Si no encuentra el idioma, usa inglés
		interpolation: { escapeValue: false }, // React ya maneja el escape
		resources: {
			en: { translation: en },
			es: { translation: es },
		},
		react: { useSuspense: false },
		detection: {
			order: ["localStorage", "navigator"], // Detecta idioma primero en localStorage, luego en navegador
			caches: ["localStorage"], // Guarda la preferencia en localStorage
		},
	});

export default i18n;
