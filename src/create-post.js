let postButton = document.getElementById('createPostButton');
postButton.addEventListener("click", async ()=>{
  let companyName = document.getElementById("companyName").value;
  let positionLocation = document.getElementById("positionLocation").value;
  let companyType = document.getElementById("companyType").value;
  let careerFair = document.getElementById("careerFair").value;
  let school = document.getElementById("school").value;
  let comment = document.getElementById("comment").value;
  const response = await fetch('/create-post', {
    method: 'POST',
    body: JSON.stringify({
        companyName: companyName,
        positionLocation: positionLocation,
        companyType: companyType,
        careerFair: careerFair,
        school: school,
        comment: comment,
        rating: rating,
        upvote: 0,
        downvote: 0
    })
  });
  if (!response.ok) {
      console.error(`error`);
  }
});