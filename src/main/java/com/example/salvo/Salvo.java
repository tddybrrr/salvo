package com.example.salvo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.GenericGenerator;
import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;


@Entity
public class Salvo {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
    @GenericGenerator(name = "native", strategy = "native")
    private long id;

    private Integer turn ;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="gamePlayer_id")
    private GamePlayer gamePlayer;

    @ElementCollection
    @Column(name="location")
    private List<String> location = new ArrayList<>();


    public Salvo() {}

    public Salvo(Integer turn) {
        this.turn = turn;
    }
    public void addLocations(List<String> location){

    }

    public void setGamePlayer(GamePlayer gamePlayer){
        this.gamePlayer  = gamePlayer;
    }
    public long getId(){
        return this.id;
    }

    public Integer getTurn(){
        return this.turn;
    }

    public List<String> getLocations(){
        return this.location;
    }

    public void setlocation(List<String> location) {
        this.location = location;
    }

    @Override
    public String toString() {
        return "Salvo{" +
                "id=" + id +
                ", turn=" + turn +
                ", salvoLocations=" + location +
                ", gamePlayer=" + gamePlayer +
                '}';
    }

    @JsonIgnore
    public GamePlayer getGamePlayer() {
        return this.gamePlayer;
    }


}
