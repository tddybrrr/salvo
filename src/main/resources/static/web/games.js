
function fillRows(games){

    var row = document.getElementById("list")
    for (i=0; i<games.length; i++){
        var element = document.createElement('li');
        row.appendChild(element);
        element.innerHTML=games[i].gameID;
    };
};

fetch( "http://localhost:8080/api/games").then(function(response) {
  if (response.ok) {
  // add a new promise to the chain
    return response.json();
  }
  // signal a server error to the chain
  throw new Error(response.statusText);
}).then(function(json) {

    fillRows(json.games)

}).catch(function(error) {
  // called when an error occurs anywhere in the chain
  console.log( "Request failed: " + error.message );
});





