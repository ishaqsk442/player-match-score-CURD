const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "cricketMatchDetails.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

let forplayers = (object) => {
  return {
    playerId: object.player_id,
    playerName: object.player_name,
  };
};

let forsinglestate = (object) => {
  return {
    playerId: object.player_id,
    playerName: object.player_name,
  };
};

let forsinglematch = (object) => {
  return {
    matchId: object.match_id,
    match: object.match,
    year: object.year,
  };
};

let forplayerDet = (object) => {
  return {
    playerId: object.player_id,
    playerName: object.player_name,
  };
};

app.get("/players/", async (request, response) => {
  let queiry = `SELECT * FROM player_details`;

  let stats = await database.all(queiry);

  response.send(stats.map((eachstate) => forplayers(eachstate)));
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getstateQuery = `
    SELECT 
      * 
    FROM 
      player_details
    WHERE 
      player_id = ${playerId};`;
  const player = await database.get(getstateQuery);
  response.send(forsinglestate(player));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerName } = request.body;
  const { playerId } = request.params;
  const updatePlayerQuery = `
  UPDATE
    player_details
  SET
    player_name = '${playerName}'
  WHERE
    player_id = ${playerId};`;

  await database.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getstateQuery = `
    SELECT 
      * 
    FROM 
      match_details
    WHERE 
      match_id = ${matchId};`;
  const player = await database.get(getstateQuery);
  response.send(forsinglematch(player));
});

app.get("/players/:playerId/matches/", async (request, response) => {
  let { playerId } = request.params;

  let quiery = `SELECT * FROM match_details join player_match_score ON match_details.match_id = player_match_score.match_id WHERE player_id = ${playerId};`;
  let result = await database.all(quiery);

  response.send(result.map((eachmatch) => forsinglematch(eachmatch)));
});

app.get("/matches/:matchId/players/", async (request, response) => {
  let { matchId } = request.params;

  let quiery = `SELECT * FROM player_details JOIN player_match_score ON player_details.player_id = player_match_score.player_id WHERE match_id = ${matchId};`;

  let result = await database.all(quiery);

  //   let player = `SELECT * FROM  player_details JOIN result ON player_details.player_id = result.player_id`;

  //   let playerDet = await database.all(player);

  response.send(result.map((eachmatch) => forplayerDet(eachmatch)));
});

app.get("/players/:playerId/playerScores/", async (request, response) => {
  let { playerId } = request.params;

  //   let quiery = `SELECT player_name,SUM(score),SUM(fours),SUM(sixes) FROM player_details JOIN player_match_score ON player_details.player_id = player_match_score.player_id WHERE player_id = ${playerID};`;

  let quiery2 = `SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes FROM 
    player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId};
    `;

  let result = await database.get(quiery2);

  //   response.send(result.map((eachmatch) => forplayerDet(eachmatch)));

  //   response.send({
  //     playerId: `${playerId}`,
  //     playerName: result["player_name"],
  //     totalScore: result["SUM(score)"],
  //     totalFours: result["SUM(fours)"],
  //     totalSixes: result["SUM(sixes)"],
  //   });

  response.send(result);
});

module.exports = app;
