

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

function createGame(){
      fetch("http://localhost:8080/api/games", {
           credentials: 'include',
           method: 'POST',
           headers: {
               'Accept': 'application/json',
               'Content-Type': 'application/x-www-form-urlencoded'
           }
      })
      .then(response =>  response.json())
      .then(data => {
            if (data !== "undefined"){
//             window.location.href = "game.html?gp=" + data.newGpID;
                location.reload();
            } else {
               alert("You must be logged-in to do this");
            }
        })
        .catch(err => console.log(err))
}


function buildOverview(games){

     var table = document.getElementById("gamesOverview");

     for (i=0; i<games.length; i++){

           var row = table.insertRow(i);
           var cell = row.insertCell(0);
           cell.innerHTML=games[i].gameID;

           var cell = row.insertCell(1);

           var link = document.createElement('a');

            var gameNotReady;

           if (games[i].gamePlayers[0]=== undefined){
              link.innerHTML="N/A"
              gameNotReady=true;
           } else {
              link.innerHTML=games[i].gamePlayers[0].gpName;
             link.href="/web/testVue.html?gp=" + games[i].gamePlayers[0].gpID;
            }
           cell.appendChild(link);

           var cell = row.insertCell(2);
           var link = document.createElement('a');
            if (games[i].gamePlayers[1] === undefined){
                     link.innerHTML="N/A"
                    gameNotReady=true;
            } else {
          link.innerHTML=games[i].gamePlayers[1].gpName;
          link.href="/web/testVue.html?gp=" + games[i].gamePlayers[1].gpID;
          }

          cell.appendChild(link);
           var cell = row.insertCell(3);
           var addZero = '';
           if (games[i].gameMinute < 10){
                var addZero = 0;
           }
           cell.innerHTML=games[i].gameHour + ":" + addZero + games[i].gameMinute;
            var cell = row.insertCell(4);


            var button = document.createElement('BUTTON');
            if (gameNotReady){
                 button.innerHTML = "JOIN"
            } else {
                 button.innerHTML = "VIEW"
            }

            var gameIDnumber = games[i].gameID;
            button.onclick=function(){joinGame(gameIDnumber)};
            cell.appendChild(button);
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
        var cell = row.insertCell(4);
       cell.innerHTML="Action"
    }


function joinGame(gameID){

    fetch("http://localhost:8080/api/game/" + gameID + "/players", {
           credentials: 'include',
           method: 'POST',
           headers: {
               'Accept': 'application/json',
               'Content-Type': 'application/x-www-form-urlencoded'
           }
      })
      .then(response =>  response.json())
      .then(data => {
            if (data.error === "game is full"){
               alert(data.error);
            } else if (data.error === "no such game") {
               alert("no such game");
            } else if (data.error === "you are not logged in"){
                alert("you are not logged in");
            }
        })
        .catch(err => console.log(err))
}

fetch( "http://localhost:8080/api/games",{
        method: "GET"
    }).then(function(response) {
        if (response.ok) {
        // add a new promise to the chain
        return response.json();
        }
    // signal a server error to the chain
    throw new Error(response.statusText);
    }).then(function(json) {
        //    console.log(json.scores)
        //    console.log(json.games)
        buildLeaderBoard(json.scores)
        buildOverview(json.games)
    }).catch(function(error) {
        // called when an error occurs anywhere in the chain
        console.log( "Request failed: " + error.message );
});

function logout(){
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
//                document.location.reload(true);
                 alert("logged out!");
                 this.loggedIn=false;
              }
          })
          .catch(err => console.log(err))
    }





