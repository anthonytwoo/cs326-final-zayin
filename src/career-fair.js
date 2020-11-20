window.addEventListener("load", async function() {
    console.log("huh");
    const cfId = window.location.pathname.split("/")[2];
    console.log(cfId);

    const cfPostsRequest = await fetch(`../cf/${cfId}`);
    const cfPostsData = cfPostsRequest.ok ? await cfPostsRequest.json() : [];
    for(const cfPosts of cfPostsData) {
        const card = document.createElement('div');
        card.className = "card";

        const cardHeader1 = document.createElement('div');
        cardHeader1.className = "card-header";
        const username = document.createElement('h5');

        const cardHeader2 = document.createElement('div');
        cardHeader2.className = "card-header";
        const title = document.createElement('h5');

        const cardBody = document.createElement('div');
        cardBody.className = "card-body";
        const comment = document.createElement('p');

        const like = document.createElement('button');
        like.type = "button";
        like.className = "btn btn-outline-primary";
        like.innerText = "Like";

        username.innerText = cfPosts.username;
        title.innerText = "Title";
        comment.innerText = cfPosts.comment;

        cardHeader1.appendChild(username);
        cardHeader2.appendChild(title);
        cardBody.appendChild(comment);

        card.appendChild(cardHeader1);
        card.appendChild(cardHeader2);
        card.appendChild(cardBody);
        card.appendChild(like);

        document.getElementById('cfPosts').appendChild(card);
        document.getElementById('cfPosts').appendChild(document.createElement('br'));
    }
});
