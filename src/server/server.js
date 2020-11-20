const express = require("express");
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

// Local PostgreSQL credentials

const url = process.env.DATABASE_URL || `postgres://postgres@localhost`;
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

async function getCompany() {
    return await connectAndRun(db => db.any("SELECT CompanyName, CompanyLocation, CompanyType FROM Companies;"));
}

async function getPost() {
    return await connectAndRun(db => db.any("SELECT * FROM Posts;"));
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

// app.use(bodyParser.json());
// app.post("/create-post", async (req, res) => {
//     console.log(req.body);
//     await createPost(req.body.careerfairid, req.body.companyid, req.body.username, req.body.title, req.body.rating, req.body.comment);
//     res.writeHead(200);
//     res.end();
// })

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

app.post("/sign-in", async (req, res) => {
    let body = '';
    req.on('data', data => body += data);
    req.on('end', () => {
        const data = JSON.parse(body);
        console.log(data);
    });
    res.writeHead(200);
    res.end();
});

app.post("/sign-up", async (req, res) => {
    let body = '';
    req.on('data', data => body += data);
    req.on('end', () => {
        const data = JSON.parse(body);
        console.log(data);
    });
    res.writeHead(200);
    res.end();
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

app.get("/login", async (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'sign-in.html'));
});

app.get("/search", async (req, res) => {
    console.log(JSON.stringify(req.query));
    res.sendFile(path.join(__dirname, '../', 'search.html'));
});

app.listen(process.env.PORT || 8080);
