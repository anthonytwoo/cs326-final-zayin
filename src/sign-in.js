let signInButton = document.getElementById('signIn');
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
  if (!response.ok) {
      console.error(`error`);
  }
});
createAccountButton.addEventListener("click", async ()=>{
    let username = document.getElementById("SUUsername").value;
    let password = document.getElementById("SUPassword").value;
    let school = document.getElementById("SUSchool").value;
    const response = await fetch('/sign-up', {
      method: 'POST',
      body: JSON.stringify({
          username: username,
          password: password,
          school: school
      })
    });
    if (!response.ok) {
        console.error(`error`);
    }
  });