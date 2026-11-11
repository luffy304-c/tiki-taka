import {useState} from 'react';
import {useI18n,languageCodes,languageNames} from '../lib/i18n';
export default function LanguageSwitcher(){
  const {t,languageCode,setLanguage}=useI18n();
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  async function change(event){setBusy(true);setError('');try{await setLanguage(event.target.value);}catch{setError(t('language.error'));}finally{setBusy(false);}}
  return <div className="language-switcher"><label><span aria-hidden="true">🌐</span><select aria-label={t('language.label')} value={languageCode} onChange={change} disabled={busy}>{languageCodes.map(code=><option key={code} value={code} lang={code}>{code.toUpperCase()} · {languageNames[code]}</option>)}</select></label>{error&&<span role="alert">{error}</span>}</div>;
}
