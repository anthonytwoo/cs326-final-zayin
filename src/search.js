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