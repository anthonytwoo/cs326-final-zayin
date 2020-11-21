require('dotenv').config();
const { count } = require("console");
const express = require("express");
const express = require('express');                 // express routing
const expressSession = require('express-session');  // for managing session state
const passport = require('passport');  
const LocalStrategy = require('passport-local').Strategy; // username/password strategy
const minicrypt = require('./miniCrypt');
const bodyParser = require("body-parser");
const { get } = require("http");
const path = require("path");
const { getHeapCodeStatistics } = require("v8");
const pgp = require("pg-promise")({
    connect(client) {
        console.log('Connected to database:', client.connectionParameters.database);
    },

    disconnect(client) {
        console.log('Disconnected from database:', client.connectionParameters.database);
    }
});

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
	if (!findUser(username)) {
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

app.use(express.json()); // allow JSON inputs
app.use(express.urlencoded({'extended' : true})); // allow URLencoded data

function findUser(username) {
    getCount(data.username).then((value)=>{
        return 
    }
    if (!users[username]) {
	return false;
    } else {
	return true;
    }
}

function validatePassword(name, pwd) {
    if (!findUser(name)) {
	return false;
    }
    if (!mc.check(pwd, users[name][0], users[name][1])) {
	return false;
    }
    return true;
}



// Local PostgreSQL credentials
const username = "postgres";
const password = "india123";

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

async function getCount(username){
    ret = await connectAndRun(db => db.any("SELECT * FROM users WHERE username = ($1);", [username]));
    return JSON.parse(JSON.stringify(ret)).length >= 1;
}

async function signIn(username, password) {
    ret = await connectAndRun(db => db.any("SELECT * FROM users WHERE username = ($1) AND password = ($2);", [username, password]));
    return JSON.parse(JSON.stringify(ret)).length >= 1;
}

async function signUp(username, password) {
    ret = await connectAndRun(db => db.any("SELECT * FROM users WHERE username = ($1);", [username]));
    if (JSON.parse(JSON.stringify(ret)).length === 0){
        await connectAndRun(db => db.none("INSERT INTO Users VALUES ($1, $2);", [username, password]));
        return true;
    }
    else{
        return false;
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

async function getLikes(postId) {
    return await connectAndRun(db => db.any("SELECT COUNT (DISTINCT Likes.username) FROM Posts JOIN Likes ON Posts.postID = Likes.postID WHERE Likes.PostID = ($1);", [postId]));
}

async function addLike(postID, username) {
    return await connectAndRun(db => db.none("INSERT INTO Likes VALUES ($1, $2);", [postID, username]));
}

// EXPRESS SETUP
const app = express();
app.use(express.static('src'));
app.use(express.json());


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

app.get("/company", async (req, res) => {
    const company = await getCompany();
    res.send(company);
});

app.get("/post", async (req, res) => {
    const post = await getPost();
    res.send(post);
});


// We use GET here for simplicity
app.get("/add", async (req, res) => {
    await addBook(req.query.isbn, req.query.author, req.query.title);
    res.send("OK");
});

app.get("/", async (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'home.html'));
});

app.get("/company-list", async (req, res) => {
    console.log(JSON.stringify(req.query));
    res.sendFile(path.join(__dirname, '../', 'company-list.html'));
});


app.get("/career-fair-list", async (req, res) => {
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

app.get("/create-post", async (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'create-post.html'));
});

app.post("/create-post", async (req, res) => {
    
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
    console.log(signedIn);
    res.sendFile(path.join(__dirname, '../', 'sign-in.html'));
});

app.get("/search", async (req, res) => {
    console.log(JSON.stringify(req.query));
    res.sendFile(path.join(__dirname, '../', 'search.html'));
});

app.listen(process.env.PORT || 8080);
