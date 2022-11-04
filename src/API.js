const baseUrl = 'https://blog.kata.academy/api'

export async function getArticleList(offset, token) {
  const response = await fetch(`${baseUrl}/articles?offset=${offset}`, {
    method: 'GET',
    headers: {
      Authorization: `Token ${token}`,
    },
  })
  if (!response.ok) throw new Error('Не удалось получить список статей')
  const data = response.json()
  return data
}

export async function getArticle(slug, token) {
  const response = await fetch(`${baseUrl}/articles/${slug}`, {
    method: 'GET',
    headers: {
      Authorization: `Token ${token}`,
    },
  })
  if (!response.ok) throw new Error('Не удалось получить данные о статье')
  const data = response.json()
  return data
}

export async function userRegister({ username, email, password }) {
  const body = {
    user: {
      username,
      email,
      password,
    },
  }
  const response = await fetch(`${baseUrl}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(body),
  })
  if (response.ok) {
    const user = await userLogin({ email, password })
    return user
  }
  const data = response.json()
  return data
}

export async function userLogin({ email, password }) {
  const body = {
    user: {
      email,
      password,
    },
  }
  const response = await fetch(`${baseUrl}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(body),
  })
  const data = response.json()
  return data
}

export async function editProfile({ email, password, username, image = null, token }) {
  const body = {
    user: {
      username,
      email,
      password,
      image,
    },
  }
  const response = await fetch(`${baseUrl}/user`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(body),
  })
  const data = response.json()
  if (response.ok) {
    localStorage.setItem('user', JSON.stringify({ ...data }))
  }
  return data
}

export async function createNewArticle(obj, token) {
  const body = { article: obj }
  const response = await fetch(`${baseUrl}/articles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(body),
  })
  const data = response.json()
  if (!response.ok) throw new Error('Something went wrong. Try later')
  return data
}

export async function editArticle(obj, slug, token) {
  const body = { article: obj }
  const response = await fetch(`${baseUrl}/articles/${slug}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(body),
  })
  const data = response.json()
  if (!response.ok) throw new Error('Something went wrong. Try later')
  return data
}

export async function deleteArticle(slug, token) {
  const response = await fetch(`${baseUrl}/articles/${slug}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      Authorization: `Token ${token}`,
    },
  })
  if (!response.ok) throw new Error('Something went wrong. Try later')
}

export async function favoriteArticle(slug, token, status) {
  const response = await fetch(`${baseUrl}/articles/${slug}/favorite`, {
    method: status ? 'POST' : 'DELETE',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      Authorization: `Token ${token}`,
    },
  })
  if (!response.ok) throw new Error('Failed to like. Try later')
}
