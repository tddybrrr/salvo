
import SingleFileComponent from './component.js';

new Vue({
  el: '#app',
  data: {
    loggedIn: false,
    un: '',
    pw: '',
    credentials: ''
  },
  components: {
    SingleFileComponent
  },
  // when the component is created, get information about all the games.
  created(){
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
               this.loggedIn=true;
              //if some no one is logged in, build the sign-up form
              }
          })
          .catch(err => console.log(err))
  },
  methods: {
    // update the data field for a players credentials, to be used in the login function below
    createCredentials: function(){
        let loginCredentials = 'userName=' + this.un + '&password=' + this.pw;
        this.credentials = loginCredentials;
    },

    testLogin: function(){
       // attempt to fetch information about logged in players
      var loginCredentials = this.credentials;
      fetch('/api/login', {
              credentials: 'include',
              method: 'POST',
              headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/x-www-form-urlencoded'
              },
            body: loginCredentials
          })
          .then(response => {
              if(response.ok){
              // if correct credentials, reload the page to render new information
                  this.loggedIn=true;
                    location.reload();
              } else {
              alert("Incorrect username or password");
              }
          })
          .catch(err => console.log(err))
    },
    testSignup: function(){
      var loginCredentials = this.credentials;
        // post request with an object of the given username/password of a new user
        fetch('/api/players', {
              credentials: 'include',
              method: 'POST',
              headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/x-www-form-urlencoded'
              },
              body: loginCredentials
          })
          .then(response => response.json())
          .then(response => {
              console.log(response);
              if (Object.keys(response)[0] == "error"){
                    alert(response.error);
              } else {
              // if the username isnt taken and there is no error, try to login
              // with the same credentials given. This function also reloads the page
                  this.testLogin();
              }
          })
          .catch(err => alert(err))
    },
    testLogout: function(){
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
              // tell the player that they were successfully logged out
=                 alert("logged out!");
                 this.loggedIn=false;
              }
          })
          .catch(err => console.log(err))
    }
  }
})

