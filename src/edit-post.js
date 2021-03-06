window.addEventListener('load', async function () {
  const cfId = window.location.pathname.split('/')[2]
  const postId = window.location.pathname.split('/')[3]

  const cfCompaniesRequest = await fetch(`/cfCompany/${cfId}`)
  const cfCompaniesData = cfCompaniesRequest.ok ? await cfCompaniesRequest.json() : []
  for (const cfCompanies of cfCompaniesData) {
    const companyOption = document.createElement('option')
    companyOption.innerText = cfCompanies.companyname
    companyOption.setAttribute('value', cfCompanies.companyid)
    companyOption.id = `c${cfCompanies.companyid}`
    document.getElementById('companyOption').appendChild(companyOption)
  }

  const postRequest = await fetch(`/getPost/${postId}`)
  const postData = postRequest.ok ? await postRequest.json() : []
  for (const post of postData) {
    document.getElementById('title').value = post.title
    document.getElementById('companyOption').selectedIndex = document.getElementById(`c${post.companyid}`).index
    document.getElementById('comment').value = post.comment
    document.getElementById(`star${post.rating}`).click()
  }

  document.getElementById('submit').addEventListener('click', async () => {
    const createPostTitle = document.getElementById('title').value
    const createPostRating = rating
    const createPostComment = document.getElementById('comment').value
    const createPostCompany = document.getElementById('companyOption').value
    if (createPostTitle !== '' && rating !== 0 && createPostComment !== '' && createPostCompany >= 1) {
      const createPost = await fetch(`/editPost/${postId}`, {
        method: 'PUT',
        body: JSON.stringify({
          careerfairid: cfId,
          companyid: createPostCompany,
          title: createPostTitle,
          rating: createPostRating,
          comment: createPostComment
        })
      })
      if (!createPost.ok) {
        console.error('Could not save the turn score to the server.')
      }
    }

    document.location.href = `/career-fair/${cfId}`
  })
})
