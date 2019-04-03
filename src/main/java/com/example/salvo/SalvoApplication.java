package com.example.salvo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class SalvoApplication {

    public static void main(String[] args) {
        SpringApplication.run(SalvoApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(PlayerRepository playersRepo, GameRepository gamesRepo, GamePlayerRepository gamePlayerRepo) {
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
            GamePlayer gp4 = new GamePlayer(g2, p4);

            gamePlayerRepo.save(gp1);
            gamePlayerRepo.save(gp2);
            gamePlayerRepo.save(gp3);
            gamePlayerRepo.save(gp4);
        };
    }
}



