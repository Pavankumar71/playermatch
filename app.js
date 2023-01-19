const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "cricketMatchDetails.db");
const app = express();
app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//GET ALL API1
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT * FROM player_details;`;
  const playersDetailsResponse = await db.all(getPlayersQuery);
  let convertResponse = playersDetailsResponse.map((x) => ({
    playerId: x.player_id,
    playerName: x.player_name,
  }));
  console.log(convertResponse);
  response.send(convertResponse);
});

//GET API based on ID2
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `SELECT * FROM player_details WHERE player_id=${playerId};`;
  const playerDetailsResponse = await db.get(getPlayerQuery);
  let convertResponse = {
    playerId: playerDetailsResponse.player_id,
    playerName: playerDetailsResponse.player_name,
  };
  console.log(convertResponse);
  response.send(convertResponse);
});

//UPDATE API3
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName } = playerDetails;
  const updatePlayerQuery = `
  UPDATE
    player_details
      SET
         player_id=${playerId},
         player_name='${playerName}'
   WHERE 
       player_id=${playerId};`;
  const updateResponse = await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//GET match details API4
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = `SELECT match_id AS matchId,match,year FROM match_details WHERE match_id=${matchId};`;
  const matchDetailsResponse = await db.get(getMatchQuery);

  console.log(matchDetailsResponse);
  response.send(matchDetailsResponse);
});

// GET ALL match API5
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getMatchesQuery = `SELECT 
  match_details.match_id AS matchId,
   match_details.match AS match,
   match_details.year AS year
  FROM match_details  INNER JOIN player_match_score ON match_details.match_id=player_match_score.player_match_id WHERE player_match_score.player_id=${playerId};`;
  const matchDetailsResponse = await db.all(getMatchesQuery);

  console.log(matchDetailsResponse);
  response.send(matchDetailsResponse);
});

//GET players API
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getPlayersQuery = `SELECT
   player_details.player_id AS playerId,
   player_details.player_name AS playerName
  FROM player_details  INNER JOIN player_match_score ON player_details.player_id=player_match_score.player_id WHERE player_match_score.player_match_id=${matchId} ;`;
  const playersDetailsResponse = await db.all(getPlayersQuery);

  console.log(playersDetailsResponse);
  response.send(playersDetailsResponse);
});

//GET scores API
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayersQuery = `SELECT
  player_details.player_id AS playerId,
  player_details.player_name AS playerName,
  SUM(player_match_score.score) AS totalScore,
  SUM(player_match_score.fours) AS totalFours,
  SUM(player_match_score.sixes) AS totalSixes
  FROM player_match_score INNER JOIN  player_details ON player_match_score.player_id=player_details.player_id WHERE player_match_score.player_id=${playerId} GROUP BY player_match_score.player_id;`;
  const playersDetailsResponse = await db.get(getPlayersQuery);
  console.log(playersDetailsResponse);

  response.send(playersDetailsResponse);
});

module.exports = app;
