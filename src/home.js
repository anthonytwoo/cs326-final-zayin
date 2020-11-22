window.addEventListener("load", async function() {
    console.log(window.location.pathname);
    if(window.location.pathname.split("/")[1] === "private") {
        document.getElementById('welcome').innerText += " " + window.location.pathname.split("/")[2];
        document.getElementById('login').innerText = "Logout";
        document.getElementById('login').href = "/logout";

        document.getElementById('home').href = window.location.pathname;
        // document.getElementById('career-fair-list').href = window.location.pathname + "/career-fair-list";
        // document.getElementById('create-career-fair').href = window.location.pathname + "/create-career-fair";
    }
});