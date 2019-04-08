package com.example.salvo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@SpringBootApplication
public class SalvoApplication {

    public static void main(String[] args) {
        SpringApplication.run(SalvoApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(PlayerRepository playersRepo, GameRepository gamesRepo, GamePlayerRepository gamePlayerRepo,
                                      ShipRepository shipsRepo) {
        return (args) -> {

            Player p1 = new Player("Jack");
            Player p2 = new Player("Chloe");
            Player p3 = new Player("Kim");
            Player p4 = new Player("Ottavia");

            playersRepo.save(p1);
            playersRepo.save(p2);
            playersRepo.save(p3);
            playersRepo.save(p4);

            Game g1 = new Game();
            Game g2 = new Game();

            gamesRepo.save(g1);
            gamesRepo.save(g2);

            GamePlayer gp1 = new GamePlayer(g1, p1);
            GamePlayer gp2 = new GamePlayer(g1, p2);
            GamePlayer gp3 = new GamePlayer(g2, p3);
            GamePlayer gp4 = new GamePlayer(g2, p1);

            gamePlayerRepo.save(gp1);
            gamePlayerRepo.save(gp2);
            gamePlayerRepo.save(gp3);
            gamePlayerRepo.save(gp4);


            Ship ship1 = new Ship("destroyer");
            ship1.setlocation((Arrays.asList("h3", "h2", "h1")));

            Ship ship2 = new Ship("aircraft");
            ship2.setlocation((Arrays.asList("b3", "b4", "b5")));

            Ship ship3 = new Ship("submarine");
            ship3.setlocation((Arrays.asList("a1", "b1", "c1")));

            Ship ship4 = new Ship("jet");
            ship4.setlocation((Arrays.asList("e3", "e4", "e5")));

            Ship ship5 = new Ship("helicopter");
            ship5.setlocation((Arrays.asList("e5", "f5", "g5")));

            Ship ship6 = new Ship("tank");
            ship6.setlocation((Arrays.asList("c5", "c6", "c7")));


            Ship ship7 = new Ship("nuke");
            ship7.setlocation((Arrays.asList("d4", "e4", "f4")));

            gp1.addShip(ship1);
            gp1.addShip(ship2);
            gp2.addShip(ship3);
            gp2.addShip(ship4);
            gp3.addShip(ship5);
            gp3.addShip(ship6);
            gp4.addShip(ship7);

            shipsRepo.save(ship1);
            shipsRepo.save(ship2);
            shipsRepo.save(ship3);
            shipsRepo.save(ship4);
            shipsRepo.save(ship5);
            shipsRepo.save(ship6);
            shipsRepo.save(ship7);



















        };
    }
}


