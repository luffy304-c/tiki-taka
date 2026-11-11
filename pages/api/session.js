import {configured,isAdmin,checkPassword,checkSetupCode,verifyAccount,canonicalAccount,createAccount,accountCount,accounts,cookie,sameOrigin,loginAllowed} from '../../lib/server/auth';
export default function handler(req,res){res.setHeader('Cache-Control','no-store');
 if(req.method==='GET')return res.json({admin:isAdmin(req),configured:configured(),needsRegistration:accountCount()===0,accounts:isAdmin(req)?accounts():[]});
 if(!sameOrigin(req))return res.status(403).json({error:'Недопустимый источник запроса'});
 if(req.method==='DELETE'){cookie(res,true);return res.json({ok:true});}
 if(req.method!=='POST')return res.status(405).end();
 if(!loginAllowed(req))return res.status(429).json({error:'Слишком много попыток. Подождите 10 минут.'});
 const {username,password,action,setupCode}=req.body||{};
 try{
  if(action==='register'){
   if(accountCount()>0&&!isAdmin(req))return res.status(403).json({error:'Регистрация закрыта. Попросите администратора создать аккаунт.'});
   if(accountCount()===0&&!checkSetupCode(setupCode))return res.status(403).json({error:'Неверный код настройки. Запустите npm run setup в терминале проекта.'});
   const user=createAccount(username,password);cookie(res,false,user.username);return res.json({ok:true});
  }
  if(typeof username==='string'&&verifyAccount(username,password)){cookie(res,false,canonicalAccount(username));return res.json({ok:true});}
  // Backwards-compatible login for projects configured with the original setup command.
  if(checkPassword(password)){cookie(res);return res.json({ok:true});}
  return res.status(401).json({error:'Неверное имя аккаунта или пароль'});
 }catch(e){return res.status(400).json({error:e.message});}
}
