import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { ProjectCard } from './ProjectCard'

const baseProject = {
  id: 1,
  slug: 'micromart',
  title: 'MicroMart',
  subtitle: 'An e-commerce platform',
  summary: 'A summary of the project.',
  accent_label: 'E-commerce',
  technologies: [
    { id: 1, name: 'Django' },
    { id: 2, name: 'React' },
  ],
  github_url: 'https://github.com/example/repo',
  live_url: '',
  cover_image: null,
}

function renderCard(overrides = {}) {
  return render(
    <MemoryRouter>
      <ProjectCard project={{ ...baseProject, ...overrides }} />
    </MemoryRouter>,
  )
}

describe('ProjectCard', () => {
  it('renders the project details', () => {
    renderCard()

    expect(screen.getByText('MicroMart')).toBeInTheDocument()
    expect(screen.getByText('An e-commerce platform')).toBeInTheDocument()
    expect(screen.getByText('Django')).toBeInTheDocument()
  })

  it('links to the case study', () => {
    renderCard()

    expect(
      screen.getByRole('link', { name: 'MicroMart' }),
    ).toHaveAttribute('href', '/projects/micromart')
  })

  it('shows a GitHub link when the URL exists', () => {
    renderCard()
    expect(
      screen.getByRole('link', { name: /source on GitHub/i }),
    ).toBeInTheDocument()
  })

  it('hides the live demo link when there is no URL', () => {
    // An undeployed project must not render a dead button.
    renderCard()
    expect(screen.queryByRole('link', { name: /live demo/i })).toBeNull()
  })

  it('shows the live demo link once a URL exists', () => {
    renderCard({ live_url: 'https://example.com' })
    expect(
      screen.getByRole('link', { name: /live demo/i }),
    ).toBeInTheDocument()
  })

  it('collapses a long technology list', () => {
    renderCard({
      technologies: [1, 2, 3, 4, 5, 6].map((n) => ({ id: n, name: `Tech${n}` })),
    })

    expect(screen.getByText('Tech1')).toBeInTheDocument()
    expect(screen.getByText('+2')).toBeInTheDocument()
    expect(screen.queryByText('Tech6')).toBeNull()
  })
})
