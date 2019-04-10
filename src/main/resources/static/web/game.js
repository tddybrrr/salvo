

 // get url of page to pull correct data from api
var gameNumIndex = window.location.href.indexOf("g=");
var gameNum = window.location.href.slice(gameNumIndex+2);

if (window.location.href.includes("g=")){

    fetch( "http://localhost:8080/api/game_view/"+gameNum).then(function(response) {
      if (response.ok) {
      // add a new promise to the chain
        return response.json();
      }
      // signal a server error to the chain
      throw new Error(response.statusText);
    }).then(function(json) {

        console.log(json);
        buildTable(json);
        buildGrid(json.GamePlayersInThisGame[0], "gp1Grid", json.GamePlayersInThisGame[1].salvoes);
        buildGrid(json.GamePlayersInThisGame[1], "gp2Grid", json.GamePlayersInThisGame[0].salvoes);

    }).catch(function(error) {
      // called when an error occurs anywhere in the chain
      console.log( "Request failed: " + error.message );
    });
}

function buildGrid(data, location, opponentsShots){

    var gridDiv = document.getElementById(location);
    gridTitle = document.createElement("h1");
    gridTitle.innerHTML = "gp" + data.gpID + "'s Grid";
    gridDiv.appendChild(gridTitle);

    var grid = document.createElement("table");
    gridDiv.appendChild(grid);

    var letters = ["/", "a", "b", "c", "d", "e", "f", "g", "h"];

    for (i=0; i< 9; i++){
        var row = grid.insertRow(i);
        // first row of letters
        if (i==0){
            for (var c=0; c<9; c++){
                var cell = row.insertCell(c);
                cell.innerHTML=letters[c];
                cell.style.color="green";
                cell.style.fontWeight="bold";
            }
        // rest of the rows
        } else if (i>0) {
            // fill left-most cell with row number
            var cell = row.insertCell(0);
            cell.innerHTML=i;
            cell.style.color="green";
            cell.style.fontWeight="bold";
            // fill main grid with letter/number coordinates
            for (var g=1; g<9; g++){
                var cell = row.insertCell(g);

                for (p=0; p<data.ships.length; p++){
                    for (x=0; x<data.ships[p].location.length; x++){
                         if (data.ships[p].location[x] == letters[g]+i) {
                            cell.style.backgroundColor = "red";
                         }
                         for (b=0; b<opponentsShots.length; b++){
                            for (h=0; h < opponentsShots[b].location.length; h++){
                                if (opponentsShots[b].location[h] == letters[g]+i){
                                cell.innerHTML = "x" + opponentsShots[b].turn;

                                    if (data.ships[p].location[x] == opponentsShots[b].location[h]){
                                        cell.style.backgroundColor = "orange";
                                    }
                                }
                            }
                         }
                    }
                }
            }
        }
    }
}


function buildTable(data){

    var gameID = document.getElementById("gameID");

    gameID.innerHTML=data.gameID;

    var body = document.getElementById("theData");

    var gameLoopLength = data.GamePlayersInThisGame.length;

    var rowIterator = 0;

    for (i=0; i<2; i++){

    // fill the first two columns with game player data
         var row = body.insertRow(rowIterator);
         var cell = row.insertCell(0);
         cell.innerHTML = data.GamePlayersInThisGame[i].gpID;

         var cell = row.insertCell(1);
         cell.innerHTML = data.GamePlayersInThisGame[i].playerName;

         // Fill the second two colums with ship data.
         for (var j=0; j < data.GamePlayersInThisGame[i].ships.length;){
                 var cell = row.insertCell(2);
                 cell.innerHTML = data.GamePlayersInThisGame[i].ships[j].type;
                 var cell = row.insertCell(3);
                 cell.innerHTML = data.GamePlayersInThisGame[i].ships[j].location;
                    j++

                    // are there more ships for this gameplayer?
                 if (j < data.GamePlayersInThisGame[i].ships.length){
                        rowIterator++;
                        var row = body.insertRow(rowIterator);
                        var cell = row.insertCell(0);
                        cell.innerHTML = "";
                        var cell = row.insertCell(1);
                        cell.innerHTML = "";
                }
         }
         rowIterator++;
    }
 };

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
    var myGridTitle = document.createElement('caption');
    myGridTitle.innerHTML = "my grid";


    myGrid.id="myGrid";
    daGrids.appendChild(myGrid);

    var whereIveShot = document.createElement("table");
    var whereIveShotTitle = document.createElement('caption');
    whereIveShotTitle.innerHTML = "Where I have shot";

    whereIveShot.id="whereIveShot";
    daGrids.appendChild(whereIveShot);

    var letters = ["/", "a", "b", "c", "d", "e", "f", "g", "h"];

    for (i=0; i< 9; i++){
        var rowMy = myGrid.insertRow(i);
        var rowShot = whereIveShot.insertRow(i);

        // first row of letters
        if (i==0){
            for (var c=0; c<9; c++){
                var cellMy = rowMy.insertCell(c);
                var cellShot = rowShot.insertCell(c);

                cellMy.innerHTML=letters[c];
                cellMy.style.color="green";
                cellMy.style.fontWeight="bold";

                cellShot.innerHTML=letters[c];
                cellShot.style.color="green";
                cellShot.style.fontWeight="bold";
            }
        // rest of the rows
        } else if (i>0) {
            // fill left-most cell with row number
            var cellMy = rowMy.insertCell(0);
            cellMy.innerHTML=i;
            cellMy.style.color="green";
            cellMy.style.fontWeight="bold";

            var cellShot = rowShot.insertCell(0);
            cellShot.innerHTML=i;
            cellShot.style.color="green";
            cellShot.style.fontWeight="bold";
            // fill main grid with letter/number coordinates
            for (var g=1; g<9; g++){
                var cellMy = rowMy.insertCell(g);
                var cellShot = rowShot.insertCell(g);

                for (p=0; p<data.game_player[0].ships.length; p++){
                    for (x=0; x<data.game_player[0].ships[p].location.length; x++){
                         if (data.game_player[0].ships[p].location[x] == letters[g]+i) {
                            cellMy.style.backgroundColor = "red";
                         }
                         for (b=0; b<data.opponentInformation[0].enemySalvoes.length; b++){
                            for (h=0; h < data.opponentInformation[0].enemySalvoes[b].location.length; h++){
                                if (data.opponentInformation[0].enemySalvoes[b].location[h] == letters[g]+i){
                                cellMy.innerHTML = "x" + data.opponentInformation[0].enemySalvoes[b].turn;
                                    if (data.game_player[0].ships[p].location[x] == data.opponentInformation[0].enemySalvoes[b].location[h]){
                                        cellMy.style.backgroundColor = "orange";
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
                                        cellShot.style.backgroundColor = "orange";
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


