window.addEventListener("load", async function() {

    document.getElementById("filter").addEventListener("click", () => {
        const typeCheckBoxes = document.querySelectorAll('input[name="type"]:checked');
        let types = [];
        typeCheckBoxes.forEach(checkbox => {
            types.push(checkbox.value);
        });
        fetch(`https://cs326-zayin-fairshare.herokuapp.com/career-fair-list?types=${types}`);
        document.getElementById("upcomingCF").innerHTML = `Table filtered by ${types}`;
    });
});
//["Computer Science", "Economics"]