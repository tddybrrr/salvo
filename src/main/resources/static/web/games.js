


function buildLeaderBoard(scores){

     var table = document.getElementById("leaderBoard");


     for (i = 0; i < scores.length; i++){
        var row = table.insertRow(i);

          var cell = row.insertCell(0);
          cell.innerHTML=scores[i].player;
          var cell = row.insertCell(1);
          cell.innerHTML=scores[i].win;
          var cell = row.insertCell(2);
          cell.innerHTML=scores[i].lost;
          var cell = row.insertCell(3);
          cell.innerHTML=scores[i].tied;
           var cell = row.insertCell(4);
           cell.innerHTML=scores[i].total;

//        for (var key in scores[i]) {
//            var x = 0;
//                 if (scores[i].hasOwnProperty(key)) {
//                     var cell = row.insertCell(x);
//                     x++;
//                     cell.innerHTML = (scores[i][key]);
//                 }
//             }
     }
      var header = table.createTHead();
      var row = header.insertRow(0);
      var cell = row.insertCell(0);
      cell.innerHTML="Player"
      var cell = row.insertCell(1);
      cell.innerHTML="Won"
      var cell = row.insertCell(2);
      cell.innerHTML="Lost"
      var cell = row.insertCell(3);
      cell.innerHTML="Tied"
      var cell = row.insertCell(4);
      cell.innerHTML="Total score"

}


function buildOverview(games){

     var table = document.getElementById("gamesOverview");

     for (i=0; i<games.length; i++){

           var row = table.insertRow(i);
           var cell = row.insertCell(0);
           cell.innerHTML=games[i].gameID;
           var cell = row.insertCell(1);
           cell.innerHTML=games[i].gamePlayers[0].gpName;
           var cell = row.insertCell(2);
           cell.innerHTML=games[i].gamePlayers[1].gpName;
           var cell = row.insertCell(3);
           cell.innerHTML=games[i].gameMinute;
     }

       var header = table.createTHead();
       var row = header.insertRow(0);
       var cell = row.insertCell(0);
       cell.innerHTML="Game ID"
       var cell = row.insertCell(1);
       cell.innerHTML="Player One"
       var cell = row.insertCell(2);
       cell.innerHTML="Player Two"
       var cell = row.insertCell(3);
       cell.innerHTML="Game Time"
    }


fetch( "http://localhost:8080/api/games").then(function(response) {
  if (response.ok) {
  // add a new promise to the chain
    return response.json();
  }
  // signal a server error to the chain
  throw new Error(response.statusText);
}).then(function(json) {
    console.log(json.scores)
    buildLeaderBoard(json.scores)
    buildOverview(json.games)
}).catch(function(error) {
  // called when an error occurs anywhere in the chain
  console.log( "Request failed: " + error.message );
});





