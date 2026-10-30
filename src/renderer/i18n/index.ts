import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import id from './id.json';
import en from './en.json';

const savedLang = localStorage.getItem('eduvault_lang') || 'id';

i18n.use(initReactI18next).init({
  resources: {
    id: { translation: id },
    en: { translation: en },
  },
  lng: savedLang,
  fallbackLng: 'id',
  interpolation: { escapeValue: false },
});

export default i18n;
