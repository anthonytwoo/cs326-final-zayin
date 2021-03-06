require('dotenv').config()
// const { count } = require('console')
const express = require('express') // express routing
const expressSession = require('express-session') // for managing session state
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy // username/password strategy
const app = express()
app.use(express.static('src'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const minicrypt = require('./miniCrypt.js')
// const bodyParser = require('body-parser')
// const { get } = require('http')
const path = require('path')
// const { getHeapCodeStatistics } = require('v8')
const pgp = require('pg-promise')({
  connect (client) {
    console.log('Connected to database:', client.connectionParameters.database)
  },

  disconnect (client) {
    console.log('Disconnected from database:', client.connectionParameters.database)
  }
})

const mc = new minicrypt()

// Session configuration

const session = {
  secret: process.env.SECRET || 'SECRET', // set this encryption key in Heroku config (never in GitHub)!
  resave: false,
  saveUninitialized: false
}

// Passport configuration

const strategy = new LocalStrategy(
  async (username, password, done) => {
    const found = await findUser(username)
    if (!found) {
      return done(null, false, { message: 'Wrong username' })
    }
    const val = await validatePassword(username, password)
    console.log(val)
    if (!val) {
      await new Promise((r) => setTimeout(r, 2000))
      return done(null, false, { message: 'Wrong password' })
    }
    return done(null, username)
  })

app.use(expressSession(session))
passport.use(strategy)
app.use(passport.initialize())
app.use(passport.session())

// Convert user object to a unique identifier.
passport.serializeUser((user, done) => {
  done(null, user)
})
// Convert a unique identifier to a user object.
passport.deserializeUser((uid, done) => {
  done(null, uid)
})

app.use(express.json()) // allow JSON inputs
app.use(express.urlencoded({ extended: true })) // allow URLencoded data

async function findUser (username) {
  const count = await getCount(username)
  return count > 0
}

async function validatePassword (name, pwd) {
  const found = await findUser(name)
  if (!found) {
    return false
  }
  const user = await getUser(name)
  if (!mc.check(pwd, user.salt, user.hash)) {
    console.log('FALSE')
    return false
  }
  console.log('True')
  return true
}

async function addUserToDatabase (name, salt, hash) {
  const res = await connectAndRun(db => db.none('INSERT INTO Users VALUES ($1, $2, $3);', [name, salt, hash]))
  return true
}

async function addUser (name, pwd) {
  const value = await getCount(name)
  if (value > 0) {
    return false
  }
  const [salt, hash] = mc.hash(pwd)
  return addUserToDatabase(name, salt, hash)
}

function checkLoggedIn (req, res, next) {
  if (req.isAuthenticated()) {
    // If we are authenticated, run the next route.
    next()
  } else {
    // Otherwise, redirect to the login page.
    res.redirect('/sign-in')
  }
}

// Local PostgreSQL credentials
// let secrets;
// let password;
// if (!process.env.PASSWORD) {
//     secrets = require('./secrets.json');
//     password = secrets.password;
// } else {
// 	  password = process.env.PASSWORD;
// }

const username = 'postgres'

const url = process.env.DATABASE_URL || `postgres://${username}@localhost/`
const db = pgp(url)

async function connectAndRun (task) {
  let connection = null

  try {
    connection = await db.connect()
    return await task(connection)
  } finally {
    try {
      connection.done()
    } catch (ignored) {

    }
  }
}

// Sign-in / Sign-up Functions

async function getCount (username) {
  const ret = await connectAndRun(db => db.any('SELECT * FROM users WHERE username = ($1);', [username]))
  const count = JSON.parse(JSON.stringify(ret)).length
  return count
}

async function getUser (username) {
  const ret = await connectAndRun(db => db.any('SELECT * FROM users WHERE username = ($1);', [username]))
  return JSON.parse(JSON.stringify(ret))[0]
}

// async function signIn(username, password) {
//     ret = await connectAndRun(db => db.any("SELECT * FROM users WHERE username = ($1) AND password = ($2);", [username, password]));
//     return JSON.parse(JSON.stringify(ret)).length >= 1;
// }

// async function signUp(username, password) {
//     ret = await connectAndRun(db => db.any("SELECT * FROM users WHERE username = ($1);", [username]));
//     if (JSON.parse(JSON.stringify(ret)).length === 0){
//         await connectAndRun(db => db.none("INSERT INTO Users VALUES ($1, $2);", [username, password]));
//         return true;
//     }
//     else{
//         return false;
//     }
// }

// Career Fair Functions

async function getCF () {
  return await connectAndRun(db => db.any("SELECT *, to_char(date,'MM/DD/YYYY') as fdate FROM CareerFairs;"))
}

async function getCFCompanies (careerfairId) {
  return await connectAndRun(db => db.any('SELECT CompanyID, CompanyName FROM CareerFairs JOIN Companies ON CareerFairs.CareerFairID = Companies.CareerFairID WHERE CareerFairs.CareerFairID = ($1);', [careerfairId]))
}

async function createCo (companyname, careerfairid) {
  return await connectAndRun(db => db.none('INSERT INTO Companies (companyname, careerfairid) VALUES ($1, $2) ON CONFLICT (companyname, careerfairid) DO NOTHING;', [companyname, careerfairid]))
}

async function createCF (name, school, type, date) {
  return await connectAndRun(db => db.none('INSERT INTO CareerFairs (careerfairname, school, type, date) VALUES ($1, $2, $3, $4);', [name, school, type, date]))
}

// Post Functions

async function getCFPosts (careerfairId) {
  return await connectAndRun(db => db.any('SELECT * FROM Posts WHERE CareerFairID = ($1) ORDER BY PostID DESC;', [careerfairId]))
}

async function getPostCompany (postId) {
  return await connectAndRun(db => db.any('SELECT CompanyName FROM Posts JOIN Companies ON Posts.CompanyID = Companies.CompanyID WHERE PostID = ($1);', [postId]))
}

async function createPost (careerfairId, companyId, username, title, rating, comment) {
  return await connectAndRun(db => db.none('INSERT INTO Posts (careerfairid, companyid, username, title, rating, comment) values ($1, $2, $3, $4, $5, $6);', [careerfairId, companyId, username, title, rating, comment]))
}

async function getLikes (postId) {
  return await connectAndRun(db => db.any('SELECT COUNT (DISTINCT Likes.username) FROM Posts JOIN Likes ON Posts.postID = Likes.postID WHERE Likes.PostID = ($1);', [postId]))
}

async function addLike (postID, username) {
  return await connectAndRun(db => db.none('INSERT INTO Likes VALUES ($1, $2);', [postID, username]))
}

async function getPost (postId) {
  return await connectAndRun(db => db.any('SELECT * FROM Posts WHERE postID = ($1);', [postId]))
}

async function editPost (postId, companyId, title, rating, comment) {
  return await connectAndRun(db => db.none('UPDATE Posts SET title = ($1), companyID = ($2), rating = ($3), comment = ($4) WHERE postId = ($5);', [title, companyId, rating, comment, postId]))
}

async function deletePost (postId) {
  return await connectAndRun(db => db.none('DELETE FROM Posts WHERE PostId = ($1);', [postId]))
}

// EXPRESS SETUP
app.use(express.static('src'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Home Page (Default)

app.get('/',
  async (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'home.html'))
  })

// Career Fairs

// Front-End

// Get Webpage with List of Career Fairs
app.get('/career-fair-list',
  checkLoggedIn,
  async (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'career-fair-list.html'))
  })

// Get Webpage with Posts and Companies Info of Specific Career Fair By careerfairId
app.get('/career-fair/:careerfairId',
  checkLoggedIn,
  async (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'career-fair.html'))
  })

// Create Career Fair Webpage
app.get('/create-career-fair',
  checkLoggedIn,
  async (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'create-career-fair.html'))
  })

// Back-End

// Get All Career Fairs From DB
app.get('/cf',
  checkLoggedIn,
  async (req, res) => {
    const cf = await getCF()
    res.send(cf)
  })

// Get Posts In Specific Career Fair By careerfairId
app.get('/cf/:careerfairId',
  checkLoggedIn,
  async (req, res) => {
    const id = parseInt(req.params.careerfairId)
    const cfPosts = await getCFPosts(id)
    res.send(cfPosts)
  })

// Get List of Companies In Specific Career Fair By careerfairId
app.get('/cfCompany/:careerfairId',
  checkLoggedIn,
  async (req, res) => {
    const id = parseInt(req.params.careerfairId)
    const cfCompanies = await getCFCompanies(id)
    res.send(cfCompanies)
  })

// Create Career Fair
app.post('/create-cf',
  checkLoggedIn,
  async (req, res) => {
    let body = ''
    req.on('data', data => body += data)
    req.on('end', async () => {
      const data = JSON.parse(body)
      await createCF(data.name, data.school, data.type, data.date)
    })
    res.writeHead(200)
    res.end()
  })

// Posts

// Get Info for Specific Post By PostId
app.get('/getPost/:postId',
  checkLoggedIn,
  async (req, res) => {
    const id = parseInt(req.params.postId)
    const post = await getPost(id)
    res.send(post)
  })

// Get Like Count For Specific Post By PostId
app.get('/likeCount/:postId',
  checkLoggedIn,
  async (req, res) => {
    const id = parseInt(req.params.postId)
    const likeCount = await getLikes(id)
    res.send(likeCount)
  })

// Get Company Info For Specific Post By postId
app.get('/postCompany/:postId',
  checkLoggedIn,
  async (req, res) => {
    const id = parseInt(req.params.postId)
    const postCompany = await getPostCompany(id)
    res.send(postCompany)
  })

app.post('/cf/:careerfairId/addCo',
  checkLoggedIn,
  async (req, res) => {
    let body = ''; req.on('data', data => body += data)
    req.on('end', async () => {
      const data = JSON.parse(body)
      await createCo(data.addCompanyName, parseInt(req.params.careerfairId))
    })
    res.writeHead(200)
    res.end()
  })

// Add Like
app.post('/addLike',
  checkLoggedIn,
  async (req, res) => {
    let body = ''
    req.on('data', data => body += data)
    req.on('end', async () => {
      const data = JSON.parse(body)
      await addLike(data.postid, req.user)
    })
    res.writeHead(200)
    res.end()
  })

// Create Post For Specific CareerFair
app.post('/create-post',
  checkLoggedIn,
  async (req, res) => {
    let body = ''
    req.on('data', data => body += data)
    req.on('end', async () => {
      const data = JSON.parse(body)
      await createPost(data.careerfairid, data.companyid, req.user, data.title, data.rating, data.comment)
    })
    res.writeHead(200)
    res.end()
  })

// Update Post By postId
app.put('/editPost/:postId',
  checkLoggedIn,
  async (req, res) => {
    const id = parseInt(req.params.postId)
    let body = ''
    req.on('data', data => body += data)
    req.on('end', async () => {
      const data = JSON.parse(body)
      await editPost(id, data.companyid, data.title, data.rating, data.comment)
    })
    res.writeHead(200)
    res.end()
  })

// Delete Post By postId
app.delete('/deletePost/:postId',
  checkLoggedIn,
  async (req, res) => {
    const id = parseInt(req.params.postId)
    await deletePost(id)
    res.writeHead(200)
    res.end()
  })

// Go to Edit Post Page By PostId
app.get('/edit-post/:cfId/:postId',
  checkLoggedIn,
  async (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'edit-post.html'))
  })

app.get('/currentUser',
  checkLoggedIn,
  async (req, res) => {
    // res.send({"username": req.user});
    const currentUser = req.user
    res.send(currentUser)
  })

// Sign-in / Sign-up

// Sign In Webpage
app.get('/sign-in', async (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'sign-in.html'))
})

// Sign Up & Store In DB
app.post('/sign-up',
  (req, res) => {
    let body = ''
    req.on('data', data => body += data)
    req.on('end', async () => {
      const data = JSON.parse(body)
      const value = await addUser(data.username, data.password)
      if (value) {
        res.redirect('/')
        console.log('SUCCESS')
      } else {
        res.redirect('/sign-up')
      }
    })
  })

// Sign In
app.post('/sign-in',
  passport.authenticate('local', { // use username/password authentication
    successRedirect: '/private', // when we login, go to /private
    failureRedirect: '/sign-in?error="error"' // otherwise, back to login
  })
)

// Redirect After Logged In
app.get('/private',
  checkLoggedIn,
  (req, res) => {
    res.redirect('/private/' + req.user)
  })

// Home Page After Logged In
app.get('/private/:username/',
  checkLoggedIn,
  (req, res) => {
    if (req.params.username === req.user) {
      res.sendFile(path.join(__dirname, '../', 'home.html'))
    } else {
      res.redirect('/private/')
    }
  })

// Logout
app.get('/logout', (req, res) => {
  req.logout() // Logs us out!
  res.redirect('/') // back to homepage
})

app.listen(process.env.PORT || 8080)
