const express = require("express");
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

// If you use MongoDB, you will typically have two URLs. You can then use:
// const url = (process.env.NODE_ENV === "production") ? "MongoDB Atlas URL" : "localhost URL";

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


// EXPRESS SETUP
const app = express();
app.get("/books", async (req, res) => {
    const books = await getBooks();
    res.send(JSON.stringify(books));
});

// We use GET here for simplicity
app.get("/add", async (req, res) => {
    await addBook(req.query.isbn, req.query.author, req.query.title);
    res.send("OK");
});

app.post("/")

app.listen(process.env.PORT || 8080);