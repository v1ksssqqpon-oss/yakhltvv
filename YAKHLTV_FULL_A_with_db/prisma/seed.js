
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main(){
  // create teams
  const teamNames = ['Team A','Team B','Team C','Team D','Team E','Team F','Team G','Team H'];
  const teams = [];
  for(const name of teamNames){
    let t = await prisma.team.create({ data:{ name } }).catch(()=>null);
    if(t) teams.push(t);
  }
  // create players for teams
  for(const t of teams){
    for(let i=1;i<=5;i++){
      await prisma.player.create({ data:{ name: `${t.name}_Player${i}`, teamId: t.id, rating: (1 + Math.random()).toFixed(2) } }).catch(()=>{});
    }
  }
  // tournament
  const tour = await prisma.tournament.create({ data:{ name:'YAK Cup Demo', format:'single' } });
  // create matches pairs
  for(let i=0;i<teams.length;i+=2){
    await prisma.match.create({ data:{ tournamentId: tour.id, team1: teams[i].name, team2: teams[i+1].name, stage:'Round 1', status:'TBD' } });
  }
  console.log('Seed done');
}
main().catch(e=>{ console.error(e); process.exit(1); }).finally(()=>process.exit());
