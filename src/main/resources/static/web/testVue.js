


new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue.js!',
    items: ["popp", "idk", "wow"]
  },
  created(){
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
              .then(response => {
                  console.log(response.status)
                  if(response.ok){
                       location.reload();
                  } else {
                  alert("Incorrect username or password");
                  }
              })
              .catch(err => console.log(err))
    }
  }
})