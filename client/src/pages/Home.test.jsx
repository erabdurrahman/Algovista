import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Home from './Home'

describe('Home page', () => {
  it('renders hero content and required action buttons', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    expect(screen.getByText(/visualize data structures and algorithms/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /open learning dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /login\/register/i })).toBeInTheDocument()
  })
})
