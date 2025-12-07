
const API = '';
async function apiFetch(path, method='GET', body){ const headers={'Content-Type':'application/json'}; const token = localStorage.getItem('yak_token'); if(token) headers['Authorization']='Bearer '+token; const res = await fetch(API+path,{method,headers,body: body?JSON.stringify(body):undefined}); try{ return await res.json(); }catch(e){return null;} }
async function loadHome(){ const live = document.getElementById('live'); const matches = await apiFetch('/api/matches') || []; live.innerText = matches.map(m=>m.team1+' vs '+m.team2+' ('+(m.stage||'')+')').join('\n'); const players = await apiFetch('/api/players') || []; const top = document.getElementById('topPlayers'); top.innerHTML = players.slice(0,6).map(p=>'<div>'+p.name+' ('+(p.teamId||'')+')'+'</div>').join(''); }
function openAdminModal(){ document.getElementById('adminModal').style.display='flex'; document.getElementById('adminPassword').value=''; document.getElementById('adminError').style.display='none'; }
function closeAdminModal(){ document.getElementById('adminModal').style.display='none'; }
async function apiLogin(){ const pass = document.getElementById('adminPassword').value; const res = await apiFetch('/api/auth/login','POST',{password:pass}); if(res && res.token){ localStorage.setItem('yak_token', res.token); closeAdminModal(); alert('Logged in'); window.location='/public/admin.html'; } else { document.getElementById('adminError').style.display='block'; } }
document.addEventListener('DOMContentLoaded', ()=>{ if(document.getElementById('live')) loadHome(); });
