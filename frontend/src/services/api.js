/**
 * API client.
 *
 * In development, requests go to /api and Vite proxies them to Django. In
 * production, VITE_API_URL points at the deployed backend.
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`

  let response
  try {
    response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    })
  } catch {
    // fetch only rejects on network failure, so this is genuinely offline
    // or an unreachable backend — not an HTTP error status.
    throw new ApiError(
      'Could not reach the server. Please check your connection.',
      0,
      null,
    )
  }

  const isJson = response.headers
    .get('content-type')
    ?.includes('application/json')
  const payload = isJson ? await response.json().catch(() => null) : null

  if (!response.ok) {
    throw new ApiError(
      payload?.detail || `Request failed (${response.status})`,
      response.status,
      payload,
    )
  }

  return payload
}

export const api = {
  getProfile: () => request('/profile/'),

  getProjects: ({ tech, featured } = {}) => {
    const params = new URLSearchParams()
    if (tech) params.set('tech', tech)
    if (featured) params.set('featured', 'true')
    const query = params.toString()
    return request(`/projects/${query ? `?${query}` : ''}`)
  },

  getProject: (slug) => request(`/projects/${slug}/`),
  getTechnologies: () => request('/technologies/'),
  getSkills: () => request('/skills/'),
  getCoursework: () => request('/coursework/'),
  getEducation: () => request('/education/'),

  sendContact: (data) =>
    request('/contact/', { method: 'POST', body: JSON.stringify(data) }),
}

export { ApiError }
