require('dotenv').config({path: '.env.local'});
const { getMatchDetails, getMatchHistoryIds, getValorantAccount } = require('./src/app/actions/valorant.js');

async function run() {
  const accountRes = await getValorantAccount('jethiya', '021');
  console.log("Account:", accountRes);
  if(!accountRes.data) return;

  const historyRes = await getMatchHistoryIds(accountRes.data.puuid);
  console.log("History:", historyRes);
  if(!historyRes.data) return;

  const matchId = historyRes.data[0];
  console.log("Match ID:", matchId);

  const matchRes = await getMatchDetails(matchId, accountRes.data.puuid);
  console.log("Match Res Error?", matchRes.error);
}

run();
