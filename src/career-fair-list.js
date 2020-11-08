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

async function getCF() {
    return await connectAndRun(db)
}

window.addEventListener("load", async function() {
    document.getElementById("pastCF").innerHTML = 

    document.getElementById("filter").addEventListener("click", () => {
        const typeCheckBoxes = document.querySelectorAll('input[name="type"]:checked');
        let types = [];
        typeCheckBoxes.forEach(checkbox => {
            types.push(checkbox.value);
        });
        filterTypes(types);
        console.log(types);
    });
});