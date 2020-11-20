

async function createPost(username, school, companyID, companyName, companyLocation, companyType, companyComment, companyRating) {
    let postID = connectAndRun(db=> db.any("SELECT COUNT * FROM Posts;"))+1;
    return await connectAndRun(db=> db.none("INSERT INTO Posts VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, 0);", 
    [postID, username, school, companyID, companyName, companyLocation, companyType, companyComment, companyRating]));
}

async function deletePost(postID) {
    return await connectAndRun(db => db.none("DELETE FROM Posts WHERE postID = ($1);", [postID]));
}

async function upVote(postID) {
    return await connectAndRun(db => db.none("UPDATE Posts SET upVote = upVote+1 WHERE postID = ($1);", [postID]));
}

async function downVote(postID) {
    return await connectAndRun(db => db.none("UPDATE Posts SET downVote = downVote+1 WHERE postID = ($1);", [postID]));
}

async function search() {

}

async function date() {}

async function filterTypes(types) {
    return await connectAndRun(db => db.any("SELECT * FROM CareerFairs WHERE type = ($1);", types));
}