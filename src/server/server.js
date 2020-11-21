require('dotenv').config();
const { count } = require("console");
const express = require("express");              // express routing
const expressSession = require('express-session');  // for managing session state
const passport = require('passport');  
const LocalStrategy = require('passport-local').Strategy; // username/password strategy
const app = express();
app.use(express.static('src'));
app.use(express.json());
app.use(express.urlencoded({extended: true})); 
const minicrypt = require('./miniCrypt.js');
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
        let found = await findUser(username);
        if (!found) {
            return done(null, false, { 'message' : 'Wrong username' });
        }
        let val = await validatePassword(username, password);
        console.log(val)
        if (!val) {
            await new Promise((r) => setTimeout(r, 2000));
            return done(null, false, { 'message' : 'Wrong password' });
        }
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

async function findUser(username) {
    const count = await getCount(username);
    return count > 0;
}

async function validatePassword(name, pwd) {
    let found = await findUser(name);
    if (!found) {
	    return false;
    }
    let user = await getUser(name);
    console.log(user);
    if (!mc.check(pwd, user.salt, user.hash)) {
        console.log("FALSE");
        return false;
    }
    console.log("True");
    return true;
}

async function addUserToDatabase(name, salt, hash){
    res = await connectAndRun(db => db.none("INSERT INTO Users VALUES ($1, $2, $3);", [name, salt, hash]));
    return true;
}
       
async function addUser(name, pwd) {
    const value = await getCount(name);
    if(value > 0){
        return false;
    }
    const [salt, hash] = mc.hash(pwd);
    return addUserToDatabase(name, salt, hash);
}



function checkLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
	// If we are authenticated, run the next route.
	next();
    } else {
	// Otherwise, redirect to the login page.
	res.redirect('/sign-in');
    }
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
    let ret = await connectAndRun(db => db.any("SELECT * FROM users WHERE username = ($1);", [username]));
    length =  JSON.parse(JSON.stringify(ret)).length;
    return length;
}

async function getUser(username) {
    ret = await connectAndRun(db => db.any("SELECT * FROM users WHERE username = ($1);", [username]));
    return JSON.parse(JSON.stringify(ret))[0];
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
    res.sendFile(path.join(__dirname, '../', 'sign-in.html'));
});

app.post('/sign-up',
(req, res) => {
    let body = '';
    req.on('data', data => body += data);
    req.on('end', async () => {
        const data = JSON.parse(body);
        let value = await addUser(data.username, data.password);
        if(value){
            res.redirect('/');
            console.log("SUCCESS");
        }else {
            res.redirect('/sign-up');
        }
    });
});

app.post('/sign-in',
    passport.authenticate('local' , {     // use username/password authentication
        'successRedirect' : '/',   // when we login, go to /private 
        'failureRedirect' : '/sign-in'      // otherwise, back to login
    })
);

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
    res.sendFile(path.join(__dirname, '../', 'sign-in.html'));
});

app.get("/search", async (req, res) => {
    console.log(JSON.stringify(req.query));
    res.sendFile(path.join(__dirname, '../', 'search.html'));
});

app.listen(process.env.PORT || 8080);
