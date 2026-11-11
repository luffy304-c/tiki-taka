import {memberUser,registerMember,loginMember,setMemberCookie} from '../../lib/server/member-auth';
import {sameOrigin,loginAllowed} from '../../lib/server/auth';

export default function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method==='GET'){const username=memberUser(req);return res.json({authenticated:!!username,username});}
 if(!sameOrigin(req))return res.status(403).json({error:'Недопустимый источник запроса'});
 if(req.method==='DELETE'){setMemberCookie(res,'',true);return res.json({ok:true});}
 if(req.method!=='POST')return res.status(405).end();
 if(!loginAllowed(req))return res.status(429).json({error:'Слишком много попыток. Подождите 10 минут.'});
 const {action,username,password}=req.body||{};
 try{
  let account;
  if(action==='register')account=registerMember(username,password);
  else if(action==='login')account=loginMember(username,password);
  else return res.status(400).json({error:'Выберите регистрацию или вход'});
  if(!account)return res.status(401).json({error:'Неверный логин или пароль'});
  setMemberCookie(res,account);return res.json({ok:true,username:account});
 }catch(e){return res.status(400).json({error:e.message});}
}
