

export default {
  template: `
  <div>
    <div id="gridZone">
         <h1>{{name}}</h1>
             <h4 v-if="isNewGame"> Set up your new game below </h4>
             <h3>selected gp: {{selected}}</h3>
             <select v-model="selected" v-on:change="makeGameView">
                  <option disabled value="">Please select one</option>
                  <option v-for="(item, index) in ids" :key="index"> {{item}}</option>
            </select>
               <br>
                <hr>
                <br>
    </div>
    <br>
    <hr>
    <br>
    <div id=selectors>
         <form id="shipSelector" v-if="isNewGame">
                <label for="shipTypeSelector" >ship type:
                </label>
                <select v-model="shipType" id="shipTypeSelector" name="shipTypeSelector">
                    <option v-for="(item, index) in shipList" :key="index" :value="item.shipsLength"> {{item.shipTypeName}} ({{item.shipsLength}}) </option>
                </select>

                <fieldset id="directions">
                     <legend >ship direction:
                    </legend>
                    <input type="radio" id="Right" value="Right" v-model="picked">
                    <label for="Right">Right</label>
                    <br>
                    <input type="radio" id="Down" value="Down" v-model="picked">
                    <label for="Down">Down</label>
                </fieldset>
                <fieldset>
                   <legend >starting point
                    </legend>
                    <input id="shipPoint" v-model="shipPoint" placeholder="(click cell on grid)">
                </fieldset>
                <br>
                <button type="button" id="addShipBtn" v-on:click="addShip"> Add ship</button>

        </form>
        <div id="shotSelector" v-else>
              <ul id="list">
               </ul>

               <button type="button" id="addShot" v-on:click="shoot"> Confirm Shots</button>
        </div>
    </div>
</div>
  `,
  data() {
    return {
      name: 'Choose a game',
      selected: null,
      /// GamePlayer ids for the currently loggedn player
      ids: [],
      shipType: 2,
      shipList: [
               {shipTypeName: "Helicopter", shipsLength: 2},
               {shipTypeName: "Submarine", shipsLength: 3},
               {shipTypeName: "Destoryer", shipsLength: 4},
               {shipTypeName: "Aircraft Carrier", shipsLength: 5},
      ],
      selectedShots: '',
      picked: 'Right',
      goingRight: null,
      shipPoint: null,
      isNewGame: null,
      shot: null,
      shots: [],
      turn: null,
      coordinates: []
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
            /// GamePlayer ids for the currently loggedn player
                    if (gpData.length == 0 ){
                        window.location.href = "games.html";

                    }
                    console.log(gpData.length);
                   this.ids = gpData;
                   if (window.location.href.indexOf('gp=') == -1){
                        this.selected = gpData[0];
                        this.checkTurn();
                        this.makeGameView();
                   } else {
                        var url = window.location.href;
                        var gpNum = url.split('gp=').pop();
                        this.selected=gpNum;
//                        this.checkTurn();
                        this.makeGameView();
                }
                }).catch(function(error) {
                  // called when an error occurs anywhere in the chain
                  console.log(error);
                });

  },
  methods:{
    gameOver: function(){
        alert("GAME OVER !!!!!!");
        var selected = this.selected;
        fetch('/api/games/players/' + selected + '/scores', {
                  credentials: 'include',
                  method: 'POST',
                  headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json'
                  },
                  body: 1.0
              })
              .then(response => response.json())
              .then(data => {
               console.log(data)
            })
                .catch(err => console.log(err))
    },
    checkTurn: function(){
        var selected = this.selected;
        fetch('/api/games/players/' + selected + '/salvoes', {
                  credentials: 'include',
                  method: 'GET',
                  headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json'
                  }
              })
              .then(response => response.json())
              .then(data => {
                this.turn = data.turns.length;
            })
                .catch(err => console.log(err))
    },
    checkSunk: function(someInfo){
            var theirShips = someInfo.opponentInformation[0].enemyShips;
            // each ship
            for (let i = 0; i<theirShips.length; i++){
                var hits = 0;
                // if the current ship in the loop is not already sunk
                if (theirShips[i].sunk == false ) {
                      // the locations of each ship's square
                     for (let x = 0; x<theirShips[i].location.length; x++){
                        // loop through every single turn
                        for (let h = 0; h<someInfo.game_player[0].salvoes.length; h++){
                            // loop though
                            for (let y = 0; y<someInfo.game_player[0].salvoes[h].location.length; y++){
                               if (theirShips[i].location[x] == someInfo.game_player[0].salvoes[h].location[y]){
                                 hits++;
                                 if (hits == theirShips[i].location.length){
                                    this.postSunk(theirShips[i].shipID);
                                    }
                                }
                            }
                        }
                     }
                 }
            }
    },
    postSunk: function(id){
                var theShipsId = id;
                var selected = this.selected;
               fetch('/api/games/players/' + selected + '/sinks', {
                  credentials: 'include',
                  method: 'POST',
                  headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json'
                  },
                body: theShipsId
              })
              .then(response => response.json())
              .then(data => {
                alert("you sunk a " + data.sunkenShip + "!")
            })
                .catch(err => console.log(err))
    },

    shoot: function(){
//                var shots = this.shots;
                var childNodes = document.getElementById('list').childNodes;
                var newArrayOfShots = [];
                 childNodes.forEach(elem => {
                     newArrayOfShots.push(elem.innerHTML);
                 });

                var currentTurn = this.turn+1;
                var anObject =  { "turn": currentTurn, "location": newArrayOfShots };
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
              .then(data => {
//                window.location.href="/web/testVue.html?gp=" + selected;
                location.reload();
            })
                .catch(err => console.log(err))
    },
    makeGameView: function(){
        var theChosenOne = this.selected;
        this.checkTurn();
        fetch(("http://localhost:8080/api/gp_view/"+ theChosenOne), {
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
                else if (gpData.game_player[0].ships.length == 0 || gpData.opponentInformation.length == 0 ){
                    this.isNewGame=true;
                    this.emptyGrid();
                    return;
                    }
                else {
                    this.isNewGame=false;
                    this.name = gpData.game_player[0].realName + "'s View";
                     this.checkTurn();
                     this.checkSunk(gpData);
                    this.build(gpData);
                    this.someFunction();
                }
            }).catch(function(error) {
              // called when an error occurs anywhere in the chain
              console.log(error);
            });
    },

    createNewCoordinates: function(start){
//        var start = this.shipPoint;

//            newArr.forEach(letter => {
//                let cell = document.getElementById(letter);
//                cell.style.backgroundColor = "red";
//            })

    },

    addShip: function (){
//        var start = this.shipPoint;
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
        var anObject =  { "shipType": shipTypeText, "location": this.coordinates };
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
//                location.reload();
            })
                .catch(err => console.log(err))
    },

    emptyGrid: function(){

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
        myGrid.classList.add("table");
        var myGridTitle = document.createElement('caption');
        myGridTitle.innerHTML = "Select ship placement";

        myGrid.id="myGrid";
        daGrids.appendChild(myGrid);

        var letters = ["", "a", "b", "c", "d", "e", "f", "g", "h"];

        for (var i=0; i< 9; i++){
            var rowMy = myGrid.insertRow(i);
            // first row of letters
            if (i==0){
                for (var c=0; c<9; c++){
                    var cellMy = rowMy.insertCell(c);
                    cellMy.innerHTML=letters[c];
                    cellMy.style.fontWeight="bold";
                }
            // rest of the rows
            } else if (i>0) {
                // fill left-most cell with row number
                var cellMy = rowMy.insertCell(0);
                cellMy.innerHTML=i;
                cellMy.style.fontWeight="bold";
                for (var g=1; g<9; g++){
                    var cellMy = rowMy.insertCell(g);
//                    cellMy.innerHTML="x"
                    cellMy.id=letters[g]+i;
//                    cellMy.classList.add('hoverShip');
                    cellMy.addEventListener("mouseover", this.idk);
                }
            }
        }
        myGrid.appendChild(myGridTitle);
//        whereIveShot.appendChild(whereIveShotTitle);
        var allCells = document.getElementsByTagName("td");

        for (var i = 0; i < allCells.length; i++) {
            allCells[i].addEventListener('click', function() {
                console.log(this.id);
            });
        }
    },
    idk: function(event){
         var allCells = Array.from(document.getElementsByTagName("td")).filter(eachCell => {
                return eachCell.id !== '';
          });
        allCells.forEach(cell => {
            cell.classList.remove('hoverShip')
        });


        var right = this.picked;
        var ship = this.shipType;
        var shipTypeText;
        var start = event.path[0].id;
        if (ship == 2){
            shipTypeText = "Helicopter"
        } else if (ship == 3){
            shipTypeText = "Submarine"
        } else if (ship == 4){
            shipTypeText = "Destroyer"
        } else if (ship == 5){
            shipTypeText = "Aircraft Carrier"
        }
        var newArr= [];
        var letters=["a", "b", "c", "d", "e", "f", "g", "h"];
            if (right === 'Down'){
              var startingNum = start.charAt(1);
              for (let i=0; i<ship; i++){
                if (startingNum > 8){
                  return start.charAt(0) + startingNum  + " is out of range";
                }
                newArr.push(start.charAt(0)+startingNum);
                startingNum++;
              }
            } else if (right === 'Right') {
              var startingIndex = letters.indexOf(start.charAt(0));
              for (let i=0; i<ship; i++){
                 if ((letters[startingIndex]) === undefined){
                  return "ship selection is out of range";
                }
                newArr.push(letters[startingIndex] + start.charAt(1));
                startingIndex++;
              }
            }
            this.coordinates=newArr;
            console.log(newArr);
                newArr.forEach(letter => {
                let cell = document.getElementById(letter);

                cell.classList.add('hoverShip')
            })
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
        //area for game views grids
        gridZone.appendChild(daGrids);

        // build grid of my ship locations
        var myGrid = document.createElement("table");
        myGrid.classList.add("table", "table-bordered");
        var myGridTitle = document.createElement('caption');
        myGridTitle.innerHTML = "My Boats";
        myGrid.id="myGrid";
        daGrids.appendChild(myGrid);

//         build score table
        var centerDiv = document.createElement("div");
        centerDiv.id="centerDiv";
        daGrids.appendChild(centerDiv)
        var scoreTable = document.createElement("table");
        scoreTable.id="scoreTable";
        centerDiv.appendChild(scoreTable);

        var theTurn = document.createElement('h2');
        var theTurnText = this.turn;
        theTurn.innerHTML="TURN: " + theTurnText;
        centerDiv.appendChild(theTurn);
         var scoreBoardTitle = document.createElement('caption');
        scoreBoardTitle.innerHTML = "scoreboard";
        scoreTable.appendChild(scoreBoardTitle);

//         Create an empty <tr> element and add it to the first position of <thead>:
        var row = scoreTable.insertRow(0);
        var head = document.createElement('th');
        row.appendChild(head);
        head.innerHTML="SHIP";
        var head = document.createElement('th');
        row.appendChild(head);
        head.innerHTML="STATUS";

        var totalSunk = 0;
        var totalShips = data.opponentInformation[0].enemyShips.length;

        for (let s = 0; s<data.opponentInformation[0].enemyShips.length; s++){
             // make a row for each ship
            let row = scoreTable.insertRow(i);
            var cell = row.insertCell(0);
            cell.innerHTML=data.opponentInformation[0].enemyShips[s].type;
            cell = row.insertCell(1);
            if (data.opponentInformation[0].enemyShips[s].sunk){
                cell.innerHTML="sunk";
                totalSunk++;
            } else {
                cell.innerHTML="afloat";
            }
            if (totalSunk == totalShips){
                this.gameOver();
            }
        }

         // build grid of my sots against my opponent
        var whereIveShot = document.createElement("table");
        whereIveShot.classList.add("table", "table-dark",  "table-bordered")
        var whereIveShotTitle = document.createElement('caption');
        whereIveShotTitle.innerHTML = "Shot History";

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

                            // what to do if there are know salvoes?
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
                    cellShot.id=letters[g]+i;
                    cellShot.classList.add('hoverCell');
                }
            }
        }
        myGrid.appendChild(myGridTitle);
        whereIveShot.appendChild(whereIveShotTitle);
    },
    someFunction: function(){
         var allCells = Array.from(document.getElementsByTagName("td")).filter(eachCell => {
                return eachCell.id !== '';
          });
//          console.log(allCells);
        for (var i = 0; i < allCells.length; i++) {
            var myValue;
            allCells[i].addEventListener('click', function() {

                 var list = document.getElementById('list');
                 var listLength = list.childElementCount+1;

                 if (listLength <= 3 ){
                        var targetCell =  document.getElementById(this.id);
                        var targetPic = new Image();
                        targetPic.src = 'https://a.wattpad.com/useravatar/target.256.882874.jpg';
                        targetPic.style.display = "block";
                        targetPic.style.width="100%";
                         targetCell.appendChild(targetPic);
                        var item = document.createElement('li');
                         item.innerHTML=this.id;
                         list.appendChild(item);
                 } else if (listLength==3) {
                        var targetCell =  document.getElementById(this.id);
                        var targetPic = new Image();
                        targetPic.src = 'https://a.wattpad.com/useravatar/target.256.882874.jpg';
                        targetPic.style.display = "block";
                        targetPic.style.width="100%";
                         targetCell.appendChild(targetPic);
                        var item = document.createElement('li');
                         item.innerHTML=this.id;
                         list.appendChild(item);
                        list.style.border = "thick solid #0000FF";
                 }  else {
                      alert("too many shots!");
                 }
//                console.log(cellId);
            });

        }
    }
  }
}