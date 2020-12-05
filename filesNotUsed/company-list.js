window.addEventListener('load', async function () {
  const companyRequest = await fetch('./company')
  const companyData = companyRequest.ok ? await companyRequest.json() : []
  for (const company of companyData) {
    const tr = document.createElement('tr')
    const name = document.createElement('td')
    name.setAttribute('name', 'name')
    const location = document.createElement('td')
    location.setAttribute('name', 'location')
    const type = document.createElement('td')
    type.setAttribute('name', 'type')
    name.innerText = company.companyname
    location.innerText = company.companylocation
    type.innerText = company.companytype
    tr.appendChild(name)
    tr.appendChild(location)
    tr.appendChild(type)
    document.getElementById('company').appendChild(tr)
  };

  document.getElementById('filter').addEventListener('click', () => {
    const filterTypeChecked = document.querySelectorAll('input[name="filterType"]:checked')
    const filterLocationChecked = document.querySelectorAll('input[name="filterLocation"]:checked')
    if (filterTypeChecked.length > 0 || filterLocationChecked.length > 0) {
      console.log('typechecked: ' + filterTypeChecked.length)
      const table = document.getElementById('company')
      const row = table.getElementsByTagName('tr')

      for (let i = 1; i < row.length; i++) {
        const td = document.getElementsByName('type')[i - 1]
        console.log(i + ' ' + td.innerText)
        let typeChecked = false
        let locationChecked = false
        console.log(filterTypeChecked.item(0).innerText)
        for (let j = 0; j < filterTypeChecked.length; j++) {
          console.log('td.innerText: ' + td.innerText)
          console.log('item.value: ' + filterTypeChecked.item(j).value)
          if (td.innerText === filterTypeChecked.item(j).value) {
            typeChecked = true
            break
          }
        }
        for (let j = 0; j < filterLocationChecked.length; j++) {
          if (td.innerText === filterLocationChecked.item(j).value) {
            locationChecked = true
            break
          }
        }
        if (typeChecked || locationChecked) {
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
