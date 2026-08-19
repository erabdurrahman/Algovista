import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Auth from './Auth'

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    saveSession: vi.fn(),
    isAuthenticated: false,
    bootstrapping: false,
    token: '',
    user: null,
    logout: vi.fn(),
  }),
}))

vi.mock('../lib/api', () => ({
  api: {
    login: vi.fn().mockResolvedValue({ token: 't', user: { name: 'A', email: 'a@a.com' } }),
    register: vi.fn().mockResolvedValue({ token: 't', user: { name: 'A', email: 'a@a.com' } }),
  },
}))

describe('Auth page', () => {
  it('toggles between login and register modes', () => {
    render(
      <MemoryRouter>
        <Auth />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /new user\? register/i }))
    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/name/i)).toBeInTheDocument()
  })
})
