package com.example.salvo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class SalvoController {

    @Autowired
    private GameRepository gameRepo;

    @Autowired
    private PlayerRepository playerRepo;

    @Autowired
    private GamePlayerRepository gpRepo;

    @RequestMapping("/games")
    public Map<String, Object> getGames() {

        List<Object> gamesObject = new ArrayList<>();

        List<Object> playersObj = new ArrayList<>();

        Map<String, Object> playersMap = new HashMap<>();

        gameRepo.findAll().stream().forEach(each -> {

            Map<String, Object> gamesMap = new HashMap<>();
            List<Object> gpObject = new ArrayList<>();

            gpRepo.findAll().stream().forEach(eachGP -> {

                Map<String, Object> gpMap = new HashMap<>();

                if (each.getGamePlayers().contains(eachGP)) {

                    playerRepo.findAll().stream().forEach(eachPlayer -> {

                        if (eachGP.getPlayer().getFirstName() == eachPlayer.getFirstName() ){
                            playersMap.put("playerName", eachPlayer.getFirstName());
                            playersMap.put("playerID", eachPlayer.getId());
                            playersObj.add(playersMap);
                        }
                    });
                    gpMap.put("gpID", eachGP.getId());
                    gpMap.put("gpName", eachGP.getPlayer().getFirstName());
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

        finalMapOfGames.put("games!", gamesObject);

        return finalMapOfGames;
    }

    @RequestMapping("/players")
    public Map<String, Object> getPlayers() {

        List<Object> playerObj = new ArrayList<>();

        playerRepo.findAll().stream().forEach(playa -> {
            Map<String, Object> playersMap = new HashMap<>();
            playersMap.put("firstName", playa.getFirstName());
            playerObj.add(playersMap);
        });

        Map<String, Object> playerMap = new HashMap<>();

        playerMap.put("players", playerObj);

        return playerMap;
    }
}
