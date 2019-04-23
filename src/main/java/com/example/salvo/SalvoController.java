package com.example.salvo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
//
//    @RequestMapping("/login")
//    public Player loggedPlayer() {
//
//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//
//        if (!(authentication instanceof AnonymousAuthenticationToken)) {
//            return playersRepo.findUserByUserName(authentication.getName());
//        }
//        else return null;
//    }

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
    @RequestMapping("/games")
    public Map<String, Object> getGames() {

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
            gamesMap.put("gameMinute", each.getGameTime().getMinute());
            gamesMap.put("gameNano", each.getGameTime().getNano());
            gamesMap.put("gamePlayers", gpObject);
            gamesObject.add(gamesMap);
        });

        Map<String, Object> finalMapOfGames = new HashMap<>();

        finalMapOfGames.put("scores", getleaderboard());
        finalMapOfGames.put("games", gamesObject);

        return finalMapOfGames;
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

    @RequestMapping("/gp_view/{gpID}")
    public Map<String, Object> gpView(@PathVariable long gpID) {

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

    public List<Object> getShipsfromGamePlayer(GamePlayer singleGP) {
        List<Object> shipsObj = new ArrayList<>();
        singleGP.getShips().stream().forEach(ship -> {
            Map<String, Object> ships = new HashMap<>();
            ships.put("location", ship.getlocation());
            ships.put("type", ship.getShipType());
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
}


