

export default {
  template: `
  <div>
  // gridzone is where the grids for the player UI go
    <div id="gridZone">
    // display player's name
         <h1>{{name}}</h1>
         // controller to switch between the games the current player has available. Fires
         // a function makegameview each time a new game is selected
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
             // conditional rendering based on whether this is a new game
         <form id="shipSelector" v-if="isNewGame == true">
                // simple form to select a ship type to place on a new board
                <label for="shipTypeSelector" >ship type:
                </label>
                <select v-model="shipType" id="shipTypeSelector" name="shipTypeSelector">
                    <option v-for="(item, index) in shipList" :key="index" :value="item.shipsLength"> {{item.shipTypeName}} ({{item.shipsLength}}) </option>
                </select>
                // select the direction you wish the ship to go based on a series of buttons
                <fieldset id="directions">
                     <legend >ship direction:
                    </legend>
                    <input type="radio" id="Right" value="Right" v-model="picked">
                    <label for="Right">Right</label>
                    <br>
                    <input type="radio" id="Down" value="Down" v-model="picked">
                    <label for="Down">Down</label>
                </fieldset>

                <br>
                // confirm your placement of ships
              <button type="button" id="confirm" v-on:click="confirm"> confirm ships </button>
              // reset all placements
               <button type="button" id="reset" v-on:click="reset"> reset ship placement </button>
        </form>
        // build UI if game has already been started
        <div id="shotSelector" v-else-if="isNewGame == false">
            // conditional rendering based on if it's your turn. If it's not
            // your turn, display a 'waiting' message
            <div id="waiting" v-if="yourTurn">
                <img src="https://i.imgur.com/NLPrNgm.gif" width="480" height="270">
                <h1 class="top-left">waiting for opponent to shoot</h1>
             </div>
            <div v-else>
               <ul id="list">
               </ul>
               <button type="button" id="addShot" v-on:click="shoot"> Confirm Shots</button>
            </div>

        </div>
          <div v-else-if="isNewGame == null">
             <h1> Waiting on other player to place their ships </h1>
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
      // options for the ships a player can add to a game
      shipList: [
               {shipTypeName: "Helicopter", shipsLength: 2},
               {shipTypeName: "Submarine", shipsLength: 3},
               {shipTypeName: "Destoryer", shipsLength: 4},
               {shipTypeName: "Aircraft Carrier", shipsLength: 5},
      ],
      emptyArray: [],
    selectedShots: '',
      picked: 'Right',
      isNewGame: true,
      shot: null,
      shots: [],
      turn: null,
      yourTurn: null,
      coordinates: []
    }
  },
  created(){
        // when the component is rendered, get request a list of all the games
        // the current player is playing in
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
                   this.ids = gpData;
                   // weird function to handle manually entered URLS
                   if (window.location.href.indexOf('gp=') == -1){
                        this.selected = gpData[0];
                        this.checkTurn();
                        this.makeGameView();
                   } else {
                        var url = window.location.href;
                        var gpNum = url.split('gp=').pop();
                        this.selected=gpNum;
                        this.makeGameView();
                }
                }).catch(function(error) {
                  // called when an error occurs anywhere in the chain
                  console.log(error);
                });
  },
  methods:{
    // function to delete items from an object in the data() function
    deleteItem: function(index){
            this.$delete(this.items,index);
    },
    reset: function(){
        this.emptyArray=[];
        this.makeGameView();
    },
    // post request to update the scores of each player in the database
    // after all of a player's ships has been sunk
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
                  alert("Game over! You won!")
                  window.href="games.html"
            })
                .catch(err => console.log(err))
    },
    // function to figure out whose turn it is to shoot by pinging the database
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
               console.log(data.firstPersonToShoot);
               var didYouStart = data.firstPersonToShoot;
               //overcomplicated function to compare the turns of each player to see who goes next
                if (data.myTurns.length < data.theirTurns.length){
                    this.yourTurn=false;
                } else if (data.myTurns.length > data.theirTurns.length){
                    this.yourTurn=true;
                } else if (data.myTurns.length == data.theirTurns.length){
                    if (didYouStart){
                        this.yourTurn=false;
                    } else {
                        this.yourTurn=true;
                    }
                }
                this.turn = data.myTurns.length;
                 })
                .catch(err => console.log(err))
    },

    // go through the grid to see if any ships have been sunk
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
                                    // send the ships ID in the postsunk function to update the database
                                    }
                                }
                            }
                        }
                     }
                 }
            }
    },
    // post request that takes a ships ID to update the ship sunk-status in the database
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
                location.reload();
            })
                .catch(err => console.log(err))
    },

    shoot: function(){
                // crude method to send a post request of the chosen shots to the database
                var childNodes = document.getElementById('list').childNodes;
                var newArrayOfShots = [];
                 childNodes.forEach(elem => {
                     newArrayOfShots.push(elem.innerHTML);
                 });

                var currentTurn = this.turn+1;
                var anObject =  { "turn": currentTurn, "location": newArrayOfShots };
                var selected = this.selected;
                console.log(anObject)
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
                window.location.href="/web/testVue.html?gp=" + selected;
            })
                .catch(err => console.log(err))
    },
    makeGameView: function(){
    // function to handle how to build the user interface depending on the
    // game that was selected
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
                else if (gpData.game_player[0].ships.length == 0 ){
                    // if it's a new game, create an empty grid to place new ships
                    this.isNewGame=true;
                    this.emptyGrid();
                    return;
                    }
                else if (gpData.opponentInformation.length == 0){
                    this.isNewGame=null;
                    return;
                    }
                else {
                    this.isNewGame=false;
                    this.name = gpData.game_player[0].realName + "'s View";
                    // check the turn, the sunked ships, and build the board grid
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

    // function to handle the confirm button after selection shots
    confirm: function(){

            var sampleObject = this.emptyArray;
            fetch('/api/games/players/' + this.selected + '/ships', {
                  credentials: 'include',
                  method: 'POST',
                  headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json'
                  },
                body: JSON.stringify(sampleObject)
              })
              .then(response => response.json())
              .then(function(data) {
                console.log(data);
                location.reload();
            })
                .catch(err => console.log(err))
    },

    addShip: function (){
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
        this.emptyArray.push(anObject);
    },

    // DOM manipulation to build an empty grid of 1-8/a-h
    emptyGrid: function(){

        // select the area to build the grid
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
        // build the table grid for your own ship placements
        var myGrid = document.createElement("table");
        myGrid.classList.add("table");
        var myGridTitle = document.createElement('caption');
        myGridTitle.innerHTML = "Select ship placement";

        myGrid.id="myGrid";
        daGrids.appendChild(myGrid);

        var letters = ["", "a", "b", "c", "d", "e", "f", "g", "h"];

        // makes 9 rows
        for (var i=0; i< 9; i++){
            var rowMy = myGrid.insertRow(i);
            // first row is only letters
            if (i==0){
                for (var c=0; c<9; c++){
                    // make letters bold
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
                    cellMy.addEventListener("mouseover", this.hoverClassAdder);
                }
            }
        }
        myGrid.appendChild(myGridTitle);
//        whereIveShot.appendChild(whereIveShotTitle);
        var allCells = document.getElementsByTagName("td");

        // add an onclick event listener to every single cell, so that
        // when you click on a cell it will add a ship to the grid, represented by simple blue colors
        // of the 'placedship' class.
        //ships are confirmed by a button that is handled by a seperate function called confirm()
        for (var i = 0; i < allCells.length; i++) {
            var self = this;
            allCells[i].addEventListener('click', function(e) {
                console.log(this.id);
                self.addShip(this.id);
                // cells will change color when hovered above. Hover will turn to a target when clicked.
                var someCells = Array.from(document.getElementsByClassName("hoverShip")).forEach(cell => {
                    cell.classList.remove('hoverShip');
                    cell.classList.add('placedShip');
                 });
            });
        }
    },
    hoverClassAdder: function(event){
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
        // this function determines which cells will by highlighted to create a 'shadow'
        // effect of the ship you are trying to place. For example, if 'destroyer' is selected,
        // and the direction 'down' is selected, the board will highlight the four cells below
        // whereever the mouse is hovering. It does identifying the cell thats underneath the
        // mouse (e.g. 'B3'), and created a list of coordinates based on that (e.g. 'B4, B5, B6, B7')

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
            newArr.forEach(letter => {
                let cell = document.getElementById(letter);
                cell.classList.add('hoverShip')
            })
    },

    // seperate function to build a non-empty grid. Takes data of ship and shot locations from
    // a fetch request and build two grids: one for where you've shot, and one for where your own
    // ships are
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
        // fill in information about opponent's ship status. Are they sunk? how
        // much life do they have? etc.
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
                window.location.href="/web/games.html"
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

                // fill main grid with letter/number coordinates in the form of IDs

                // go through every row
                for (var g=1; g<9; g++){
                    // insert a cell
                    var cellMy = rowMy.insertCell(g);
                    var cellShot = rowShot.insertCell(g);
                    // the series of loops below cross references a players ship coordinates and the coordinates on the grid.
                    // if there is overlap, the cell is highlighted blue to represent a ships location
                    for (let p=0; p<data.game_player[0].ships.length; p++){
                        for (let x=0; x<data.game_player[0].ships[p].location.length; x++){

                             if (data.game_player[0].ships[p].location[x] == letters[g]+i) {
                                cellMy.style.backgroundColor = "blue";
                             }

                             // the series of loops below cross references whether an opponents shot coordinates overlap
                            // with your own ships' coordinates. If there is overlap, the background color of that cell's
                            // coordinates gets highlighted
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
                    // the series of loops below cross references whether an players shot coordinates overlap
                    // with their opponents ships' coordinates. If there is overlap, the background color of that cell's
                    // coordinates gets highlighted
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
                    // add an id to each cell based on where it is in the grid. A a hoverable class
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



        for (var i = 0; i < allCells.length; i++) {
            var myValue;

             // add an onclick event listener to every single cell, so that
            // when you click on a cell it will add a target. The target represents
            // a potential shot.
            allCells[i].addEventListener('click', function() {
                 // potential shots are also shown as a list. Only three shots are allowed
                 // per turn. These two lines measure the items in the list to see how many
                 // shots are being attempted
                 var list = document.getElementById('list');
                 var listLength = list.childElementCount+1;
                // only allow three shots per turn
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
                    // error thrown for too many shots
                      alert("too many shots!");
                 }
//                console.log(cellId);
            });
        }
    }
  }
}