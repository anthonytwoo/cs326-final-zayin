let signInButton = document.getElementById('signin');
let createAccountButton = document.getElementById('createAccount');

signInButton.addEventListener("click", async ()=>{
  let username = document.getElementById("SIUsername").value;
  let password = document.getElementById("SIPassword").value;
  const response = await fetch('/sign-in', {
    method: 'POST',
    body: JSON.stringify({
        username: username,
        password: password
    })
  });
  if (response.status === 200){
    window.location = "/";
    document.getElementById('passwordLabel').innerHTML=""
    document.getElementById("signinHalf").style.visibility = "hidden";
  }
  else{
    document.getElementById('passwordLabel').innerHTML="Incorrect username or password."
  }
});

createAccountButton.addEventListener("click", async ()=>{
    let username = document.getElementById("SUUsername").value;
    let password = document.getElementById("SUPassword").value;
    console.log(password);
    const response = await fetch('/sign-up', {
      method: 'POST',
      body: JSON.stringify({
          username: username,
          password: password
      })
    });
    if (response.status === 200){
      document.getElementById('accountLabel').innerHTML="Account successfully created.";
    }
    else{
      document.getElementById('accountLabel').innerHTML="Cannot use this username.";
    }
  });

  function SIFunction() {
    var x = document.getElementById("SIPassword");
    if (x.type === "password") {
      x.type = "text";
    } else {
      x.type = "password";
    }
  }

  function SUFunction() {
    var x = document.getElementById("SUPassword");
    if (x.type === "password") {
      x.type = "text";
    } else {
      x.type = "password";
    }
  }
