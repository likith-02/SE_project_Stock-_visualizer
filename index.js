// My web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyDiZGBpkbW40p4Cjg5Q9pWlEwr_pD3Y6yA",
    authDomain: "login-ee00a.firebaseapp.com",
    projectId: "login-ee00a",
    storageBucket: "login-ee00a.appspot.com",
    messagingSenderId: "906470477941",
    appId: "1:906470477941:web:9809c6a61068237b24a83c"
};
// Initializing Firebase
firebase.initializeApp(firebaseConfig);
// Initializing variables
const auth = firebase.auth()
const database = firebase.database()


// Set up the login function
function login() {
  // Get all the input fields
  email = document.getElementById('email').value
  password = document.getElementById('password').value

   //Validate input fields
  if (!validate_email(email) || !validate_password(password)) {
   alert('Email or Password is Invalid!!');
   //return if email or password is invalid
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
  .then(function() {
    var user = auth.currentUser
    var database_ref = database.ref()
    var user_data = {
      last_login : Date.now()
    }
    database_ref.child('users/' + user.uid).update(user_data)
    window.location.href="https://likith-02.github.io/SE_project_Stock-_visualizer/api.html";

  })
  .catch(function(error) {
    var error_code = error.code
    var error_message = error.message
    alert(error_message)
  })
}

function forgotpass(){
    var email = document.getElementById("email")
    const promise=auth.sendPasswordResetEmail(email.value)
    promise.then(() => {
        alert("Reset link sent to your email id")
    })
    promise.catch((error) => {
          var error_code = error.code
          var error_message = error.message
          alert('Enter registered email address!!')
    });
}


// Validation Functions
function validate_email(email) {
  expression = /^[^@]+@\w+(\.\w+)+\w$/
  if (expression.test(email)) {
    return true
  } else {
      return false
  }
}

function validate_password(password) {
  // Firebase only accepts lengths greater than 7 and lengths less than 17
  if ((password < 8) || (password>16)) {
    return false
  } else {
    return true
  }
}

function validate_field(field) {
  //if the field is left null then it will throw an error
  if (field == null) {
    return false
  }
else {
  return true;
}
}
