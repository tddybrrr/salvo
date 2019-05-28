package com.example.salvo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

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

    private Player getAuthenticatedPlayer (Authentication authentication){
            return playersRepo.findUserByUserName(authentication.getName());
    };

    @RequestMapping("/games")
    public Map<String, Object> getGames(Authentication authentication) {

        List<Object> gamesObject = new ArrayList<>();

        List<Object> playersObj = new ArrayList<>();

        Map<String, Object> playersMap = new HashMap<>();

        // go through every game
        gamesRepo.findAll().stream().forEach(each -> {

            Map<String, Object> gamesMap = new HashMap<>();
            List<Object> gpObject = new ArrayList<>();

            // go through each game player in
            gamePlayerRepo.findAll().stream().forEach(eachGP -> {

                Map<String, Object> gpMap = new HashMap<>();
                //find matching gamePlayers in games
                if (each.getGamePlayers().contains(eachGP)) {
                    /// go through all the players
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

            gamesMap.put("gameID", each.getId());
            gamesMap.put("gameHour", each.getGameTime().getHour());
            gamesMap.put("gameMinute", each.getGameTime().getMinute());
            gamesMap.put("gamePlayers", gpObject);
            gamesObject.add(gamesMap);
        });

        Map<String, Object> finalMapOfGames = new HashMap<>();

        finalMapOfGames.put("scores", getleaderboard());
        finalMapOfGames.put("games", gamesObject);

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


    @RequestMapping(path = "/CurrentPlayersGames")
    public List<Long> getCurrentPlayersGames(Authentication auth) {
        ArrayList<Long> list = new ArrayList<>();
        Player currentPlayer = getAuthenticatedPlayer(auth);

        currentPlayer.getGamePlayers().stream().forEach(gamePlayer -> {
            list.add(gamePlayer.getId());
        });
        list.sort(null);
            return list;
    }

    @RequestMapping(path = "/games", method = RequestMethod.POST)
    public ResponseEntity<Map<String, Object>> createNewGame(Authentication authentication) {

        if (getAuthenticatedPlayer(authentication).getuserName()== null){
            return new ResponseEntity<>(makeMapForResponseEntity("error", "you are not logged in"), HttpStatus.UNAUTHORIZED);
        } else {

            Game aGame = new Game();
            gamesRepo.save(aGame);

            GamePlayer aGamePlayer= new GamePlayer(aGame, getAuthenticatedPlayer(authentication) );

            gamePlayerRepo.save(aGamePlayer);

            return new ResponseEntity<>(makeMapForResponseEntity("newGpID", aGamePlayer.getId()), HttpStatus.CREATED);
        }
    }

    @RequestMapping(path = "/game/{gameID}/players", method = RequestMethod.POST)
    public ResponseEntity<Map<String, Object>> joinGame(@PathVariable long gameID, Authentication authentication) {

        if (getAuthenticatedPlayer(authentication).getuserName()== null){
            return new ResponseEntity<>(makeMapForResponseEntity("error", "you are not logged in"), HttpStatus.UNAUTHORIZED);
        } else if (gamesRepo.findOne(gameID) == null){
            return new ResponseEntity<>(makeMapForResponseEntity("error", "no such game"), HttpStatus.FORBIDDEN);
        }   else if (gamesRepo.findOne(gameID).isFull()){
            return new ResponseEntity<>(makeMapForResponseEntity("error", "game is full"), HttpStatus.FORBIDDEN);
        } else {
            //get current game
            GamePlayer aGamePlayer= new GamePlayer(gamesRepo.getOne(gameID), getAuthenticatedPlayer(authentication) );
            gamePlayerRepo.save(aGamePlayer);
            return new ResponseEntity<>(makeMapForResponseEntity("newGpID", aGamePlayer.getId()), HttpStatus.CREATED);
        }
    }

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



    @RequestMapping("/gamePlayers")
    public Map<String, Object> getGamePlayers() {
        List<Object> gamePlayerObj = new ArrayList<>();
        gamePlayerRepo.findAll().stream().forEach(gamePlaya -> {
            Map<Long, Object> aMap = new HashMap<>();
            aMap.put(gamePlaya.getId(), getShipsfromGamePlayer(gamePlaya) );
            gamePlayerObj.add(aMap);
//            gamePlayerObj.add(getShipsfromGamePlayer(gamePlaya));
        });
        Map<String, Object> playerMap = new HashMap<>();
        playerMap.put("gamePlayers", gamePlayerObj);
        return playerMap;
    }

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
        return new ResponseEntity<>(makeMapForResponseEntity("New User", newPlayer.toString()), HttpStatus.CREATED);
    }

    private HashMap<String, Object> makeMapForResponseEntity(String key, Object value) {
        HashMap<String, Object> map = new LinkedHashMap<>();
        map.put(key, value);
        return map;
    }

    @RequestMapping("/gp_view/{gpID}")
    public Map<String, Object> gpView(@PathVariable long gpID, Authentication auth) {

        if (getAuthenticatedPlayer(auth).getuserName() == gamePlayerRepo.getOne(gpID).getPlayer().getuserName()){
            Map<String, Object> gamePlayerMap = new HashMap<>();
            List<Object> gpOBJ = new ArrayList<>();

            gamePlayerMap.put("gpID", gamePlayerRepo.getOne(gpID).getId());
            gamePlayerMap.put("realName", gamePlayerRepo.getOne(gpID).getPlayer().getuserName());
            gamePlayerMap.put("ships", getShipsfromGamePlayer(gamePlayerRepo.getOne(gpID)));
            gamePlayerMap.put("salvoes", getSalvoesfromGamePlayer(gamePlayerRepo.getOne(gpID)));

            gpOBJ.add(gamePlayerMap);

            Map<String, Object> gpViewMap = new HashMap<>();
            gpViewMap.put("opponentInformation", getOpponentInfo(gamePlayerRepo.getOne(gpID)));
            gpViewMap.put("game_player", gpOBJ);
            return gpViewMap;
        }
        else {
            return makeMapForResponseEntity("error", HttpStatus.FORBIDDEN);
        }
    }

    @RequestMapping("/game_view/{gameID}")
    public Map<String, Object> gameView(@PathVariable long gameID) {

        List<Object> playersInGameObject = new ArrayList<>();
        Map<String, Object> gamePlayersMap = new HashMap<>();

        gamesRepo.findAll().stream().forEach(game -> {
            if (game.getId() == gameID) {
                game.getGamePlayers().stream().forEach(gamePlayer -> {
                    Map<String, Object> singleGamePlayerMap = new HashMap<>();
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

     @RequestMapping(path = "/games/players/{gamePlayerId}/salvoes")
     public Map<String, Object> getSalvoes(@PathVariable long gamePlayerId, Authentication auth) {

        if (getAuthenticatedPlayer(auth).getuserName() == gamePlayerRepo.getOne(gamePlayerId).getPlayer().getuserName()) {
            GamePlayer aGamePlayer = gamePlayerRepo.findOne(gamePlayerId);
            List<Object> salvoeObject = new ArrayList<>();

            aGamePlayer.salvoes.stream().forEach(turn -> {
                Map<String, Object> salvoesMap = new HashMap<>();

                salvoesMap.put("shotLocations", turn.getLocations());
                salvoesMap.put("turn", turn.getTurn());
                salvoeObject.add(salvoesMap);
            });
              Map<String, Object> finalSalvoeMap = new HashMap<>();
                finalSalvoeMap.put("turns", salvoeObject);
                return finalSalvoeMap;
        }
        return makeMapForResponseEntity("error", HttpStatus.FORBIDDEN);
    }

    @RequestMapping(path = "/ships")
     public Map<String, Object> getShips() {
        List<Object> shipObject = new ArrayList<>();
        shipsRepo.findAll().stream().forEach(ship -> {
            Map<String, Object> shipsMap = new HashMap<>();
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

    @RequestMapping(path = "/games/players/{gamePlayerId}/ships", method=RequestMethod.POST)
     public ResponseEntity<Map<String, Object>> addShips(@PathVariable long gamePlayerId,
                                                          Authentication authentication,
                                                          @RequestBody Ship sentShip) {
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
//             GamePlayer currentGP = gamePlayerRepo.findById(gamePlayerId);
             Map<Object,Object> results = new HashMap<>();
              currentGP.addShip(sentShip);
             shipsRepo.save(sentShip);

             results.put(sentShip.getId(), sentShip.getlocation());

            return new ResponseEntity<>(makeMapForResponseEntity("addedShips", results), HttpStatus.CREATED);
        }
    }

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

        //the current user is not the game player the ID references
        }  else if (getAuthenticatedPlayer(authentication).getGamePlayers().stream().allMatch(
                gamePlayer -> gamePlayer.getId() == gamePlayerId)
                  ) {
            return new ResponseEntity<>(makeMapForResponseEntity("error", "not your game"), HttpStatus.UNAUTHORIZED);
        }
        //add ships
         else {
             GamePlayer currentGP = gamePlayerRepo.getOne(gamePlayerId);
             Map<Object,Object> results = new HashMap<>();
              currentGP.addSalvo(shot);
             salvoeRepo.save(shot);
             results.put(shot.getId(), shot.getLocations());

            return new ResponseEntity<>(makeMapForResponseEntity("ShotsFired", results), HttpStatus.CREATED);
        }
    }
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

    @RequestMapping(path = "/games/players/{gamePlayerId}/sinks", method=RequestMethod.POST)
     public ResponseEntity<Map<String, Object>> updateDinks(@PathVariable long gamePlayerId,
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
        //add ships
         else {
             Ship currentShip = shipsRepo.findOne(theShipID);
             currentShip.setSunk(true);
             shipsRepo.save(currentShip);
            return new ResponseEntity<>(makeMapForResponseEntity("sunkenShip", currentShip.getShipType()), HttpStatus.CREATED);
        }
    }
}