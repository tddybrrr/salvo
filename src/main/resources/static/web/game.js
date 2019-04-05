

function buildTable(data){
    var gameID = document.getElementById("gameID");
    gameID.innerHTML=data.gameID;

    var body = document.getElementById("theData");

    var gameLoopLength = data.GamePlayersInThisGame.length;

    var rowIterator = 0;

    for (i=0; i<2; i++){
         var row = body.insertRow(rowIterator);
         var cell = row.insertCell(0);
         cell.innerHTML = data.GamePlayersInThisGame[i].gpID;
         var cell = row.insertCell(1);
         cell.innerHTML = data.GamePlayersInThisGame[i].playerName;

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
var specialNumIndex = window.location.href.indexOf("=");
var specialNum = window.location.href.slice(specialNumIndex+1);

fetch( "http://localhost:8080/api/game_view/"+specialNum).then(function(response) {
  if (response.ok) {
  // add a new promise to the chain
    return response.json();
  }
  // signal a server error to the chain
  throw new Error(response.statusText);
}).then(function(json) {

    console.log(json)
    buildTable(json);

}).catch(function(error) {
  // called when an error occurs anywhere in the chain
  console.log( "Request failed: " + error.message );
});
