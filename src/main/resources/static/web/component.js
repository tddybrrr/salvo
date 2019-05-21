

export default {
  template: `
  <div>
    <div id="gridZone">
         <h1>{{name}}</h1>
             <select v-model="selected" v-on:change="makeGameView">
                  <option disabled value="">Please select one</option>
                  <option v-for="(item, index) in ids" :key="index"> {{item}}</option>
            </select>
    </div>

    <br>
    <hr>
    <br>
    <div id=selectors>
         <form id="shipSelector">
            <div class="form-group row">
                <label for="shipTypeSelector" class="col-sm-6 col-form-label">ship type:
                </label>
                <div class="col-sm-6">
                    <select v-model="shipType" id="shipTypeSelector" name="shipTypeSelector">
                        <option value="4">Destroyer (4)</option>
                        <option value="5">Aircraft Carrier (5)</option>
                        <option value="2">Helicopter (2)</option>
                        <option value="3">Submarine (3)</option>
                    </select>
                </div>
            </div>
            <br>
            <div class="form-group row">
                <label class="col-sm-6 col-form-label">ship direction:
                </label>
                <div class="col-sm-6">

                    <input type="checkbox" id="goingRight" v-model="goingRight">
                        <label for="goingRight">Is the ship going right? {{ goingRight }}</label>
                </div>
            </div>
               <br>
            <div class="form-group row">
                <div class="col-sm-6">
                    <input v-model="shipPoint" placeholder="starting point">
                </div>
            </div>
               <br>
            <div class="form-row">
                <button type="button" id="addShipBtn" v-on:click="addShip"> Add ship</button>
            </div>
        </form>

        <form id="shotSelector">
            <input id="shot" v-model="shot" placeholder="type where you shooting">
              <button type="button" id="addShot" v-on:click="shots.push(shot)"> enter a shot </button>
              <ul>
                <li v-for="(item, index) in shots" :key="index"> {{ item }} </li>
              </ul>
               <button type="button" id="addShot" v-on:click="shoot"> submit all shots</button>
        </form>
    </div>
</div>
  `,
  data() {
    return {
      name: 'Choose a game',
      selected: 1,
      ids: [],
      shipType: null,
      goingRight: null,
      shipPoint: null,
      isNewGame: null,
      shot: null,
      shots: []
    }
  },
  created(){
      fetch(("http://localhost:8080/api/CurrentPlayersGames"), {
                method: "GET",
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/x-www-form-urlencoded'
                         }
                })
                .then(response => response.json())
                .then(gpData => {
                   this.ids = gpData;
                }).catch(function(error) {
                  // called when an error occurs anywhere in the chain
                  console.log(error);
                });

                 if (window.location.href.indexOf('gp=') == -1){
                    this.$emit('update', 'no GP in url');

                } else {
                    var url = window.location.href;
                    var gpNum = url.split('gp=').pop();
                    this.selected=gpNum;
                    this.makeGameView();
                }
  },
  methods:{

    shoot: function(){
                var shots = this.shots
                var anObject =  { "turn": 0, "location": shots };
                var selected = this.selected;

               fetch('/api/games/players/' + selected + '/salvoes', {
                  credentials: 'include',
                  method: 'POST',
                  headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json'
                  },
                body: JSON.stringify(anObject)
              })
              .then(response => response.json())
              .then(function(data) {
                window.location.href="/web/testVue.html?gp=" + selected;
//                location.reload();
            })
                .catch(err => console.log(err))
    },
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
                if (gpData.error === "FORBIDDEN"){
                     alert("not your game bro");
                } else if (gpData.error === "Unauthorized"){
                    alert("not logged in");
                }
                else  {
                    this.name = gpData.game_player[0].realName + "'s View";
                    this.build(gpData);
                }
            }).catch(function(error) {
              // called when an error occurs anywhere in the chain
              console.log(error);
            });
    },
        addShip: function (start, ship, right){

        var start = this.shipPoint;
        var ship = this.shipType;
        var shipTypeText = '';
        if (ship == 2){
            shipTypeText = "Helicopter"
        } else if (ship == 3){
            shipTypeText = "Submarine"
        } else if (ship == 4){
            shipTypeText = "Destroyer"
        } else if (ship == 5){
            shipTypeText = "Aircraft Carrier"
        }
        var right = this.goingRight;
          try {
            if(right == null) throw "select a direction";
            if(start == null) throw "select a starting point";
            if(ship == null) throw "select a ship";
          }
          catch(err) {
        alert("error: " + err);
        return;
        }
        var newArr= [];
          var letters=["a", "b", "c", "d", "e", "f", "g", "h"];
            if (right === false){
              var startingNum = start.charAt(1);
              for (let i=0; i<ship; i++){
                if (startingNum > 8){
                  return start.charAt(0) + startingNum  + " is out of range";
                }
                newArr.push(start.charAt(0)+startingNum);
                startingNum++;
              }
            } else {
              var startingIndex = letters.indexOf(start.charAt(0));
              for (let i=0; i<ship; i++){
                 if ((letters[startingIndex]) === undefined){
                  return "ship selection is out of range";
                }
                newArr.push(letters[startingIndex] + start.charAt(1));
                startingIndex++;
              }
            }
            console.log(newArr);
            var anObject =  { "shipType": shipTypeText, "location": newArr };

//            var gamePlayerId = 1;
            fetch('/api/games/players/' + this.selected + '/ships', {
                  credentials: 'include',
                  method: 'POST',
                  headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json'
                  },
//                body: JSON.stringify(sampleObject)
                body: JSON.stringify(anObject)
              })
              .then(response => response.json())
              .then(function(data) {
                console.log(data);
                location.reload();
            })
                .catch(err => console.log(err))
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