import { GithubApiCatch } from './GitHubAPI.js'

export class GitHubFavorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    this.profiles = JSON.parse(localStorage.getItem('@github_favorites')) || []
  }

  delete(profile) {
    const filteredProfiles = this.profiles.filter(filteredProfiles => {
      return profile.login !== filteredProfiles.login
    })

    this.profiles = filteredProfiles
    this.update()
    this.save()
  }

  async add(username) {
    try {
      this.profiles.find(profile => {
        if (profile.login.toLowerCase() === username) {
          throw new Error(`Usuário ${username} já foi adicionado!`)
        }
      })

      const user = await GithubApiCatch.gitHubUser(username)
      console.log(user)
      if (user.login === undefined) {
        throw new Error(`Usuário ${username} não encontrado, tente novamente!`)
      }
      this.profiles = [user, ...this.profiles]
      this.save()
      this.update()
    } catch (error) {
      alert(error.message)
    }
  }

  save() {
    localStorage.setItem('@github_favorites', JSON.stringify(this.profiles))
  }
}

export class GitHubFavoritesView extends GitHubFavorites {
  constructor(root) {
    super(root)
    this.tbody = this.root.querySelector('table tbody.appBody')
    this.update()
    this.onAdd()
  }

  update() {
    this.removeAllTr()
    this.showOrHideBgEmpty()
    this.createOrDeleteCustomTr()
  }

  onAdd() {
    const inputSearch = this.root.querySelector('.search input')
    const buttonSearch = this.root.querySelector('.search button')

    buttonSearch.onclick = () => {
      const user = inputSearch.value.toLowerCase()
      this.add(user)

      inputSearch.value = ''
    }

    inputSearch.addEventListener('keypress', pressKey => {
      if (pressKey.key === 'Enter') {
        buttonSearch.click()
      }
    })
  }
  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach(tr => {
      tr.remove()
    })
  }
  createDefaultTr() {
    const tr = document.createElement('tr')
    tr.innerHTML = `
    <td class="user">
      <a href="https://www.github.com/piluvitu">
        <img
          src="https://www.github.com/piluvitu.png"
          alt="Paulo Victor profile image"
        />
        <div class="id">
          <p>Paulo Victor</p>
          <span>/PiluVitu</span>
        </div>
      </a>
    </td>
    <td class="repositories">123</td>
    <td class="followers">12000</td>
    <td><button class="remove">Remover</button></td>
    `
    return tr
  }
  createOrDeleteCustomTr() {
    this.profiles.forEach(profile => {
      const row = this.createDefaultTr()

      //Create Custom Tr
      row.querySelector('.user a').href = `https://github.com/${profile.login}`
      row.querySelector(
        '.user img'
      ).src = `https://github.com/${profile.login}.png`
      row.querySelector('.user img').alt = `${profile.name} profile image`
      row.querySelector('.user .id p').innerText = `${profile.name}`
      row.querySelector('.user .id span').innerText = `/${profile.login}`
      row.querySelector('.repositories').innerText = `${profile.public_repos}`
      row.querySelector('.followers').innerText = `${profile.followers}`

      //Delete Custom Tr
      row.querySelector('button.remove').onclick = () => {
        const confirmed = confirm(`Você deseja excluir ${profile.name}?`)

        if (confirmed) {
          this.delete(profile)
        }
      }

      //Show Custom Tr
      this.tbody.append(row)
    })
  }
  showOrHideBgEmpty() {
    const emptyBody = this.root.querySelector('table tbody.firstUse')
    const arrayNumberItems = this.profiles.length

    if (arrayNumberItems > 0) {
      emptyBody.classList.add('removeScreen')
    } else {
      emptyBody.classList.remove('removeScreen')
    }
  }
}
