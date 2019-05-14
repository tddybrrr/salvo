

export default {
  template: `
    <div id="gridZone">
         <h1>{{name}}</h1>
             <select v-model="selected" v-on:change="makeGameView">
                  <option disabled value="">Please select one</option>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
        </select>
    </div>
  `,
  data() {
    return {
      name: 'Choose a game',
      selected: 1
    }
  },
  methods:{

    makeGameView: function(){
        fetch(("http://localhost:8080/api/gp_view/"+ this.selected), {
            method: "GET",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/x-www-form-urlencoded'
                     }
            })
            .then(response => response.json())
            .then(gpData => {
                console.log(gpData);
                if (gpData.error === "FORBIDDEN"){
                     alert("not your game bro");
                } else if (gpData.error === "Unauthorized"){
                    alert("not logged in");
                }
                else  {
                    console.log(gpData.game_player[0].realName);
                    this.name = gpData.game_player[0].realName + "'s View";
                    this.build(gpData);
                }
            }).catch(function(error) {
              // called when an error occurs anywhere in the chain
              console.log(error);
            });
    },

    alertShit: function(whatever){
            alert(whatever);
    },
    build: function(data){

        var gridZone = document.getElementById('gridZone');
        var daGrids = document.getElementById('daGrids');

        // deletes innerHTML if a grid was built before
        if (daGrids){
            daGrids.innerHTML="";
        } else {
            var daGrids = document.createElement('div');
                daGrids.id="daGrids";
        }

        gridZone.appendChild(daGrids);

        var myGrid = document.createElement("table");
        myGrid.classList.add("table", "table-bordered");
        var myGridTitle = document.createElement('caption');
        myGridTitle.innerHTML = "my grid";

        myGrid.id="myGrid";
        daGrids.appendChild(myGrid);

        var whereIveShot = document.createElement("table");
        whereIveShot.classList.add("table", "table-dark",  "table-bordered")
        var whereIveShotTitle = document.createElement('caption');
        whereIveShotTitle.innerHTML = "Where I have shot";

        whereIveShot.id="whereIveShot";
        daGrids.appendChild(whereIveShot);

        var letters = ["", "a", "b", "c", "d", "e", "f", "g", "h"];

        for (var i=0; i< 9; i++){
            var rowMy = myGrid.insertRow(i);
            var rowShot = whereIveShot.insertRow(i);

            // first row of letters
            if (i==0){
                for (var c=0; c<9; c++){
                    var cellMy = rowMy.insertCell(c);
                    var cellShot = rowShot.insertCell(c);

                    cellMy.innerHTML=letters[c];
                    cellMy.style.fontWeight="bold";

                    cellShot.innerHTML=letters[c];
                    cellShot.style.fontWeight="bold";
                }
            // rest of the rows
            } else if (i>0) {
                // fill left-most cell with row number
                var cellMy = rowMy.insertCell(0);
                cellMy.innerHTML=i;
                cellMy.style.fontWeight="bold";

                var cellShot = rowShot.insertCell(0);
                cellShot.innerHTML=i;
                cellShot.style.fontWeight="bold";
                // fill main grid with letter/number coordinates
                for (var g=1; g<9; g++){
                    var cellMy = rowMy.insertCell(g);
                    var cellShot = rowShot.insertCell(g);

                    for (let p=0; p<data.game_player[0].ships.length; p++){
                        for (let x=0; x<data.game_player[0].ships[p].location.length; x++){
                             if (data.game_player[0].ships[p].location[x] == letters[g]+i) {
                                cellMy.style.backgroundColor = "blue";
                             }
                             for (let b=0; b<data.opponentInformation[0].enemySalvoes.length; b++){
                                for (let h=0; h < data.opponentInformation[0].enemySalvoes[b].location.length; h++){
                                    if (data.opponentInformation[0].enemySalvoes[b].location[h] == letters[g]+i){
                                    cellMy.innerHTML = "x" + data.opponentInformation[0].enemySalvoes[b].turn;
                                        if (data.game_player[0].ships[p].location[x] == data.opponentInformation[0].enemySalvoes[b].location[h]){
                                            cellMy.style.backgroundColor = "red";
                                        }
                                    }
                                }
                             }
                        }
                    }
                    for (let p=0; p<data.opponentInformation[0].enemyShips.length; p++){
                        for (let x=0; x<data.opponentInformation[0].enemyShips[p].location.length; x++){

                             for (let b=0; b<data.game_player[0].salvoes.length; b++){
                                for (let h=0; h < data.game_player[0].salvoes[b].location.length; h++){
                                    if (data.game_player[0].salvoes[b].location[h] == letters[g]+i){
                                    cellShot.innerHTML = "x" + data.game_player[0].salvoes[b].turn;
                                        if (data.opponentInformation[0].enemyShips[p].location[x] == data.game_player[0].salvoes[b].location[h]){
                                            cellShot.style.backgroundColor = "red";
                                        }
                                    }
                                }
                             }
                        }
                    }
                }
            }
        }
        myGrid.appendChild(myGridTitle);
        whereIveShot.appendChild(whereIveShotTitle);
    }
  }
}