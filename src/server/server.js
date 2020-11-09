const express = require("express");
const path = require("path");
const pgp = require("pg-promise")({
    connect(client) {
        console.log('Connected to database:', client.connectionParameters.database);
    },

    disconnect(client) {
        console.log('Disconnected from database:', client.connectionParameters.database);
    }
});

// Local PostgreSQL credentials

const url = process.env.DATABASE_URL || `postgres://postgres@localhost/`;
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
    return await connectAndRun(db => db.any("SELECT * FROM CareerFairs;"));
}

// EXPRESS SETUP
const app = express();
app.use(express.static('src'));

app.get("/books", async (req, res) => {
    const books = await getBooks();
    res.send(JSON.stringify(books));
});

app.get("/cf", async (req, res) => {
    const cf = await getCF();
    res.send(JSON.stringify(cf));
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
    console.log("company");
    res.sendFile(path.join(__dirname, '../', 'company-list.html'));
});

app.get("/career-fair-list", async (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'career-fair-list.html'));
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
    req.on('end', () => {
        const data = JSON.parse(body);
        console.log(data);
    });
    res.writeHead(200);
    res.end();
});

app.get("/login", async (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'sign-in.html'));
});

app.get("/search", async (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'search.html'));
});

app.listen(process.env.PORT || 8080);