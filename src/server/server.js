
const { count } = require("console");
const express = require("express");
require('dotenv').config();
const { get } = require("http");
const path = require("path");
const { getHeapCodeStatistics } = require("v8");
const expressSession = require('express-session');  // for managing session state
const passport = require('passport');               // handles authentication
const LocalStrategy = require('passport-local').Strategy; // username/password strategy
const minicrypt = require('./miniCrypt');
const pgp = require("pg-promise")({
    connect(client) {
        console.log('Connected to database:', client.connectionParameters.database);
    },

    disconnect(client) {
        console.log('Disconnected from database:', client.connectionParameters.database);
    }
});

// Local PostgreSQL credentials
const username = "postgres";
const password = "admin";

const url = process.env.DATABASE_URL || `postgres://${username}:${password}@localhost/`;
const db = pgp(url);

async function connectAndRun(task) {
    let connection = null;

    try {
        connection = await db.connect();
        return await task(connection);
    } catch (e) {
        throw e;
    } finally {
        try {
            connection.done();
        } catch(ignored) {

        }
    }
}

const mc = new minicrypt();

// Session configuration

const session = {
    secret : process.env.SECRET || 'SECRET', // set this encryption key in Heroku config (never in GitHub)!
    resave : false,
    saveUninitialized: false
};

// Passport configuration

const strategy = new LocalStrategy(
    async (username, password, done) => {
        const userFound = await findUsername(username);
	if (!userFound) {
	    // no such user
	    return done(null, false, { 'message' : 'Wrong username' });
	}
	if (!validatePassword(username, password)) {
	    // invalid password
	    // should disable logins after N messages
	    // delay return to rate-limit brute-force attacks
	    await new Promise((r) => setTimeout(r, 2000)); // two second delay
	    return done(null, false, { 'message' : 'Wrong password' });
	}
	// success!
	// should create a user object here, associated with a unique identifier
	return done(null, username);
    });


// // App configuration
const app = express();

app.use(expressSession(session));
passport.use(strategy);
app.use(passport.initialize());
app.use(passport.session());   

// Convert user object to a unique identifier.
passport.serializeUser((user, done) => {
    done(null, user);
});
// Convert a unique identifier to a user object.
passport.deserializeUser((uid, done) => {
    done(null, uid);
});

// Returns true iff the user exists.
// async function findUsername(username) {
//     return await connectAndRun(db => db.any("SELECT username FROM Users WHERE username = ($1);", [username]));
// }

async function findUser(username) {
    return await connectAndRun(db => db.any("SELECT *, COUNT(*) as count FROM Users WHERE username = ($1);", [username]));
}


// TODO
// Returns true iff the password is the one we have stored (in plaintext = bad but easy).
async function validatePassword(name, pwd) {
    const userFound = await findUser(name);
    if (userFound[0].count === 0) {
	return false;
    }
    // TODO CHECK PASSWORD
	let salt = userFound[0].salt;
	let hash = userFound[0].hash;
	return mc.check(pwd, salt, hash);
}

// Add a user to the "database".
// TODO
async function addUser(name, pwd) {
    const userFound = await findUser(name);
    if(userFound[0].count === 0) {
        return false;
    }
    let arr = mc.hash(pwd);
    await addUserToDatabase(name, arr[0], arr[1]);
}

async function addUserToDatabase(name, salt, hash){
    res = await connectAndRun(db => db.none("INSERT INTO Users VALUES ($1, $2, $3);", [name, salt, hash]));
    
 }

function checkLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
	// If we are authenticated, run the next route.
	next();
    } else {
	// Otherwise, redirect to the login page.
	res.redirect('/login');
    }
}
 

async function signIn(username, password) {
    const ret = await connectAndRun(db => db.any("SELECT * FROM users WHERE username = ($1) AND password = ($2);", [username, password]));
    return JSON.parse(JSON.stringify(ret)).length >= 1;
}

async function signUp(username, password) {
    ret = await connectAndRun(db => db.any("SELECT * FROM users WHERE username = ($1) AND password = ($2);", [username, password]));
    if (JSON.parse(JSON.stringify(ret)).length === 0){
        return await connectAndRun(db => db.none("INSERT INTO Users VALUES ($1, $2);", [username, password]));
    }
}

async function getBooks() {
    return await connectAndRun(db => db.any("SELECT * FROM Books;"));
};

async function addBook(isbn, author, title) {
    return await connectAndRun(db => db.none("INSERT INTO Books VALUES ($1, $2, $3);", [isbn, author, title]));
}

async function getCF() {
    return await connectAndRun(db => db.any("SELECT *, to_char(date,'MM/DD/YYYY') as fdate FROM CareerFairs;"));
}

async function getCFPosts(careerfairId) {
    return await connectAndRun(db => db.any("SELECT * FROM Posts WHERE CareerFairID = ($1);", [careerfairId]));
}

async function getPostCompany(postId) {
    return await connectAndRun(db => db.any("SELECT CompanyName FROM Posts JOIN Companies ON Posts.CompanyID = Companies.CompanyID WHERE PostID = ($1);", [postId]));
}

async function getCFCompanies(careerfairId) {
    return await connectAndRun(db => db.any("SELECT CompanyID, CompanyName FROM CareerFairs JOIN Companies ON CareerFairs.CareerFairID = Companies.CareerFairID WHERE CareerFairs.CareerFairID = ($1);", [careerfairId]));
}

async function createPost(careerfairId, companyId, username, title, rating, comment) {
    return await connectAndRun(db => db.none("INSERT INTO Posts (careerfairid, companyid, username, title, rating, comment) values ($1, $2, $3, $4, $5, $6);", [careerfairId, companyId, username, title, rating, comment]));
}

async function createCF(name, school, type, date) {
    return await connectAndRun(db => db.none("INSERT INTO CareerFairs (careerfairname, school, type, date) VALUES ($1, $2, $3, $4);", [name, school, type, date]));
}

async function getCompany() {
    return await connectAndRun(db => db.any("SELECT CompanyName, CompanyLocation, CompanyType FROM Companies;"));
}

async function getPost() {
    return await connectAndRun(db => db.any("SELECT * FROM Posts;"));
}
//1. get all the likes - no filter
//2. in addLike call getLikes(postId)
//3. check if username is in getLikes result
//4. if not we addLike
async function getLikes(postId) {
    return await connectAndRun(db => db.any("SELECT COUNT (Likes.username) FROM Posts JOIN Likes ON Posts.postID = Likes.postID WHERE Likes.PostID = ($1);", [postId]));
}

async function addLike(postId, username) {
    return await connectAndRun(db => db.none("INSERT INTO Likes VALUES ($1, $2);", [postId, username]));
}

async function editPost(postId, companyId, title, rating, comment) {
    return await connectAndRun(db => db.none("UPDATE Posts SET companyId = ($1), title = ($2), rating = ($3), comment = ($4) WHERE postID = ($5);", [companyId, title, rating, comment, postId]));
}

async function deletePost(postId) {
    return await connectAndRun(db => db.none("DELETE FROM Posts WHERE PostId = ($1);", [postId]));
}


// EXPRESS SETUP
app.use(express.static('src'));
app.use(express.json());
app.use(express.urlencoded({'extended' : true}));

app.get("/books", async (req, res) => {
    const books = await getBooks();
    res.send(JSON.stringify(books));
});

app.get("/cf", async (req, res) => {
    const cf = await getCF();
    res.send(cf);
});

app.get("/cf/:careerfairId", async (req, res) => {
    const id = parseInt(req.params.careerfairId);
    const cfPosts = await getCFPosts(id);
    res.send(cfPosts);
});

app.get("/postCompany/:postId", async (req, res) => {
    const id = parseInt(req.params.postId);
    const postCompany = await getPostCompany(id);
    res.send(postCompany);
});

//app.delete("/postCompnay/:postId")

app.get("/cfCompany/:careerfairId", async (req, res) => {
    const id = parseInt(req.params.careerfairId);
    const cfCompanies = await getCFCompanies(id);
    res.send(cfCompanies);
});

app.get("/likeCount/:postId", async (req, res) => {
    const id = parseInt(req.params.postId);
    const likeCount = await getLikes(id);
    res.send(likeCount);
})

app.delete("/deletePost/:postId", async (req, res) => {
    const id = parseInt(req.params.postId);
    await deletePost(id);
    res.writeHead(200);
    res.end();
})

app.get("/company", async (req, res) => {
    const company = await getCompany();
    res.send(company);
});

app.get("/post", async (req, res) => {
    const post = await getPost();
    res.send(post);
});

<<<<<<< Updated upstream

// We use GET here for simplicity
app.get("/add", async (req, res) => {
    await addBook(req.query.isbn, req.query.author, req.query.title);
    res.send("OK");
=======
//Go to edit-post By PostId
app.get('/editPost/:postId'),
    checkLoggedIn,
    async (req, res) => {
        res.sendFile(path.join(__dirname, '../', 'edit-post.html'));
    }

app.put('/edit-post/:postId'),
    checkLoggedIn,
    async (req, res) => {
        const id = parseInt(req.params.postId);
        let body = '';
        req.on('data', data => body += data);
        req.on('end', async () => {
        const data = JSON.parse(body);
        await editPost(id, data.companyid, data.title, data.rating, data.comment);
    });
    }

//Get Like Count For Specific Post By PostId
app.get("/likeCount/:postId",
    checkLoggedIn,
    async (req, res) => {
    const id = parseInt(req.params.postId);
    const likeCount = await getLikes(id);
    res.send(likeCount);
>>>>>>> Stashed changes
});

app.get("/", async (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'home.html'));
});

app.get("/company-list", async (req, res) => {
    console.log(JSON.stringify(req.query));
    res.sendFile(path.join(__dirname, '../', 'company-list.html'));
});


app.get("/career-fair-list", 
    checkLoggedIn,
    async (req, res) => {
    console.log(JSON.stringify(req.query));
    res.sendFile(path.join(__dirname, '../', 'career-fair-list.html'));
});

app.get("/career-fair/:careerfairId", async (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'career-fair.html'));
});

app.get("/sign-in", async (req, res) => {
    console.log(signedIn);
    res.sendFile(path.join(__dirname, '../', 'sign-in.html'));
});

app.post("/sign-in", async (req, res) => {
    let body = '';
    req.on('data', data => body += data);
    req.on('end', () => {
        const data = JSON.parse(body);
        console.log(data);
        signIn(data.username, data.password).then((value)=>{
            signedIn = value;
            if(value){
                res.writeHead(200);
                res.end();
            }
            else{
                res.writeHead(201);
                res.end();
            }
        });
    });
});

app.post("/sign-up", async (req, res) => {
    let body = '';
    req.on('data', data => body += data);
    req.on('end', () => {
        const data = JSON.parse(body);
        console.log(data);
        signUp(data.username, data.password).then((value)=>{});
    });
    res.writeHead(200);
    res.end();
});

app.get("/create-post", async (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'create-post.html'));
});

app.get("/create-career-fair", async (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'create-career-fair.html'));
});

app.post("/create-post", async (req, res) => {
    //req.body = {}
    let body = '';
    req.on('data', data => body += data);
    req.on('end', async () => {
        const data = JSON.parse(body);
        await createPost(data.careerfairid, data.companyid, data.username, data.title, data.rating, data.comment);

    });
    res.writeHead(200);
    res.end();
});

app.post("/create-cf", async (req, res) => {
    
    let body = '';
    req.on('data', data => body += data);
    req.on('end', async () => {
        const data = JSON.parse(body);
        await createCF(data.name, data.school, data.type, data.date);

    });
    res.writeHead(200);
    res.end();
});

app.post("/addLike", async (req, res) => {
    
    let body = '';
    req.on('data', data => body += data);
    req.on('end', async () => {
        const data = JSON.parse(body);
        await addLike(data.postid, data.username);

    });
    res.writeHead(200);
    res.end();
});

app.get("/login", async (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'sign-in.html'));
});

app.get("/search", async (req, res) => {
    console.log(JSON.stringify(req.query));
    res.sendFile(path.join(__dirname, '../', 'search.html'));
});

app.listen(process.env.PORT || 8080);
