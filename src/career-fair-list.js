window.addEventListener('load', async function () {
  const cfRequest = await fetch('/cf')
  const cfData = cfRequest.ok ? await cfRequest.json() : []
  for (const cf of cfData) {
    const tr = document.createElement('tr')
    const name = document.createElement('td')
    name.setAttribute('name', 'name')
    const school = document.createElement('td')
    school.setAttribute('name', 'school')
    const type = document.createElement('td')
    type.setAttribute('name', 'type')
    const date = document.createElement('td')
    date.setAttribute('name', 'date')
    name.innerText = cf.careerfairname
    school.innerText = cf.school
    type.innerText = cf.type
    date.innerText = cf.fdate

    tr.appendChild(name)
    tr.appendChild(school)
    tr.appendChild(type)
    tr.appendChild(date)

    const id = cf.careerfairid

    tr.addEventListener('click', function () {
      document.location.href = `career-fair/${id}`
    })

    document.getElementById('cf').appendChild(tr)
  }

  document.getElementById('filter').addEventListener('click', () => {
    const filterChecked = document.querySelectorAll('input[name="filterType"]:checked')
    if (filterChecked.length > 0) {
      const table = document.getElementById('cf')
      const row = table.getElementsByTagName('tr')

      for (let i = 1; i < row.length; i++) {
        const td = document.getElementsByName('type')[i - 1]
        console.log(i + ' ' + td.innerText)
        let checked = false
        for (let j = 0; j < filterChecked.length; j++) {
          if (td.innerText === filterChecked.item(j).value) {
            checked = true
            break
          }
        }
        if (checked) {
          row[i].style.display = ''
        } else {
          row[i].style.display = 'none'
        }
      }
    } else {
      location.reload()
    }
  })
})
