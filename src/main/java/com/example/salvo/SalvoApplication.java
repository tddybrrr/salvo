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


            Ship ship1 = new Ship("Destroyer");
            ship1.setlocation((Arrays.asList("h3", "h2", "h1")));

            Ship ship2 = new Ship("aircraft");
            ship1.setlocation((Arrays.asList("b3", "b4", "b5")));

            Ship ship3 = new Ship("submarine");
            ship1.setlocation((Arrays.asList("a1", "b1", "c1")));

            Ship ship4 = new Ship("jet");
            ship1.setlocation((Arrays.asList("e3", "e4", "e5")));


            gp1.addShip(ship1);
            gp2.addShip(ship2);
            gp3.addShip(ship3);
            gp3.addShip(ship4);
            gp4.addShip(ship4);

            shipsRepo.save(ship1);
            shipsRepo.save(ship2);
            shipsRepo.save(ship3);
            shipsRepo.save(ship4);



















        };
    }
}



