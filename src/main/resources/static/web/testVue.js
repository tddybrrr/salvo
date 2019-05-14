

import SingleFileComponent from './component.js';

new Vue({
  el: '#app',
  data: {
    items: ["popp", "idk", "wow"],
    loggedIn: false
  },
  components: {
    SingleFileComponent
  },
  methods: {
    doSomething: function (thing){
        alert(thing)
    },
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
              if (response == null){
                    console.log(response);
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
//                document.location.reload(true);
                 alert("logged out!");
                 this.loggedIn=false;
              }
          })
          .catch(err => console.log(err))
    }
  }
})

