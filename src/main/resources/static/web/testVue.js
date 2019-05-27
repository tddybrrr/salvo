
import SingleFileComponent from './component.js';

new Vue({
  el: '#app',
  data: {
    loggedIn: false
  },
  components: {
    SingleFileComponent
  },
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

    testLogin: function(){
      let form = document.getElementById('signInUp');
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
              if(response.ok){
                  this.loggedIn=true;
                    location.reload();
              } else {
              alert("Incorrect username or password");
              }
          })
          .catch(err => console.log(err))
    },
    testSignup: function(){
        let form = document.getElementById('signInUp');
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
              if (Object.keys(response)[0] == "error"){
                    alert(response.error);
              } else {
//                  this.testLogin();
                    alert("account created: " + Object.values(response)[0]);
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
//                document.location.reload(true);
                 alert("logged out!");
                 this.loggedIn=false;
              }
          })
          .catch(err => console.log(err))
    }
  }
})

