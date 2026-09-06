import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ImageFrame } from './ImageFrame'

describe('ImageFrame', () => {
  it('renders the image when a source is given', () => {
    render(<ImageFrame src="/photo.jpg" alt="A screenshot" />)

    const img = screen.getByAltText('A screenshot')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/photo.jpg')
  })

  it('falls back to a labelled placeholder when no source exists', () => {
    // Projects without screenshots must still render as designed, never blank.
    render(<ImageFrame alt="Not yet available" label="Screenshot" />)

    expect(screen.queryByRole('img', { name: 'Not yet available' })).toBeInTheDocument()
    expect(screen.getByText('Screenshot')).toBeInTheDocument()
    expect(document.querySelector('img')).toBeNull()
  })

  it('lazy loads by default and eagerly on request', () => {
    const { rerender } = render(<ImageFrame src="/a.jpg" alt="a" />)
    expect(screen.getByAltText('a')).toHaveAttribute('loading', 'lazy')

    rerender(<ImageFrame src="/a.jpg" alt="a" loading="eager" />)
    expect(screen.getByAltText('a')).toHaveAttribute('loading', 'eager')
  })
})
