import fs from 'node:fs';
import crypto from 'node:crypto';
const file='.env.local';
const current=fs.existsSync(file)?fs.readFileSync(file,'utf8'):'';
let next=current;
let password='';
if(!/^ADMIN_PASSWORD=.{12,}$/m.test(next)){password=crypto.randomBytes(18).toString('base64url');next=next.replace(/^ADMIN_PASSWORD=.*\n?/gm,'')+'\nADMIN_PASSWORD='+password+'\n';}
let setupCode=(next.match(/^ADMIN_SETUP_CODE=(.+)$/m)||[])[1];
if(!setupCode){setupCode=crypto.randomBytes(18).toString('base64url');next=next.replace(/^ADMIN_SETUP_CODE=.*\n?/gm,'')+'ADMIN_SETUP_CODE='+setupCode+'\n';}
if(next!==current)fs.writeFileSync(file,next,{mode:0o600});
console.log('Код одноразовой регистрации первого аккаунта администратора (сохраните его):\n'+setupCode);
if(password)console.log('Резервный пароль сервера:\n'+password);
console.log('Запустите npm run dev, откройте /admin и введите код регистрации.');
