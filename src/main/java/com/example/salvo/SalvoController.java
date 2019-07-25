package com.example.salvo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

// The controller holds the methods to handle requests to and from the API.
@RestController
@RequestMapping("/api")
public class SalvoController {

    @Autowired
    private GameRepository gamesRepo;

    @Autowired
    private PlayerRepository playersRepo;

    @Autowired
    private GamePlayerRepository gamePlayerRepo;

    @Autowired
    private ShipRepository shipsRepo;

     @Autowired
    private SalvoRepository salvoeRepo;

     @Autowired
     private ScoreRepository scoreRepo;

    private boolean isGuest(Authentication authentication) {
        return authentication == null || authentication instanceof AnonymousAuthenticationToken;
    }
//    @RequestMapping("/leaderboard")
    public List<Object> getleaderboard() {
        List<Object> scoreObj = new ArrayList<>();

        playersRepo.findAll().stream().forEach(p -> {
            Map<String, Object> playersScore = new HashMap<>();
            playersScore.put("player", p.getuserName());
            playersScore.put("win", p.getScore().stream().filter(s -> s.getScoreValue() == 1).collect(Collectors.counting()));
            playersScore.put("lost", p.getScore().stream().filter(s -> s.getScoreValue() == 0).collect(Collectors.counting()));
            playersScore.put("tied", p.getScore().stream().filter(s -> s.getScoreValue() == 0.5).collect(Collectors.counting()));
            playersScore.put("total", p.getScore().stream().map(e-> e.getScoreValue()).reduce((double) 0, (a, b) -> a + b));
            scoreObj.add(playersScore);
        });
        return scoreObj;
    }
    // function to search database to authenticate if a user exists.
    private Player getAuthenticatedPlayer (Authentication authentication){
            return playersRepo.findUserByUserName(authentication.getName());
    };

    // structuring the api route for all the games
    @RequestMapping("/games")
    public Map<String, Object> getGames(Authentication authentication) {

        List<Object> gamesObject = new ArrayList<>();

        List<Object> playersObj = new ArrayList<>();

        Map<String, Object> playersMap = new HashMap<>();

        // go through every game in the database
        gamesRepo.findAll().stream().forEach(each -> {
            // create a map for each game and its gameplayers
            Map<String, Object> gamesMap = new HashMap<>();
            List<Object> gpObject = new ArrayList<>();

            // go through each gameplayer in each game
            gamePlayerRepo.findAll().stream().forEach(eachGP -> {

                Map<String, Object> gpMap = new HashMap<>();
                //for each game player in each game
                if (each.getGamePlayers().contains(eachGP)) {
                    playersRepo.findAll().stream().forEach(eachPlayer -> {
                        if (eachGP.getPlayer().getuserName() == eachPlayer.getuserName()) {
                            playersMap.put("playerName", eachPlayer.getuserName());
                            playersMap.put("playerID", eachPlayer.getId());
                            playersObj.add(playersMap);
                        }
                    });
                    gpMap.put("gpID", eachGP.getId());
                    gpMap.put("gpName", eachGP.getPlayer().getuserName());
                    gpObject.add(gpMap);
                }
            });
            // create map of the status of the given games time and status
            gamesMap.put("gameID", each.getId());
            gamesMap.put("gameHour", each.getGameTime().getHour());
            gamesMap.put("gameMinute", each.getGameTime().getMinute());
            gamesMap.put("gamePlayers", gpObject);
            gamesMap.put("isFinished", each.getFinished());
            gamesObject.add(gamesMap);
        });

        Map<String, Object> finalMapOfGames = new HashMap<>();

        finalMapOfGames.put("scores", getleaderboard());
        finalMapOfGames.put("games", gamesObject);
        // add additional information about the current game player, in addition to general information about other games.
        if (!isGuest(authentication)){
            Map<String, Object> onePlayer = new HashMap<>();
            onePlayer.put("playerID", getAuthenticatedPlayer(authentication).getId());
            onePlayer.put("username", getAuthenticatedPlayer(authentication).getuserName());
            finalMapOfGames.put("player", onePlayer);
        } else {
            finalMapOfGames.put("player", null);
        }
        return finalMapOfGames;
    }

    // map of the currently-logged-in-player's games
    @RequestMapping(path = "/CurrentPlayersGames")
    public List<Long> getCurrentPlayersGames(Authentication auth) {
        ArrayList<Long> list = new ArrayList<>();
        Player currentPlayer = getAuthenticatedPlayer(auth);
        // Each player has instances of themselves in different games. These
        // instances are called game players. This returns the ID of each of those instances
        currentPlayer.getGamePlayers().stream().forEach(gamePlayer -> {
            list.add(gamePlayer.getId());
        });
        list.sort(null);
            return list;
    }

    @RequestMapping(path = "/games", method = RequestMethod.POST)
    public ResponseEntity<Map<String, Object>> createNewGame(Authentication authentication) {
        // checks to see if the player has authority to create a game
        if (getAuthenticatedPlayer(authentication).getuserName()== null){
            return new ResponseEntity<>(makeMapForResponseEntity("error", "you are not logged in"), HttpStatus.UNAUTHORIZED);
        } else {
            // create a new game and save it to the repository
            Game aGame = new Game();
            gamesRepo.save(aGame);
            // creates a gameplayer for that game and save it to the repository
            GamePlayer aGamePlayer= new GamePlayer(aGame, getAuthenticatedPlayer(authentication) );
            gamePlayerRepo.save(aGamePlayer);
            // return information for the current player about whether their request was successful.
            return new ResponseEntity<>(makeMapForResponseEntity("newGpID", aGamePlayer.getId()), HttpStatus.CREATED);
        }
    }

    // post request for players to submit their information to join a specific game. Users submit
    // the game id of their desire
    @RequestMapping(path = "/game/{gameID}/players", method = RequestMethod.POST)
    public ResponseEntity<Map<String, Object>> joinGame(@PathVariable long gameID, Authentication authentication) {
        // check if requesting player is authorized to join a game
        if (getAuthenticatedPlayer(authentication).getuserName()== null){
            return new ResponseEntity<>(makeMapForResponseEntity("error", "you are not logged in"), HttpStatus.UNAUTHORIZED);
        } else if (gamesRepo.findOne(gameID) == null){
            return new ResponseEntity<>(makeMapForResponseEntity("error", "no such game"), HttpStatus.FORBIDDEN);
        }   else if (gamesRepo.findOne(gameID).isFull()){
            return new ResponseEntity<>(makeMapForResponseEntity("error", "game is full"), HttpStatus.FORBIDDEN);
        } else {
            //find their game and add them as a gameplayer.
            GamePlayer aGamePlayer= new GamePlayer(gamesRepo.getOne(gameID), getAuthenticatedPlayer(authentication) );
            gamePlayerRepo.save(aGamePlayer);
            // return information about their request
            return new ResponseEntity<>(makeMapForResponseEntity("newGpID", aGamePlayer.getId()), HttpStatus.CREATED);
        }
    }

    // simple API route for information about all the players in the database
    @RequestMapping("/players")
    public Map<String, Object> getPlayers() {
        List<Object> playerObj = new ArrayList<>();
        playersRepo.findAll().stream().forEach(playa -> {
            Map<String, Object> playersMap = new HashMap<>();
            playersMap.put("userName", playa.getuserName());
            playerObj.add(playersMap);
        });
        Map<String, Object> playerMap = new HashMap<>();
        playerMap.put("players", playerObj);
        return playerMap;
    }

    // simple API route for returning ship information for each gameplayer in the database
    @RequestMapping("/gamePlayers")
    public Map<String, Object> getGamePlayers() {
        List<Object> gamePlayerObj = new ArrayList<>();
        // go through every game player
        gamePlayerRepo.findAll().stream().forEach(gamePlaya -> {
            Map<Long, Object> aMap = new HashMap<>();
            // make a map of their ships, using the getshipsfromgameplayer method
            aMap.put(gamePlaya.getId(), getShipsfromGamePlayer(gamePlaya) );
             gamePlayerObj.add(aMap);
        });
        Map<String, Object> playerMap = new HashMap<>();
        playerMap.put("gamePlayers", gamePlayerObj);
        return playerMap;
    }

    // post method for created a new player with their desired login credentials.
    @RequestMapping(path = "/players", method = RequestMethod.POST)
    public ResponseEntity<HashMap<String, Object>> createPlayer(@RequestParam("userName") String userName, @RequestParam("password") String password) {

        // Forbidden is a 403 error
        if (userName.isEmpty()) {
            return new ResponseEntity<>(makeMapForResponseEntity("error", "No email given"), HttpStatus.FORBIDDEN);
        }

        // Conflict is a 409 error
        Player player = playersRepo.findUserByUserName(userName);
        if (player != null) {
            return new ResponseEntity<>(makeMapForResponseEntity("error", "Email already used"), HttpStatus.CONFLICT);
        }

        // created is 201 response
        Player newPlayer = new Player(userName);
        newPlayer.setPassword(password);
        playersRepo.save(newPlayer);
        // return information about the status of the users request
        return new ResponseEntity<>(makeMapForResponseEntity("New User", newPlayer.toString()), HttpStatus.CREATED);
    }

    // method for creating hashmaps to use in building API endpoints
    private HashMap<String, Object> makeMapForResponseEntity(String key, Object value) {
        HashMap<String, Object> map = new LinkedHashMap<>();
        map.put(key, value);
        return map;
    }

    // API end point to see the relevent information about each game they are in, including
    // shots, turns, score, etc. This information is scoped with authentication to
    // prevent players from seeing opposing players information
    @RequestMapping("/gp_view/{gpID}")
    public Map<String, Object> gpView(@PathVariable long gpID, Authentication auth) {

        // checks to see if the player has authority to view the requested information
        if (getAuthenticatedPlayer(auth).getuserName() == gamePlayerRepo.getOne(gpID).getPlayer().getuserName()){
            Map<String, Object> gamePlayerMap = new HashMap<>();
            List<Object> gpOBJ = new ArrayList<>();
            // make a map of a game players game information.
            gamePlayerMap.put("gpID", gamePlayerRepo.getOne(gpID).getId());
            gamePlayerMap.put("realName", gamePlayerRepo.getOne(gpID).getPlayer().getuserName());
            gamePlayerMap.put("ships", getShipsfromGamePlayer(gamePlayerRepo.getOne(gpID)));
            gamePlayerMap.put("salvoes", getSalvoesfromGamePlayer(gamePlayerRepo.getOne(gpID)));
            gpOBJ.add(gamePlayerMap);
            // opponent information used for development purposes
            Map<String, Object> gpViewMap = new HashMap<>();
            gpViewMap.put("opponentInformation", getOpponentInfo(gamePlayerRepo.getOne(gpID)));
            gpViewMap.put("game_player", gpOBJ);
            return gpViewMap;
        }
        else {
            return makeMapForResponseEntity("error", HttpStatus.FORBIDDEN);
        }
    }

    // non-scoped information about a specific game. This should be only available to Admins intead of users.
    @RequestMapping("/game_view/{gameID}")
    public Map<String, Object> gameView(@PathVariable long gameID) {

        List<Object> playersInGameObject = new ArrayList<>();
        Map<String, Object> gamePlayersMap = new HashMap<>();
        // for each game in the repository
        gamesRepo.findAll().stream().forEach(game -> {
            if (game.getId() == gameID) {
                game.getGamePlayers().stream().forEach(gamePlayer -> {
                    Map<String, Object> singleGamePlayerMap = new HashMap<>();
                    // map relavent information about the game
                    singleGamePlayerMap.put("gpID", gamePlayer.getId());
                    singleGamePlayerMap.put("playerID", gamePlayer.getPlayer().getId());
                    singleGamePlayerMap.put("playerName", gamePlayer.getPlayer().getuserName());
                    singleGamePlayerMap.put("ships", getShipsfromGamePlayer(gamePlayer));
                    singleGamePlayerMap.put("salvoes", getSalvoesfromGamePlayer(gamePlayer));
                    playersInGameObject.add(singleGamePlayerMap);
                });
                gamePlayersMap.put("gameID", game.getId());
            }
        });
        gamePlayersMap.put("GamePlayersInThisGame", playersInGameObject);
        return gamePlayersMap;
    }
    // scoped API endpoint about a given gameplayers shots. Used to help build UI of game board
     @RequestMapping(path = "/games/players/{gamePlayerId}/salvoes")
     public Map<String, Object> getSalvoes(@PathVariable long gamePlayerId, Authentication auth) {

        if (getAuthenticatedPlayer(auth).getuserName() == gamePlayerRepo.getOne(gamePlayerId).getPlayer().getuserName()) {
            GamePlayer aGamePlayer = gamePlayerRepo.findOne(gamePlayerId);
            Game currentGame = gamePlayerRepo.findById(aGamePlayer.getId()).getGame();

            Set<GamePlayer> set = new HashSet<>(currentGame.getGamePlayers());

            Set<GamePlayer> filteredSet = new HashSet<>();

		// iterate through the set
            for (GamePlayer g : set) {
                // filter languages that start with C
                if (g.getId() == aGamePlayer.getId()) {
                } else {
                    filteredSet.add(g);
                }
            }
            GamePlayer Opponent = filteredSet.iterator().next();

            List<Object> myObject = new ArrayList<>();
            List<Object> opponentObject = new ArrayList<>();
            // map of the location and turn of each of the opponents shots
            Opponent.salvoes.stream().forEach(turn -> {
                Map<String, Object> salvoesMap = new HashMap<>();
                salvoesMap.put("shotLocations", turn.getLocations());
                salvoesMap.put("turn", turn.getTurn());
                opponentObject.add(salvoesMap);
            });
            // map of the location and turn of each of the game player's shots
            aGamePlayer.salvoes.stream().forEach(turn -> {
                Map<String, Object> salvoesMap = new HashMap<>();
                salvoesMap.put("shotLocations", turn.getLocations());
                salvoesMap.put("turn", turn.getTurn());
                myObject.add(salvoesMap);
            });
            // determines who shoots first based on who entered the game first.
            Boolean firstPersonToShoot = aGamePlayer.getGameTime().isBefore(Opponent.getGameTime());
            // map of each players turn, to determine who should shoot next
              Map<String, Object> finalSalvoeMap = new HashMap<>();
                finalSalvoeMap.put("myTurns", myObject);
                finalSalvoeMap.put("theirTurns", opponentObject);
                finalSalvoeMap.put("firstPersonToShoot", firstPersonToShoot);
                return finalSalvoeMap;
        }
        return makeMapForResponseEntity("error", HttpStatus.FORBIDDEN);
    }
    // simple endpoint of all of the ships in all of the games
    @RequestMapping(path = "/ships")
     public Map<String, Object> getShips() {
        List<Object> shipObject = new ArrayList<>();
        shipsRepo.findAll().stream().forEach(ship -> {
            Map<String, Object> shipsMap = new HashMap<>();
            // basic information about each ship
            shipsMap.put("ShipID", ship.getId());
            shipsMap.put("ShipLocation", ship.getlocation());
            shipsMap.put("ShipType", ship.getShipType());
            shipsMap.put("sunk", ship.isSunk());
            shipObject.add(shipsMap);
        });
        Map<String, Object> finalShipMap = new HashMap<>();
        finalShipMap.put("ships", shipObject);
        return finalShipMap;
    }
    // scoped post request to add ships to a newly created game. It takes a set of multiple
    // ships as an input in the form of a JSON object.
    @RequestMapping(path = "/games/players/{gamePlayerId}/ships", method=RequestMethod.POST)
     public ResponseEntity<Map<String, Object>> addShips(@PathVariable long gamePlayerId,
                                                          Authentication authentication,
                                                          @RequestBody Set<Ship> sentShips) {
        // there is no current user logged in, or
        GamePlayer currentGP = gamePlayerRepo.findById(gamePlayerId);
        Player loggedInPlayer = playersRepo.findUserByUserName(authentication.getName());
        if (getAuthenticatedPlayer(authentication).getuserName()== null){
            return new ResponseEntity<>(makeMapForResponseEntity("error", "you are not logged in"), HttpStatus.UNAUTHORIZED);

            //there is no game player with the given ID, or
        } else if (gamePlayerRepo.findOne(gamePlayerId) == null){
            return new ResponseEntity<>(makeMapForResponseEntity("error", "no such game player"), HttpStatus.UNAUTHORIZED);

        //the current user is not the game player the ID references
        }  else if (!loggedInPlayer.getGamePlayers().contains(currentGP)){
            return new ResponseEntity<>(makeMapForResponseEntity("error", "not your game"), HttpStatus.UNAUTHORIZED);
        }
        //add ships
         else {
             Map<Object,Object> results = new HashMap<>();
            // add each ships to the current game player's repository
            sentShips.stream().forEach(ship -> {
                 currentGP.addShip(ship);
                 shipsRepo.save(ship);
                 // basic information about each new ship
                 results.put(ship.getId(), ship.getlocation());
            });
            return new ResponseEntity<>(makeMapForResponseEntity("addedShips", results), HttpStatus.CREATED);
        }
    }

    // scoped post request to add salvoes to a game. It takes a set of multiple
    // salvoes as an input in the form of a JSON object.
    @RequestMapping(path = "/games/players/{gamePlayerId}/salvoes", method=RequestMethod.POST)
     public ResponseEntity<Map<String, Object>> addSalvoes(@PathVariable long gamePlayerId,
                                                          Authentication authentication,
                                                          @RequestBody Salvo shot) {
        // there is no current user logged in, or
        if (getAuthenticatedPlayer(authentication).getuserName()== null){
            return new ResponseEntity<>(makeMapForResponseEntity("error", "you are not logged in"), HttpStatus.UNAUTHORIZED);

            //there is no game player with the given ID, or
        } else if (gamePlayerRepo.findOne(gamePlayerId) == null){
            return new ResponseEntity<>(makeMapForResponseEntity("error", "no such game player"), HttpStatus.UNAUTHORIZED);

        }
        // if authorized
         else {
             GamePlayer currentGP = gamePlayerRepo.getOne(gamePlayerId);
             Map<Object,Object> results = new HashMap<>();
             currentGP.addSalvo(shot);
             salvoeRepo.save(shot);
             results.put(shot.getId(), shot.getLocations());
             // for sucessful requests, return information to the player about what was updated
             return new ResponseEntity<>(makeMapForResponseEntity("ShotsFired", results), HttpStatus.CREATED);
        }
    }
    // method to return all of the ships from a specific gameplayer. To use in other
    // request mapping API endpoints
    public List<Object> getShipsfromGamePlayer(GamePlayer singleGP) {
        List<Object> shipsObj = new ArrayList<>();
        singleGP.getShips().stream().forEach(ship -> {
            Map<String, Object> ships = new HashMap<>();
            ships.put("location", ship.getlocation());
            ships.put("type", ship.getShipType());
            ships.put("sunk", ship.isSunk());
            ships.put("shipID", ship.getId());
            shipsObj.add(ships);
        });
        return shipsObj;
    }
    // method to return information about a given gameplayer's opponents.
    // useful for other API endpoint structuring
    public List<Object> getOpponentInfo (GamePlayer you){
        List<Object> opponentObj = new ArrayList<>();
        you.getGame().getGamePlayers().stream().forEach(dude -> {
            if (dude.getId() != you.getId()){
                Map<String, Object> oppData = new HashMap<>();
                oppData.put("enemySalvoes", getSalvoesfromGamePlayer(dude));
                oppData.put("enemyShips", getShipsfromGamePlayer(dude));
                opponentObj.add(oppData);
            }
        });
        return opponentObj;
    }

    // method to return all of the shots from a specific gameplayer. To use in other
    // request mapping API endpoints
    public List<Object> getSalvoesfromGamePlayer(GamePlayer singleGP) {
        List<Object> salvoesObj = new ArrayList<>();
        singleGP.getSalvoes().stream().sorted(Comparator.comparing(Salvo::getTurn)).forEach(salvo -> {
            Map<String, Object> ships = new HashMap<>();
            ships.put("turn", salvo.getTurn());
            ships.put("location", salvo.getLocations());
            salvoesObj.add(ships);
        });
        return salvoesObj;
    }

    //post request from Javascript method to notifity the database that a given
    // ship has been sunk
    @RequestMapping(path = "/games/players/{gamePlayerId}/sinks", method=RequestMethod.POST)
     public ResponseEntity<Map<String, Object>> updateSinks(@PathVariable long gamePlayerId,
                                                          Authentication authentication,
                                                          @RequestBody Long theShipID) {
        // there is no current user logged in, or
        GamePlayer currentGP = gamePlayerRepo.findById(gamePlayerId);
        Player loggedInPlayer = playersRepo.findUserByUserName(authentication.getName());
        if (getAuthenticatedPlayer(authentication).getuserName()== null){
            return new ResponseEntity<>(makeMapForResponseEntity("error", "you are not logged in"), HttpStatus.UNAUTHORIZED);
            //there is no game player with the given ID, or
        } else if (gamePlayerRepo.findOne(gamePlayerId) == null){
            return new ResponseEntity<>(makeMapForResponseEntity("error", "no such game player"), HttpStatus.UNAUTHORIZED);

        //the current user is not the game player the ID references
        }  else if (!loggedInPlayer.getGamePlayers().contains(currentGP)){
            return new ResponseEntity<>(makeMapForResponseEntity("error", "not your game"), HttpStatus.UNAUTHORIZED);
        }
        //mark a selected ship as sunk
         else {
             Ship currentShip = shipsRepo.findOne(theShipID);
             currentShip.setSunk(true);
             shipsRepo.save(currentShip);
             // tell the user that their request was successful
            return new ResponseEntity<>(makeMapForResponseEntity("sunkenShip", currentShip.getShipType()), HttpStatus.CREATED);
        }
    }

    // update player scores. This is a post request that only fires if the
    // javascript engines that a gameplayer has had all of their ships sunk
       @RequestMapping(path = "/games/players/{gamePlayerId}/scores", method=RequestMethod.POST)
     public ResponseEntity<Map<String, Object>> postScores(@PathVariable long gamePlayerId,
                                                          Authentication authentication,
                                                          @RequestBody Double theScore) {
        GamePlayer currentGP = gamePlayerRepo.findById(gamePlayerId);
        Game currentGame = currentGP.getGame();
        // mark specified game as finished and update the database
        currentGame.isFinished(true);
        gamesRepo.save(currentGame);
        Player loggedInPlayer = playersRepo.findUserByUserName(authentication.getName());

        // create a set of the two gameplayers in this specific game
       Set<GamePlayer> set = new HashSet<>(currentGame.getGamePlayers());

            Set<GamePlayer> filteredSet = new HashSet<>();
		// iterate through the set
            for (GamePlayer g : set) {
                //
                if (g.getId() == currentGP.getId()) {
                } else {
                    filteredSet.add(g);
                }
            }
        GamePlayer Opponent = filteredSet.iterator().next();
            // add a score of 1 or 0 to each gameplayer's database.
        Score winnerScore = new Score(loggedInPlayer, currentGame, theScore );
        Score loserScore = new Score(Opponent.getPlayer(), currentGame, 0.0);

        scoreRepo.save(winnerScore);
        scoreRepo.save(loserScore);
        //return request information to the user
        return new ResponseEntity<>(makeMapForResponseEntity("sunkenShip", loggedInPlayer.getScore()), HttpStatus.CREATED);
    }
}