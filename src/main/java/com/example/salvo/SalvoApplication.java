package com.example.salvo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configurers.GlobalAuthenticationConfigurerAdapter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.WebAttributes;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.util.Arrays;

@SpringBootApplication
public class SalvoApplication {

    public static void main(String[] args) {
        SpringApplication.run(SalvoApplication.class, args);
    }
    // initialize application with a serires of repositories
    @Bean
    public CommandLineRunner initData(PlayerRepository playersRepo, GameRepository gamesRepo, GamePlayerRepository gamePlayerRepo,
                                      ShipRepository shipsRepo, SalvoRepository salvoeRepo, ScoreRepository scoreRepo) {
        return (args) -> {

            // base level player data to use for production. Comment out data to start a server without any data.

            // Data includes creating players (w/ username and passwords), games, gameplayers (an instance of a player in a game),
            // ships, and shot locations.
            Player p1 = new Player("Jack");
            Player p2 = new Player("Chloe");
            Player p3 = new Player("Kim");

            p1.setPassword("24");
            p2.setPassword("poop");
            p3.setPassword("kb");

            playersRepo.save(p1);
            playersRepo.save(p2);
            playersRepo.save(p3);

            Game g1 = new Game();
            Game g2 = new Game();
            Game g3 = new Game();

            gamesRepo.save(g1);
            gamesRepo.save(g2);
            gamesRepo.save(g3);

            GamePlayer gp1 = new GamePlayer(g1, p1);
            GamePlayer gp2 = new GamePlayer(g1, p2);
            GamePlayer gp3 = new GamePlayer(g2, p3);
            GamePlayer gp4 = new GamePlayer(g2, p1);
            GamePlayer gp5 = new GamePlayer(g3, p2);
            GamePlayer gp6 = new GamePlayer(g3, p3);

            gamePlayerRepo.save(gp1);
            gamePlayerRepo.save(gp2);
            gamePlayerRepo.save(gp3);
            gamePlayerRepo.save(gp4);
            gamePlayerRepo.save(gp5);
            gamePlayerRepo.save(gp6);


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

            Ship ship8 = new Ship("submarine");
            ship8.setlocation((Arrays.asList("e5", "f5", "g5")));

            Ship ship9 = new Ship("aircraft");
            ship9.setlocation((Arrays.asList("d7", "e7", "f7")));

            Ship ship10 = new Ship("aircraft");
            ship10.setlocation((Arrays.asList("g4", "g5", "g6")));

            gp1.addShip(ship1);
            gp1.addShip(ship2);

            gp2.addShip(ship3);
            gp2.addShip(ship4);

            gp3.addShip(ship5);
            gp3.addShip(ship6);

            gp4.addShip(ship7);
            gp4.addShip(ship8);

            gp5.addShip(ship9);
            gp6.addShip(ship10);

            Salvo salv1 = new Salvo(1);
            salv1.setlocation((Arrays.asList("e4", "d7")));
            gp1.addSalvo(salv1);

            Salvo salv2 = new Salvo(1);
            salv2.setlocation((Arrays.asList("h1", "e2")));
            gp2.addSalvo(salv2);

            Salvo salv3 = new Salvo(2);
            salv3.setlocation((Arrays.asList("h1", "d3")));
            gp1.addSalvo(salv3);

            Salvo salv4 = new Salvo(2);
            salv4.setlocation((Arrays.asList("f7", "f8")));
            gp2.addSalvo(salv4);

            Salvo salv5 = new Salvo(3);
            salv5.setlocation((Arrays.asList("a4", "e6")));
            gp1.addSalvo(salv5);

            Salvo salv6 = new Salvo(3);
            salv6.setlocation((Arrays.asList("d2", "d8")));
            gp2.addSalvo(salv6);

            Salvo salv7 = new Salvo(3);
            salv7.setlocation((Arrays.asList("b1", "b8")));
            gp3.addSalvo(salv7);

            Score score1 = new Score(p1, g1, 1.0);
            Score score2 = new Score(p2, g1, 0.0);
            Score score3 = new Score(p1, g2, .5);
            Score score4 = new Score(p3, g2, .5);

            scoreRepo.save(score1);
            scoreRepo.save(score2);
            scoreRepo.save(score3);
            scoreRepo.save(score4);

            salvoeRepo.save(salv1);
            salvoeRepo.save(salv2);
            salvoeRepo.save(salv3);
            salvoeRepo.save(salv4);
            salvoeRepo.save(salv5);
            salvoeRepo.save(salv6);
            salvoeRepo.save(salv7);

            shipsRepo.save(ship1);
            shipsRepo.save(ship2);
            shipsRepo.save(ship3);
            shipsRepo.save(ship4);
            shipsRepo.save(ship5);
            shipsRepo.save(ship6);
            shipsRepo.save(ship7);
            shipsRepo.save(ship8);
            shipsRepo.save(ship9);
            shipsRepo.save(ship10);
        };
    }
}


// SECURITY SECTION
@EnableWebSecurity
@Configuration
class WebSecurityConfiguration extends GlobalAuthenticationConfigurerAdapter {

    // inject playersrepo dependencies
    @Autowired
    PlayerRepository playersRepo;

    @Override
    public void init(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(inputName-> {
            Player player = playersRepo.findUserByUserName(inputName);
            // checks to see if player logging in exists
            if (player != null) {
                return new User(player.getuserName(), player.getPassword(),
                        // designates the player as a User, rather than an admin
                        AuthorityUtils.createAuthorityList("USER"));
            } else {
                //throw error for wrong username
                throw new UsernameNotFoundException("Unknown user: " + inputName);
            }
        });
    }
}

@Configuration
@EnableWebSecurity
class WebSecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests()
                // give user access to all of the neccessary game files and api routes
            .antMatchers("/web/games.html").permitAll()
            .antMatchers("/web/games.css").permitAll()
            .antMatchers("/web/games.js").permitAll()
            .antMatchers("/web/game.html").permitAll()
            .antMatchers("/web/testVue.html").permitAll()
            .antMatchers("/web/testVue.js").permitAll()
            .antMatchers("/web/testVue.css").permitAll()
            .antMatchers("/web/component.js").permitAll()
            .antMatchers("/web/game.css").permitAll()
            .antMatchers("/web/game.js").permitAll()
            .antMatchers("/api/games").permitAll()
            .antMatchers("/api/ships").permitAll()
            .antMatchers("/api/leaderboard").permitAll()
            .antMatchers("/api/players").permitAll()
            .antMatchers("/api/gamePlayers").permitAll()
            .antMatchers("/favicon.ico").permitAll()
            .antMatchers("/**").hasAuthority("USER")
            .anyRequest().authenticated();
        http.formLogin()
            .loginPage("/api/login")
            .usernameParameter("userName")
            .passwordParameter("password");
        http.logout()
            .logoutUrl("/api/logout");

        // turn off checking for CSRF tokens
        http.csrf().disable();

        // if user is not authenticated, just send an authentication failure response
        http.exceptionHandling().authenticationEntryPoint((req, res, exc) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED));

        // if login is successful, just clear the flags asking for authentication
        http.formLogin().successHandler((req, res, auth) -> clearAuthenticationAttributes(req));

        // if login fails, just send an authentication failure response
        http.formLogin().failureHandler((req, res, exc) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED));

        // if logout is successful, just send a success response
        http.logout().logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler());
    }

    private void clearAuthenticationAttributes(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.removeAttribute(WebAttributes.AUTHENTICATION_EXCEPTION);
        }
    }
}


