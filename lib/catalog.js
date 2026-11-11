import { useI18n } from './i18n';
import {createContext,useContext,useState,useEffect,useCallback} from 'react';
const Context=createContext(null);
export function CatalogProvider({children}){
  const { t: tr, locale } = useI18n();

 const [data,setData]=useState(null),[error,setError]=useState('');
 const reload=useCallback(async()=>{try{const r=await fetch('/api/catalog',{cache:'no-store'});const d=await r.json();if(!r.ok)throw Error(d.error||'Ошибка загрузки');setData(d);setError('');return d;}catch(e){setError(e.message);throw e;}},[]);
 useEffect(()=>{reload().catch(()=>{});const f=()=>reload().catch(()=>{});window.addEventListener('focus',f);return()=>window.removeEventListener('focus',f);},[reload]);
 if(!data)return <div className="container" style={{padding:60}}>{tr(error||'Загружаем каталог…')}{error&&<button onClick={()=>reload().catch(()=>{})}>{tr("Повторить")}</button>}</div>;
 return <Context.Provider value={{...data,reload}}>{error&&<p role="alert">{tr("Не удалось обновить данные: ")}{tr(error)}</p>}{children}</Context.Provider>;
}
export function useCatalog(){return useContext(Context);}
