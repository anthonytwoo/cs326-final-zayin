window.addEventListener("load", async function() {

    document.getElementById('submit').addEventListener('click', async () => {
        const cfName = document.getElementById('cfName').value;
        const cfSchool = document.getElementById('cfSchool').value;
        const cfType = document.getElementById('cfType').value;
        const cfDate = document.getElementById('cfDate').value;

        const createPost = await fetch('/create-cf', {
            method: 'POST',
            body: JSON.stringify({
                name: cfName,
                school: cfSchool,
                type: cfType,
                date: cfDate
            })
        });
        if (!createPost.ok) {
            console.error("Could not save the turn score to the server.");
        }
    });
});