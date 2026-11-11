import { useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import ru from '../assets/translations/ru.json';
import en from '../assets/translations/en.json';
import kk from '../assets/translations/kk.json';
import es from '../assets/translations/es.json';
import fr from '../assets/translations/fr.json';
import de from '../assets/translations/de.json';
import zh from '../assets/translations/zh.json';
import ja from '../assets/translations/ja.json';
import ko from '../assets/translations/ko.json';
import pt from '../assets/translations/pt.json';
import { createTranslator, normalizeLanguage, intlLocales, languageCodes, languageNames } from './i18n-core.mjs';
export { languageCodes, languageNames } from './i18n-core.mjs';
const dictionaries={ru,en,kk,es,fr,de,zh,ja,ko,pt};
export function useI18n(){
  const router=useRouter();
  const languageCode=normalizeLanguage(router.locale);
  const t=useMemo(()=>createTranslator(dictionaries[languageCode],ru,intlLocales[languageCode]),[languageCode]);
  async function setLanguage(code){
    if(!languageCodes.includes(code))return;
    await router.push({pathname:router.pathname,query:router.query},router.asPath,{locale:code,scroll:false});
    document.cookie=`NEXT_LOCALE=${code}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol==='https:'?'; Secure':''}`;
  }
  return {t,languageCode,locale:intlLocales[languageCode],setLanguage};
}
export function LocalizedMetadata(){
  const {t}=useI18n();
  return <Head><title>{t('meta.title')}</title><meta name="description" content={t('meta.description')}/><meta property="og:title" content={t('meta.title')}/><meta property="og:description" content={t('meta.description')}/></Head>;
}
