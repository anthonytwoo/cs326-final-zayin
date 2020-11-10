window.addEventListener("load", async function() {
    document.getElementById("search").addEventListener("click", () => {
        const searchText = document.getElementById("searchText").value;
        // fetch(`https://cs326-zayin-fairshare.herokuapp.com/search/?text=${searchText}`);
        fetch(`localhost:8080/search/?text=${searchText}`);
        document.getElementById("postList").innerHTML = `List filtered by ${searchText}`;

    });
});