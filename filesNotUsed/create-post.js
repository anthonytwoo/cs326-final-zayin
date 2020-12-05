const postButton = document.getElementById('createPostButton')
postButton.addEventListener('click', async () => {
  const companyName = document.getElementById('companyName').value
  const positionLocation = document.getElementById('positionLocation').value
  const companyType = document.getElementById('companyType').value
  const careerFair = document.getElementById('careerFair').value
  const school = document.getElementById('school').value
  const comment = document.getElementById('comment').value
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
  })
  if (!response.ok) {
    console.error('error')
  }
})
