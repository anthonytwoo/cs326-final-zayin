window.addEventListener("load", async function() {
    const postId = window.location.pathname.split("/")[2];

    document.getElementById('submit').addEventListener('click', async () => {
        const createPostTitle = document.getElementById('title').value;
        const createPostRating = rating;
        const createPostComment = document.getElementById('comment').value;

        const createPost = await fetch(`/editPost/${postId}`, {
            method: 'PUT',
            body: JSON.stringify({
                title: createPostTitle,
                rating: createPostRating,
                comment: createPostComment
            })
        });
        if (!createPost.ok) {
            console.error("Could not save to the server.");
        }
    });
});