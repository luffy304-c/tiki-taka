// RFC4180-style parser: commas, quoted cells, embedded newlines, escaped quotes, BOM.
export function parseCSV(text){
 if(text.length>1500000)throw Error('CSV должен быть меньше 1,5 МБ');
 text=text.replace(/^\uFEFF/,'');let rows=[],row=[],cell='',quoted=false,closed=false;
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(quoted){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++;}else{quoted=false;closed=true;}}else cell+=c;continue;}
  if(c==='"'){if(cell||closed)throw Error('Некорректные кавычки CSV');quoted=true;}
  else if(c===','||c==='\n'||c==='\r'){row.push(cell);cell='';closed=false;if(c!==','){if(c==='\r'&&text[i+1]==='\n')i++;if(row.some(v=>v.trim()))rows.push(row);row=[];}}
  else{if(closed)throw Error('Лишние символы после закрывающей кавычки');cell+=c;}
 }
 if(quoted)throw Error('Незакрытые кавычки CSV');
 row.push(cell);if(row.some(v=>v.trim()))rows.push(row);
 if(rows.length<2)throw Error('Нужны заголовок и хотя бы один игрок');
 const headers=rows.shift().map(v=>v.trim());
 if(new Set(headers).size!==headers.length||headers.some(v=>!v))throw Error('Повторяющиеся или пустые заголовки');
 for(const key of ['id','name','position','teamId','season','source','updatedAt'])if(!headers.includes(key))throw Error(`Нет колонки ${key}`);
 return rows.map((r,i)=>{if(r.length!==headers.length)throw Error(`Строка ${i+2}: неверное число колонок`);return Object.fromEntries(headers.map((h,j)=>[h,r[j].trim()]));});
}
export function exportCSV(records,headers){const cell=v=>'"'+String(v??'').replace(/"/g,'""')+'"';return '\uFEFF'+[headers,...records.map(r=>headers.map(h=>r[h]))].map(r=>r.map(cell).join(',')).join('\r\n');}
