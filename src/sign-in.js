const createAccountButton = document.getElementById('createAccount')

const urlParams = new URLSearchParams(window.location.search)
const info = urlParams.get('error')
console.log(info)
if (info) {
  const errorMessage = document.getElementById('error')
  errorMessage.innerText = 'Incorrect username and/or password'
  // errorMessage.style.display = "block";
}

createAccountButton.addEventListener('click', async () => {
  const username = document.getElementById('SUUsername').value
  const password = document.getElementById('SUPassword').value
  if (username === '' || password === '') {
    document.getElementById('accountLabel').innerHTML = 'Username or Password cannot be empty.'
  } else {
    const response = await fetch('/sign-up', {
      method: 'POST',
      body: JSON.stringify({
        username: username,
        password: password
      })
    })
    if (response.status === 200) {
      document.getElementById('accountLabel').innerHTML = 'Account successfully created.'
    } else {
      document.getElementById('accountLabel').innerHTML = 'Cannot use this username.'
    }
  }
})

function SIFunction () {
  const x = document.getElementById('SIPassword')
  if (x.type === 'password') {
    x.type = 'text'
  } else {
    x.type = 'password'
  }
}

function SUFunction () {
  const x = document.getElementById('SUPassword')
  if (x.type === 'password') {
    x.type = 'text'
  } else {
    x.type = 'password'
  }
}
