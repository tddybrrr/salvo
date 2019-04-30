
/// run a function to test whether anyone is logged in
tester();

function tester(){
    fetch('/api/games', {
              credentials: 'include',
              method: 'POST',
              headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/x-www-form-urlencoded'
              }
          })
          .then(response => response.json())
          .then(response => {
          //if some one is logged in, build the user interface
              if(response.player != null){
                console.log("someone is looged in")
                buildUI();
              //if some no one is logged in, build the sign-up form
              } else {
                console.log("no one is logged in");
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
//      .then(response => response.json())
      .then(response => {
          console.log(response.status)
          if(response.ok){
               location.reload();
          }
      })
      .catch(err => console.log(err))
}


//------------------------------------------------------------
//Building the user interface for a logged in player

function buildUI(){
    var wrapper = document.getElementById("wrapper");
    wrapper.innerHTML = "";
    wrapper.innerHTML = ' <div id="lowerSection"> <div id="tableWrapper"> <button id = "logoutButton" type="button" class="btn btn-secondary m-3 logoutButton" onclick="testLogout()"> LOG OUT</button> </div> </div>';
    var somediv = document.createElement('div');
    var body = document.getElementById("body");
    body.appendChild(somediv);
    somediv.innerHTML = '<div class="form-group"> <label for="exampleFormControlSelect1">Example select</label> <select class="form-control" id="gadget" name="gadget"> <option>1</option> <option>2</option> <option>3</option> <option>4</option> <option>5</option> </select> <button id="btn">Show selected games</button></div>';
    document.getElementById('btn').addEventListener('click', show_selected);

}

function show_selected() {
    var selector = document.getElementById('gadget');
    var value = selector[selector.selectedIndex].value;
    console.log(value);
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

var gpNumIndex = window.location.href.indexOf("gp=");
var gpNum = window.location.href.slice(gpNumIndex+3);

if (window.location.href.includes("gp=")){

 document.getElementById("tableWrapper").innerHTML = "";

fetch( "http://localhost:8080/api/gp_view/"+gpNum).then(function(response) {
      if (response.ok) {
      // add a new promise to the chain
        return response.json();
      }
      // signal a server error to the chain
      throw new Error(response.statusText);
    }).then(function(json) {

        console.log(json);
        firstPersonView(json)
    }).catch(function(error) {
      // called when an error occurs anywhere in the chain
      console.log( "Request failed: " + error.message );
    });
}

function firstPersonView(data){

    var daGrids = document.getElementById('tableWrapper');
    daGrids.id="daGrids";

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


