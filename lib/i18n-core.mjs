export const languageCodes = ['ru', 'en', 'kk', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'pt'];
export const languageNames = {ru:'Русский',en:'English',kk:'Қазақша',es:'Español',fr:'Français',de:'Deutsch',zh:'中文',ja:'日本語',ko:'한국어',pt:'Português'};
export const intlLocales = {ru:'ru-RU',en:'en-GB',kk:'kk-KZ',es:'es-ES',fr:'fr-FR',de:'de-DE',zh:'zh-CN',ja:'ja-JP',ko:'ko-KR',pt:'pt-PT'};
export function normalizeLanguage(code) {
  const language=String(code||'').toLowerCase().split('-')[0];
  return languageCodes.includes(language)?language:'ru';
}
const normalize=text=>text.replace(/\s+/g,' ').trim();
const escapeRegex=text=>text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
export function createTranslator(messages, fallback={}, locale='ru-RU') {
  const entries={...fallback,...messages};
  const numberFormat=new Intl.NumberFormat(locale,{maximumFractionDigits:4});
  const patterns=Object.keys(entries).filter(key=>/\{\d+\}/.test(key)).map(key=>{
    const names=[];
    const source=key.split(/(\{\d+\})/g).map(part=>/^\{\d+\}$/.test(part)?(names.push(part.slice(1,-1)),'(.+?)'):escapeRegex(part)).join('');
    return {key,names,regex:new RegExp('^'+source+'$','s')};
  });
  function interpolate(text, values) {return text.replace(/\{(\w+)\}/g,(placeholder,key)=>Object.hasOwn(values,key)?String(values[key]):placeholder);}
  function t(value,values={},depth=0) {
    if(typeof value==='number')return numberFormat.format(value);
    if(typeof value!=='string'||!value.trim())return value;
    const key=normalize(value);
    if(Object.hasOwn(entries,key))return value.match(/^\s*/)[0]+interpolate(entries[key],values)+value.match(/\s*$/)[0];
    // Translate messages containing server-provided values without changing the values.
    for(const pattern of patterns){const match=pattern.regex.exec(key);if(match){const args={...values};pattern.names.forEach((name,i)=>{args[name]=depth<4?t(match[i+1],{},depth+1):match[i+1];});return interpolate(entries[pattern.key],args);}}
    return value;
  }
  return t;
}
