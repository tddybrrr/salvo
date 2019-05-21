
/// run a function to test whether anyone is logged in
tester();

function tester(){

    fetch('/api/games', {
              credentials: 'include',
              method: 'GET',
              headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/x-www-form-urlencoded'
              }
          })
          .then(response => response.json())
          .then(response => {
          //if some one is logged in, build the user interface
              if(response.player != null){
                console.log(response)
                buildUI();
                    // if 'gp' is not in the url
                  if (window.location.href.indexOf('gp') !== -1){
                    var url = window.location.href;
                    var gpNum = url.split('gp=').pop();
                    fetchData(gpNum);
                } else if (window.location.href.indexOf('selectGamePlayer') !== -1) {
                    var url = window.location.href;
                    var gpNum = url.split('Player=').pop();
                    fetchData(gpNum);
                }
                else {
                    fetchData(response.games[0].gamePlayers[0].gpID)
                }
              //if some no one is logged in, build the sign-up form
              } else {
                buildLoginPanel();
              }
          })
          .catch(err => console.log(err))
}

function buildLoginPanel(){
    var wrapper = document.getElementById("wrapper");
    wrapper.innerHTML = "";
    wrapper.classList.add('loginStyle');
    wrapper.innerHTML='<form class="form-group w-50 p-3" id="myForm" name="myForm"> <div class="row"> <div class="col"> Enter Username: <input class="form-control" type="text" id="username" name="userName"> </div> <div class="col"> Enter password: <input class="form-control" type="text" id="password" name="password"> </div> </div> <div class="row"> <button id = "signinButton" type="button" class="btn btn-primary col m-3" onclick="testLogin()">Sign in</button> <button id = "signupButton" type="button" class="btn btn-success col m-3" onclick="testSignup()">Sign up</button> </div> </form>';
}

function testSignup() {
    let form = document.getElementById('myForm');
    fetch('/api/players', {
          credentials: 'include',
          method: 'POST',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: 'userName=' + form[0].value + '&password=' + form[1].value
      })
      .then(response => response.json())
      .then(response => {
          console.log(response);
          if (response != null){
              testLogin();
          }
      })
      .catch(err => console.log(err))
}

function testLogin() {
let form = document.getElementById('myForm');
  fetch('/api/login', {
          credentials: 'include',
          method: 'POST',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: 'userName=' + form[0].value + '&password=' + form[1].value
      })
      .then(response => {
          console.log(response.status)
          if(response.ok){
               location.reload();
          } else {
          alert("Incorrect username or password");
          }
      })
      .catch(err => console.log(err))
}

//------------------------------------------------------------
//Building the user interface for a logged in player

function buildUI(){
    var wrapper = document.getElementById("wrapper");
    wrapper.innerHTML = "";
    wrapper.innerHTML = ' <div id="lowerSection"> <div id="tableWrapper"> <button id = "logoutButton" type="button" class="btn btn-secondary m-3 logoutButton" onclick="testLogout()"> LOG OUT</button><a href="/web/games.html">home</a> </div> </div>';
    var gameSelector = document.createElement('div');

    var body = document.getElementById("body");
    wrapper.appendChild(gameSelector);
    gameSelector.innerHTML = '<form id="uiForm"> <div class=" form-group row"> <label for="selectGamePlayer" class="col-sm-6 col-form-label">select game player: </label> <div class="col-sm-5"> <select class="form-control" id="selectGamePlayer" name="selectGamePlayer"> <option>1</option> <option>2</option> <option>3</option> <option>4</option> <option>5</option> </select> </div> </div> <div class="form-row"> <button id="btn"> Show selected games</button> </div></form>';
    document.getElementById('btn').addEventListener('click', show_selected);

    var shipAdder = document.createElement('div');
    wrapper.appendChild(shipAdder);
    shipAdder.innerHTML = '<form id="shipSelector"> <div class="form-group row"> <label for="shipTypeSelector" class="col-sm-6 col-form-label">ship type: </label> <div class="col-sm-6"> <select class="form-control" id="shipTypeSelector" name="shipTypeSelector"> <option>Destroyer</option> <option>Aircraft Carrier</option> <option>Helicopter</option> <option>Submarine</option> </select> </div> </div> <div class="form-group row"> <label for="shipDirection" class="col-sm-6 col-form-label">ship direction: </label> <div class="col-sm-6"> <select class="form-control" id="shipDirection" name="shipDirection"> <option>Right</option> <option>Down</option> </select> </div> </div> <div class="form-row"> <button id="addShipBtn">addShip!</button> </div></form>';
    document.getElementById('addShipBtn').addEventListener('click', function(event){
    event.preventDefault();
    addShip();
    });
}

function show_selected() {
    var selector = document.getElementById('selectGamePlayer');
    var value = selector[selector.selectedIndex].value;
    fetchData(value);
}

function testLogout(){
    fetch('/api/logout', {
              credentials: 'include',
              method: 'POST',
              headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/x-www-form-urlencoded'
              },
          })
          .then(response => {
              console.log(response);
              if(response.ok){
                document.location.reload(true);
                 console.log("logged out!");
              }
          })
          .catch(err => console.log(err))
    }

//-----------------------------------------------------------------------------------

function addShip(){
//
//    var type = document.getElementById('shipTypeSelector');
//    var value = selector.value;
//    console.log(value);
//    var selector = document.getElementById('shipDirection');
//    var value = selector.value;
//    console.log(value);
//    var sampleObject =  { "shipType": "patrolBoat", "location": ["h5", "h6"] }
//
//
//    var gamePlayerId = 5;
//
//    fetch('/api/games/players/' + gamePlayerId + '/ships', {
//          credentials: 'include',
//          method: 'POST',
//          headers: {
//              'Accept': 'application/json',
//              'Content-Type': 'application/json'
//          },
//        body: JSON.stringify(sampleObject)
//      })
//      .then(response => response.json())
//      .then(function(data) {
//        console.log(data);
//        alert(data.error);
//    })
//        .catch(err => console.log(err))
}

function fetchData(gpNum){

    console.log(gpNum);
    fetch(("http://localhost:8080/api/gp_view/"+ gpNum), {
            method: "GET",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/x-www-form-urlencoded'
                      }
    })
    .then(response => response.json())
    .then(function(data) {
        console.log(data);
        if (data.error === "FORBIDDEN"){
             alert("not your game bro");
        } else {
            firstPersonView(data)
        }
    }).catch(function(error) {
      // called when an error occurs anywhere in the chain
      console.log(error);
    });
}

function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function firstPersonView(data){

    var lowerSection = document.getElementById('lowerSection');
    var daGrids = document.getElementById('daGrids');
    if (daGrids){
        daGrids.innerHTML="";
    } else {
        var daGrids = document.createElement('div');
            daGrids.id="daGrids";
            insertAfter(daGrids, lowerSection);
    }

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

    for (i=0; i< 9; i++){
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

                for (p=0; p<data.game_player[0].ships.length; p++){
                    for (x=0; x<data.game_player[0].ships[p].location.length; x++){
                         if (data.game_player[0].ships[p].location[x] == letters[g]+i) {
                            cellMy.style.backgroundColor = "blue";
                         }
                         for (b=0; b<data.opponentInformation[0].enemySalvoes.length; b++){
                            for (h=0; h < data.opponentInformation[0].enemySalvoes[b].location.length; h++){
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
                for (p=0; p<data.opponentInformation[0].enemyShips.length; p++){
                    for (x=0; x<data.opponentInformation[0].enemyShips[p].location.length; x++){

                         for (b=0; b<data.game_player[0].salvoes.length; b++){
                            for (h=0; h < data.game_player[0].salvoes[b].location.length; h++){
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


