import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {languageCodes,intlLocales,normalizeLanguage,createTranslator} from '../lib/i18n-core.mjs';
const dictionaries=Object.fromEntries(languageCodes.map(code=>[code,JSON.parse(readFileSync(new URL(`../assets/translations/${code}.json`,import.meta.url)))]));
const fields=value=>[...value.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort();
test('all ten translation files have the same keys and interpolation arguments',()=>{
 const expected=Object.keys(dictionaries.ru).sort();
 assert.equal(languageCodes.length,10);
 for(const code of languageCodes){
  assert.deepEqual(Object.keys(dictionaries[code]).sort(),expected,code);
  for(const key of expected){const value=dictionaries[code][key];assert.equal(typeof value,'string',`${code}: ${key}`);assert.ok(value.trim(),`${code}: ${key}`);assert.deepEqual(fields(value),fields(dictionaries.en[key]),`${code}: ${key}`);}
 }
});
test('each language translates navigation, registration, validation and parameterized counts',()=>{
 for(const code of languageCodes){const dict=dictionaries[code],t=createTranslator(dict,dictionaries.ru,intlLocales[code]);
  assert.equal(t('Главная'),dict.Home);
  assert.equal(t('Зарегистрироваться'),dict.Register);
  assert.equal(t('Неверный логин или пароль'),dict['Invalid username or password']);
  assert.ok(!t('search.summary',{count:12,query:'Pedri'}).includes('{'));
  assert.equal(t('Сохранено на сервере: 2.'),dict['Сохранено на сервере: {0}.'].replace('{0}','2'));
 }
});
test('nested CSV errors translate while unknown data and React nodes are preserved',()=>{
 const t=createTranslator(dictionaries.en,dictionaries.ru,'en-GB');
 assert.equal(t('Строка 2: Некорректное число: goals'),'Row 2: Invalid number: goals');
 assert.equal(t('Erling Haaland'),'Erling Haaland');
 assert.equal(t('Made-up club 123'),'Made-up club 123');
 assert.equal(t('Goals '),'Goals ');
 assert.equal(t(null),null);const node={type:'strong'};assert.equal(t(node),node);
 assert.equal(t('Delete {0}?',{0:'<img src=x>'}),'Delete <img src=x>?');
});
test('language normalization, Russian fallback and numeric formatting',()=>{
 assert.equal(normalizeLanguage('pt-BR'),'pt');assert.equal(normalizeLanguage('kk-KZ'),'kk');assert.equal(normalizeLanguage('unknown'),'ru');
 assert.equal(createTranslator({},dictionaries.ru)('Home'),'Главная');
 assert.equal(createTranslator(dictionaries.de,{},'de-DE')(1234.5),'1.234,5');
});
