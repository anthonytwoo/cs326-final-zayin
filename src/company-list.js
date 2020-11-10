window.addEventListener("load", async function() {

    document.getElementById("filter").addEventListener("click", () => {
        const typeCheckBoxes = document.querySelectorAll('input[name="type"]:checked');
        let types = [];
        typeCheckBoxes.forEach(checkbox => {
            types.push(checkbox.value);
        });
        fetch(`https://cs326-zayin-fairshare.herokuapp.com/company-list?types=${types}`);
        // fetch(`http://localhost:8080/company-list.html?types=${types}`);
        document.getElementById("companyList").innerHTML = `Table filtered by ${types}`;
    });
});