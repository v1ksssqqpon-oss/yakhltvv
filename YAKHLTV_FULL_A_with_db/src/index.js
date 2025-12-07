
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());
app.use('/public', express.static(path.join(__dirname,'..','public')));
app.use('/uploads', express.static(path.join(__dirname,'..','uploads')));

const ADMIN_PASS = process.env.ADMIN_PASS || 'yakyakhltvbyv';
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

function genToken(payload){ return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' }); }
function authMiddleware(req,res,next){
  const h = req.headers.authorization;
  if(!h) return res.status(401).json({error:'no auth'});
  const parts = h.split(' ');
  if(parts.length!==2) return res.status(401).json({error:'bad auth'});
  try{ req.user = jwt.verify(parts[1], JWT_SECRET); next(); }catch(e){ res.status(401).json({error:'invalid token'}); }
}

app.post('/api/auth/login', async (req,res)=>{
  const { password } = req.body;
  if(!password) return res.status(400).json({error:'no password'});
  if(password === ADMIN_PASS){
    const token = genToken({ role:'admin' });
    return res.json({ token, role:'admin' });
  }
  res.status(401).json({ error: 'invalid password' });
});

// Teams
app.get('/api/teams', async (req,res)=>{ const teams = await prisma.team.findMany({ include:{ players:true } }); res.json(teams); });
app.post('/api/teams', authMiddleware, async (req,res)=>{ const { name, country } = req.body; const t = await prisma.team.create({ data:{ name, country } }); res.json(t); });
app.delete('/api/teams/:id', authMiddleware, async (req,res)=>{ await prisma.team.delete({ where:{ id: req.params.id } }); res.json({ ok:true }); });

// Players
app.get('/api/players', async (req,res)=>{ const p = await prisma.player.findMany(); res.json(p); });
app.post('/api/players', authMiddleware, async (req,res)=>{ const { name, teamId, rating } = req.body; const pl = await prisma.player.create({ data:{ name, teamId: teamId || null, rating: rating || 1.0 } }); res.json(pl); });
app.put('/api/players/:id', authMiddleware, async (req,res)=>{ const { name, teamId, rating } = req.body; const pl = await prisma.player.update({ where:{ id: req.params.id }, data:{ name, teamId: teamId || null, rating } }); res.json(pl); });
app.delete('/api/players/:id', authMiddleware, async (req,res)=>{ await prisma.player.delete({ where:{ id: req.params.id } }); res.json({ok:true}); });

// Tournaments
app.get('/api/tournaments', async (req,res)=>{ const t = await prisma.tournament.findMany(); res.json(t); });
app.get('/api/tournaments/:id', async (req,res)=>{ const t = await prisma.tournament.findUnique({ where:{ id: req.params.id } }); res.json(t); });
app.post('/api/tournaments', authMiddleware, async (req,res)=>{ const { name, date, format } = req.body; const t = await prisma.tournament.create({ data:{ name, date: date? new Date(date):null, format: format || 'single' } }); res.json(t); });
app.put('/api/tournaments/:id', authMiddleware, async (req,res)=>{ const { name, date, format, teams } = req.body; const t = await prisma.tournament.update({ where:{ id: req.params.id }, data:{ name, date: date? new Date(date):null, format, teams: teams? JSON.stringify(teams): null } }); res.json(t); });
app.delete('/api/tournaments/:id', authMiddleware, async (req,res)=>{ await prisma.tournament.delete({ where:{ id: req.params.id } }); res.json({ok:true}); });

// Matches
app.get('/api/matches', async (req,res)=>{ const m = await prisma.match.findMany(); res.json(m); });
app.get('/api/matches/:id', async (req,res)=>{ const m = await prisma.match.findUnique({ where:{ id: req.params.id } }); res.json(m); });
app.post('/api/matches', authMiddleware, async (req,res)=>{ const { tournamentId, team1, team2, time, stage } = req.body; const m = await prisma.match.create({ data:{ tournamentId: tournamentId || null, team1, team2, time: time? new Date(time):null, stage: stage||'Round 1' } }); res.json(m); });
app.put('/api/matches/:id', authMiddleware, async (req,res)=>{ const { score, status, maps } = req.body; const m = await prisma.match.update({ where:{ id: req.params.id }, data:{ score: score||null, status: status||'TBD', maps: maps? JSON.stringify(maps): null } }); res.json(m); });
app.delete('/api/matches/:id', authMiddleware, async (req,res)=>{ await prisma.match.delete({ where:{ id: req.params.id } }); res.json({ok:true}); });

// result helper
app.post('/api/matches/:id/result', authMiddleware, async (req,res)=>{
  const { score } = req.body;
  const m = await prisma.match.update({ where:{ id: req.params.id }, data:{ score, status:'FINISHED' } });
  res.json({ ok:true, match: m });
});

// file uploads (avatars)
const uploadDir = path.join(__dirname,'..','uploads');
if(!fsExistsSync(uploadDir)) fsMkdirSync(uploadDir);
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadDir); },
  filename: function (req, file, cb) { cb(null, Date.now() + '_' + file.originalname); }
});
const upload = multer({ storage });
app.post('/api/upload/avatar', authMiddleware, upload.single('avatar'), async (req,res)=>{
  const url = '/uploads/' + path.basename(req.file.path);
  res.json({ url });
});

function fsExistsSync(p){ try{ return require('fs').existsSync(p); }catch(e){return false;} }
function fsMkdirSync(p){ try{ require('fs').mkdirSync(p,{ recursive:true }); }catch(e){} }

app.get('/api/health', (req,res)=> res.json({ok:true, mode:'full'}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('YAKhltv API listening on', PORT));
