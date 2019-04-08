

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

        buildTable(json);

        console.log(json);

    }).catch(function(error) {
      // called when an error occurs anywhere in the chain
      console.log( "Request failed: " + error.message );
    });
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

 document.getElementById("tableWrapper").style.visibility = "hidden";

fetch( "http://localhost:8080/api/gp_view/"+gpNum).then(function(response) {
  if (response.ok) {
  // add a new promise to the chain
    return response.json();
  }
  // signal a server error to the chain
  throw new Error(response.statusText);
}).then(function(json) {

    console.log(json);
    buildGrid(json);
    fillGrid(json);


}).catch(function(error) {
  // called when an error occurs anywhere in the chain
  console.log( "Request failed: " + error.message );
});

}

function fillGrid(data){

        for (x=0; x<data.ships.length; x++){
//             for each of the squares that this particular ship occupies, make that square blue
            data.ships[x].location.forEach(shipSquare => {
            document.getElementById(shipSquare).style.backgroundColor = "blue";
            })
        }
}

function buildGrid(data){

    document.getElementById("gpShips").innerHTML = "gp" + data.gpID + "'s Grid"

    var grid = document.getElementById("grid");

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
    //            cell.innerHTML=letters[g]+i;
                // make the id of each sell the grid value
                cell.id=letters[g]+i;
            }
        }
    }

}